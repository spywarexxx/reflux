import { Client } from '@/classes/provider/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProviderService {
  public readonly clients: Client[] = [];

  public constructor() {}

  public getProvider(name: string): Client | null {
    const client = this.clients.find((c) => c.name === name);

    return client ?? null;
  }

  public inject(client: Client): void {
    const exists = this.clients.find((c) => c.name === client.name);

    if (exists) {
      throw new Error(`Client "${client.name}" already exists.`);
    }

    this.clients.push(client);
  }
}
