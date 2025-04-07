import { EnvService } from '@/modules/env/env.service';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AutoIndexService {
  private readonly logger = new Logger(AutoIndexService.name);

  private readonly MOVIES_INDEXING_CONFIG = {
    PAGE_FROM: 1,
    PAGE_TO: 10,
    RETURN_AMOUNT: 40,
    URLS: [
      'reflux.featured',
      'reflux.dubbed',
      'reflux.subtitled',
      'reflux.national',
      'reflux.2024',
      'reflux.2023',
      'reflux.2022',
      'reflux.2021',
    ],
  };

  private readonly SERIES_INDEXING_CONFIG = {
    PAGE_FROM: 1,
    PAGE_TO: 10,
    RETURN_AMOUNT: 40,
    URLS: ['reflux.featured', 'reflux.animes'],
  };

  public constructor(
    private readonly httpService: HttpService,
    private readonly envService: EnvService,
  ) {}

  @Cron('0 4 * * *')
  public async handleMoviesIndexing() {
    try {
      this.logger.log('Starting movies indexing...');
      await this.processMoviesIndexing();
      this.logger.log('Movie indexing completed successfully');
    } catch (error) {
      this.logger.error(`Error during movie indexing: ${error}`);
    }
  }

  @Cron('0 4 * * *')
  public async handleSeriesIndexing() {
    try {
      this.logger.log('Starting series indexing...');
      await this.processSeriesIndexing();
      this.logger.log('Series indexing completed successfully');
    } catch (error) {
      this.logger.error(`Error during series indexing: ${error}`);
    }
  }

  private async processMoviesIndexing() {
    const { URLS, PAGE_FROM, PAGE_TO, RETURN_AMOUNT } =
      this.MOVIES_INDEXING_CONFIG;

    for (const urlPath of URLS) {
      for (let page = PAGE_FROM; page <= PAGE_TO; page++) {
        const skipOffset = (page - 1) * RETURN_AMOUNT;
        const endpoint = this.buildUrl(
          `/catalog/movie/${urlPath}/skip=${skipOffset}.json`,
        );

        try {
          await firstValueFrom(this.httpService.get(endpoint));
        } catch {}
      }
    }
  }

  private async processSeriesIndexing() {
    const { URLS, PAGE_FROM, PAGE_TO, RETURN_AMOUNT } =
      this.SERIES_INDEXING_CONFIG;

    for (const urlPath of URLS) {
      for (let page = PAGE_FROM; page <= PAGE_TO; page++) {
        const skipOffset = (page - 1) * RETURN_AMOUNT;
        const endpoint = this.buildUrl(
          `/catalog/series/${urlPath}/skip=${skipOffset}.json`,
        );

        try {
          await firstValueFrom(this.httpService.get(endpoint));
        } catch {}
      }
    }
  }

  private buildUrl(path: string): string {
    const baseUrl = this.envService.get('APP_URL');

    if (!baseUrl) {
      throw new Error('APP_URL environment variable is not set.');
    }

    return new URL(path, baseUrl).toString();
  }
}
