import { RedeCanaisMetasService } from '@/modules/rede-canais/services/rede-canais.metas.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('/meta/movie')
export class MetaMovieController {
  public constructor(
    private readonly redeCanaisMetasService: RedeCanaisMetasService,
  ) {}

  @Get('/:id.json')
  public async get(@Param('id') id: string) {
    const parsedId = id.split(':')[1];
    const meta = await this.redeCanaisMetasService.getContentById(
      'movie',
      parsedId,
    );

    return { meta };
  }
}
