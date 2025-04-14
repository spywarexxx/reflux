import { Data } from '@/classes/provider/data';
import { Snapshot } from '@/classes/provider/snapshot';
import { Audio } from '@/enums/audio';
import { Media } from '@/enums/media';
import { Trending } from '@/modules/tmdb/types/tmdb';
import { Info } from '@prisma/client';
import { AxiosInstance } from 'axios';

export interface Episode {
  title: string;
  tracks: Track[];
}

export interface Track {
  url: string;
  audio: Audio;
}

export abstract class Client {
  public readonly name: string;
  public readonly url: string;
  public readonly snapshots: Snapshot[];
  public readonly data: Data;
  public readonly api: AxiosInstance;

  public constructor() {}

  public async getInfo(id: number): Promise<Info> {
    return null;
  }

  public async getTrending(type: Media, trending: Trending): Promise<Info[]> {
    return [];
  }

  public async getEpisodes(id: number): Promise<Episode[][]> {
    return [];
  }

  public async getStream(url: string): Promise<string> {
    return '';
  }
}
