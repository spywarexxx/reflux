import { Client, Episode } from '@/classes/provider/client';
import { Snapshot } from '@/classes/provider/snapshot';
import { Media } from '@/enums/media';
import { NlpProcessingService } from '@/modules/nlp/services/processing.service';
import { PrismaRepository } from '@/modules/prisma/prisma.repository';
import { Trending } from '@/modules/tmdb/types/tmdb';
import { TrendingService } from '@/modules/trending/trending.service';
import { PROVIDER_URL } from '@/providers/rc/constants/url';
import { RcData } from '@/providers/rc/rc.data';
import { RcSource } from '@/providers/rc/snapshots/rc.source';
import { RcTvSnapshot } from '@/providers/rc/snapshots/rc.tv';
import { Info } from '@prisma/client';
import axios from 'axios';

export class RcClient extends Client {
  public readonly name = 'Rede Canais';
  public readonly url = PROVIDER_URL;
  public readonly data = new RcData(this);
  public readonly snapshots: Snapshot[] = [
    new RcTvSnapshot(this, this.nlpProcessingService),
    new RcSource(this),
  ];
  public readonly api = axios.create({
    baseURL: this.url,
    headers: { referer: this.url },
  });

  public constructor(
    private readonly prismaRepository: PrismaRepository,
    private readonly trendingService: TrendingService,
    private readonly nlpProcessingService: NlpProcessingService,
  ) {
    super();
  }

  public async getInfo(id: number): Promise<Info> {
    const info = await this.prismaRepository.allInfo(id);

    return info;
  }

  public async getTrending(type: Media, trending: Trending): Promise<Info[]> {
    const trendings = this.trendingService.trendings.filter(
      (t) => t.type === trending && t.info.type === type,
    );

    const formatted = trendings.map((t) => t.info);

    return formatted;
  }

  public async getEpisodes(id: number): Promise<Episode[][]> {
    const info = await this.prismaRepository.allInfo(id);

    if (info?.type !== 'TV') {
      return [];
    }

    const recentStream = info.streams
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .at(0);

    const snapshot = this.snapshots.find((s) => s instanceof RcTvSnapshot);

    const episodes = await snapshot.build(recentStream.url);

    return episodes;
  }

  public async getStream(url: string): Promise<string> {
    const snapshot = this.snapshots.find((s) => s instanceof RcSource);

    const stream = await snapshot.build(url);

    return stream;
  }
}
