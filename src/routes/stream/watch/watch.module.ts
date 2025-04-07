import { EnvModule } from '@/modules/env/env.module';
import { PrometheusModule } from '@/modules/prometheus/prometheus.module';
import { ProxyModule } from '@/modules/proxy/proxy.module';
import { RedeCanaisModule } from '@/modules/rede-canais/rede-canais.module';
import { StreamWatchController } from '@/routes/stream/watch/watch.controller';
import { StreamWatchService } from '@/routes/stream/watch/watch.service';
import { PrismaService } from '@/services/database/prisma.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrometheusModule, EnvModule, ProxyModule, RedeCanaisModule],
  controllers: [StreamWatchController],
  providers: [PrismaService, StreamWatchService],
})
export class StreamWatchModule {}
