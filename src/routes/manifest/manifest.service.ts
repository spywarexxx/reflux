import { EnvService } from '@/config/env.service';
import { Injectable } from '@nestjs/common';
import * as pkg from '@package';
import { z } from 'zod';

export const MovieCategoryType = z.enum([
  'featured',
  'dubbed',
  'subtitled',
  'national',
  '2021',
  '2022',
  '2023',
  '2024',
]);

export const SeriesCategoryType = z.enum(['featured', 'tv', 'animes']);

export type IMovieCategoryType = z.infer<typeof MovieCategoryType>;

export type ISeriesCategoryType = z.infer<typeof SeriesCategoryType>;

@Injectable()
export class ManifestService {
  public constructor(private readonly envService: EnvService) {}

  public get() {
    const categories = this.categories();

    const movies = categories.movies.map((movies) => ({
      id: `reflux.${movies.type}`,
      type: 'movie',
      name: `Reflux - ${movies.label}`,
      extra: [
        {
          name: 'genre',
          isRequired: false,
          options: movies.items.map((item) => item.label),
          optionsLimit: 1,
        },
        {
          name: 'skip',
          isRequired: false,
          options: [],
          optionsLimit: 1,
        },
        movies.items.length
          ? {
              name: 'search',
              isRequired: false,
              options: [],
              optionsLimit: 1,
            }
          : null,
      ].filter(Boolean),
    }));

    const series = categories.series.map((series) => ({
      id: `reflux.${series.type}`,
      type: 'series',
      name: `Reflux - ${series.label}`,
      extra: [
        {
          name: 'genre',
          isRequired: false,
          options: series.items.map((item) => item.label),
          optionsLimit: 1,
        },
        {
          name: 'skip',
          isRequired: false,
          options: [],
          optionsLimit: 1,
        },
        series.items.length
          ? {
              name: 'search',
              isRequired: false,
              options: [],
              optionsLimit: 1,
            }
          : null,
      ].filter(Boolean),
    }));

    return {
      id: pkg.stremio.id,
      version: pkg.version,
      name: pkg.stremio.name,
      description: pkg.stremio.description,
      logo: this.envService.get('APP_URL').concat('/public/images/logo.png'),
      resources: ['catalog', 'meta', 'stream'],
      idPrefixes: ['reflux'],
      types: ['movie', 'series'],
      catalogs: [...movies, ...series],
    };
  }

  public findMovieCategory(type: IMovieCategoryType) {
    const categories = this.categories();
    return categories.movies.find((movie) => movie.type === type);
  }

  public findSeriesCategory(type: ISeriesCategoryType) {
    const categories = this.categories();
    return categories.series.find((series) => series.type === type);
  }

  public findMovieGenre(type: IMovieCategoryType, label: string) {
    const categories = this.categories();

    return categories.movies
      .find((movie) => movie.type === type)
      .items.find((item) => item.label === label);
  }

  public findSeriesGenre(type: ISeriesCategoryType, label: string) {
    const categories = this.categories();

    return categories.series
      .find((series) => series.type === type)
      .items.find((item) => item.label === label);
  }

  /**
   * You might be wondering why this long array is static. Here's the explanation:
   * Fetching from a provider can introduce latency when adding the manifest, and this issue could be amplified if thousands of people are doing it simultaneously.
   * Additionally, we need to consider the risk of sending a broken category to one user but not to others, which could lead to content mismatches.
   *
   * Also we can't forget about pagination: %page% is a dynamic parameter returned by media provider.
   */
  public categories(): {
    movies: {
      type: IMovieCategoryType;
      label: string;
      url: string;
      items: {
        label: string;
        url: string;
      }[];
    }[];
    series: {
      type: ISeriesCategoryType;
      label: string;
      url: string;
      items: {
        label: string;
        url: string;
      }[];
    }[];
  } {
    return {
      movies: [
        {
          type: 'featured',
          label: 'Lançamentos',
          url: '/browse-filmes-lancamentos-videos-%page%-date.html',
          items: [],
        },
        {
          type: 'dubbed',
          label: 'Dublado',
          url: '/browse-filmes-dublado-videos-%page%-date.html',
          items: [
            {
              label: 'Ação',
              url: '/browse-acao-filmes-videos-%page%-date.html',
            },
            {
              label: 'Animação',
              url: '/browse-animacao-filmes-videos-%page%-date.html',
            },
            {
              label: 'Anime',
              url: '/browse-anime-filmes-videos-%page%-date.html',
            },
            {
              label: 'Aventura',
              url: '/browse-aventura-filmes-videos-%page%-date.html',
            },
            {
              label: 'Biografia',
              url: '/browse-biografia-filmes-videos-%page%-date.html',
            },
            {
              label: 'Comédia',
              url: '/browse-comedia-filmes-videos-%page%-date.html',
            },
            {
              label: 'Comédia Romântica',
              url: '/browse-comedia-romantica-filmes-videos-%page%-date.html',
            },
            {
              label: 'Documentário',
              url: '/browse-documentario-filmes-videos-%page%-date.html',
            },
            {
              label: 'Drama',
              url: '/browse-drama-filmes-videos-%page%-date.html',
            },
            {
              label: 'Épico',
              url: '/browse-epico-filmes-videos-%page%-date.html',
            },
            {
              label: 'Erótico',
              url: '/browse-erotico-filmes-videos-%page%-date.html',
            },
            {
              label: 'Família',
              url: '/browse-familia-filmes-videos-%page%-date.html',
            },
            {
              label: 'Fantasia',
              url: '/browse-fantasia-filmes-videos-%page%-date.html',
            },
            {
              label: 'Faroeste',
              url: '/browse-faroeste-filmes-videos-%page%-date.html',
            },
            {
              label: 'Ficção Científica',
              url: '/browse-ficcao-cientifica-filmes-videos-%page%-date.html',
            },
            {
              label: 'Guerra',
              url: '/browse-guerra-filmes-videos-%page%-date.html',
            },
            {
              label: 'Histórico',
              url: '/browse-historico-filmes-videos-%page%-date.html',
            },
            {
              label: 'Musical',
              url: '/browse-musical-filmes-videos-%page%-date.html',
            },
            {
              label: 'Policial',
              url: '/browse-policial-filmes-videos-%page%-date.html',
            },
            {
              label: 'Romance',
              url: '/browse-romance-filmes-videos-%page%-date.html',
            },
            {
              label: 'Religioso',
              url: '/browse-religioso-filmes-videos-%page%-date.html',
            },
            {
              label: 'Show',
              url: '/browse-show-filmes-videos-%page%-date.html',
            },
            {
              label: 'Suspense',
              url: '/browse-suspense-filmes-videos-%page%-date.html',
            },
            {
              label: 'Terror',
              url: '/browse-terror-filmes-videos-%page%-date.html',
            },
            {
              label: 'Extras',
              url: '/browse-extras-filmes-videos-%page%-date.html',
            },
          ],
        },
        {
          type: 'subtitled',
          label: 'Legendado',
          url: '/browse-filmes-legendado-videos-%page%-date.html',
          items: [
            {
              label: 'Ação',
              url: '/browse-acao-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Animação',
              url: '/browse-animacao-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Anime',
              url: '/browse-anime-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Aventura',
              url: '/browse-aventura-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Biografia',
              url: '/browse-biografia-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Comédia',
              url: '/browse-comedia-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Comédia Romântica',
              url: '/browse-comedia-romantica-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Documentário',
              url: '/browse-documentario-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Drama',
              url: '/browse-drama-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Erótico',
              url: '/browse-erotico-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Fantasia',
              url: '/browse-fantasia-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Faroeste',
              url: '/browse-faroeste-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Ficção Científica',
              url: '/browse-ficcao-cientifica-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Guerra',
              url: '/browse-guerra-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Histórico',
              url: '/browse-historico-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Musical',
              url: '/browse-musical-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Romance',
              url: '/browse-romance-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Show',
              url: '/browse-show-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Suspense',
              url: '/browse-suspense-filmes-legendado-videos-%page%-date.html',
            },
            {
              label: 'Terror',
              url: '/browse-terror-filmes-legendado-videos-%page%-date.html',
            },
          ],
        },
        {
          type: 'national',
          label: 'Nacionais',
          url: '/browse-filmes-nacional-videos-%page%-date.html',
          items: [],
        },
        {
          type: '2024',
          label: 'Melhores de 2024',
          url: '/browse-filmes-de-2024-videos-%page%-date.html',
          items: [],
        },
        {
          type: '2023',
          label: 'Melhores de 2023',
          url: '/browse-filmes-de-2023-videos-%page%-date.html',
          items: [],
        },
        {
          type: '2022',
          label: 'Melhores de 2022',
          url: '/browse-filmes-de-2022-videos-%page%-date.html',
          items: [],
        },
        {
          type: '2021',
          label: 'Melhores de 2021',
          url: '/browse-filmes-de-2021-videos-%page%-date.html',
          items: [],
        },
      ],
      series: [
        {
          type: 'featured',
          label: 'Lançamentos',
          url: '/browse-series-videos-%page%-date.html',
          items: [],
        },
        {
          type: 'tv',
          label: 'TV',
          url: '/browse-series-videos-%page%-date.html',
          items: [
            {
              label: 'Letra - A',
              url: '/browse-letra-a-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - B',
              url: '/browse-letra-b-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - C',
              url: '/browse-letra-c-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - D',
              url: '/browse-letra-d-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - E',
              url: '/browse-letra-e-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - F',
              url: '/browse-letra-f-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - G',
              url: '/browse-letra-g-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - H',
              url: '/browse-letra-h-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - I',
              url: '/browse-letra-i-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - J',
              url: '/browse-letra-j-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - K',
              url: '/browse-letra-k-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - L',
              url: '/browse-letra-l-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - M',
              url: '/browse-letra-m-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - N',
              url: '/browse-letra-n-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - O',
              url: '/browse-letra-o-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - P',
              url: '/browse-letra-p-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - Q',
              url: '/browse-letra-q-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - R',
              url: '/browse-letra-r-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - S',
              url: '/browse-letra-s-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - T',
              url: '/browse-letra-t-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - U',
              url: '/browse-letra-u-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - V',
              url: '/browse-letra-v-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - W',
              url: '/browse-letra-w-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - X',
              url: '/browse-letra-x-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - Y',
              url: '/browse-letra-y-series-videos-%page%-date.html',
            },
            {
              label: 'Letra - Z',
              url: '/browse-letra-z-series-videos-%page%-date.html',
            },
            {
              label: 'Outros',
              url: '/browse-numerosesimbolos-series-videos-%page%-date.html',
            },
          ],
        },
        {
          type: 'animes',
          label: 'Animes',
          url: '/browse-animes-videos-%page%-date.html',
          items: [
            {
              label: 'Letra - A',
              url: '/browse-letra-a-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - B',
              url: '/browse-letra-b-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - C',
              url: '/browse-letra-c-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - D',
              url: '/browse-letra-d-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - E',
              url: '/browse-letra-e-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - F',
              url: '/browse-letra-f-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - G',
              url: '/browse-letra-g-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - H',
              url: '/browse-letra-h-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - I',
              url: '/browse-letra-i-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - J',
              url: '/browse-letra-j-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - K',
              url: '/browse-letra-k-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - L',
              url: '/browse-letra-l-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - M',
              url: '/browse-letra-m-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - N',
              url: '/browse-letra-n-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - O',
              url: '/browse-letra-o-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - P',
              url: '/browse-letra-p-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - Q',
              url: '/browse-letra-q-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - R',
              url: '/browse-letra-r-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - S',
              url: '/browse-letra-s-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - T',
              url: '/browse-letra-t-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - U',
              url: '/browse-letra-u-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - V',
              url: '/browse-letra-v-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - W',
              url: '/browse-letra-w-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - X',
              url: '/browse-letra-x-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - Y',
              url: '/browse-letra-y-animes-videos-%page%-date.html',
            },
            {
              label: 'Letra - Z',
              url: '/browse-letra-z-animes-videos-%page%-date.html',
            },
            {
              label: 'Outros',
              url: '/browse-numerosesimbolos-animes-videos-%page%-date.html',
            },
          ],
        },
      ],
    };
  }
}
