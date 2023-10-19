import type { AnimeDetails } from "$types/AnimeDetails";
import type { AnimeStreamLink } from "$types/AnimeStreamLink";
import type { SimpleAnime } from "$types/SimpleAnime";

export interface AnimeSource {
  animeDetails(contentLink: string): Promise<AnimeDetails>;
  searchAnime(searchedText: string): Promise<Array<SimpleAnime>>;
  latestAnime(): Promise<Array<SimpleAnime>>;
  trendingAnime(): Promise<Array<SimpleAnime>>;
  streamLink(
    anime_url: string,
    animeEpCode: string,
    extras?: Array<string>
  ): Promise<AnimeStreamLink>;
}