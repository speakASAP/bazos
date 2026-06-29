import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { BazosAdService } from './bazos-ad.service';
import { LoggerService } from '../../logger/logger.service';

const TICK_MS = 60_000;

@Injectable()
export class BazosAdAvailabilityScheduler implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly ads: BazosAdService,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.tick(), TICK_MS);
    this.timer.unref?.();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick() {
    if (this.running) return;
    this.running = true;
    try {
      const result = await this.ads.refreshDueExternalStatus();
      if (result.checked) {
        this.logger.log('Bazos availability scheduler checked due ad', result);
      }
    } catch (error) {
      this.logger.warn('Bazos availability scheduler failed', { error: error?.message || String(error) });
    } finally {
      this.running = false;
    }
  }
}
