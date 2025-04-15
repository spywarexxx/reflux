import { convertToId } from '@/modules/prisma/utils/string';
import { ProxyService } from '@/modules/proxy/proxy.service';
import { StreamService } from '@/routes/stream/stream.service';
import { redoHash, undoHash } from '@/utils/string';
import {
  Controller,
  Get,
  Param,
  Res
} from '@nestjs/common';
import { Response } from 'express';
@Controller('/stream')
export class StreamController {
  public constructor(
    private readonly streamService: StreamService,
    private readonly proxyService: ProxyService,
  ) {}

  @Get('/*/:params.json')
  public async getStream(@Param('params') params: string) {
    const [id, season, episode] = params.split('.');

    const coerceId = convertToId(id);
    const coerceSeason = !Number.isNaN(Number(season)) ? Number(season) : 0;
    const coerceEpisode = !Number.isNaN(Number(episode)) ? Number(episode) : 0;
    const streams = await this.streamService.getStreams(
      coerceId,
      coerceSeason,
      coerceEpisode,
    );

    const proxied = streams.map((stream) => ({
      ...stream,
      url: this.proxyService.byPass(redoHash(stream.url), 'stream/watch'),
    }));

    return { streams: proxied };
  }

  @Get('/watch/:hash')
  public async watchStream(@Param('hash') hash: string, @Res() res: Response) {
    const uri = undoHash(hash);
    const stream = await this.streamService.generateStream(uri);
    const proxied = this.proxyService.passThrough(stream);

    return res.status(302).redirect(proxied);
  }
}
