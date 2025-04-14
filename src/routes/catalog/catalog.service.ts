import { Media } from '@/enums/media';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { ProviderService } from '@/modules/provider/provider.service';
import { Trending } from '@/modules/tmdb/types/tmdb';
import { Meta } from '@/types/meta';
import { metafy } from '@/utils/misc';
import { Injectable } from '@nestjs/common';
import { Info, Type } from '@prisma/client';

@Injectable()
export class CatalogService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly providerService: ProviderService,
  ) {}

  public async getCatalog(
    type: Type,
    trending: Trending,
    search: string,
    skip: number,
    genre: string,
  ): Promise<Meta[]> {
    const size = 50;
    const skipCount = Math.floor(skip / size);
    const data: Info[] = [];

    switch (trending) {
      case Trending.ALL:
        {
          const infos = await this.prismaService.info.findMany({
            where: {
              type,
              title: {
                contains: search ?? undefined,
                mode: 'insensitive',
              },
              rating: {
                gt: skip <= 1000 ? 0 : undefined,
                not: skip <= 1000 ? 10 : undefined,
              },
              genres: {
                some: {
                  name: genre ?? undefined,
                },
              },
            },
            include: {
              genres: true,
            },
            orderBy: {
              releasedAt: 'desc',
            },
            skip,
            take: size,
          });

          data.push(...infos);
        }
        break;

      default:
        {
          const infos: Info[] = [];

          for (const client of this.providerService.clients) {
            const catalog = await client.getTrending(Media[type], trending);

            infos.push(...catalog);
          }

          data.push(...infos);
        }
        break;
    }

    const formatted = data.map(metafy);
    const skipped =
      trending === Trending.ALL
        ? formatted
        : formatted.slice(skipCount * size, (skipCount + 1) * size);
    const genres = genre
      ? skipped.filter((s) => s.genres.some((g) => g.includes(genre)))
      : skipped;
    const searched = search
      ? genres.filter((s) =>
          s.name.toLowerCase().includes(search.toLowerCase()),
        )
      : genres;

    return searched;
  }
}
