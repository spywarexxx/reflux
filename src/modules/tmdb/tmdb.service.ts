import { Media } from '@/enums/media';
import { EnvService } from '@/modules/env/env.service';
import { API_URL, IMAGE_URL } from '@/modules/tmdb/constants/url';
import {
  ContentType,
  Genre,
  Search,
  SearchMovie,
  SearchTv,
  Trending,
} from '@/modules/tmdb/types/tmdb';
import { convertToContentType } from '@/modules/tmdb/utils/string';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Type } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class TmdbService implements OnModuleInit {
  private readonly logger = new Logger(TmdbService.name);
  private readonly url = API_URL;
  private readonly cdn = IMAGE_URL;
  private readonly api = axios.create({
    baseURL: this.url,
    headers: { authorization: `Bearer ${this.envService.get('TMDB_API_KEY')}` },
  });

  public constructor(private readonly envService: EnvService) {}

  public async onModuleInit(): Promise<void> {
    const isSessionValid = await this.validateKey();

    if (!isSessionValid) {
      this.logger.error('Invalid TMDB api key, check environment settings.');
      process.exit(1);
    }
  }

  public async validateKey(): Promise<boolean> {
    const { status } = await this.api.get('authentication');
    const isValid = status === 200;

    return isValid;
  }

  public async listGenres(type: ContentType | Media): Promise<{
    genres: Genre[];
  } | null> {
    const contentType = convertToContentType(type);
    const searchParams = new URLSearchParams();

    searchParams.append('language', 'pt-BR');

    const params = searchParams.toString();
    const uri = `genre/${contentType}/list?${params}`;

    const { status, data } = await this.api.get<{ genres: Genre[] }>(uri);
    const isValid = status === 200;

    if (isValid) {
      return data;
    }

    return null;
  }

  public async searchMedia(
    type: ContentType | Media | Type,
    query: string,
    page: number = 1,
  ): Promise<(SearchMovie & SearchTv)[] | null> {
    const contentType = convertToContentType(type);
    const searchParams = new URLSearchParams();

    searchParams.append('query', query);
    searchParams.append('page', String(page));
    searchParams.append('language', 'pt-BR');
    searchParams.append('include_adult', String(true));

    const params = searchParams.toString();
    const uri = `search/${contentType}?${params}`;

    const { status, data } =
      await this.api.get<Search<SearchMovie & SearchTv>>(uri);
    const isValid = status === 200;

    if (isValid) {
      const formatted = this.formatSearch(data);

      return formatted;
    }

    return null;
  }

  public async getTrending(
    type: ContentType | Media,
    trending: Trending,
    page: number = 1,
  ): Promise<(SearchMovie & SearchTv)[]> {
    const contentType = convertToContentType(type);
    const searchParams = new URLSearchParams();

    searchParams.append('page', String(page));
    searchParams.append('language', 'pt-BR');
    searchParams.append('include_adult', String(false));

    switch (trending) {
      case Trending.POPULAR:
        searchParams.append('sort_by', 'popularity.desc');
        break;

      case Trending.TOP_RATED:
        searchParams.append('sort_by', 'vote_average.desc');
        searchParams.append('vote_count.gte', String(200));
        break;

      case Trending.THEATHER:
        searchParams.append('sort_by', 'popularity.desc');
        searchParams.append('with_release_type', '2|3');
        break;
    }

    const params = searchParams.toString();
    const uri = `discover/${contentType}?${params}`;

    const { status, data } =
      await this.api.get<Search<SearchMovie & SearchTv>>(uri);
    const isValid = status === 200;

    if (isValid) {
      const formatted = this.formatSearch(data);

      return formatted;
    }

    return [];
  }

  private formatSearch(
    data: Search<SearchMovie & SearchTv>,
  ): (SearchMovie & SearchTv)[] {
    const formatted: (SearchMovie & SearchTv)[] = [];

    for (const item of data.results) {
      const backdropPath = `${this.cdn}${item.backdrop_path}`;
      const posterPath = `${this.cdn}${item.poster_path}`;
      const popularity = item.popularity ?? 0;
      const voteAverage = item.vote_average ?? 0;
      const genresId = item.genre_ids ?? [];

      item.backdrop_path = backdropPath;
      item.poster_path = posterPath;
      item.popularity = Number(popularity.toFixed(1));
      item.vote_average = Number(voteAverage.toFixed(1));
      item.genre_ids = genresId;

      formatted.push(item);
    }

    return formatted;
  }
}
