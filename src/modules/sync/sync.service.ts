import { Stream } from '@/classes/media/stream';
import { Client } from '@/classes/provider/client';
import { Output } from '@/classes/provider/data';
import { EnvService } from '@/modules/env/env.service';
import { NlpQueriesService } from '@/modules/nlp/services/queries.service';
import { PrismaRepository } from '@/modules/prisma/prisma.repository';
import { ProviderService } from '@/modules/provider/provider.service';
import { TmdbService } from '@/modules/tmdb/tmdb.service';
import { chunk } from '@/utils/misc';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Genre, Info } from '@prisma/client';
import { PromisePool } from '@supercharge/promise-pool';

@Injectable()
export class SyncService implements OnModuleInit {
  public constructor(
    private readonly envService: EnvService,
    private readonly prismaRepository: PrismaRepository,
    private readonly providerService: ProviderService,
    private readonly nlpQueriesService: NlpQueriesService,
    private readonly tmdbService: TmdbService,
  ) {}

  public async onModuleInit(): Promise<void> {
    const environment = this.envService.get('NODE_ENV');

    if (environment === 'production') {
      await this.build();
      await this.index();
    }
  }

  private async build(): Promise<void> {
    for (const client of this.providerService.clients) {
      await client.data.build();
    }
  }

  private async index(): Promise<void> {
    const chunks: (Output & { client: Client })[][] = [];
    const chunksConcurrency = 10;
    const processingConcurrency = 25;

    for (const client of this.providerService.clients) {
      const { data } = client;
      const { output } = data;
      const content = output.map((item) => ({ client, ...item }));
      const chunked = chunk(content, chunksConcurrency);

      chunks.push(...chunked);
    }

    await new PromisePool()
      .withConcurrency(processingConcurrency)
      .for(chunks)
      .process(async (chunk) => {
        const data: {
          client: Client;
          output: Output;
          nlp: Info & { genres: Genre[] };
        }[] = [];

        await Promise.all(
          chunk.map(async ({ client, ...output }) => {
            const { type, title } = output;
            const search = await this.tmdbService.searchMedia(type, title);
            const nlp = await this.nlpQueriesService.search(output, search);

            if (nlp) {
              data.push({ client, output, nlp });
            }
          }),
        );

        if (data.length) {
          for (const { client, output, nlp } of data) {
            const info = await this.prismaRepository.createInfo(nlp);

            await this.prismaRepository.createStream(
              info,
              new Stream({
                provider: client.name,
                url: output.url,
                audio: output.audio,
                quality: output.quality,
              }),
            );
          }
        }
      });
  }
}
