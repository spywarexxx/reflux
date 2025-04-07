import { RedeCanaisModule } from '@/modules/rede-canais/rede-canais.module';
import { StreamMovieController } from '@/routes/stream/movie/movie.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [RedeCanaisModule],
  controllers: [StreamMovieController],
  providers: [],
})
export class StreamMovieModule {}
