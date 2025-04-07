import {
  RedeCanaisIndexingFormat,
  RedeCanaisIndexingService,
} from '@/modules/rede-canais/services/rede-canais.indexing.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RedeCanaisCachingService implements OnModuleInit {
  private readonly logger = new Logger(RedeCanaisCachingService.name);

  private static moviesCache: RedeCanaisIndexingFormat[] = [];
  private static seriesCache: RedeCanaisIndexingFormat[] = [];
  private static cacheInitialized = false;

  public constructor(
    private readonly redeCanaisIndexingService: RedeCanaisIndexingService,
  ) {}

  public getMoviesCache(): ReadonlyArray<RedeCanaisIndexingFormat> {
    return RedeCanaisCachingService.moviesCache;
  }

  public getSeriesCache(): ReadonlyArray<RedeCanaisIndexingFormat> {
    return RedeCanaisCachingService.seriesCache;
  }

  public isCacheInitialized(): boolean {
    return RedeCanaisCachingService.cacheInitialized;
  }

  public async onModuleInit(): Promise<void> {
    if (RedeCanaisCachingService.cacheInitialized) {
      return;
    }

    try {
      await this.initializeCache();
      RedeCanaisCachingService.cacheInitialized = true;
      this.logger.log('Cache initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize cache: ${error.stack}`);
      throw error;
    }
  }

  private async initializeCache(): Promise<void> {
    const [movies, series] = await Promise.all([
      this.redeCanaisIndexingService.findMovies(),
      this.redeCanaisIndexingService.findSeries(),
    ]);

    RedeCanaisCachingService.moviesCache = movies;
    RedeCanaisCachingService.seriesCache = series;

    this.logger.log(`${movies.length} movies were cached`);
    this.logger.log(`${series.length} series were cached`);
  }
}
