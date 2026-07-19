import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../logger/logger.service';
import { CONSENT_DOCUMENT_VERSION, CONSENT_SCOPE, ConsentScope } from '../policy/publish-policy.types';

export interface GrantConsentInput {
  identityId: string;
  userId: string;
  scope?: ConsentScope;
  /** Version the seller was actually shown. Rejected if it is not the current one. */
  documentVersion: string;
  ip?: string;
  userAgent?: string;
}

export interface ConsentStatus {
  granted: boolean;
  /** Set when a consent exists but was given against superseded wording. */
  needsRenewal: boolean;
  currentVersion: string;
  grantedAt?: Date;
  grantedVersion?: string;
}

@Injectable()
export class BazosConsentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Records the seller's consent. The caller must pass the version of the text that
   * was actually rendered — a mismatch means the seller agreed to something other
   * than the current terms, so we refuse rather than store a misleading record.
   */
  async grant(input: GrantConsentInput) {
    if (input.documentVersion !== CONSENT_DOCUMENT_VERSION) {
      throw new Error(
        `Refusing to record consent for "${input.documentVersion}"; current terms are "${CONSENT_DOCUMENT_VERSION}".`,
      );
    }

    const scope = input.scope ?? CONSENT_SCOPE.PUBLISH;

    // Supersede any live consent so exactly one row is active per identity+scope.
    await this.prisma.bazosIdentityConsent.updateMany({
      where: { identityId: input.identityId, scope, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    const consent = await this.prisma.bazosIdentityConsent.create({
      data: {
        identityId: input.identityId,
        userId: input.userId,
        scope,
        documentVersion: input.documentVersion,
        ip: input.ip,
        userAgent: input.userAgent,
      },
    });

    this.logger.log(
      `Consent granted for identity ${input.identityId} (scope=${scope}, version=${input.documentVersion})`,
    );

    return consent;
  }

  /**
   * Withdraws consent. Publishing stops at the next policy evaluation; the row is
   * kept and stamped so the grant/withdraw history stays auditable.
   */
  async revoke(identityId: string, scope: ConsentScope = CONSENT_SCOPE.PUBLISH) {
    const result = await this.prisma.bazosIdentityConsent.updateMany({
      where: { identityId, scope, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    this.logger.log(`Consent revoked for identity ${identityId} (scope=${scope}, rows=${result.count})`);

    return { revoked: result.count };
  }

  async status(identityId: string, scope: ConsentScope = CONSENT_SCOPE.PUBLISH): Promise<ConsentStatus> {
    const consent = await this.prisma.bazosIdentityConsent.findFirst({
      where: { identityId, scope, revokedAt: null },
      orderBy: { grantedAt: 'desc' },
    });

    if (!consent) {
      return { granted: false, needsRenewal: false, currentVersion: CONSENT_DOCUMENT_VERSION };
    }

    const current = consent.documentVersion === CONSENT_DOCUMENT_VERSION;

    return {
      granted: current,
      needsRenewal: !current,
      currentVersion: CONSENT_DOCUMENT_VERSION,
      grantedAt: consent.grantedAt,
      grantedVersion: consent.documentVersion,
    };
  }

  /** Full history including revoked rows, for audit and data-subject requests. */
  async history(identityId: string) {
    return this.prisma.bazosIdentityConsent.findMany({
      where: { identityId },
      orderBy: { grantedAt: 'desc' },
    });
  }
}
