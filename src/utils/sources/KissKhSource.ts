import type { AnimeDetails } from "$types/AnimeDetails";
import type { AnimeSource } from "$types/AnimeSource";
import type { AnimeStreamLink } from "$types/AnimeStreamLink";
import type { SimpleAnime } from "$types/SimpleAnime";
import { request } from "$utils/request";

export class KissKhSource implements AnimeSource {
  static URL = "https://kisskh.co";

  public async animeDetails(contentLink: string): Promise<AnimeDetails> {
    const url = `${KissKhSource.URL}/api/DramaList/Drama/${contentLink}?isq=false`;
    const res = await this.getJSON(url);

    const anime_cover = res.thumbnail;
    const anime_name = res.title;
    const anim_desc = res.description;
    const eps = res.episodes;
    const ep_map: { [key: string]: { [key: string]: string } } = { SUB: {} };

    eps.reverse().forEach((ep: any) => {
      ep_map.SUB[ep.number.toString()] = ep.id;
    });

    return { anime_name: anime_name, anime_desc: anim_desc, anime_cover: anime_cover, anime_episodes: ep_map };
  }

  public async searchAnime(searchedText: string): Promise<SimpleAnime[]> {
    const anime_list: SimpleAnime[] = [];
    const url = `${KissKhSource.URL}/api/DramaList/Search?q=${searchedText}&type=0`;

    const res = await this.getJSON(url);

    for (const json of res) {
      const name = json.title;
      const image = json.thumbnail;
      const id = json.id;
      anime_list.push({ anime_name: name, anime_image_url: image, anime_link: id });
    }

    return anime_list;
  }

  public async latestAnime(): Promise<SimpleAnime[]> {
    const url = `${KissKhSource.URL}/api/DramaList/List?page=1&type=0&sub=0&country=0&status=0&order=2&pageSize=40`;
    return this.getAnimeList(url);
  }

  public async trendingAnime(): Promise<SimpleAnime[]> {
    const url = `${KissKhSource.URL}/api/DramaList/List?page=1&type=0&sub=0&country=0&status=0&order=1&pageSize=40`;
    return this.getAnimeList(url);
  }

  public async streamLink(anime_url: string, anime_ep_code: string, extras?: string[]): Promise<AnimeStreamLink> {
    const url = `${KissKhSource.URL}/api/DramaList/Episode/${anime_ep_code}.png?err=false&ts=&time=`;
    const res = await this.getJSON(url);

    let subs = "";
    const subObj = (await this.getJSON(`${KissKhSource.URL}/api/Sub/${anime_ep_code}`))[0];
    if (subObj.default) {
      subs = subObj.src;
    }
    return {
      link: !res.Video.includes("https") ? `https:${res.Video}` : res.Video,
      server: subs,
      success: true,
      is_playable: true,
      extra_headers: { referer: "https://kisskh.me/", origin: "https://kisskh.me" },
      is_hls: false,
      subs_link: "",
    };
  }

  private async getJSON(url: string): Promise<any> {
    const response = await request({
      url,
      method: "GET",
    });
    const json = JSON.parse(response);
    return json;
  }

  private async getAnimeList(url: string): Promise<SimpleAnime[]> {
    const anime_list: SimpleAnime[] = [];
    const res = (await this.getJSON(url)).data;
    for (const json of res) {
      const name = json.title;
      const image = json.thumbnail;
      const id = json.id;
      anime_list.push({ anime_name: name, anime_image_url: image, anime_link: id });
    }
    return anime_list;
  }
}

export default KissKhSource;
