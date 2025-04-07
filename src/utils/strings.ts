import * as stringSimilarity from 'string-similarity';

export function normalize(text: string) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function isPhraseSimilar(
  thisPhrase: string,
  thatPhrase: string,
  minimumSimilarityPercentage: number = 75,
): boolean {
  const thisWords = normalize(thisPhrase).split(/\s+/);
  const thatWords = normalize(thatPhrase).split(/\s+/);

  const exactWords = new Set<string>();

  for (const word1 of thisWords) {
    for (const word2 of thatWords) {
      if (word1 === word2) {
        exactWords.add(word1);
        break;
      }
    }
  }

  const totalWords = Math.min(thisWords.length, thatWords.length);
  const similarWordCount = exactWords.size;

  const similarityPercentage = (similarWordCount / totalWords) * 100;
  return similarityPercentage >= minimumSimilarityPercentage;
}

export function comparePhrases(thisPhrase: string, thatPhrase: string) {
  const normalizedThisPhrase = normalize(thisPhrase);
  const normalizedThatPhrase = normalize(thatPhrase);

  if (isPhraseSimilar(thisPhrase, thatPhrase)) {
    return true;
  }

  if (
    normalizedThatPhrase.includes(normalizedThisPhrase) ||
    normalizedThisPhrase.includes(normalizedThatPhrase)
  ) {
    return true;
  }

  return false;
}

export function findBestMatch(
  search: string,
  found: string[],
  limit: number = 50,
): string | null {
  const normalizedSearch = normalize(search);
  const matches = found.map((foundTitle) => {
    const normalizedFound = normalize(foundTitle);
    const similarity = isPhraseSimilar(search, foundTitle, 0)
      ? (normalize(search)
          .split(/\s+/)
          .filter((word) => normalizedFound.includes(word)).length /
          Math.max(
            normalizedSearch.split(/\s+/).length,
            normalizedFound.split(/\s+/).length,
          )) *
        100
      : 0;

    return { foundTitle, similarity };
  });

  const bestMatch = matches.sort((a, b) => b.similarity - a.similarity)[0] ?? {
    similarity: 0,
    foundTitle: null,
  };

  return bestMatch.similarity > limit ? bestMatch.foundTitle : null;
}

export function compareBestMatch(
  search: string,
  found: string[],
  limit: number = 50,
): string | null {
  const normalizeForComparison = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizedSearch = normalizeForComparison(search);
  const matches = found.map((foundTitle) => {
    const normalizedFound = normalizeForComparison(foundTitle);
    const similarity =
      stringSimilarity.compareTwoStrings(normalizedSearch, normalizedFound) *
      100;

    return { foundTitle, similarity };
  });

  const bestMatch = matches.sort((a, b) => {
    return (
      b.similarity - a.similarity || a.foundTitle.length - b.foundTitle.length
    );
  })[0] ?? { similarity: 0, foundTitle: null };

  const adjustedLimit = normalizedSearch.split(/\s+/).length > 3 ? 70 : limit;

  return bestMatch.similarity >= adjustedLimit ? bestMatch.foundTitle : null;
}

export function hash<T = never>(content: T): string {
  try {
    const base64 = btoa(String(content));
    const hex = stringToHex(base64);
    const inverse = hex.split('').reverse().join('');

    return inverse;
  } catch {
    return String(content);
  }
}

export function unhash(content: string): string {
  try {
    const inverse = content.split('').reverse().join('');
    const hex = hexToString(inverse);
    const base64 = atob(hex);

    return base64;
  } catch {
    return content;
  }
}

function stringToHex(input: string) {
  let output = '';

  for (let i = 0; i < input.length; i++) {
    output += input.charCodeAt(i).toString(16).padStart(2, '0').toLowerCase();
  }

  return output;
}

function hexToString(input: string) {
  const hex = input.match(/[0-9a-fA-F]{2}/g);
  let output = '';

  if (hex) {
    hex.forEach(
      (h) =>
        (output += String.fromCharCode(
          Number.parseInt(h.replace('\\x', ''), 16),
        )),
    );
  }

  return output;
}
