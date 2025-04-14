import { Trending } from '@/modules/tmdb/types/tmdb';

export function convertToTrending(type: string): Trending {
  const value = type.toUpperCase();

  switch (value) {
    case 'ALL':
      return Trending.ALL;

    case 'POPULAR':
      return Trending.POPULAR;

    case 'TOP_RATED':
    case 'TOP-RATED':
      return Trending.TOP_RATED;

    case 'THEATHER':
      return Trending.THEATHER;

    default:
      return Trending.ALL;
  }
}
