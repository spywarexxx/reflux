import { NlpProcessingService } from '@/modules/nlp/services/processing.service';
import { NlpQueriesService } from '@/modules/nlp/services/queries.service';
import { PrismaRepository } from '@/modules/prisma/prisma.repository';
import { ProviderService } from '@/modules/provider/provider.service';
import { TrendingService } from '@/modules/trending/trending.service';
import { RcClient } from '@/providers/rc/rc.client';
import { RcData } from '@/providers/rc/rc.data';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RcProvider implements OnModuleInit {
  public readonly client = new RcClient(
    this.prismaRepository,
    this.trendingService,
    this.nlpProcessingService,
  );
  public readonly data = new RcData(this.client);

  public constructor(
    public readonly prismaRepository: PrismaRepository,
    public readonly providerService: ProviderService,
    public readonly trendingService: TrendingService,
    public readonly nlpProcessingService: NlpProcessingService,
    public readonly nlpQueriesService: NlpQueriesService,
  ) {}

  public onModuleInit(): void {
    this.providerService.inject(this.client);
  }
}
