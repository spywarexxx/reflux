import { EnvService } from '@/modules/env/env.service';
import { TmdbContentType } from '@/modules/tmdb/types/content-type';
import { TmdbExternalId } from '@/modules/tmdb/types/external-id';
import { TmdbGenres } from '@/modules/tmdb/types/genres';
import { TmdbMovie } from '@/modules/tmdb/types/movie';
import { TmdbSearch } from '@/modules/tmdb/types/search';
import { TmdbTv } from '@/modules/tmdb/types/tv';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class TmdbService implements OnModuleInit {
  private readonly logger = new Logger(TmdbService.name);

  private readonly apiUrl = 'https://api.themoviedb.org/3';
  private readonly authorizationHeader =
    `Bearer ${this.envService.get('TMDB_READ_API_KEY')}`;

  // Backdrop images and posters fallback url (currently: original size of image, it can cause performance issues).
  public readonly cdnUrl = 'https://image.tmdb.org/t/p/original';

  public constructor(private readonly envService: EnvService) {}

  public async onModuleInit() {
    const isSessionValid = await this.validateKey();

    if (!isSessionValid) {
      this.logger.error('Invalid tmdb api key, check environment settings.');
      process.exit(1);
    }
  }

  public async validateKey() {
    const response = await fetch(`${this.apiUrl}/authentication`, {
      headers: { authorization: this.authorizationHeader },
    });

    return response.ok;
  }

  public async search<T = TmdbMovie | TmdbTv>(
    contentType: TmdbContentType,
    query: string,
    page: number = 1,
  ) {
    const searchParams = new URLSearchParams();

    searchParams.append('query', query);
    searchParams.append('page', String(page));
    searchParams.append('language', 'pt-BR');
    searchParams.append('include_adult', String(true));

    const response = await fetch(
      `${this.apiUrl}/search/${contentType}?${searchParams.toString()}`,
      { headers: { authorization: this.authorizationHeader } },
    );

    if (response.ok) {
      const data: TmdbSearch<T> = await response.json();
      return data;
    }

    return null;
  }

  /**
   * Find other IDs related to TMDb content (usually used to retrieve IMDb IDs, though not in use today).
   */
  public async findExternalId(contentType: TmdbContentType, id: number) {
    const response = await fetch(
      `${this.apiUrl}/${contentType}/${id}/external_ids`,
      { headers: { authorization: this.authorizationHeader } },
    );

    if (response.ok) {
      const data: TmdbExternalId = await response.json();
      return data;
    }

    return null;
  }

  public async listGenres(contentType: TmdbContentType) {
    const searchParams = new URLSearchParams();
    searchParams.append('language', 'pt-BR');

    const response = await fetch(
      `${this.apiUrl}/genre/${contentType}/list?${searchParams.toString()}`,
      {
        headers: { authorization: this.authorizationHeader },
      },
    );

    if (response.ok) {
      const data: TmdbGenres = await response.json();
      return data;
    }

    return null;
  }
}
