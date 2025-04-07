import { EnvService } from '@/modules/env/env.service';
import { RedeCanaisListingService } from '@/modules/rede-canais/services/rede-canais.listing.service';
import { decrypt } from '@/modules/rede-canais/utils/decrypt';
import { PrismaService } from '@/services/database/prisma.service';
import { normalize } from '@/utils/strings';
import { Injectable, Logger } from '@nestjs/common';
import { Audio, Series } from '@prisma/client';
import * as cheerio from 'cheerio';
import * as sanitizeHtml from 'sanitize-html';

interface EpisodeTrack {
  type: Audio;
  url: string;
}

interface ParsedEpisode {
  seasonTitle: string;
  episodeTitle: string;
  episodeTracks: EpisodeTrack[];
}

interface Season {
  title: string;
  episodes: {
    label: string;
    tracks: EpisodeTrack[];
  }[];
}

export interface RedeCanaisEpisodesVideo {
  id: string;
  name: string;
  backdrop_url: string;
  season: number;
  episode: number;
  tracks: EpisodeTrack[];
}

@Injectable()
export class RedeCanaisEpisodesService {
  private readonly logger = new Logger(RedeCanaisEpisodesService.name);

  private readonly SEASON_CONTAINER_SELECTORS = [
    'div.pm-category-description',
    'div[itemprop="description"]',
  ];

  public constructor(
    private readonly envService: EnvService,
    private readonly prismaService: PrismaService,
    private readonly redeCanaisListingService: RedeCanaisListingService,
  ) {}

  public async getEpisodes(series: Series): Promise<RedeCanaisEpisodesVideo[]> {
    if (!series) {
      return [];
    }

    const foundOnDatabase = await this.prismaService.series.findUnique({
      where: { id: series.id },
    });

    if (!foundOnDatabase) {
      return [];
    }

    const seriesOnCache = this.redeCanaisListingService.format('tv', series);
    if (!seriesOnCache?.url) {
      return [];
    }

    try {
      const { uri, referer } = this.buildRequestInfo(seriesOnCache.url);
      const response = await fetch(uri, {
        method: 'GET',
        headers: {
          referer,
          'referer-policy': 'strict-origin-when-cross-origin',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error, status: ${response.status}`);
      }

      const body = await response.text();
      const content = decrypt(body);
      const parsedEpisodes = this.parseEpisodes(content);
      const seasons = this.groupEpisodesIntoSeasons(parsedEpisodes);

      return this.formatEpisodes(series, seasons);
    } catch (error) {
      this.logger.error(`Error fetching episodes: ${error}`);
      return [];
    }
  }

  private buildRequestInfo(url: string): { uri: URL; referer: string } {
    const uri = new URL(url, this.envService.get('API_URL'));
    const referer = `${uri.protocol}//${uri.host}`;

    return { uri, referer };
  }

  private parseEpisodes(content: string): ParsedEpisode[] {
    const $ = this.initializeCheerioWithSanitizedContent(content);
    const episodes: ParsedEpisode[] = [];

    $('span').each((_, seasonElement) => {
      const seasonTitle = $(seasonElement).text().trim();

      $(seasonElement)
        .nextUntil('span')
        .each((_, el) => {
          if ($(el).is('p')) {
            const episodeTitle = $(el).text().trim();
            const episodeTracks = this.extractEpisodeTracks($, el as never);

            if (episodeTitle) {
              episodes.push({
                seasonTitle,
                episodeTitle,
                episodeTracks,
              });
            }
          }
        });
    });

    return episodes;
  }

  private initializeCheerioWithSanitizedContent(content: string) {
    const containerHtml = this.findContainerHtml(content);
    const sanitizedContent = this.sanitizeContainerContent(containerHtml);

    return cheerio.load(sanitizedContent);
  }

  private findContainerHtml(content: string): string {
    const $ = cheerio.load(content);

    for (const selector of this.SEASON_CONTAINER_SELECTORS) {
      const html = $(selector).html()?.trim();
      if (html) return html;
    }

    return '';
  }

  private sanitizeContainerContent(html: string): string {
    // First pass: basic sanitization.
    const firstPass = sanitizeHtml(html, {
      allowedAttributes: { a: ['href'] },
      allowedTags: ['a', 'span'],
    });

    // Second pass: ensure text is wrapped in paragraphs.
    const secondPass = sanitizeHtml(firstPass, {
      allowedTags: ['a', 'p', 'span'],
      textFilter: (text, tagName) => {
        const hasContent =
          /(.|\s)*\S(.|\s)*/.test(text) && !/^\s*\/\s*$/.test(text);
        return hasContent ? (!tagName ? `<p>${text}</p>` : text) : '';
      },
    });

    // Third pass: ensure we have at least one span for season splitting.
    return secondPass.includes('<span')
      ? secondPass
      : `<span>season-${Date.now()}</span>${secondPass}`;
  }

  private extractEpisodeTracks(
    $: cheerio.CheerioAPI,
    episodeElement: never,
  ): EpisodeTrack[] {
    return $(episodeElement)
      .nextUntil('p')
      .map((_, trackElement) => {
        const audioMap: Record<string, Audio> = {
          dublado: 'DUBBED',
          legendado: 'SUBTITLED',
          nacional: 'NATIONAL',
          mudo: 'MUTED',
        };

        const text = normalize($(trackElement).text());
        const url = $(trackElement).attr('href');
        const type: Audio = audioMap[text] || 'UNKNOWN';

        return url ? { type, url } : null;
      })
      .toArray()
      .filter(Boolean) as EpisodeTrack[];
  }

  private groupEpisodesIntoSeasons(episodes: ParsedEpisode[]): Season[] {
    const seasons: Season[] = [];

    for (const episode of episodes) {
      const normalizedSeasonTitle = normalize(episode.seasonTitle);
      const seasonIndex = seasons.findIndex(
        (s) => normalize(s.title) === normalizedSeasonTitle,
      );

      const episodeData = {
        label: episode.episodeTitle,
        tracks: episode.episodeTracks,
      };

      if (seasonIndex === -1) {
        seasons.push({
          title: episode.seasonTitle,
          episodes: [episodeData],
        });
      } else {
        seasons[seasonIndex].episodes.push(episodeData);
      }
    }

    return seasons;
  }

  private formatEpisodes(
    series: Series,
    seasons: Season[],
  ): RedeCanaisEpisodesVideo[] {
    return seasons.flatMap((season, seasonIndex) =>
      season.episodes.map((episode, episodeIndex) => ({
        id: `reflux:${series.id}:${seasonIndex}:${episodeIndex}`,
        name: this.cleanEpisodeTitle(episode.label),
        backdrop_url: series.backdrop_url,
        season: seasonIndex + 1,
        episode: episodeIndex + 1,
        tracks: episode.tracks,
      })),
    );
  }

  private cleanEpisodeTitle(title: string): string {
    return title.replace(/(\s*-)$/g, '').trim();
  }
}
