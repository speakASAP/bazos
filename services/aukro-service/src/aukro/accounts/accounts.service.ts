import { Injectable } from '@nestjs/common';
import { PrismaService, LoggerService } from '@bazos/shared';

@Injectable()
export class AccountsService {
  private readonly logger: LoggerService;

  constructor(
    private readonly prisma: PrismaService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext('AccountsService');
  }

  async findAll() {
    return this.prisma.bazosAccount.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.bazosAccount.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.bazosAccount.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.bazosAccount.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.bazosAccount.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

