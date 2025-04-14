import { Snapshot } from '@/classes/provider/snapshot';
import { Audio } from '@/enums/audio';
import { NlpProcessingService } from '@/modules/nlp/services/processing.service';
import { EPISODE_TITLE_REGEX } from '@/providers/rc/constants/regex';
import { SEASON_CONTAINER_SELECTORS } from '@/providers/rc/constants/string';
import { RcClient } from '@/providers/rc/rc.client';
import { decrypt } from '@/providers/rc/utils/decrypt';
import * as cheerio from 'cheerio';
import * as sanitize from 'sanitize-html';

interface Season {
  title: string;
  episodes: {
    title: string;
    tracks: Track[];
  }[];
}

interface Episode {
  seasonTitle: string;
  episodeTitle: string;
  episodeTracks: Track[];
}

interface Track {
  url: string;
  audio: Audio;
}

export class RcTvSnapshot extends Snapshot {
  public constructor(
    public readonly client: RcClient,
    private readonly nlpProcessingService: NlpProcessingService,
  ) {
    super(client);
  }

  public async build(url: string) {
    const { data } = await this.client.api.get(url);
    const decrypted = decrypt(data);
    const episodes = this.parseEpisodes(decrypted);
    const seasons = this.parseSeasons(episodes);
    const output = seasons.map((season) => season.episodes);

    return output;
  }

  private parseEpisodes(content: string) {
    const $ = this.startCheerio(content);
    const episodes: Episode[] = [];

    $('span').each((_, seasonElement) => {
      const seasonTitle = $(seasonElement).text().trim();

      $(seasonElement)
        .nextUntil('span')
        .each((_, element) => {
          if ($(element).is('p')) {
            const episodeTitle = this.beautify($(element).text().trim());
            const episodeTracks = this.extractEpisodes($, element as never);

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

  private parseSeasons(episodes: Episode[]) {
    const seasons: Season[] = [];

    for (const episode of episodes) {
      const seasonTitle = this.nlpProcessingService.normalize(
        episode.seasonTitle,
      );
      const seasonIndex = seasons.findIndex(
        (s) => this.nlpProcessingService.normalize(s.title) === seasonTitle,
      );

      const episodeData = {
        title: episode.episodeTitle,
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

  private startCheerio(content: string) {
    const container = this.findContainer(content);
    const sanitized = this.sanitizeContainer(container);

    return cheerio.load(sanitized);
  }

  private findContainer(content: string): string {
    const $ = cheerio.load(content);

    for (const selector of SEASON_CONTAINER_SELECTORS) {
      const html = $(selector).html()?.trim();
      if (html) return html;
    }

    return '';
  }

  private sanitizeContainer(html: string): string {
    // First pass: basic sanitization.
    const firstPass = sanitize(html, {
      allowedAttributes: { a: ['href'] },
      allowedTags: ['a', 'span'],
    });

    // Second pass: ensure text is wrapped in paragraphs.
    const secondPass = sanitize(firstPass, {
      allowedTags: ['a', 'p', 'span'],
      textFilter: (text, tagName) => {
        const hasContent =
          /(.|\s)*\S(.|\s)*/.test(text) && !/^\s*\/\s*$/.test(text);

        return hasContent ? (!tagName ? `<p>${text}</p>` : text) : '';
      },
    });

    // Third pass: ensure we have at least one span for season splitting.
    if (!secondPass.includes('<span')) {
      return `<span>season-${Date.now()}</span>${secondPass}`;
    }

    return secondPass;
  }

  private extractEpisodes($: cheerio.CheerioAPI, episode: never) {
    return $(episode)
      .nextUntil('p')
      .map((_, track) => {
        const audios: Record<string, Audio> = {
          dublado: Audio.DUBBED,
          legendado: Audio.SUBTITLED,
        };

        const text = this.nlpProcessingService.normalize($(track).text());
        const url = $(track).attr('href');
        const audio: Audio = audios[text] ?? null;
        const output = url ? { url, audio } : null;

        return output;
      })
      .toArray()
      .filter(Boolean);
  }

  private beautify(title: string): string {
    const clean = title.trim();
    const fallback = title.replace(/(\s*-)$/g, '').trim();
    const match = clean.match(EPISODE_TITLE_REGEX)?.[1] ?? fallback;

    return match;
  }
}
