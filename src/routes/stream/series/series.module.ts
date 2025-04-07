import { RedeCanaisModule } from '@/modules/rede-canais/rede-canais.module';
import { StreamSeriesController } from '@/routes/stream/series/series.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [RedeCanaisModule],
  controllers: [StreamSeriesController],
  providers: [],
})
export class StreamSeriesModule {}
