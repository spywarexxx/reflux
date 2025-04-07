import { PrometheusModule } from '@/modules/prometheus/prometheus.module';
import { RedeCanaisModule } from '@/modules/rede-canais/rede-canais.module';
import { CatalogSeriesController } from '@/routes/catalog/series/series.controller';
import { CatalogSeriesService } from '@/routes/catalog/series/series.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrometheusModule, RedeCanaisModule],
  controllers: [CatalogSeriesController],
  providers: [CatalogSeriesService],
})
export class CatalogSeriesModule {}
