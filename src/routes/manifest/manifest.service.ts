import { Media } from '@/enums/media';
import { PrismaRepository } from '@/modules/prisma/prisma.repository';
import { Trending } from '@/modules/tmdb/types/tmdb';
import { convertTrendingToString } from '@/modules/tmdb/utils/string';
import { convertMediaToStremio } from '@/utils/string';
import { Injectable } from '@nestjs/common';
import { Genre } from '@prisma/client';

@Injectable()
export class ManifestService {
  private readonly options = [
    {
      name: 'genre',
      isRequired: false,
      options: [],
      optionsLimit: 1,
    },
    {
      name: 'skip',
      isRequired: false,
      options: [],
      optionsLimit: 1,
    },
    {
      name: 'search',
      isRequired: false,
      options: [],
      optionsLimit: 1,
    },
  ];

  public constructor(private readonly prismaRepository: PrismaRepository) {}

  public async onModuleInit(): Promise<void> {
    const genres = await this.getGenres();
    const formatted = genres.map((genre) => genre.name);
    const option = this.options.findIndex((option) => option.name === 'genre');

    this.options[option].options = formatted;
  }

  public async getCatalogs() {
    const types = Object.values(Media);
    const trendings = Object.values(Trending);

    const list = types.flatMap((type) =>
      trendings.flatMap((trending) => ({
        id: `reflux.${trending}`,
        type: convertMediaToStremio(type),
        name: `Reflux - ${convertTrendingToString(trending)}`,
        extra: this.options,
      })),
    );

    return list;
  }

  private async getGenres(): Promise<Genre[]> {
    return this.prismaRepository.getGenres();
  }
}
