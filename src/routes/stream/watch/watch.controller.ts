import { TooManyRequestsException } from '@/exceptions/too-many-requests.exception';
import { PrometheusService } from '@/modules/prometheus/prometheus.service';
import { ProxyService } from '@/modules/proxy/proxy.service';
import { StreamWatchService } from '@/routes/stream/watch/watch.service';
import { unhash } from '@/utils/strings';
import { Controller, Get, Head, HttpStatus, Param, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('/stream/watch')
export class StreamWatchController {
  public constructor(
    private readonly prometheusService: PrometheusService,
    private readonly proxyService: ProxyService,
    private readonly streamWatchService: StreamWatchService,
  ) {}

  @Head('/movie/:id')
  public async checkMovieExists(@Param('id') id: string, @Res() res: Response) {
    const exists = await this.streamWatchService.existsStream(id);
    return res.status(exists ? HttpStatus.OK : HttpStatus.NOT_FOUND).end();
  }

  @Head('/series/:id')
  public checkSeriesExists(@Res() res: Response) {
    // Assume exists due to rate limiting constraints.
    return res.status(HttpStatus.OK).end();
  }

  @Get('/movie/:id')
  public async streamMovie(@Param('id') id: string, @Res() res: Response) {
    const endStatsTimer = this.prometheusService.startMoviesWatchDuration();

    try {
      await this.handleStreamRequest(
        () => this.streamWatchService.generateMovieStream(id),
        res,
      );
    } catch {}

    endStatsTimer();
  }

  @Get('/series/:uri')
  public async streamSeries(@Param('uri') uri: string, @Res() res: Response) {
    const endStatsTimer = this.prometheusService.startSeriesWatchDuration();

    try {
      await this.handleStreamRequest(async () => {
        const url = unhash(uri);
        return this.streamWatchService.generateSeriesStream(url);
      }, res);
    } catch {}

    endStatsTimer();
  }

  private async handleStreamRequest(
    streamGenerator: () => Promise<string | null>,
    res: Response,
  ) {
    const fallback = this.streamWatchService.fallbackVideo();

    try {
      const generatedStream = await streamGenerator();

      if (!generatedStream) {
        return this.handleFallback(fallback, res);
      }

      return res
        .status(HttpStatus.FOUND)
        .redirect(this.proxyService.stream(generatedStream));
    } catch (error) {
      return this.handleFallback(fallback, res);
    }
  }

  private handleFallback(
    fallback: string | typeof TooManyRequestsException,
    res: Response,
  ) {
    if (typeof fallback === 'string') {
      return res.status(HttpStatus.FOUND).redirect(fallback);
    }

    throw new fallback();
  }
}
