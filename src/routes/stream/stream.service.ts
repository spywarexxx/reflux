import { EnvService } from '@/modules/env/env.service';
import { PrismaRepository } from '@/modules/prisma/prisma.repository';
import { ProviderService } from '@/modules/provider/provider.service';
import { Source } from '@/types/source';
import { streamfyMovie, streamfyTv } from '@/utils/misc';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Stream } from '@prisma/client';

@Injectable()
export class StreamService {
  public constructor(
    private readonly envService: EnvService,
    private readonly prismaRepository: PrismaRepository,
    private readonly providerService: ProviderService,
  ) {}

  public async getStreams(id: number, season: number, episode: number) {
    const info = await this.prismaRepository.allInfo(id);
    const streams: Source[] = [];

    if (!info) {
      throw new NotFoundException();
    }

    if (info.type === 'MOVIE') {
      for (const stream of info.streams) {
        const provider = this.providerService.getProvider(stream.provider);

        if (provider) {
          const url = new URL(stream.url, provider.url).href;
          const formatted: Stream = { ...stream, url };

          streams.push(streamfyMovie(formatted));
        }
      }
    } else {
      for (const client of this.providerService.clients) {
        const episodes = await client.getEpisodes(id);
        const stream = episodes[season]?.[episode];

        if (stream) {
          const formatted = streamfyTv(client, stream).map((stream) => ({
            ...stream,
            url: new URL(stream.url, client.url).href,
          }));

          streams.push(...formatted);
        }
      }
    }

    return streams;
  }

  public async generateStream(url: string) {
    const { hostname: urlHostName } = new URL(url);

    for (const client of this.providerService.clients) {
      const { hostname: clientHostName } = new URL(client.url);

      if (urlHostName === clientHostName) {
        const stream = await client.getStream(url);

        return stream;
      }
    }

    const fallbackVideoUrl = this.envService.get('FALLBACK_VIDEO_URL');

    return fallbackVideoUrl;
  }
}
