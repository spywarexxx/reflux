import { convertToId } from '@/modules/prisma/utils/string';
import { MetaService } from '@/routes/meta/meta.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('/meta')
export class MetaController {
  public constructor(private readonly metaService: MetaService) {}

  @Get('/*/:section.json')
  public async getMeta(@Param('section') section: string) {
    const id = convertToId(section);
    const meta = await this.metaService.getMeta(id);
    const episodes = await this.metaService.getEpisodes(id);
    const formatted = { ...meta, videos: episodes };

    return { meta: formatted };
  }
}
