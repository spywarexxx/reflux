import { Info } from '@/classes/media/info';
import { Output } from '@/classes/provider/data';
import { NlpProcessingService } from '@/modules/nlp/services/processing.service';
import { PrismaRepository } from '@/modules/prisma/prisma.repository';
import { SearchMovie, SearchTv } from '@/modules/tmdb/types/tmdb';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NlpQueriesService {
  public constructor(
    private readonly prismaRepository: PrismaRepository,
    private readonly processingService: NlpProcessingService,
  ) {}

  public async search(
    output: Output,
    search: (SearchMovie & SearchTv)[],
  ): Promise<Info> {
    const titles = search.map((result) => result.name ?? result.title);

    const bestMatch = this.processingService.findBestMatch(
      output.title,
      titles,
    );

    const compareMatch = this.processingService.compareBestMatch(
      output.title,
      titles,
    );

    const index = bestMatch?.index ?? compareMatch?.index;
    const result = search[index];

    if (!result) {
      return null;
    }

    const genres = await this.prismaRepository.getGenres(result.genre_ids);
    const info = new Info({
      id: result.id,
      type: output.type,
      title: result.name ?? result.title,
      description: result.overview,
      thumbnail: result.backdrop_path,
      poster: result.poster_path,
      rating: result.vote_average,
      genres,
      releasedAt: result.release_date
        ? new Date(result.release_date)
        : result.first_air_date
          ? new Date(result.first_air_date)
          : new Date(),
    });

    return info;
  }
}
