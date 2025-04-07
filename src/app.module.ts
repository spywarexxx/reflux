import { EnvModule } from '@/modules/env/env.module';
import { PrometheusModule } from '@/modules/prometheus/prometheus.module';
import { RedeCanaisModule } from '@/modules/rede-canais/rede-canais.module';
import { TmdbModule } from '@/modules/tmdb/tmdb.module';
import { CatalogMovieModule } from '@/routes/catalog/movie/movie.module';
import { CatalogSeriesModule } from '@/routes/catalog/series/series.module';
import { ManifestModule } from '@/routes/manifest/manifest.module';
import { MetaMovieModule } from '@/routes/meta/movie/movie.module';
import { MetaSeriesModule } from '@/routes/meta/series/series.module';
import { StreamMovieModule } from '@/routes/stream/movie/movie.module';
import { StreamSeriesModule } from '@/routes/stream/series/series.module';
import { StreamWatchModule } from '@/routes/stream/watch/watch.module';
import { PrismaService } from '@/services/database/prisma.service';
import { AutoIndexService } from '@/services/lifecycle/auto-index.service';
import { GenresSyncService } from '@/services/lifecycle/genres-sync.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { createZodValidationPipe } from 'nestjs-zod';
import { join } from 'node:path';

@Module({
  imports: [
    PrometheusModule,
    HttpModule,
    EnvModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/public/',
    }),
    RedeCanaisModule,
    TmdbModule,
    CatalogMovieModule,
    CatalogSeriesModule,
    ManifestModule,
    MetaMovieModule,
    MetaSeriesModule,
    StreamMovieModule,
    StreamSeriesModule,
    StreamWatchModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: createZodValidationPipe(),
    },
    PrismaService,
    AutoIndexService,
    GenresSyncService,
  ],
})
export class AppModule {}
