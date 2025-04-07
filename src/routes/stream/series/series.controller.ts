import { RedeCanaisMetasService } from '@/modules/rede-canais/services/rede-canais.metas.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('/stream/series')
export class StreamSeriesController {
  public constructor(
    private readonly redeCanaisMetasService: RedeCanaisMetasService,
  ) {}

  @Get('/:id.json')
  public async get(@Param('id') id: string) {
    const splitted = id.split(':');
    const parsedId = splitted[1];
    const parsedSeason = splitted[2];
    const parsedEpisode = splitted[3];
    const formattedSeason = !Number.isNaN(Number(parsedSeason))
      ? Number(parsedSeason)
      : 0;
    const formattedEpisode = !Number.isNaN(Number(parsedEpisode))
      ? Number(parsedEpisode)
      : 0;

    const streams = await this.redeCanaisMetasService.getSeriesStreamsById(
      parsedId,
      formattedSeason,
      formattedEpisode,
    );

    return { streams };
  }
}
