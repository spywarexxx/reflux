import { EnvModule } from '@/modules/env/env.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { ManifestController } from '@/routes/manifest/manifest.controller';
import { ManifestService } from '@/routes/manifest/manifest.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [EnvModule, PrismaModule],
  controllers: [ManifestController],
  providers: [ManifestService],
})
export class ManifestModule {}
