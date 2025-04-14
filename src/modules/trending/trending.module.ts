import { EnvModule } from '@/modules/env/env.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { TmdbModule } from '@/modules/tmdb/tmdb.module';
import { TrendingService } from '@/modules/trending/trending.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [EnvModule, PrismaModule, TmdbModule],
  providers: [TrendingService],
  exports: [TrendingService],
})
export class TrendingModule {}
