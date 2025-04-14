import { PrismaService } from '@/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Genre, Info, Stream } from '@prisma/client';

@Injectable()
export class PrismaRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async allInfo(id: number): Promise<
    | (Info & {
        genres: Genre[];
        streams: Stream[];
      })
    | null
  > {
    const info = await this.prismaService.info.findFirst({
      where: { id },
      include: {
        genres: true,
        streams: true,
      },
    });

    return info;
  }

  public async allInfos(): Promise<
    (Pick<Info, 'id' | 'type'> & {
      streams: Pick<Stream, 'url'>[];
    })[]
  > {
    const infos = await this.prismaService.info.findMany({
      select: {
        id: true,
        type: true,
        streams: { select: { url: true } },
      },
    });

    return infos;
  }

  public async allStreams(): Promise<string[]> {
    const streams = await this.prismaService.stream.findMany({
      select: { url: true },
    });

    const mapped = streams.map((stream) => stream.url);

    return mapped;
  }

  public async getInfo(id: number): Promise<Pick<Info, 'id' | 'type'> | null> {
    const got = await this.prismaService.info.findFirst({
      where: { id },
      select: { id: true, type: true },
    });

    return got;
  }

  public async createInfo(
    info: Info & { genres: Genre[] },
  ): Promise<Pick<Info, 'id' | 'type'>> {
    const got = await this.getInfo(info.id);

    if (got) {
      return got;
    }

    const created = await this.prismaService.info.create({
      data: {
        ...info,
        genres: {
          connect: info.genres.map((genre) => ({ id: genre.id })),
        },
      },
      select: { id: true, type: true },
    });

    return created;
  }

  public async createStream(
    info: Pick<Info, 'id'>,
    stream: Stream,
  ): Promise<void> {
    await this.prismaService.stream.create({
      data: {
        ...stream,
        infoId: info.id,
      },
      select: { id: true },
    });
  }

  public async getGenres(ids?: number[]): Promise<Genre[]> {
    if (!ids?.length) {
      const genres = await this.prismaService.genre.findMany();

      return genres;
    }

    const found = await this.prismaService.genre.findMany({
      where: { id: { in: ids } },
    });

    return found;
  }
}
