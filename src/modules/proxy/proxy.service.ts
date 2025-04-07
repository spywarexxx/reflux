import { EnvService } from '@/modules/env/env.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProxyService {
  public constructor(private readonly envService: EnvService) {}

  public bypass(target: string) {
    const api = this.envService.get('API_URL');
    return api.concat(target);
  }

  public stream(target: string) {
    const proxy = this.envService.get('STREAM_PROXY_URL');

    if (proxy) {
      return proxy.concat(encodeURIComponent(target));
    }

    return target;
  }

  public image(target: string) {
    const proxy = this.envService.get('IMAGE_PROXY_URL');

    if (proxy) {
      return proxy.concat(encodeURIComponent(target));
    }

    return target;
  }

  public fallbackVideo() {
    return this.stream(this.envService.get('VIDEO_PROXY_FALLBACK_URL'));
  }
}
