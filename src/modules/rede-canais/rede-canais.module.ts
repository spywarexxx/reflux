import { EnvModule } from '@/modules/env/env.module';
import { ProxyModule } from '@/modules/proxy/proxy.module';
import { RedeCanaisCachingService } from '@/modules/rede-canais/services/rede-canais.caching.service';
import { RedeCanaisEpisodesService } from '@/modules/rede-canais/services/rede-canais.episodes.service';
import { RedeCanaisIndexingService } from '@/modules/rede-canais/services/rede-canais.indexing.service';
import { RedeCanaisListingService } from '@/modules/rede-canais/services/rede-canais.listing.service';
import { RedeCanaisMetasService } from '@/modules/rede-canais/services/rede-canais.metas.service';
import { RedeCanaisStreamService } from '@/modules/rede-canais/services/rede-canais.stream.service';
import { TmdbModule } from '@/modules/tmdb/tmdb.module';
import { PrismaService } from '@/services/database/prisma.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [EnvModule, ProxyModule, TmdbModule],
  providers: [
    PrismaService,
    RedeCanaisCachingService,
    RedeCanaisEpisodesService,
    RedeCanaisIndexingService,
    RedeCanaisListingService,
    RedeCanaisMetasService,
    RedeCanaisStreamService,
  ],
  exports: [
    RedeCanaisCachingService,
    RedeCanaisIndexingService,
    RedeCanaisListingService,
    RedeCanaisMetasService,
    RedeCanaisStreamService,
  ],
})
export class RedeCanaisModule {}
