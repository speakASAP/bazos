import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../logger/logger.service';
import { WarehouseClientService } from '../../clients/warehouse-client.service';
import {
  IDENTITY_STATUS,
  REVIEW_STATE,
  SESSION_STATE,
  MAX_ACTIVE_ADS,
  PACING_MIN_SECONDS,
  PACING_MAX_SECONDS,
  CATEGORY_COOLDOWN_HOURS,
} from '../identity/bazos-identity.types';
import {
  POLICY_GATE,
  PolicyEvaluationResult,
  PolicyGateFailure,
} from './publish-policy.types';

type EvidenceSource = 'manual_review' | 'trusted_backend';

export interface PolicyCheckInput {
  identityId: string;
  bazosCategory: string;
  productId?: string;
  adId?: string;
  /** Ad title used for local duplicate detection */
  adTitle?: string;
  /** Trusted backend/manual evidence. Client self-attestation must not pass this gate. */
  publicDuplicateCheck?: {
    checkedAt: Date;
    source?: EvidenceSource;
    likelyDuplicate: boolean;
    reason?: string;
  };
  /** Trusted backend/manual evidence. Client self-attestation must not pass this gate. */
  contentPolicy?: {
    checkedAt: Date;
    source?: EvidenceSource;
    passed: boolean;
    reason?: string;
  };
}

@Injectable()
export class PublishPolicyService {
  private readonly publicDuplicateEvidenceTtlMs = 60 * 60 * 1000;
  private readonly contentPolicyEvidenceTtlMs = 60 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly warehouseClient?: WarehouseClientService,
  ) {}

  /**
   * Evaluates all compliance gates defined in docs/BAZOS_COMPLIANCE.md.
   * Returns allowed=false if ANY gate fails; never throws for policy reasons.
   *
   * Gates checked (in order from BAZOS_COMPLIANCE.md):
   *  1. identity.status == verified
   *  2. identity.reviewState == clear
   *  3. identity.verificationExpiresAt > now (when known)
   *  4. identity.sessionState == active
   *  5. identity.activeAdCount < 50
   *  6. now >= identity.nextPublishNotBefore
   *  7. now - category.lastPublishedAt >= 24h
   *  8. No local active duplicate for product/identity
   *  9. Warehouse availability for the linked catalog product is known and > 0
   * 10. No likely public Bazos duplicate
   * 11. Category mapping exists and is not blocked
   * 12. Content policy validation passes
   */
  async evaluate(input: PolicyCheckInput): Promise<PolicyEvaluationResult> {
    const now = new Date();
    const failures: PolicyGateFailure[] = [];

    const identity = await this.prisma.bazosIdentity.findUnique({
      where: { id: input.identityId },
      include: {
        categoryCadences: {
          where: { bazosCategory: input.bazosCategory },
        },
      },
    });

    if (!identity) {
      failures.push({
        gate: POLICY_GATE.IDENTITY_NOT_VERIFIED,
        message: `Identity ${input.identityId} not found`,
      });
      return this.buildResult(failures, now);
    }

    // Gate 1 — identity must be verified
    if (identity.status !== IDENTITY_STATUS.VERIFIED) {
      failures.push({
        gate: POLICY_GATE.IDENTITY_NOT_VERIFIED,
        message: `Identity status is "${identity.status}", must be "verified"`,
      });
    }

    // Gate 2 — reviewState must be clear (no pending challenge)
    if (identity.reviewState !== REVIEW_STATE.CLEAR) {
      failures.push({
        gate: POLICY_GATE.IDENTITY_REVIEW_BLOCKED,
        message: `Identity reviewState is "${identity.reviewState}", requires human resolution`,
      });
    }

    // Gate 3 — verification not expired
    if (identity.verificationExpiresAt && identity.verificationExpiresAt <= now) {
      failures.push({
        gate: POLICY_GATE.IDENTITY_VERIFICATION_EXPIRED,
        message: `Verification expired at ${identity.verificationExpiresAt.toISOString()}`,
        blockedUntil: identity.verificationExpiresAt,
      });
    }

    // Gate 4 — session must be active, so verified identity state cannot mask an expired/missing session.
    if (identity.sessionState !== SESSION_STATE.ACTIVE) {
      failures.push({
        gate: POLICY_GATE.IDENTITY_SESSION_NOT_ACTIVE,
        message: `Identity sessionState is "${identity.sessionState}", must be "active"`,
      });
    }

    // Gate 5 — active ad cap
    if (identity.activeAdCount >= MAX_ACTIVE_ADS) {
      failures.push({
        gate: POLICY_GATE.ACTIVE_AD_CAP_REACHED,
        message: `Active ad count ${identity.activeAdCount} has reached the maximum of ${MAX_ACTIVE_ADS}`,
      });
    }

    // Gate 6 — pacing (nextPublishNotBefore stored before worker sleeps)
    if (identity.nextPublishNotBefore && identity.nextPublishNotBefore > now) {
      failures.push({
        gate: POLICY_GATE.PACING_TOO_SOON,
        message: `Must wait until ${identity.nextPublishNotBefore.toISOString()} before next publish attempt`,
        blockedUntil: identity.nextPublishNotBefore,
      });
    }

    // Gate 7 — 24h per-category cooldown
    const cadence = identity.categoryCadences[0];
    if (cadence) {
      const cooldownMs = CATEGORY_COOLDOWN_HOURS * 60 * 60 * 1000;
      const nextAllowedAt = new Date(cadence.lastPublishedAt.getTime() + cooldownMs);
      if (nextAllowedAt > now) {
        failures.push({
          gate: POLICY_GATE.CATEGORY_COOLDOWN,
          message: `Category "${input.bazosCategory}" was last published at ${cadence.lastPublishedAt.toISOString()}; next allowed at ${nextAllowedAt.toISOString()}`,
          blockedUntil: nextAllowedAt,
        });
      }
    }

    // Gate 8 — local duplicate check
    if (input.productId) {
      const duplicate = await this.prisma.bazosAd.findFirst({
        where: {
          identityId: input.identityId,
          productId: input.productId,
          isActive: true,
          ...(input.adId ? { id: { not: input.adId } } : {}),
        },
      });
      if (duplicate) {
        failures.push({
          gate: POLICY_GATE.LOCAL_DUPLICATE,
          message: `Active local ad ${duplicate.id} already exists for product ${input.productId} on this identity`,
        });
      }
    }

    // Gate 9 — Warehouse remains the stock authority. Local draft stock is never sellable truth.
    await this.evaluateWarehouseAvailability(input.productId, failures);

    // Gate 10 — public duplicate evidence must exist, be trusted, and be clean.
    if (!input.publicDuplicateCheck) {
      failures.push({
        gate: POLICY_GATE.PUBLIC_DUPLICATE_CHECK_MISSING,
        message: 'Trusted public duplicate evidence is required before publishing',
      });
    } else if (!this.isTrustedEvidence(input.publicDuplicateCheck.source)) {
      failures.push({
        gate: POLICY_GATE.PUBLIC_DUPLICATE_CHECK_MISSING,
        message: 'Public duplicate evidence must come from manual_review or trusted_backend',
      });
    } else if (this.isEvidenceExpired(input.publicDuplicateCheck.checkedAt, now, this.publicDuplicateEvidenceTtlMs)) {
      failures.push({
        gate: POLICY_GATE.PUBLIC_DUPLICATE_CHECK_MISSING,
        message: 'Public duplicate evidence is missing, invalid, future-dated, or stale',
      });
    } else if (input.publicDuplicateCheck.likelyDuplicate) {
      failures.push({
        gate: POLICY_GATE.PUBLIC_DUPLICATE,
        message: input.publicDuplicateCheck.reason || 'Public Bazos search found a likely duplicate',
      });
    }

    // Gate 11 — category mapping must exist and be active
    const categoryMapping = await this.prisma.bazosCategory.findFirst({
      where: { bazosCategory: input.bazosCategory, isActive: true },
    });
    if (!categoryMapping) {
      failures.push({
        gate: POLICY_GATE.CATEGORY_MISSING_OR_BLOCKED,
        message: `Bazos category "${input.bazosCategory}" has no active mapping; human review required`,
      });
    }

    // Gate 12 — content policy evidence must exist, be trusted, and pass.
    if (!input.contentPolicy) {
      failures.push({
        gate: POLICY_GATE.CONTENT_POLICY_NOT_VALIDATED,
        message: 'Trusted content policy evidence is required before publishing',
      });
    } else if (!this.isTrustedEvidence(input.contentPolicy.source)) {
      failures.push({
        gate: POLICY_GATE.CONTENT_POLICY_NOT_VALIDATED,
        message: 'Content policy evidence must come from manual_review or trusted_backend',
      });
    } else if (this.isEvidenceExpired(input.contentPolicy.checkedAt, now, this.contentPolicyEvidenceTtlMs)) {
      failures.push({
        gate: POLICY_GATE.CONTENT_POLICY_NOT_VALIDATED,
        message: 'Content policy evidence is missing, invalid, future-dated, or stale',
      });
    } else if (!input.contentPolicy.passed) {
      failures.push({
        gate: POLICY_GATE.CONTENT_POLICY_FAIL,
        message: input.contentPolicy.reason || 'Content policy validation failed',
      });
    }

    const result = this.buildResult(failures, now);

    this.logger.log('Publish policy evaluated', {
      identityId: input.identityId,
      bazosCategory: input.bazosCategory,
      productId: input.productId,
      allowed: result.allowed,
      failureCount: failures.length,
      failures: failures.map((f) => f.gate),
    });

    return result;
  }

  /**
   * Returns a random pacing delay in [PACING_MIN_SECONDS..PACING_MAX_SECONDS].
   * Use this to select the delay BEFORE calling reservePublishSlot so the
   * notBefore timestamp is persisted before the worker sleeps.
   */
  selectPacingDelaySeconds(): number {
    const range = PACING_MAX_SECONDS - PACING_MIN_SECONDS;
    return Math.floor(Math.random() * (range + 1)) + PACING_MIN_SECONDS;
  }


  private async evaluateWarehouseAvailability(productId: string | undefined, failures: PolicyGateFailure[]) {
    if (!productId) {
      failures.push({
        gate: POLICY_GATE.WAREHOUSE_STOCK_UNAVAILABLE,
        message: 'Catalog product ID is required before Warehouse stock can authorize Bazos publishing',
      });
      return;
    }

    if (!this.warehouseClient) {
      failures.push({
        gate: POLICY_GATE.WAREHOUSE_STOCK_UNAVAILABLE,
        message: 'Warehouse availability client is not configured for Bazos publish policy evaluation',
      });
      return;
    }

    try {
      const [stockRows, totalAvailable] = await Promise.all([
        this.warehouseClient.getStockByProduct(productId),
        this.warehouseClient.getTotalAvailable(productId),
      ]);
      const hasRouteEvidence = Array.isArray(stockRows) && stockRows.length > 0;
      const available = Number(totalAvailable);
      if (!hasRouteEvidence) {
        failures.push({
          gate: POLICY_GATE.WAREHOUSE_STOCK_UNAVAILABLE,
          message: `Warehouse route evidence is missing for product ${productId}`,
        });
        return;
      }
      if (!Number.isFinite(available) || available <= 0) {
        failures.push({
          gate: POLICY_GATE.WAREHOUSE_STOCK_UNAVAILABLE,
          message: `Warehouse available stock for product ${productId} is ${Number.isFinite(available) ? available : 'unknown'}`,
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      failures.push({
        gate: POLICY_GATE.WAREHOUSE_STOCK_UNAVAILABLE,
        message: `Warehouse availability check failed for product ${productId}: ${errorMessage}`,
      });
    }
  }

  private buildResult(failures: PolicyGateFailure[], evaluatedAt: Date): PolicyEvaluationResult {
    const allowed = failures.length === 0;
    const result: PolicyEvaluationResult = { allowed, failures, evaluatedAt };
    if (allowed) {
      result.selectedPacingDelaySeconds = this.selectPacingDelaySeconds();
    }
    return result;
  }

  private isEvidenceExpired(checkedAt: Date, now: Date, ttlMs: number): boolean {
    const checkedAtMs = checkedAt?.getTime();
    return !Number.isFinite(checkedAtMs) || checkedAtMs > now.getTime() || now.getTime() - checkedAtMs > ttlMs;
  }

  private isTrustedEvidence(source?: string): boolean {
    return source === 'manual_review' || source === 'trusted_backend';
  }
}
