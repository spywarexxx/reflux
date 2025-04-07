import { RedeCanaisMetasService } from '@/modules/rede-canais/services/rede-canais.metas.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('/stream/movie')
export class StreamMovieController {
  public constructor(
    private readonly redeCanaisMetasService: RedeCanaisMetasService,
  ) {}

  @Get('/:id.json')
  public async get(@Param('id') id: string) {
    const parsedId = id.split(':')[1];
    const streams =
      await this.redeCanaisMetasService.getMovieStreamsById(parsedId);

    return { streams };
  }
}
