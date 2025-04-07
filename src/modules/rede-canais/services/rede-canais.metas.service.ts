import { EnvService } from '@/modules/env/env.service';
import { RedeCanaisCachingService } from '@/modules/rede-canais/services/rede-canais.caching.service';
import { RedeCanaisEpisodesService } from '@/modules/rede-canais/services/rede-canais.episodes.service';
import {
  RedeCanaisIndexingDatabaseResult,
  RedeCanaisIndexingFormat,
  RedeCanaisIndexingService,
} from '@/modules/rede-canais/services/rede-canais.indexing.service';
import { RedeCanaisListingService } from '@/modules/rede-canais/services/rede-canais.listing.service';
import { TmdbContentType } from '@/modules/tmdb/types/content-type';
import { PrismaService } from '@/services/database/prisma.service';
import { hash, normalize } from '@/utils/strings';
import { Injectable } from '@nestjs/common';
import * as packageJson from '@package';
import { Audio, Genre, Movie, Quality, Series, Stream } from '@prisma/client';
import { decode } from 'he';

@Injectable()
export class RedeCanaisMetasService {
  private readonly STREAM_NAME = packageJson.stremio.name;

  public constructor(
    private readonly envService: EnvService,
    private readonly prismaService: PrismaService,
    private readonly cachingService: RedeCanaisCachingService,
    private readonly episodesService: RedeCanaisEpisodesService,
    private readonly indexingService: RedeCanaisIndexingService,
    private readonly listingService: RedeCanaisListingService,
  ) {}

  public async getContentById(contentType: TmdbContentType, id: string) {
    const database = this.getDatabaseDelegate(contentType);
    const content = await database.findUnique({
      where: { id },
      include: { genres: true, streams: true },
    });

    if (!content) {
      return null;
    }

    const videos =
      contentType === 'tv'
        ? await this.episodesService.getEpisodes(content as Series)
        : [];

    return this.formatContent(contentType, { ...content, videos });
  }

  public async getMovieStreamsById(id: string) {
    const streams = await this.prismaService.stream.findMany({
      where: { movie: { id } },
      include: { movie: { include: { genres: true } } },
    });

    const formatted = streams
      .map((stream) => this.formatMovieStream(stream))
      .sort((a, b) => a.title.localeCompare(b.title));

    return formatted;
  }

  public async getSeriesStreamsById(
    id: string,
    season: number,
    episode: number,
  ) {
    const stream = await this.prismaService.stream.findFirst({
      where: { series: { id } },
      include: { series: { include: { genres: true } } },
    });

    if (!stream) {
      return [];
    }

    const formatted = await this.formatSeriesStream(stream, season, episode);

    return formatted.sort((a, b) => a.title.localeCompare(b.title));
  }

  public async getListOfContent(
    contentType: TmdbContentType,
    url: string,
    fromPage = 0,
    toPage = 1,
  ) {
    const list = await this.fetchContentList(
      contentType,
      url,
      fromPage,
      toPage,
    );
    const content = await this.processContentList(list);

    return content.map((c) => this.formatContent(contentType, c));
  }

  public async searchContent(
    contentType: TmdbContentType,
    title: string,
    maxResults = 40,
  ) {
    const cache = this.getContentCache(contentType);
    const filtered = this.filterCacheByTitle(cache, title, maxResults);
    const content = await this.processContentList(filtered);

    return content.map((c) => this.formatContent(contentType, c));
  }

  private getDatabaseDelegate(contentType?: TmdbContentType) {
    return contentType === 'movie'
      ? this.prismaService.movie
      : (this.prismaService.series as never);
  }

  private async fetchContentList(
    contentType: TmdbContentType,
    url: string,
    fromPage: number,
    toPage: number,
  ): Promise<RedeCanaisIndexingFormat[]> {
    const list: RedeCanaisIndexingFormat[] = [];

    for (let page = fromPage; page < toPage; page++) {
      const items = await this.listingService.list(contentType, url, page + 1);
      list.push(...items);
    }

    return list;
  }

  private async processContentList(
    list: RedeCanaisIndexingFormat[],
  ): Promise<RedeCanaisIndexingDatabaseResult[]> {
    const content: RedeCanaisIndexingDatabaseResult[] = [];

    for (const item of list) {
      const indexed = await this.indexingService.indexMedia(item);
      const exists = content.some((c) => c.id === indexed?.id);

      if (indexed && !exists) {
        content.push({ ...indexed, videos: [] });
      }
    }

    return content;
  }

  private getContentCache(contentType: TmdbContentType) {
    return contentType === 'movie'
      ? this.cachingService.getMoviesCache()
      : this.cachingService.getSeriesCache();
  }

  private filterCacheByTitle(
    cache: readonly RedeCanaisIndexingFormat[],
    title: string,
    maxResults: number,
  ) {
    return cache
      .filter((c) => normalize(c.title).includes(normalize(title)))
      .slice(0, maxResults);
  }

  private formatContent(
    contentType: TmdbContentType,
    content: RedeCanaisIndexingDatabaseResult,
  ) {
    const type = contentType === 'movie' ? 'movie' : 'series';
    const name = content.title
      ? decode(content.title)
      : content.original_title
        ? decode(content.original_title)
        : null;

    return {
      type,
      ...(content?.id && { id: `reflux:${content.id}` }),
      ...(content?.imdb_id && { imdb_id: content.imdb_id }),
      ...(content?.tmdb_id && { moviedb_id: content.tmdb_id }),
      ...(content?.backdrop_url && { background: content.backdrop_url }),
      ...(content?.poster_url && { poster: content.poster_url }),
      ...(name && { name }),
      ...(content?.overview && { description: content.overview }),
      ...(content?.genres && {
        genres: content.genres.map((genre) => genre.name),
      }),
      ...(content?.rating && { imdbRating: String(content.rating) }),
      ...(content?.release_date && {
        releaseInfo: content.release_date.getFullYear(),
      }),
      ...(content.videos && {
        videos: content.videos.map((video) => ({
          id: video.id,
          season: video.season,
          episode: video.episode,
          number: video.episode,
          name: decode(video.name),
          thumbnail: video.backdrop_url,
        })),
      }),
    };
  }

  private formatMovieStream(
    stream: Stream & { movie: Movie & { genres: Genre[] } },
  ) {
    const title = `${this.convertAudio(stream.audio)} - ${this.convertQuality(stream.quality)}`;
    const url = this.buildStreamUrl('movie', stream.id);

    return {
      name: this.STREAM_NAME,
      title,
      url,
    };
  }

  private async formatSeriesStream(
    stream: Stream & { series: Series & { genres: Genre[] } },
    season: number,
    episode: number,
  ) {
    const episodes = await this.episodesService.getEpisodes(stream.series);
    const streams = [];

    for (const episodeItem of episodes) {
      if (
        !episodeItem ||
        episodeItem.season !== season + 1 ||
        episodeItem.episode !== episode + 1
      ) {
        continue;
      }

      for (const track of episodeItem.tracks) {
        if (!track) continue;

        const title =
          track.type === 'UNKNOWN'
            ? this.convertAudio(stream.audio)
            : this.convertAudio(track.type);
        const url = this.buildStreamUrl('series', hash(track.url));

        streams.push({
          name: this.STREAM_NAME,
          title,
          url,
        });
      }
    }

    return streams;
  }

  private buildStreamUrl(type: 'movie' | 'series', id: string) {
    return `${this.envService.get('APP_URL')}/stream/watch/${type}/${id}`;
  }

  private convertAudio(audio: Audio): string {
    const audioMap: Record<Audio, string> = {
      DUBBED: 'Dublado',
      SUBTITLED: 'Legendado',
      NATIONAL: 'Nacional',
      MUTED: 'Mutado',
      UNKNOWN: 'Áudio Desconhecido',
    };

    return audioMap[audio];
  }

  private convertQuality(quality: Quality): string {
    const qualityMap: Record<Quality, string> = {
      STANDARD_DEFINITION: 'SD (480p)',
      HIGH_DEFINITION: 'HD (720p)',
      FULL_HIGH_DEFINITION: 'Full HD (1080p)',
      ULTRA_HIGH_DEFINITION: '4k (2160p)',
      UNKNOWN: 'Qualidade Desconhecida',
    };

    return qualityMap[quality];
  }
}
