export type EpisodeMap = Record<string, Record<string, string>>;

export interface AnimeDetails {
  anime_name: string;
  anime_desc: string;
  anime_cover: string;
  anime_episodes: EpisodeMap
}