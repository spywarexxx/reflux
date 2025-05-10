import { PROVIDER_URL } from '@/providers/redecanais/constants/url';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RedeCanaisApiService {
  public readonly http = axios.create({
    baseURL: PROVIDER_URL,
    headers: { referer: PROVIDER_URL },
  });

  public constructor() {}
}
