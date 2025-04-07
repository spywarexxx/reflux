import { RedeCanaisModule } from '@/modules/rede-canais/rede-canais.module';
import { MetaSeriesController } from '@/routes/meta/series/series.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [RedeCanaisModule],
  controllers: [MetaSeriesController],
  providers: [],
})
export class MetaSeriesModule {}
