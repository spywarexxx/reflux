import { EnvService } from '@/modules/env/env.service';
import { ManifestService } from '@/routes/manifest/manifest.service';
import { Controller, Get } from '@nestjs/common';
import * as packageJson from '@package';

@Controller('/manifest.json')
export class ManifestController {
  public constructor(
    private readonly envService: EnvService,
    private readonly manifestService: ManifestService,
  ) {}

  @Get('/')
  public async getManifest() {
    const catalogs = await this.manifestService.getCatalogs();

    return {
      id: packageJson.stremio.id,
      version: packageJson.version,
      name: packageJson.stremio.name,
      description: packageJson.stremio.description,
      logo: this.envService.get('APP_URL').concat('/public/images/logo.png'),
      resources: ['catalog', 'meta', 'stream'],
      idPrefixes: ['reflux'],
      types: ['movie', 'series'],
      catalogs,
    };
  }
}
