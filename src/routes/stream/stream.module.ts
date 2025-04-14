import { EnvModule } from '@/modules/env/env.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { ProviderModule } from '@/modules/provider/provider.module';
import { ProxyModule } from '@/modules/proxy/proxy.module';
import { StreamController } from '@/routes/stream/stream.controller';
import { StreamService } from '@/routes/stream/stream.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [EnvModule, PrismaModule, ProviderModule, ProxyModule],
  controllers: [StreamController],
  providers: [StreamService],
})
export class StreamModule {}
