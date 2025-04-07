import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  APP_PORT: z.coerce.number().min(0).max(65535).default(3000),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  IMAGE_PROXY_URL: z.string().url().optional(),
  STREAM_PROXY_URL: z.string().url().optional(),
  VIDEO_PROXY_FALLBACK_URL: z.string().url().optional(),
  TMDB_READ_API_KEY: z.string(),
  TMDB_WRITE_API_KEY: z.string(),
});

export type Env = z.infer<typeof envSchema>;
