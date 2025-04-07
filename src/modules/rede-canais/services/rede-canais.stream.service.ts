import { EnvService } from '@/modules/env/env.service';
import { decrypt } from '@/modules/rede-canais/utils/decrypt';
import { Injectable, Logger } from '@nestjs/common';
import { toASCII } from 'node:punycode';

interface FetchOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  redirect?: 'follow' | 'manual';
}

interface SourceResponse {
  url: string;
  token: string;
}

@Injectable()
export class RedeCanaisStreamService {
  private readonly logger = new Logger(RedeCanaisStreamService.name);
  private readonly playerIdentifier = '/player3';

  public constructor(private readonly envService: EnvService) {}

  public async getStreamUrl(initialUrl: string): Promise<string | null> {
    try {
      const playerUrl = await this.fetchPlayerUrl(initialUrl);
      const sourceData = await this.fetchSourceData(playerUrl);
      const streamUrl = await this.fetchStreamUrl(sourceData);
      const videoUrl = await this.resolveVideoUrl(streamUrl);

      return videoUrl;
    } catch (error) {
      this.logger.error(
        `Failed to get stream URL: ${error.message} (${error.stack})`,
      );
      throw error;
    }
  }

  private async fetchPlayerUrl(url: string): Promise<string> {
    const { uri, referer } = this.getRequestContext(url);
    const html = await this.fetchWithRetry(uri, {
      method: 'GET',
      headers: this.getDefaultHeaders(referer),
    });

    const decrypted = decrypt(html);
    const iframeMatch = decrypted.match(/<iframe\s+[^>]*src=["']([^"']*)["']/i);

    if (!iframeMatch) {
      throw new Error('Player iframe URL not found in response');
    }

    return new URL(`${referer}${toASCII(iframeMatch[1])}`).href;
  }

  private async fetchSourceData(url: string): Promise<SourceResponse> {
    const { uri, referer } = this.getRequestContext(url);
    const html = await this.fetchWithRetry(uri, {
      method: 'GET',
      headers: this.getDefaultHeaders(referer),
    });

    const decrypted = decrypt(html);
    const ajaxMatch = decrypted.match(/\$.ajax\(([\s\S]*?)\);/i);

    if (!ajaxMatch) {
      throw new Error('AJAX request pattern not found in source');
    }

    const urlMatch = ajaxMatch[1].match(/url:\s*['"]([^'"]+)['"]/);
    const tokenMatch = ajaxMatch[1].match(/'rctoken':'([^']+)'/);

    if (!urlMatch || !tokenMatch) {
      throw new Error('Missing required source URL or token');
    }

    const parsedUrl = new URL(urlMatch[1], uri);

    return {
      url: `${this.playerIdentifier}${parsedUrl.pathname}${parsedUrl.search}`,
      token: tokenMatch[1],
    };
  }

  private async fetchStreamUrl(source: SourceResponse): Promise<string> {
    const { uri, referer } = this.getRequestContext(source.url);
    const html = await this.fetchWithRetry(uri, {
      method: 'POST',
      headers: {
        ...this.getDefaultHeaders(referer),
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: `rctoken=${encodeURIComponent(source.token)}`,
    });

    const vodMatch = html.match(/const\s+VID_URL\s*=\s*["']([^"']+)["']/);

    if (!vodMatch) {
      throw new Error('VOD URL not found in stream response');
    }

    return new URL(vodMatch[1], uri).href;
  }

  private async resolveVideoUrl(url: string): Promise<string | null> {
    const { uri, referer } = this.getRequestContext(url);

    try {
      const response = await fetch(uri, {
        method: 'GET',
        redirect: 'follow',
        headers: { referer },
      });

      // Handle both successful responses and redirects.
      return response.redirected
        ? response.url
        : response.headers.get('location');
    } catch (error) {
      this.logger.warn(
        `Video URL resolution encountered an error: ${error.message}`,
      );
      return null;
    }
  }

  private async fetchWithRetry(
    url: string,
    options: FetchOptions,
    retries = 3,
  ): Promise<string> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error, status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      if (retries > 0) {
        this.logger.warn(`Retrying fetch (${retries} attempts left)`);
        return this.fetchWithRetry(url, options, retries - 1);
      }

      throw error;
    }
  }

  private getRequestContext(url: string): { uri: string; referer: string } {
    const baseUrl = this.envService.get('API_URL');
    const uri = new URL(url, baseUrl).href;
    const referer = new URL(uri).origin;

    return { uri, referer };
  }

  private getDefaultHeaders(referer: string): Record<string, string> {
    return {
      referer,
      'referer-policy': 'strict-origin-when-cross-origin',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };
  }
}
