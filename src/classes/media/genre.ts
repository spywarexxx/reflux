export class Genre {
  public id: number;
  public name: string;
  public createdAt: Date;
  public updatedAt: Date;

  public constructor(genre: Partial<Genre>) {
    Object.assign(this, genre);
  }
}
