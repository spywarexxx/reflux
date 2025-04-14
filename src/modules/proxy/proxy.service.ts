import { EnvService } from '@/modules/env/env.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProxyService {
  public constructor(private readonly envService: EnvService) {}

  public byPass(url: string, path: string = undefined): string {
    const base = this.envService.get('APP_URL');
    const uri = [base, path, url].filter(Boolean).join('/');

    return uri;
  }

  public passThrough(url: string): string {
    const searchParams = new URLSearchParams();

    searchParams.set('url', url);

    const params = searchParams.toString();
    const base = this.envService.get('PROXY_URL');
    const uri = `${base}?${params}`;

    return uri;
  }
}
