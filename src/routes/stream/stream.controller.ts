import { EnvService } from '@/config/env.service';
import { TooManyRequestsException } from '@/exceptions/too-many-requests.exception';
import { StreamService } from '@/routes/stream/stream.service';
import { proxify } from '@/utils/proxy';
import { Controller, Get, Head, Param, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller('/stream')
export class StreamController {
  public constructor(
    private readonly envService: EnvService,
    private readonly streamService: StreamService,
  ) {}

  @Get('/movie/reflux:id.json')
  public async movies(@Param('id') id: string) {
    const meta = await this.streamService.getMovieMeta(id);

    return {
      streams: [
        {
          name: 'Rede Canais',
          title: meta.title,
          url: this.streamService.formatUrl(meta.contentUrl),
        },
      ],
    };
  }

  @Get('/series/reflux:query.json')
  public async series(@Param('query') query: string) {
    const split = query.split(':') ?? [];

    const id = split[1];
    const season = Number(split[2]);
    const episode = Number(split[3]);

    const meta = await this.streamService.getSeriesMeta(id);

    const currentSeason = meta.seasons.find((_, i) => i === season);
    const currentEpisode = currentSeason?.episodes?.find?.(
      (_, i) => i === episode,
    );

    if (!currentSeason || !currentEpisode) {
      return {
        streams: [],
      };
    }

    return {
      streams: currentEpisode.tracks.map((stream) => ({
        name: meta.title,
        title: stream.type === 'dubbed' ? 'Dublado' : 'Legendado',
        url: this.streamService.formatUrl(stream.url),
      })),
    };
  }

  @Head('/watch/:id')
  public async getWatch(@Res() res: Response) {
    return res.status(200).end();
  }

  /**
   * We will redirect the player here because if we leave it on the previous routes,
   * where the user is only checking the availability of languages or content sources,
   * there is a chance that the user won't even watch the content.
   * Additionally, the waiting time to request the content would be unnecessarily long.
   *
   * In this situation, we load the content only when we're actually going to watch it,
   * reducing the waiting time and improving the user's experience.
   */
  @Get('/watch/:id')
  public async watch(@Param('id') id: string, @Res() res: Response) {
    try {
      const stream = await this.streamService.getStream(id);

      if (stream) {
        /**
         * If we have some streaming proxy in our enviroment, we run it.
         * Proxy is useful when we leading with DNS or VPN issues.
         */
        return res
          .status(302)
          .redirect(
            proxify(this.envService.get('STREAMING_PROXY_URL'), stream),
          );
      }

      throw new TooManyRequestsException();
    } catch {
      throw new TooManyRequestsException();
    }
  }
}
