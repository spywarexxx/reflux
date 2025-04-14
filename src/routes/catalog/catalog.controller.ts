import { convertToType } from '@/modules/prisma/utils/string';
import { convertToTrending } from '@/modules/trending/utils/string';
import { CatalogService } from '@/routes/catalog/catalog.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('/catalog')
export class CatalogController {
  private readonly response = {
    hasMore: true,
    cacheMaxAge: 0,
    staleError: 0,
    staleRevalidate: 0,
  };

  public constructor(private readonly catalogService: CatalogService) {}

  @Get([
    '/:category/reflux.:section.json',
    '/:category/reflux.:section/:params*.json',
  ])
  public async getCatalog(
    @Param('category') category: string,
    @Param('section') section: string,
    @Param('params') params: string,
  ) {
    const query = new URLSearchParams(params);
    const coerce = Number(query.get('skip'));

    const search = query.get('search');
    const skip = !Number.isNaN(coerce) && coerce >= 0 ? coerce : 0;
    const genre = query.get('genre');

    const type = convertToType(category);
    const trending = convertToTrending(section);

    const catalog = await this.catalogService.getCatalog(
      type,
      trending,
      search,
      skip,
      genre,
    );

    return {
      ...this.response,
      metas: catalog,
    };
  }
}
