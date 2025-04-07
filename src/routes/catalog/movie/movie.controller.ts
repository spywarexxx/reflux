import { PrometheusService } from '@/modules/prometheus/prometheus.service';
import {
  MOVIES_CATEGORIES_MAPPING_URL,
  MOVIES_GENRES_MAPPING_URL,
} from '@/modules/rede-canais/constants/listing';
import { RedeCanaisMetasService } from '@/modules/rede-canais/services/rede-canais.metas.service';
import { CatalogMovieService } from '@/routes/catalog/movie/movie.service';
import { paginate } from '@/utils/pagination';
import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
} from '@nestjs/common';

@Controller('/catalog/movie')
export class CatalogMovieController {
  private readonly defaultResponse = {
    hasMore: true,
    cacheMaxAge: 0,
    staleError: 0,
    staleRevalidate: 0,
  };

  public constructor(
    private readonly prometheusService: PrometheusService,
    private readonly catalogMovieService: CatalogMovieService,
    private readonly redeCanaisMetasService: RedeCanaisMetasService,
  ) {}

  @Get('/reflux.:type.json')
  @Header('cache-control', 'max-age=30')
  public async get(@Param('type') type: string) {
    const endStatsTimer = this.prometheusService.startMoviesFetchDuration();
    const movieType = this.catalogMovieService.convertType(type);
    const movieUrl = MOVIES_CATEGORIES_MAPPING_URL[movieType];

    if (!movieUrl) {
      throw new NotFoundException();
    }

    const metas = await this.redeCanaisMetasService.getListOfContent(
      'movie',
      movieUrl,
      0,
      5,
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
    const endStatsTimer = this.prometheusService.startMoviesFetchDuration();
    const params = new URLSearchParams(query);
    const genre = params.get('genre');
    const skip = params.has('skip') ? Number(params.get('skip')) : 0;
    const search = params.get('search');

    if (search) {
      const metas = await this.redeCanaisMetasService.searchContent(
        'movie',
        search,
      );

      return { ...this.defaultResponse, hasMore: false, metas };
    }

    const { fromPage, toPage } = paginate(skip);

    const movieType = this.catalogMovieService.convertType(type);
    const movieGenre = this.catalogMovieService.convertGenre(movieType, genre);

    const movieUrl =
      MOVIES_GENRES_MAPPING_URL[movieGenre] ??
      MOVIES_CATEGORIES_MAPPING_URL[movieType];

    if (!movieUrl) {
      throw new NotFoundException();
    }

    const metas = await this.redeCanaisMetasService.getListOfContent(
      'movie',
      movieUrl,
      fromPage,
      toPage,
    );

    endStatsTimer();
    return { ...this.defaultResponse, metas };
  }
}
