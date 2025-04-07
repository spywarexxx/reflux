import { EnvModule } from '@/modules/env/env.module';
import { TmdbService } from '@/modules/tmdb/tmdb.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [EnvModule],
  providers: [TmdbService],
  exports: [TmdbService],
})
export class TmdbModule {}
