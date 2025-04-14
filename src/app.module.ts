import { EnvModule } from '@/modules/env/env.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { ProviderModule } from '@/modules/provider/provider.module';
import { SyncModule } from '@/modules/sync/sync.module';
import { TrendingModule } from '@/modules/trending/trending.module';
import { CatalogModule } from '@/routes/catalog/catalog.module';
import { ManifestModule } from '@/routes/manifest/manifest.module';
import { MetaModule } from '@/routes/meta/meta.module';
import { StreamModule } from '@/routes/stream/stream.module';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { createZodValidationPipe } from 'nestjs-zod';
import { join } from 'node:path';

@Module({
  imports: [
    EnvModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/public/',
    }),
    PrismaModule,
    ProviderModule,
    SyncModule,
    TrendingModule,
    CatalogModule,
    ManifestModule,
    MetaModule,
    StreamModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: createZodValidationPipe(),
    },
  ],
})
export class AppModule {}
