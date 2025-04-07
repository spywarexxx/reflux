import { TmdbMovie } from '@/modules/tmdb/types/movie';
import { TmdbTv } from '@/modules/tmdb/types/tv';

export interface TmdbSearch<T = TmdbMovie | TmdbTv> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
