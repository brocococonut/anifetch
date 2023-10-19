import {YugenSource} from "$utils/sources/YugenSource";
import {KissKhSource} from "$utils/sources/KissKhSource";
import {MyAsianTvSource} from "$utils/sources/MyAsianTvSource";
import type { AnimeDetails } from "$types/AnimeDetails";
import type { AnimeSource } from "$types/AnimeSource";
import type { AnimeStreamLink } from "$types/AnimeStreamLink";
import type { SimpleAnime } from "$types/SimpleAnime";

interface AnimeRepository {
  // API operations
  getAnimeDetailsFromSite(contentLink: string): Promise<AnimeDetails | null>;
  searchAnimeFromSite(searchUrl: string): Promise<SimpleAnime[]>;
  getLatestAnimeFromSite(): Promise<SimpleAnime[]>;
  getTrendingAnimeFromSite(): Promise<SimpleAnime[]>;
  getStreamLink(
    animeUrl: string,
    animeEpCode: string,
    extras: string[]
  ): Promise<AnimeStreamLink>;

}

export class AnimeRepositoryImpl implements AnimeRepository {
  private selectedSource: string = 'yugen';
  private animeSource: AnimeSource = new YugenSource();

  constructor() {
    
  }

  public setProvider(provider: string) {
    switch (provider) {
      case "yugen":
        this.selectedSource = 'yugen'
        this.animeSource = new YugenSource();
        break;
      case "kiss_kh":
        this.selectedSource = 'kiss_kh'
        this.animeSource = new KissKhSource();
        break;
      // case "my_asian_tv":
      //   this.animeSource = new MyAsianTvSource();
      //   break;
      default:
        this.selectedSource = 'yugen'
        this.animeSource = new YugenSource();
        break;
    }
  }

  public async getAnimeDetailsFromSite(contentLink: string): Promise<AnimeDetails | null> {
    try {
      return await this.animeSource.animeDetails(contentLink);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  public async searchAnimeFromSite(searchUrl: string): Promise<SimpleAnime[]> {
    try {
      return await this.animeSource.searchAnime(searchUrl);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  public async getLatestAnimeFromSite(): Promise<SimpleAnime[]> {
    try {
      return await this.animeSource.latestAnime();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  public async getTrendingAnimeFromSite(): Promise<SimpleAnime[]> {
    try {
      return await this.animeSource.trendingAnime();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  public async getStreamLink(
    animeUrl: string,
    animeEpCode: string,
    extras: string[]
  ): Promise<AnimeStreamLink> {
    try {
      return await this.animeSource.streamLink(animeUrl, animeEpCode, extras);
    } catch (e) {
      console.error(e);
      return { link: "", server: "", is_playable: false, is_hls: false, subs_link: '' };
    }
  }
}

export const AnimeRepository = new AnimeRepositoryImpl();
