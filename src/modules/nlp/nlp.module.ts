import { NlpProcessingService } from '@/modules/nlp/services/processing.service';
import { NlpQueriesService } from '@/modules/nlp/services/queries.service';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  providers: [NlpProcessingService, NlpQueriesService],
  exports: [NlpProcessingService, NlpQueriesService],
})
export class NlpModule {}
