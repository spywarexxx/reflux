import { EnvModule } from '@/modules/env/env.module';
import { NlpModule } from '@/modules/nlp/nlp.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { ProviderModule, Providers } from '@/modules/provider/provider.module';
import { SyncService } from '@/modules/sync/sync.service';
import { TmdbModule } from '@/modules/tmdb/tmdb.module';
import { TrendingModule } from '@/modules/trending/trending.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    EnvModule,
    PrismaModule,
    ProviderModule,
    TrendingModule,
    NlpModule,
    TmdbModule,
  ],
  providers: [...Providers, SyncService],
})
export class SyncModule {}
