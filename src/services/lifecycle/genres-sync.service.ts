import { TmdbService } from '@/modules/tmdb/tmdb.service';
import { PrismaService } from '@/services/database/prisma.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class GenresSyncService implements OnModuleInit {
  private readonly logger = new Logger(GenresSyncService.name);

  public constructor(
    private readonly prismaService: PrismaService,
    private readonly tmdbService: TmdbService,
  ) {}

  public async onModuleInit() {
    const movieGenres = await this.tmdbService.listGenres('movie');
    const tvGenres = await this.tmdbService.listGenres('tv');
    const genres = [...movieGenres.genres, ...tvGenres.genres];
    let totalNewSync = 0;

    for await (const genre of genres) {
      const existsCount = await this.prismaService.genre.findUnique({
        where: { id: genre.id },
      });

      if (!existsCount) {
        await this.prismaService.genre.create({
          data: { id: genre.id, name: genre.name },
        });

        totalNewSync++;
      }
    }

    if (totalNewSync) {
      this.logger.log(`${totalNewSync} new genres was sync with tmdb.`);
    }

    this.logger.log('Database genres is fully sync with tmdb.');
  }
}
