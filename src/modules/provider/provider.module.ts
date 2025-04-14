import { ProviderService } from '@/modules/provider/provider.service';
import { RcProvider } from '@/providers/rc/rc.provider';
import { Module } from '@nestjs/common';

@Module({
  providers: [ProviderService],
  exports: [ProviderService],
})
export class ProviderModule {}

export const Providers = [RcProvider];
