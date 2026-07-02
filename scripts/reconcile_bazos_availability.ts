import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { BazosAvailabilityReconciliationService } from '../shared/bazos/reconciliation/bazos-availability-reconciliation.service';
import { ClientsModule, LoggerModule, PrismaModule } from '../shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    PrismaModule,
    LoggerModule,
    ClientsModule,
  ],
  providers: [BazosAvailabilityReconciliationService],
})
class BazosAvailabilityReconciliationCliModule {}

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

async function main() {
  const app = await NestFactory.createApplicationContext(BazosAvailabilityReconciliationCliModule, { logger: false });
  try {
    const service = app.get(BazosAvailabilityReconciliationService);
    const result = await service.reconcile({
      limit: argValue('limit') ? Number(argValue('limit')) : undefined,
      dryRun: process.argv.includes('--dry-run'),
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error?.stack || error?.message || String(error)}\n`);
  process.exit(1);
});
