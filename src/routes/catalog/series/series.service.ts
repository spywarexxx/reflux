import {
  ANIMES_CATEGORIES_MAPPING_URL,
  ANIMES_GENRES_MAPPING_URL,
  SERIES_CATEGORIES_MAPPING_URL,
  SERIES_GENRES_MAPPING_URL,
} from '@/modules/rede-canais/constants/listing';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogSeriesService {
  public convertType(
    type: string,
  ):
    | keyof typeof SERIES_CATEGORIES_MAPPING_URL
    | keyof typeof ANIMES_CATEGORIES_MAPPING_URL {
    switch (type) {
      case 'featured':
        return 'SERIES_FEATURED_URL';

      case 'tv':
        return 'SERIES_TV_URL';

      case 'animes':
        return 'ANIMES_FEATURED_URL';
    }
  }

  public convertGenre(
    type:
      | keyof typeof SERIES_CATEGORIES_MAPPING_URL
      | keyof typeof ANIMES_CATEGORIES_MAPPING_URL,
    genre: string,
  ):
    | keyof typeof SERIES_GENRES_MAPPING_URL
    | keyof typeof ANIMES_GENRES_MAPPING_URL
    | null {
    switch (type) {
      case 'SERIES_FEATURED_URL':
      case 'SERIES_TV_URL': {
        switch (genre) {
          case 'Letra - A':
            return 'SERIES_LETTER_A_URL';

          case 'Letra - B':
            return 'SERIES_LETTER_B_URL';

          case 'Letra - C':
            return 'SERIES_LETTER_C_URL';

          case 'Letra - D':
            return 'SERIES_LETTER_D_URL';

          case 'Letra - E':
            return 'SERIES_LETTER_E_URL';

          case 'Letra - F':
            return 'SERIES_LETTER_F_URL';

          case 'Letra - G':
            return 'SERIES_LETTER_G_URL';

          case 'Letra - H':
            return 'SERIES_LETTER_H_URL';

          case 'Letra - I':
            return 'SERIES_LETTER_I_URL';

          case 'Letra - J':
            return 'SERIES_LETTER_J_URL';

          case 'Letra - K':
            return 'SERIES_LETTER_K_URL';

          case 'Letra - L':
            return 'SERIES_LETTER_L_URL';

          case 'Letra - M':
            return 'SERIES_LETTER_M_URL';

          case 'Letra - N':
            return 'SERIES_LETTER_N_URL';

          case 'Letra - O':
            return 'SERIES_LETTER_O_URL';

          case 'Letra - P':
            return 'SERIES_LETTER_P_URL';

          case 'Letra - Q':
            return 'SERIES_LETTER_Q_URL';

          case 'Letra - R':
            return 'SERIES_LETTER_R_URL';

          case 'Letra - S':
            return 'SERIES_LETTER_S_URL';

          case 'Letra - T':
            return 'SERIES_LETTER_T_URL';

          case 'Letra - U':
            return 'SERIES_LETTER_U_URL';

          case 'Letra - V':
            return 'SERIES_LETTER_V_URL';

          case 'Letra - W':
            return 'SERIES_LETTER_W_URL';

          case 'Letra - X':
            return 'SERIES_LETTER_X_URL';

          case 'Letra - Y':
            return 'SERIES_LETTER_Y_URL';

          case 'Letra - Z':
            return 'SERIES_LETTER_Z_URL';

          case 'Outros':
            return 'SERIES_OTHERS_URL';

          default:
            return null;
        }
      }

      case 'ANIMES_FEATURED_URL': {
        switch (genre) {
          case 'Letra - A':
            return 'ANIMES_LETTER_A_URL';

          case 'Letra - B':
            return 'ANIMES_LETTER_B_URL';

          case 'Letra - C':
            return 'ANIMES_LETTER_C_URL';

          case 'Letra - D':
            return 'ANIMES_LETTER_D_URL';

          case 'Letra - E':
            return 'ANIMES_LETTER_E_URL';

          case 'Letra - F':
            return 'ANIMES_LETTER_F_URL';

          case 'Letra - G':
            return 'ANIMES_LETTER_G_URL';

          case 'Letra - H':
            return 'ANIMES_LETTER_H_URL';

          case 'Letra - I':
            return 'ANIMES_LETTER_I_URL';

          case 'Letra - J':
            return 'ANIMES_LETTER_J_URL';

          case 'Letra - K':
            return 'ANIMES_LETTER_K_URL';

          case 'Letra - L':
            return 'ANIMES_LETTER_L_URL';

          case 'Letra - M':
            return 'ANIMES_LETTER_M_URL';

          case 'Letra - N':
            return 'ANIMES_LETTER_N_URL';

          case 'Letra - O':
            return 'ANIMES_LETTER_O_URL';

          case 'Letra - P':
            return 'ANIMES_LETTER_P_URL';

          case 'Letra - Q':
            return 'ANIMES_LETTER_Q_URL';

          case 'Letra - R':
            return 'ANIMES_LETTER_R_URL';

          case 'Letra - S':
            return 'ANIMES_LETTER_S_URL';

          case 'Letra - T':
            return 'ANIMES_LETTER_T_URL';

          case 'Letra - U':
            return 'ANIMES_LETTER_U_URL';

          case 'Letra - V':
            return 'ANIMES_LETTER_V_URL';

          case 'Letra - W':
            return 'ANIMES_LETTER_W_URL';

          case 'Letra - X':
            return 'ANIMES_LETTER_X_URL';

          case 'Letra - Y':
            return 'ANIMES_LETTER_Y_URL';

          case 'Letra - Z':
            return 'ANIMES_LETTER_Z_URL';

          case 'Outros':
            return 'ANIMES_OTHERS_URL';

          default:
            return null;
        }
      }
    }
  }
}
