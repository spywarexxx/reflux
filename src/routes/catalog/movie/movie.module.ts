import { PrometheusModule } from '@/modules/prometheus/prometheus.module';
import { RedeCanaisModule } from '@/modules/rede-canais/rede-canais.module';
import { CatalogMovieController } from '@/routes/catalog/movie/movie.controller';
import { CatalogMovieService } from '@/routes/catalog/movie/movie.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrometheusModule, RedeCanaisModule],
  controllers: [CatalogMovieController],
  providers: [CatalogMovieService],
})
export class CatalogMovieModule {}
