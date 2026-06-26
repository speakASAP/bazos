import { Injectable } from '@nestjs/common';
import { PrismaService, LoggerService } from '@bazos/shared';

const DEFAULT_VERIFICATION_URL = 'https://www.bazos.cz/pridat-inzerat.php';
const DEFAULT_SESSION_DAYS = 90;

@Injectable()
export class HumanVerificationService {
  private readonly logger: LoggerService;

  constructor(
    private readonly prisma: PrismaService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('HumanVerificationService');
  }

  async start(identityId: string, data: any = {}) {
    const identity = await this.prisma.bazosIdentity.findUnique({ where: { id: identityId } });
    if (!identity) {
      throw new Error(`Bazos identity ${identityId} not found`);
    }

    const session = await this.prisma.bazosVerificationSession.create({
      data: {
        identityId,
        state: 'awaiting_human',
        verificationUrl: data.verificationUrl || DEFAULT_VERIFICATION_URL,
        operatorUserId: data.operatorUserId,
        notes: data.notes,
        evidence: {
          requiredActions: [
            'Open Bazos in a real browser session.',
            'Complete any SMS, CAPTCHA, bank, or moderator checks manually.',
            'Do not use this service to bypass or simulate those checks.',
          ],
        },
      },
    });

    await this.prisma.bazosIdentity.update({
      where: { id: identityId },
      data: {
        sessionState: 'awaiting_human',
        status: identity.status === 'verified' ? identity.status : 'pending_verification',
      },
    });

    return {
      ...session,
      instructions: {
        verificationUrl: session.verificationUrl,
        mustBeHumanCompleted: true,
        prohibited: ['captcha_bypass', 'sms_bypass', 'bank_check_bypass', 'cookie_forgery'],
      },
    };
  }

  async markChallenge(sessionId: string, data: any) {
    const challengeType = data.challengeType || 'manual_review';
    const session = await this.prisma.bazosVerificationSession.update({
      where: { id: sessionId },
      data: {
        state: 'challenge_required',
        challengeType,
        notes: data.notes,
        evidence: data.evidence,
      },
    });

    await this.prisma.bazosIdentity.update({
      where: { id: session.identityId },
      data: {
        sessionState: 'challenge',
        reviewState: challengeType,
      },
    });

    this.logger.warn(`Bazos verification challenge recorded for identity ${session.identityId}`, { challengeType });
    return session;
  }

  async complete(sessionId: string, data: any = {}) {
    if (!data.humanConfirmed) {
      throw new Error('humanConfirmed=true is required; Bazos checks must be completed by a human.');
    }

    const verificationExpiresAt = data.verificationExpiresAt
      ? new Date(data.verificationExpiresAt)
      : new Date(Date.now() + DEFAULT_SESSION_DAYS * 24 * 60 * 60 * 1000);
    const sessionPayload = data.encryptedSession
      ? data.encryptedSession
      : undefined;

    const session = await this.prisma.bazosVerificationSession.update({
      where: { id: sessionId },
      data: {
        state: 'completed',
        humanConfirmed: true,
        evidence: data.evidence,
        expiresAt: verificationExpiresAt,
        completedAt: new Date(),
        notes: data.notes,
      },
    });

    await this.prisma.bazosIdentity.update({
      where: { id: session.identityId },
      data: {
        status: 'verified',
        sessionState: 'active',
        reviewState: 'clear',
        encryptedSession: sessionPayload,
        verificationExpiresAt,
      },
    });

    this.logger.log(`Completed human Bazos verification session ${sessionId}`, {
      identityId: session.identityId,
      verificationExpiresAt,
    });
    return session;
  }

  async fail(sessionId: string, data: any = {}) {
    const session = await this.prisma.bazosVerificationSession.update({
      where: { id: sessionId },
      data: {
        state: 'failed',
        challengeType: data.challengeType,
        notes: data.reason || data.notes,
        completedAt: new Date(),
      },
    });

    await this.prisma.bazosIdentity.update({
      where: { id: session.identityId },
      data: {
        sessionState: 'challenge',
        reviewState: data.challengeType || 'captcha_or_human_check_required',
        notes: data.reason || data.notes,
      },
    });

    return session;
  }

  async findAll(query: any = {}) {
    return this.prisma.bazosVerificationSession.findMany({
      where: {
        identityId: query.identityId,
        state: query.state,
        challengeType: query.challengeType,
      },
      include: { identity: true },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
