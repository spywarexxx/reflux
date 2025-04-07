import { PrometheusService } from '@/modules/prometheus/prometheus.service';
import {
  ANIMES_CATEGORIES_MAPPING_URL,
  ANIMES_GENRES_MAPPING_URL,
  SERIES_CATEGORIES_MAPPING_URL,
  SERIES_GENRES_MAPPING_URL,
} from '@/modules/rede-canais/constants/listing';
import { RedeCanaisMetasService } from '@/modules/rede-canais/services/rede-canais.metas.service';
import { CatalogSeriesService } from '@/routes/catalog/series/series.service';
import { paginate } from '@/utils/pagination';
import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
} from '@nestjs/common';

@Controller('/catalog/series')
export class CatalogSeriesController {
  private readonly defaultResponse = {
    hasMore: true,
    cacheMaxAge: 0,
    staleError: 0,
    staleRevalidate: 0,
  };

  public constructor(
    private readonly prometheusService: PrometheusService,
    private readonly catalogSeriesService: CatalogSeriesService,
    private readonly redeCanaisMetasService: RedeCanaisMetasService,
  ) {}

  @Get('/reflux.:type.json')
  @Header('cache-control', 'max-age=30')
  public async get(@Param('type') type: string) {
    const endStatsTimer = this.prometheusService.startSeriesFetchDuration();
    const seriesType = this.catalogSeriesService.convertType(type);
    const seriesUrl =
      SERIES_CATEGORIES_MAPPING_URL[seriesType] ??
      ANIMES_CATEGORIES_MAPPING_URL[seriesType];

    if (!seriesUrl) {
      throw new NotFoundException();
    }

    const metas = await this.redeCanaisMetasService.getListOfContent(
      'tv',
      seriesUrl,
      5,
      10,
    );

    endStatsTimer();
    return { ...this.defaultResponse, metas };
  }

  @Get('/reflux.:type/:query.json')
  @Header('cache-control', 'max-age=30')
  public async queries(
    @Param('type') type: string,
    @Param('query') query: string,
  ) {
    const endStatsTimer = this.prometheusService.startSeriesFetchDuration();
    const params = new URLSearchParams(query);
    const genre = params.get('genre');
    const skip = params.has('skip') ? Number(params.get('skip')) : 0;
    const search = params.get('search');

    if (search) {
      const metas = await this.redeCanaisMetasService.searchContent(
        'tv',
        search,
      );

      return { ...this.defaultResponse, hasMore: false, metas };
    }

    const { fromPage, toPage } = paginate(skip);

    const seriesType = this.catalogSeriesService.convertType(type);
    const seriesGenre = this.catalogSeriesService.convertGenre(
      seriesType,
      genre,
    );

    const seriesUrl =
      SERIES_GENRES_MAPPING_URL[seriesGenre] ??
      ANIMES_GENRES_MAPPING_URL[seriesGenre] ??
      SERIES_CATEGORIES_MAPPING_URL[seriesType] ??
      ANIMES_CATEGORIES_MAPPING_URL[seriesType];

    if (!seriesUrl) {
      throw new NotFoundException();
    }

    const metas = await this.redeCanaisMetasService.getListOfContent(
      'tv',
      seriesUrl,
      fromPage,
      toPage,
    );

    endStatsTimer();
    return { ...this.defaultResponse, metas };
  }
}
