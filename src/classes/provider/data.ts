import { Client } from '@/classes/provider/client';
import { Audio } from '@/enums/audio';
import { Media } from '@/enums/media';
import { Quality } from '@/enums/quality';

export interface Output {
  type?: Media;
  url?: string;
  title?: string;
  audio?: Audio;
  quality?: Quality;
}

export abstract class Data {
  public readonly output: Output[] = [];

  public constructor(public readonly client: Client) {}

  public async build(): Promise<void> {}
}
