import { RedeCanaisMetasService } from '@/modules/rede-canais/services/rede-canais.metas.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('/meta/series')
export class MetaSeriesController {
  public constructor(
    private readonly redeCanaisMetasService: RedeCanaisMetasService,
  ) {}

  @Get('/:id.json')
  public async get(@Param('id') id: string) {
    const parsedId = id.split(':')[1];
    const meta = await this.redeCanaisMetasService.getContentById(
      'tv',
      parsedId,
    );

    return { meta };
  }
}
