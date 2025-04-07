import { TooManyRequestsException } from '@/exceptions/too-many-requests.exception';
import { EnvService } from '@/modules/env/env.service';
import { RedeCanaisStreamService } from '@/modules/rede-canais/services/rede-canais.stream.service';
import { PrismaService } from '@/services/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StreamWatchService {
  public constructor(
    private readonly envService: EnvService,
    private readonly prismaService: PrismaService,
    private readonly redeCanaisStreamService: RedeCanaisStreamService,
  ) {}

  public async existsStream(id: string) {
    const streamCount = await this.prismaService.stream.count({
      where: { id },
    });

    return !!streamCount;
  }

  public async generateMovieStream(id: string) {
    const stream = await this.prismaService.stream.findUnique({
      where: { id },
    });

    const uri = await this.redeCanaisStreamService.getStreamUrl(stream.url);
    return uri;
  }

  public async generateSeriesStream(url: string) {
    const uri = await this.redeCanaisStreamService.getStreamUrl(url);
    return uri;
  }

  public fallbackVideo() {
    const fallbackVideoUrl = this.envService.get('VIDEO_PROXY_FALLBACK_URL');

    if (fallbackVideoUrl) {
      return fallbackVideoUrl;
    }

    return TooManyRequestsException;
  }
}
