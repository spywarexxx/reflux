import { PrismaRepository } from '@/modules/prisma/prisma.repository';
import { ProviderService } from '@/modules/provider/provider.service';
import { Episodec } from '@/types/episodic';
import { Meta } from '@/types/meta';
import { episodefy, metafy } from '@/utils/misc';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class MetaService {
  public constructor(
    private readonly prismaRepository: PrismaRepository,
    private readonly providerService: ProviderService,
  ) {}

  public async getMeta(id: number): Promise<Meta> {
    const info = await this.prismaRepository.allInfo(id);

    if (!info) {
      throw new NotFoundException();
    }

    const meta = metafy(info);

    return meta;
  }

  public async getEpisodes(id: number): Promise<Episodec[]> {
    const info = await this.prismaRepository.allInfo(id);

    if (!info) {
      throw new NotFoundException();
    }

    if (info.type !== 'TV') {
      return [];
    }

    const sources = await Promise.all(
      this.providerService.clients.map((c) => c.getEpisodes(id)),
    );
    const episodes = sources.flat();
    const episodec = episodefy(info, episodes);

    return episodec;
  }
}
