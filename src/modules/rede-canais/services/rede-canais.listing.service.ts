import { ProxyService } from '@/modules/proxy/proxy.service';
import {
  LISTING_ID_FALLBACK,
  LISTING_ID_REGEX,
  LISTING_RAW_REGEX,
  LISTING_TITLE_FALLBACK,
  LISTING_TITLE_REGEX,
  LISTING_URL_FALLBACK,
  LISTING_URL_REGEX,
  paginate,
} from '@/modules/rede-canais/constants/listing';
import { RedeCanaisCachingService } from '@/modules/rede-canais/services/rede-canais.caching.service';
import {
  RedeCanaisIndexingFormat,
  RedeCanaisIndexingService,
} from '@/modules/rede-canais/services/rede-canais.indexing.service';
import { decrypt } from '@/modules/rede-canais/utils/decrypt';
import { TmdbContentType } from '@/modules/tmdb/types/content-type';
import { comparePhrases, findBestMatch } from '@/utils/strings';
import { Injectable, Logger } from '@nestjs/common';
import { Series } from '@prisma/client';

export interface RedeCanaisListingSanitize {
  url: string;
  id: string;
  title: string;
}

@Injectable()
export class RedeCanaisListingService {
  private readonly logger = new Logger(RedeCanaisListingService.name);

  public constructor(
    private readonly proxyService: ProxyService,
    private readonly redeCanaisCachingService: RedeCanaisCachingService,
    private readonly redeCanaisIndexingService: RedeCanaisIndexingService,
  ) {}

  public async list(
    contentType: TmdbContentType,
    url: string,
    page: number,
  ): Promise<RedeCanaisIndexingFormat[] | null> {
    try {
      const pagination = paginate(url, Math.max(page, 1));
      const response = await this.fetchWithProxy(pagination);
      const decrypted = decrypt(response);
      const indexes = decrypted.match(LISTING_RAW_REGEX);

      if (!indexes?.length) {
        return [];
      }

      const sanitized = this.sanitize(indexes);
      return this.formatListings(contentType, sanitized);
    } catch (error) {
      this.logger.error(`Failed to list ${contentType} (${error.stack})`);
      throw error;
    }
  }

  public format(
    contentType: TmdbContentType,
    sanitized: RedeCanaisListingSanitize | Series,
  ): RedeCanaisIndexingFormat | null {
    const contentSanitized = this.redeCanaisIndexingService.sanitize(
      contentType,
      sanitized.title,
    );

    const contentFormatted =
      this.redeCanaisIndexingService.format(contentSanitized);

    const cache =
      contentType === 'movie'
        ? this.redeCanaisCachingService.getMoviesCache()
        : this.redeCanaisCachingService.getSeriesCache();

    const filteredItems = cache.filter((item) =>
      comparePhrases(item.title, contentFormatted.title),
    );

    if (!filteredItems.length) {
      return null;
    }

    const bestMatch = findBestMatch(
      contentFormatted.title,
      filteredItems.map((item) => item.title),
    );

    return filteredItems.find((item) => item.title === bestMatch) ?? null;
  }

  private async fetchWithProxy(url: string): Promise<string> {
    const response = await fetch(this.proxyService.bypass(url));

    if (!response.ok) {
      throw new Error(`HTTP error, status: ${response.status}`);
    }

    return response.text();
  }

  private sanitize(indexes: string[]): RedeCanaisListingSanitize[] {
    return indexes.map((index) => ({
      url: index.match(LISTING_URL_REGEX)?.[1] ?? LISTING_URL_FALLBACK,
      id: index.match(LISTING_ID_REGEX)?.[1] ?? LISTING_ID_FALLBACK,
      title: index.match(LISTING_TITLE_REGEX)?.[1] ?? LISTING_TITLE_FALLBACK,
    }));
  }

  private formatListings(
    contentType: TmdbContentType,
    sanitizedListings: RedeCanaisListingSanitize[],
  ): RedeCanaisIndexingFormat[] {
    return sanitizedListings
      .map((sanitized) => this.format(contentType, sanitized))
      .filter((item): item is RedeCanaisIndexingFormat => item !== null);
  }
}
