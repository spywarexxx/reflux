import { PrismaModule } from '@/modules/prisma/prisma.module';
import { ProviderModule } from '@/modules/provider/provider.module';
import { CatalogController } from '@/routes/catalog/catalog.controller';
import { CatalogService } from '@/routes/catalog/catalog.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, ProviderModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
