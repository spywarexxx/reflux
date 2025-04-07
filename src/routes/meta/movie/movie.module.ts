import { RedeCanaisModule } from '@/modules/rede-canais/rede-canais.module';
import { MetaMovieController } from '@/routes/meta/movie/movie.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [RedeCanaisModule],
  controllers: [MetaMovieController],
  providers: [],
})
export class MetaMovieModule {}
