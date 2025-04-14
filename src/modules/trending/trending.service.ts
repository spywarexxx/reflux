import { Media } from '@/enums/media';
import { EnvService } from '@/modules/env/env.service';
import { PrismaRepository } from '@/modules/prisma/prisma.repository';
import { TmdbService } from '@/modules/tmdb/tmdb.service';
import { SearchMovie, SearchTv, Trending } from '@/modules/tmdb/types/tmdb';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Genre, Info, Stream } from '@prisma/client';
import PromisePool from '@supercharge/promise-pool';

@Injectable()
export class TrendingService implements OnModuleInit {
  public readonly trending = new Map<
    { type: Trending; id: number },
    { type: Trending; info: Info }
  >();

  public constructor(
    private readonly envService: EnvService,
    private readonly prismaRepository: PrismaRepository,
    private readonly tmdbService: TmdbService,
  ) {}

  public get trendings(): {
    type: Trending;
    info: Info & { genres: Genre[]; streams: Stream[] };
  }[] {
    return Array.from(this.trending.values()) as never;
  }

  public async onModuleInit(): Promise<void> {
    const environment = this.envService.get('NODE_ENV');

    if (environment === 'production') {
      await this.build();
    }
  }

  public async build(): Promise<void> {
    const trendings: { type: Trending; data: SearchMovie & SearchTv }[] = [];
    const concurrency = 25;
    const pages = 100;
    const size = Array.from({ length: pages }, (_, i) => i + 1);

    this.trending.clear();

    await new PromisePool()
      .withConcurrency(concurrency)
      .for(size)
      .process(async (page) => {
        const [populars, topRateds, theathers] = await Promise.all([
          Promise.all([
            this.tmdbService.getTrending(Media.MOVIE, Trending.POPULAR, page),
            this.tmdbService.getTrending(Media.TV, Trending.POPULAR, page),
          ]),
          Promise.all([
            this.tmdbService.getTrending(Media.MOVIE, Trending.TOP_RATED, page),
            this.tmdbService.getTrending(Media.TV, Trending.TOP_RATED, page),
          ]),
          Promise.all([
            this.tmdbService.getTrending(Media.MOVIE, Trending.THEATHER, page),
          ]),
        ]);

        const data = [
          ...populars
            .flat()
            .map((trending) => ({ type: Trending.POPULAR, data: trending })),
          ...topRateds
            .flat()
            .map((trending) => ({ type: Trending.TOP_RATED, data: trending })),
          ...theathers
            .flat()
            .map((trending) => ({ type: Trending.THEATHER, data: trending })),
        ];

        trendings.push(...data);
      });

    await new PromisePool()
      .withConcurrency(concurrency)
      .for(trendings)
      .process(async ({ type, data }) => {
        const info = await this.prismaRepository.allInfo(data.id);

        if (info) {
          this.trending.set({ type, id: info.id }, { type, info });
        }
      });
  }
}
