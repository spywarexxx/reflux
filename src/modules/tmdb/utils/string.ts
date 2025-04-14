import { Audio } from '@/enums/audio';
import { Quality } from '@/enums/quality';
import { ContentType, Trending } from '@/modules/tmdb/types/tmdb';
import { Audio as PrismaAudio, Quality as PrismaQuality } from '@prisma/client';

export function convertToContentType(type: string): ContentType {
  const value = type.toLowerCase();

  switch (value) {
    case 'movie':
    case 'movies':
      return 'movie';

    case 'tv':
    case 'series':
      return 'tv';

    default:
      return 'movie';
  }
}

export function convertAudio(audio: Audio | PrismaAudio): string {
  switch (audio) {
    case Audio.DUBBED:
      return 'Dublado';

    case Audio.SUBTITLED:
      return 'Legendado';

    case Audio.ORIGINAL:
      return 'Original';

    default:
      return 'Desconhecido';
  }
}

export function convertQuality(quality: Quality | PrismaQuality): string {
  switch (quality) {
    case Quality.SD:
      return 'SD';

    case Quality.HD:
      return 'HD';

    case Quality.FHD:
      return 'FHD';

    case Quality.UHD:
      return 'UHD';

    default:
      return 'Desconhecido';
  }
}

export function convertTrendingToString(trending: Trending): string {
  switch (trending) {
    case Trending.ALL:
      return 'Todos';

    case Trending.POPULAR:
      return 'Em alta';

    case Trending.TOP_RATED:
      return 'Mais votados';

    case Trending.THEATHER:
      return 'Lançamentos';

    default:
      return 'Desconhecido';
  }
}
