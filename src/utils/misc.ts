import { Client, Episode } from '@/classes/provider/client';
import { convertAudio, convertQuality } from '@/modules/tmdb/utils/string';
import { Episodec } from '@/types/episodic';
import { Meta } from '@/types/meta';
import { Source } from '@/types/source';
import { Genre, Info, Stream } from '@prisma/client';

export function chunk<T = never>(array: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

export function metafy(info: Info & { genres: Genre[] }): Meta {
  return {
    type: info.type === 'MOVIE' ? 'movie' : 'series',
    id: `reflux:${info.id}`,
    moviedb_id: info.id,
    background: info.thumbnail,
    poster: info.poster,
    name: info.title,
    description: info.description,
    genres: info.genres.map((genre) => genre.name),
    imdbRating: String(info.rating),
    releaseInfo: info.releasedAt.getFullYear(),
    videos: [],
  };
}

export function episodefy(info: Info, episode: Episode[][]): Episodec[] {
  const result: Episodec[] = [];

  for (let seasonIndex = 0; seasonIndex < episode.length; seasonIndex++) {
    const season = episode[seasonIndex];

    for (let episodeIndex = 0; episodeIndex < season.length; episodeIndex++) {
      const episode = season[episodeIndex];

      result.push({
        id: `reflux:${info.id}.${seasonIndex}.${episodeIndex}`,
        season: seasonIndex + 1,
        episode: episodeIndex + 1,
        number: episodeIndex + 1,
        name: episode.title,
        thumbnail: info.thumbnail,
      });
    }
  }

  return result;
}

export function streamfyMovie(stream: Stream): Source {
  return {
    name: stream.provider,
    title: `${convertAudio(stream.audio)} - ${convertQuality(stream.quality)}`,
    url: stream.url,
  };
}

export function streamfyTv(client: Client, episode: Episode): Source[] {
  return episode.tracks.map((track) => ({
    name: client.name,
    title: `${episode.title} - ${convertAudio(track.audio)}`,
    url: track.url,
  }));
}
