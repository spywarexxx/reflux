import { EnvModule } from '@/modules/env/env.module';
import { ProxyService } from '@/modules/proxy/proxy.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [EnvModule],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
