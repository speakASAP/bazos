import { Injectable } from '@nestjs/common';
import { PrismaService, LoggerService } from '@bazos/shared';

@Injectable()
export class IdentitiesService {
  private readonly logger: LoggerService;

  constructor(
    private readonly prisma: PrismaService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('IdentitiesService');
  }

  async findAll(query: any = {}) {
    return this.prisma.bazosIdentity.findMany({
      where: {
        accountId: query.accountId,
        userId: query.userId,
        status: query.status,
        reviewState: query.reviewState,
      },
      include: {
        account: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.bazosIdentity.findUnique({
      where: { id },
      include: {
        account: true,
        categoryCadences: true,
      },
    });
  }

  async create(data: any) {
    return this.prisma.bazosIdentity.create({
      data: {
        accountId: data.accountId,
        userId: data.userId,
        phoneNumber: data.phoneNumber,
        displayName: data.displayName,
        contactName: data.contactName,
        contactPhone: data.contactPhone || data.phoneNumber,
        defaultZip: data.defaultZip,
        defaultLocation: data.defaultLocation,
        sessionState: data.sessionState || 'missing',
        status: data.status || 'draft',
        reviewState: data.reviewState || 'clear',
        verificationExpiresAt: data.verificationExpiresAt ? new Date(data.verificationExpiresAt) : undefined,
        notes: data.notes,
      },
    });
  }

  async update(id: string, data: any) {
    const cleanData = { ...data };
    if (cleanData.verificationExpiresAt) {
      cleanData.verificationExpiresAt = new Date(cleanData.verificationExpiresAt);
    }

    return this.prisma.bazosIdentity.update({
      where: { id },
      data: cleanData,
    });
  }

  async markVerified(id: string, data: any = {}) {
    const verificationExpiresAt = data.verificationExpiresAt
      ? new Date(data.verificationExpiresAt)
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const identity = await this.prisma.bazosIdentity.update({
      where: { id },
      data: {
        status: 'verified',
        sessionState: data.sessionState || 'active',
        reviewState: 'clear',
        verificationExpiresAt,
        notes: data.notes,
      },
    });

    this.logger.log(`Marked Bazos identity ${id} as verified`, { verificationExpiresAt });
    return identity;
  }

  async pause(id: string, reason: string) {
    return this.prisma.bazosIdentity.update({
      where: { id },
      data: {
        reviewState: 'paused',
        notes: reason,
      },
    });
  }
}
