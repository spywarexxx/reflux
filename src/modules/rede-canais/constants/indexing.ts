/* URL */

export const MOVIES_MAPPING_URL = '/mapafilmes.html';
export const SERIES_MAPPING_URL = '/mapa.html';

/* Fallback */

export const INDEXING_TITLE_FALLBACK = '@@TITLE_NOT_FOUND@@';
export const INDEXING_RAW_TITLE_FALLBACK = '@@RAW_TITLE_NOT_FOUND@@';
export const INDEXING_AUDIO_FALLBACK = '@@AUDIO_NOT_FOUND@@';
export const INDEXING_AUDIO_IN_URL_FALLBACK = '@@AUDIO_IN_URL_NOT_FOUND@@';
export const INDEXING_QUALITY_FALLBACK = '@@QUALITY_NOT_FOUND@@';
export const INDEXING_QUALITY_IN_URL_FALLBACK = '@@QUALITY_IN_URL_NOT_FOUND@@';
export const INDEXING_URL_FALLBACK = '@@URL_NOT_FOUND@@';
export const INDEXING_ID_FALLBACK = '@@ID_NOT_FOUND@@';

/* Regex */

export const INDEXING_RAW_REGEX = /(.*)<a\s*href=".*"\s*target=".*">/g;
export const INDEXING_TITLE_REGEX_1 = /^(.+?)(?:\s*\([^)]*\))(?=\s+-\s*|$)/;
export const INDEXING_TITLE_REGEX_2 = /^(.+?)(?:\s*\([^)]*\))?(?=\s+-\s*|$)/;
export const INDEXING_RAW_TITLE_REGEX = /(.*)<a\s*href=".*"\s*target=".*">/;
export const INDEXING_AUDIO_REGEX =
  /\s\((Dublado|Dubaldo|Duiblado|Legendado|Legendaod|Nacional|Dublado\s\/\sLegendado|Mudo|Original)\)\s[-]?/;
export const INDEXING_AUDIO_IN_URL_REGEX =
  /.*<a\s*href=".*-(dublado|dubaldo|duiblado|legendado|legendaod|nacional)(?:-)?.*"\s*target=".*">/;
export const INDEXING_QUALITY_REGEX =
  /[-]?\s(180p|480p|720p|7200p|1008p|1080p|2160p\s\(4K\))\s[-]?/;
export const INDEXING_QUALITY_IN_URL_REGEX =
  /.*<a\s*href=".*-(180p|480p|720p|7200p|1008p|1080p|2160p-4k)(?:-)?.*"\s*target=".*">/;
export const INDEXING_URL_REGEX = /.*<a\s*href="(.*)"\s*target=".*">/;
export const INDEXING_ID_REGEX =
  /.*<a\s*href=".*_(.*?)(?:(\.html|\.htmll))?"\s*target=".*">/;

export const INDEXING_AUDIO_DUBBED_REGEX = /(dublado|dubaldo|duiblado)/i;
export const INDEXING_AUDIO_SUBTITLED_REGEX = /(legendado|legendaod)/i;
export const INDEXING_AUDIO_NATIONAL_REGEX = /(nacional)/i;
export const INDEXING_AUDIO_MUTED_REGEX = /(mudo)/i;
export const INDEXING_AUDIO_ORIGINAL_REGEX = /(original)/i;

export const INDEXING_QUALITY_STANDARD_DEFINITION_REGEX = /(480p)/i;
export const INDEXING_QUALITY_HIGH_DEFINITION_REGEX = /(720p|7200p)/i;
export const INDEXING_QUALITY_FULL_HIGH_DEFINITION_REGEX =
  /(180p|1008p|1080p)/i;
export const INDEXING_QUALITY_ULTRA_HIGH_DEFINITION_REGEX =
  /(2160p\s\(4K\)|2160p-4k)/i;
