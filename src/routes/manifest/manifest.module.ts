import { EnvModule } from '@/modules/env/env.module';
import { PrometheusModule } from '@/modules/prometheus/prometheus.module';
import { ManifestController } from '@/routes/manifest/manifest.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrometheusModule, EnvModule],
  controllers: [ManifestController],
  providers: [],
})
export class ManifestModule {}
