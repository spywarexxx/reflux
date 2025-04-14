import { Audio } from '@/enums/audio';
import { Quality } from '@/enums/quality';
import { Info } from '@prisma/client';

export class Stream {
  public id: string;
  public provider: string;
  public url: string;
  public audio: Audio;
  public quality: Quality;
  public info: Info;
  public infoId: number;
  public createdAt: Date;
  public updatedAt: Date;

  public constructor(stream: Partial<Stream>) {
    Object.assign(this, stream);
  }
}
