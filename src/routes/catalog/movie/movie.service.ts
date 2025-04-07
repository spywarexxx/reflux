import {
  MOVIES_CATEGORIES_MAPPING_URL,
  MOVIES_GENRES_MAPPING_URL,
} from '@/modules/rede-canais/constants/listing';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogMovieService {
  public convertType(type: string): keyof typeof MOVIES_CATEGORIES_MAPPING_URL {
    switch (type) {
      case 'dubbed':
        return 'DUBBED_URL';

      case 'subtitled':
        return 'SUBTITLED_URL';

      case 'national':
        return 'NATIONAL_URL';

      case '2024':
        return 'BEST_FROM_2024_URL';

      case '2023':
        return 'BEST_FROM_2023_URL';

      case '2022':
        return 'BEST_FROM_2022_URL';

      case '2021':
        return 'BEST_FROM_2021_URL';

      default:
        return 'FEATURED_URL';
    }
  }

  public convertGenre(
    type: keyof typeof MOVIES_CATEGORIES_MAPPING_URL,
    genre: string,
  ): keyof typeof MOVIES_GENRES_MAPPING_URL | null {
    switch (type) {
      case 'DUBBED_URL':
        {
          switch (genre) {
            case 'Ação':
              return 'DUBBED_GENRE_ACTION_URL';

            case 'Animação':
              return 'DUBBED_GENRE_ANIMATION_URL';

            case 'Anime':
              return 'DUBBED_GENRE_ANIME_URL';

            case 'Aventura':
              return 'DUBBED_GENRE_ADVENTURE_URL';

            case 'Biografia':
              return 'DUBBED_GENRE_BIOGRAPHY_URL';

            case 'Comédia':
              return 'DUBBED_GENRE_COMEDY_URL';

            case 'Comédia Romântica':
              return 'DUBBED_GENRE_ROMANTIC_COMEDY_URL';

            case 'Documentário':
              return 'DUBBED_GENRE_DOCUMENTARY_URL';

            case 'Drama':
              return 'DUBBED_GENRE_DRAMA_URL';

            case 'Épico':
              return 'DUBBED_GENRE_EPIC_URL';

            case 'Família':
              return 'DUBBED_GENRE_FAMILY_URL';

            case 'Fantasia':
              return 'DUBBED_GENRE_FANTASY_URL';

            case 'Faroeste':
              return 'DUBBED_GENRE_WESTERN_URL';

            case 'Ficção Científica':
              return 'DUBBED_GENRE_SCI_FI_URL';

            case 'Guerra':
              return 'DUBBED_GENRE_WAR_URL';

            case 'Histórico':
              return 'DUBBED_GENRE_HISTORICAL_URL';

            case 'Musical':
              return 'DUBBED_GENRE_MUSICAL_URL';

            case 'Policial':
              return 'DUBBED_GENRE_POLICE_URL';

            case 'Romance':
              return 'DUBBED_GENRE_ROMANCE_URL';

            case 'Religioso':
              return 'DUBBED_GENRE_RELIGIOUS_URL';

            case 'Show':
              return 'DUBBED_GENRE_SHOW_URL';

            case 'Suspense':
              return 'DUBBED_GENRE_THRILLER_URL';

            case 'Terror':
              return 'DUBBED_GENRE_HORROR_URL';

            case 'Extras':
              return 'DUBBED_GENRE_EXTRAS_URL';
          }
        }
        break;

      case 'SUBTITLED_URL':
        {
          switch (genre) {
            case 'Ação':
              return 'SUBTITLED_GENRE_ACTION_URL';

            case 'Animação':
              return 'SUBTITLED_GENRE_ANIMATION_URL';

            case 'Anime':
              return 'SUBTITLED_GENRE_ANIME_URL';

            case 'Aventura':
              return 'SUBTITLED_GENRE_ADVENTURE_URL';

            case 'Biografia':
              return 'SUBTITLED_GENRE_BIOGRAPHY_URL';

            case 'Comédia':
              return 'SUBTITLED_GENRE_COMEDY_URL';

            case 'Comédia Romântica':
              return 'SUBTITLED_GENRE_ROMANTIC_COMEDY_URL';

            case 'Documentário':
              return 'SUBTITLED_GENRE_DOCUMENTARY_URL';

            case 'Drama':
              return 'SUBTITLED_GENRE_DRAMA_URL';

            case 'Fantasia':
              return 'SUBTITLED_GENRE_FANTASY_URL';

            case 'Faroeste':
              return 'SUBTITLED_GENRE_WESTERN_URL';

            case 'Ficção Científica':
              return 'SUBTITLED_GENRE_SCI_FI_URL';

            case 'Guerra':
              return 'SUBTITLED_GENRE_WAR_URL';

            case 'Histórico':
              return 'SUBTITLED_GENRE_HISTORICAL_URL';

            case 'Musical':
              return 'SUBTITLED_GENRE_MUSICAL_URL';

            case 'Romance':
              return 'SUBTITLED_GENRE_ROMANCE_URL';

            case 'Show':
              return 'SUBTITLED_GENRE_SHOW_URL';

            case 'Suspense':
              return 'SUBTITLED_GENRE_THRILLER_URL';

            case 'Terror':
              return 'SUBTITLED_GENRE_HORROR_URL';
          }
        }
        break;

      default:
        return null;
    }
  }
}
