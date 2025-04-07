import { EnvService } from '@/modules/env/env.service';
import { ProxyService } from '@/modules/proxy/proxy.service';
import {
  INDEXING_AUDIO_DUBBED_REGEX,
  INDEXING_AUDIO_FALLBACK,
  INDEXING_AUDIO_IN_URL_FALLBACK,
  INDEXING_AUDIO_IN_URL_REGEX,
  INDEXING_AUDIO_MUTED_REGEX,
  INDEXING_AUDIO_NATIONAL_REGEX,
  INDEXING_AUDIO_REGEX,
  INDEXING_AUDIO_SUBTITLED_REGEX,
  INDEXING_ID_FALLBACK,
  INDEXING_ID_REGEX,
  INDEXING_QUALITY_FALLBACK,
  INDEXING_QUALITY_FULL_HIGH_DEFINITION_REGEX,
  INDEXING_QUALITY_HIGH_DEFINITION_REGEX,
  INDEXING_QUALITY_IN_URL_FALLBACK,
  INDEXING_QUALITY_IN_URL_REGEX,
  INDEXING_QUALITY_REGEX,
  INDEXING_QUALITY_STANDARD_DEFINITION_REGEX,
  INDEXING_QUALITY_ULTRA_HIGH_DEFINITION_REGEX,
  INDEXING_RAW_REGEX,
  INDEXING_RAW_TITLE_FALLBACK,
  INDEXING_RAW_TITLE_REGEX,
  INDEXING_TITLE_FALLBACK,
  INDEXING_TITLE_REGEX_1,
  INDEXING_TITLE_REGEX_2,
  INDEXING_URL_FALLBACK,
  INDEXING_URL_REGEX,
  MOVIES_MAPPING_URL,
  SERIES_MAPPING_URL,
} from '@/modules/rede-canais/constants/indexing';
import { RedeCanaisEpisodesVideo } from '@/modules/rede-canais/services/rede-canais.episodes.service';
import { decrypt } from '@/modules/rede-canais/utils/decrypt';
import { TmdbService } from '@/modules/tmdb/tmdb.service';
import { TmdbContentType } from '@/modules/tmdb/types/content-type';
import { TmdbMovie } from '@/modules/tmdb/types/movie';
import { TmdbTv } from '@/modules/tmdb/types/tv';
import { PrismaService } from '@/services/database/prisma.service';
import { compareBestMatch, comparePhrases } from '@/utils/strings';
import { Injectable, Logger } from '@nestjs/common';
import {
  Audio,
  Genre,
  Movie,
  Prisma,
  Quality,
  Series,
  Stream,
} from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

interface IndexingSanitize {
  title: string;
  rawTitle: string;
  audio: string;
  audioInUrl: string;
  quality: string;
  qualityInUrl: string;
  url: string;
  id: string;
  contentType?: TmdbContentType;
}

export type RedeCanaisIndexingDatabaseResult = (Movie | Series) & {
  genres: Genre[];
  streams: Stream[];
  videos?: RedeCanaisEpisodesVideo[];
};

export interface RedeCanaisIndexingFormat {
  title: string;
  rawTitle: string;
  audio: Audio;
  quality: Quality;
  url: string;
  id: string;
  contentType?: TmdbContentType;
}

@Injectable()
export class RedeCanaisIndexingService {
  private readonly logger = new Logger(RedeCanaisIndexingService.name);

  public constructor(
    private readonly envService: EnvService,
    private readonly prismaService: PrismaService,
    private readonly proxyService: ProxyService,
    private readonly tmdbService: TmdbService,
  ) {}

  public async indexMedia(
    formatted: RedeCanaisIndexingFormat,
  ): Promise<RedeCanaisIndexingDatabaseResult> {
    try {
      const database = this.getDatabaseDelegate(formatted.contentType);
      const existing = await this.findExistingMedia(database, formatted);

      if (existing) {
        return existing;
      }

      const tmdbResult = await this.searchTmdb(formatted);

      if (tmdbResult) {
        return await this.handleTmdbResult(database, formatted, tmdbResult);
      }

      return await this.createBasicMedia(database, formatted);
    } catch (error) {
      this.logger.error(
        `Failed to index media: ${error.message} (${error.stack})`,
      );
      throw error;
    }
  }

  public async findMovies(): Promise<RedeCanaisIndexingFormat[]> {
    return this.fetchAndProcessMedia(MOVIES_MAPPING_URL, 'movie');
  }

  public async findSeries(): Promise<RedeCanaisIndexingFormat[]> {
    return this.fetchAndProcessMedia(SERIES_MAPPING_URL, 'tv');
  }

  public sanitize(
    contentType: TmdbContentType,
    index: string,
  ): IndexingSanitize {
    const getMatch = (regex: RegExp, fallback: string): string => {
      const match = index.match(regex);
      return match ? match[1] : fallback;
    };

    const title =
      getMatch(INDEXING_TITLE_REGEX_1, null) ??
      getMatch(INDEXING_TITLE_REGEX_2, null) ??
      INDEXING_TITLE_FALLBACK;

    return {
      title,
      rawTitle: getMatch(INDEXING_RAW_TITLE_REGEX, INDEXING_RAW_TITLE_FALLBACK),
      audio: getMatch(INDEXING_AUDIO_REGEX, INDEXING_AUDIO_FALLBACK),
      audioInUrl: getMatch(
        INDEXING_AUDIO_IN_URL_REGEX,
        INDEXING_AUDIO_IN_URL_FALLBACK,
      ),
      quality: getMatch(INDEXING_QUALITY_REGEX, INDEXING_QUALITY_FALLBACK),
      qualityInUrl: getMatch(
        INDEXING_QUALITY_IN_URL_REGEX,
        INDEXING_QUALITY_IN_URL_FALLBACK,
      ),
      url: getMatch(INDEXING_URL_REGEX, INDEXING_URL_FALLBACK),
      id: getMatch(INDEXING_ID_REGEX, INDEXING_ID_FALLBACK),
      ...(contentType ? { contentType } : {}),
    };
  }

  public format(sanitized: IndexingSanitize): RedeCanaisIndexingFormat {
    const getMatchedValue = (
      value: string,
      inUrl: string,
      regexes: Record<string, RegExp>,
    ) => {
      for (const [key, regex] of Object.entries(regexes)) {
        if (value.match(regex) || inUrl.match(regex)) {
          return key;
        }
      }

      return 'UNKNOWN';
    };

    const audioTypes = {
      DUBBED: INDEXING_AUDIO_DUBBED_REGEX,
      SUBTITLED: INDEXING_AUDIO_SUBTITLED_REGEX,
      NATIONAL: INDEXING_AUDIO_NATIONAL_REGEX,
      MUTED: INDEXING_AUDIO_MUTED_REGEX,
    };

    const qualityTypes = {
      STANDARD_DEFINITION: INDEXING_QUALITY_STANDARD_DEFINITION_REGEX,
      HIGH_DEFINITION: INDEXING_QUALITY_HIGH_DEFINITION_REGEX,
      FULL_HIGH_DEFINITION: INDEXING_QUALITY_FULL_HIGH_DEFINITION_REGEX,
      ULTRA_HIGH_DEFINITION: INDEXING_QUALITY_ULTRA_HIGH_DEFINITION_REGEX,
    };

    return {
      title: sanitized.title,
      rawTitle: sanitized.rawTitle,
      audio: getMatchedValue(
        sanitized.audio,
        sanitized.audioInUrl,
        audioTypes,
      ) as Audio,
      quality: getMatchedValue(
        sanitized.quality,
        sanitized.qualityInUrl,
        qualityTypes,
      ) as Quality,
      url: sanitized.url,
      id: sanitized.id,
      ...(sanitized.contentType ? { contentType: sanitized.contentType } : {}),
    };
  }

  private getDatabaseDelegate(contentType?: TmdbContentType) {
    return contentType === 'movie'
      ? this.prismaService.movie
      : (this.prismaService.series as never);
  }

  private async findExistingMedia(
    database: Prisma.MovieDelegate,
    formatted: RedeCanaisIndexingFormat,
  ): Promise<RedeCanaisIndexingDatabaseResult | null> {
    const found = await database.findFirst({
      where: {
        streams: {
          some: {
            url: formatted.url,
            AND: [{ audio: formatted.audio }, { quality: formatted.quality }],
          },
        },
      },
      include: { genres: true, streams: true },
    });

    return found;
  }

  private async searchTmdb(formatted: RedeCanaisIndexingFormat) {
    const result = await this.tmdbService.search<TmdbMovie & TmdbTv>(
      formatted.contentType,
      formatted.title,
    );

    if (!result?.results?.length) {
      return null;
    }

    const resultItems = result.results.filter((r) =>
      comparePhrases(r.name ?? r.title, formatted.title),
    );

    const bestMatch = compareBestMatch(
      formatted.title,
      resultItems.map((f) => f.name ?? f.title),
    );

    return resultItems.find((f) => f.name ?? f.title === bestMatch);
  }

  private async handleTmdbResult(
    database: Prisma.MovieDelegate<DefaultArgs>,
    formatted: RedeCanaisIndexingFormat,
    tmdbItem: TmdbMovie & TmdbTv,
  ): Promise<RedeCanaisIndexingDatabaseResult> {
    const existing = await database.findUnique({
      where: { tmdb_id: tmdbItem.id },
      include: { genres: true, streams: true },
    });

    if (existing) {
      return await this.updateExistingMedia(database, existing, formatted);
    }

    return await this.createMediaFromTmdb(database, formatted, tmdbItem);
  }

  private async updateExistingMedia(
    database: Prisma.MovieDelegate<DefaultArgs>,
    existing: RedeCanaisIndexingDatabaseResult,
    formatted: RedeCanaisIndexingFormat,
  ): Promise<RedeCanaisIndexingDatabaseResult> {
    const hasStream = existing.streams.some(
      (s) => s.audio === formatted.audio && s.quality === formatted.quality,
    );

    if (!hasStream) {
      return await database.update({
        where: { id: existing.id },
        data: {
          streams: {
            create: {
              url: formatted.url,
              audio: formatted.audio,
              quality: formatted.quality,
            },
          },
        },
        include: { genres: true, streams: true },
      });
    }

    return existing;
  }

  private async createMediaFromTmdb(
    database: Prisma.MovieDelegate<DefaultArgs>,
    formatted: RedeCanaisIndexingFormat,
    tmdbItem: TmdbMovie & TmdbTv,
  ): Promise<RedeCanaisIndexingDatabaseResult> {
    const backdropUrl = tmdbItem.backdrop_path
      ? this.tmdbService.cdnUrl.concat(tmdbItem.backdrop_path)
      : undefined;
    const posterUrl = tmdbItem.poster_path
      ? this.tmdbService.cdnUrl.concat(tmdbItem.poster_path)
      : undefined;

    const fallbackUrl =
      !backdropUrl && !posterUrl
        ? await this.fetchMediaPoster(formatted.url)
        : undefined;

    const data: Prisma.MovieCreateInput | Prisma.SeriesCreateInput = {
      tmdb_id: tmdbItem.id,
      backdrop_url: backdropUrl ?? posterUrl ?? fallbackUrl,
      poster_url: posterUrl ?? backdropUrl ?? fallbackUrl,
      adult: tmdbItem.adult,
      title: tmdbItem.name ?? tmdbItem.title ?? formatted.title,
      original_title:
        tmdbItem.original_name ?? tmdbItem.original_title ?? formatted.title,
      overview: tmdbItem.overview,
      language: tmdbItem.original_language,
      rating: Number.parseFloat(tmdbItem.vote_average.toFixed(1)),
      release_date: tmdbItem.first_air_date
        ? new Date(tmdbItem.first_air_date)
        : tmdbItem.release_date
          ? new Date(tmdbItem.release_date)
          : undefined,
      genres: {
        connect: tmdbItem.genre_ids?.map((id) => ({ id })) ?? [],
      },
      streams: {
        create: {
          url: formatted.url,
          audio: formatted.audio,
          quality: formatted.quality,
        },
      },
    };

    return await database.create({
      data,
      include: { genres: true, streams: true },
    });
  }

  private async createBasicMedia(
    database: Prisma.MovieDelegate<DefaultArgs>,
    formatted: RedeCanaisIndexingFormat,
  ): Promise<RedeCanaisIndexingDatabaseResult> {
    const posterUrl = await this.fetchMediaPoster(formatted.url);

    return await database.create({
      data: {
        backdrop_url: posterUrl,
        poster_url: posterUrl,
        title: formatted.title,
        streams: {
          create: {
            url: formatted.url,
            audio: formatted.audio,
            quality: formatted.quality,
          },
        },
      },
      include: { genres: true, streams: true },
    });
  }

  private async fetchAndProcessMedia(
    url: string,
    contentType: TmdbContentType,
  ): Promise<RedeCanaisIndexingFormat[]> {
    try {
      const response = await fetch(this.proxyService.bypass(url));
      const text = await response.text();
      const indexes: string[] = text.match(INDEXING_RAW_REGEX) ?? [];

      return indexes
        .map((index) => this.sanitize(contentType, index))
        .map(this.format);
    } catch (error) {
      this.logger.error(`Failed to fetch ${contentType}: ${error.message}`);
      return [];
    }
  }

  private async fetchMediaPoster(url: string) {
    const { uri, referer } = this.buildRequestInfo(url);
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        referer,
        'referer-policy': 'strict-origin-when-cross-origin',
      },
    });

    if (!response.ok) {
      return undefined;
    }

    const body = await response.text();
    const content = decrypt(body);

    const imgSrcMatch = content.match(/\"((.*)\.jpg)\"/);

    if (!imgSrcMatch) {
      return undefined;
    }

    const parsedUrl = new URL(imgSrcMatch[1], uri);
    const proxyUrl = this.proxyService.image(parsedUrl.toString());

    return proxyUrl;
  }

  private buildRequestInfo(url: string): { uri: URL; referer: string } {
    const uri = new URL(url, this.envService.get('API_URL'));
    const referer = `${uri.protocol}//${uri.host}`;

    return { uri, referer };
  }
}
