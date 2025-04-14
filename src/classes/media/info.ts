import { Genre, Stream, Type } from '@prisma/client';

export class Info {
  public id: number;
  public type: Type;
  public title: string;
  public description: string;
  public thumbnail: string;
  public poster: string;
  public rating: number;
  public genres: Genre[];
  public streams: Stream[];
  public releasedAt: Date;
  public createdAt: Date;
  public updatedAt: Date;

  public constructor(info: Partial<Info>) {
    Object.assign(this, info);
  }
}
