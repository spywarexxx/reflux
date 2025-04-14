import { Client } from '@/classes/provider/client';

export abstract class Snapshot {
  public constructor(public readonly client: Client) {}

  public async build(url: string): Promise<unknown> {
    return null;
  }
}
