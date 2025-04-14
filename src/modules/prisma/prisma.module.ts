import { PrismaRepository } from '@/modules/prisma/prisma.repository';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [PrismaService, PrismaRepository],
  exports: [PrismaService, PrismaRepository],
})
export class PrismaModule {}
