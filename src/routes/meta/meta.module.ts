import { PrismaModule } from '@/modules/prisma/prisma.module';
import { ProviderModule } from '@/modules/provider/provider.module';
import { MetaController } from '@/routes/meta/meta.controller';
import { MetaService } from '@/routes/meta/meta.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, ProviderModule],
  controllers: [MetaController],
  providers: [MetaService],
})
export class MetaModule {}
