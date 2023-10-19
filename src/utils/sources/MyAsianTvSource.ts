import type { AnimeDetails, EpisodeMap } from "$types/AnimeDetails";
import type { AnimeSource } from "$types/AnimeSource";
import type { AnimeStreamLink } from "$types/AnimeStreamLink";
import type { SimpleAnime } from "$types/SimpleAnime";
import { request } from "$utils/request";
import { JSDOM } from "jsdom";

export class MyAsianTvSource implements AnimeSource {
  private readonly mainUrl = "https://myasiantv.cx";

  public async animeDetails(contentLink: string): Promise<AnimeDetails> {
    const url = `${this.mainUrl}${contentLink}`;
    const doc = await this.get(url);
    const animeCover = doc.querySelector(".poster img")?.getAttribute("src") ?? "";
    const animeName = doc.querySelector(".movie h1")?.textContent ?? "";
    const animDesc = doc.querySelector(".info")?.textContent ?? "";

    const lastEpUrl = doc.querySelector(".list-episode a")?.getAttribute("href") ?? "";
    const lastEp = parseInt(lastEpUrl.substring(lastEpUrl.lastIndexOf("episode-") + 8));
    const epPrefix = lastEpUrl.substring(0, lastEpUrl.lastIndexOf("episode-") + 8);
    const subMap: { [key: string]: string } = {};

    for (let ep = 1; ep <= lastEp; ep++) {
      subMap[ep.toString()] = epPrefix + ep;
    }

    const epMap: EpisodeMap = { DEFAULT: subMap };

    return { anime_name: animeName, anime_desc: animDesc, anime_cover: animeCover, anime_episodes: epMap };
  }

  public async searchAnime(searchedText: string): Promise<SimpleAnime[]> {
    const searchUrl = `${this.mainUrl}/search.html?key=${searchedText}`;
    const allInfo = (await this.get(searchUrl)).querySelectorAll(".items > li");
    return this.getItems(allInfo);
  }

  public async latestAnime(): Promise<SimpleAnime[]> {
    return this.getItems((await this.get(`${this.mainUrl}/show/goblin`)).querySelectorAll("#sidebarlist-2 div > a"));
  }

  public async trendingAnime(): Promise<SimpleAnime[]> {
    return this.getItems((await this.get(`${this.mainUrl}/anclytic.html?id=3`)).querySelectorAll("div"));
  }

  public async streamLink(animeUrl: string, animeEpCode: string, extras?: string[]): Promise<AnimeStreamLink> {
    // Get the link of episode
    const anime_ep_url = `${this.mainUrl}${animeEpCode}`;
    const doc = await this.get(anime_ep_url);
    const embed_link = "https:" + (doc.querySelector("[data-video]")?.getAttribute("data-video") ?? "");
    const link = this.getAsianStreamLink(embed_link);
    return { link, server: "", is_playable: true, is_hls: false, subs_link: "" };
  }

  private async get(url: string): Promise<Document> {
    const response = await request({ url, method: "GET" });
    return new JSDOM(response).window.document;
  }

  private getItems(allInfo: NodeListOf<Element>): SimpleAnime[] {
    const animeList: SimpleAnime[] = [];
    for (const item of allInfo) {
      const itemImage = item.querySelector("img")?.getAttribute("src") ?? "";
      const itemName = item.querySelector("img")?.getAttribute("alt") ?? "";
      const itemLink = item.querySelector("a")?.getAttribute("href") ?? "";
      animeList.push({ anime_name: itemName, anime_image_url: itemImage, anime_link: itemLink });
    }
    return animeList;
  }

  private getAsianStreamLink(embedLink: string): string {
    // Implement the logic for getting the stream link from the embed link
    return "";
  }
}
