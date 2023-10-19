import type { AnimeDetails } from "$types/AnimeDetails";
import type { AnimeSource } from "$types/AnimeSource";
import type { AnimeStreamLink } from "$types/AnimeStreamLink";
import type { SimpleAnime } from "$types/SimpleAnime";
import { request } from "$utils/request";
import { JSDOM } from "jsdom";

export class YugenSource implements AnimeSource {
  private readonly mainUrl = "https://yugenanime.tv";

  public async animeDetails(contentLink: string): Promise<AnimeDetails> {
    const url = `${this.mainUrl}${contentLink}watch/?sort=episode`;
    const doc = await this.getDOM(url);
    const anime_content = doc.getElementsByClassName("p-10-t");
    const anime_cover = doc.getElementsByClassName("page-cover-inner").item(0)!.getElementsByTagName("img").item(0)!.getAttribute("src")!.trim();
    const anime_name = anime_content.item(0)!.textContent!.trim();
    const anime_desc = anime_content.item(1)!.textContent!.trim();

    const subs_ep_count = doc
      .getElementsByClassName("box p-10 p-15 m-15-b anime-metadetails")
      .item(0)!
      .querySelector("div:nth-child(6) span")!
      .textContent!.trim();
    const ep_map_sub = Array.from({ length: parseInt(subs_ep_count) }, (_, i) => [`${i + 1}`, `${i + 1}`]).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {}
    );
    const ep_map: Record<string, Record<string, string>> = { SUB: ep_map_sub };

    try {
      const dubs_ep_count = doc
        .getElementsByClassName("box p-10 p-15 m-15-b anime-metadetails")
        .item(0)!
        .querySelector("div:nth-child(7) span")!
        .textContent!.trim();
      const ep_map_dub = Array.from({ length: parseInt(dubs_ep_count) }, (_, i) => [`${i + 1}`, `${i + 1}`]).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value }),
        {}
      );
      ep_map.DUB = ep_map_dub;
    } catch (_) {}

    return { anime_name: anime_name, anime_desc: anime_desc, anime_cover: anime_cover, anime_episodes: ep_map };
  }

  public async searchAnime(searchedText: string): Promise<SimpleAnime[]> {
    const anime_list: SimpleAnime[] = [];
    const searchUrl = `${this.mainUrl}/discover/?q=${searchedText}`;

    const doc = await this.getDOM(searchUrl);
    const all_info = doc.getElementsByClassName("anime-meta");
    for (let i = 0; i < all_info.length; i++) {
      const item = all_info.item(i)!;
      const anime_image = item.getElementsByTagName("img").item(0)!.getAttribute("data-src")!.trim();
      const anime_name = item.getElementsByClassName("anime-name").item(0)!.textContent!.trim();
      const anime_link = item.getAttribute("href")!.trim();
      anime_list.push({ anime_name: anime_name, anime_image_url: anime_image, anime_link: anime_link });
    }

    return anime_list;
  }

  public async latestAnime(): Promise<SimpleAnime[]> {
    const anime_list: SimpleAnime[] = [];
    const doc = await this.getDOM(`${this.mainUrl}/latest/`);
    const all_info = doc.getElementsByClassName("ep-card");
    for (let i = 0; i < all_info.length; i++) {
      const item = all_info.item(i)!;
      const anime_image_url = item.getElementsByTagName("img").item(0)!.getAttribute("data-src")!.trim();
      const anime_name = item.getElementsByClassName("ep-origin-name").item(0)!.textContent!.trim();
      const anime_link = item.getElementsByClassName("ep-details").item(0)!.getAttribute("href")!.trim();
      anime_list.push({ anime_name, anime_image_url, anime_link });
    }
    return anime_list;
  }

  public async trendingAnime(): Promise<SimpleAnime[]> {
    const anime_list: SimpleAnime[] = [];
    const doc = await this.getDOM(`${this.mainUrl}/trending/`);
    const all_info = doc.getElementsByClassName("series-item");
    for (let i = 0; i < all_info.length; i++) {
      const item = all_info.item(i)!;
      const anime_image_url = item.getElementsByTagName("img").item(0)!.getAttribute("src")!.trim();
      const anime_name = item.getElementsByClassName("series-title").item(0)!.textContent!.trim();
      const anime_link = item.getAttribute("href")!.trim();
      anime_list.push({ anime_name, anime_image_url, anime_link });
    }
    return anime_list;
  }

  public async streamLink(animeUrl: string, animeEpCode: string, extras?: string[]): Promise<AnimeStreamLink> {
    // Get the link of episode
    const watch_link = animeUrl.replace("anime", "watch");

    const anime_ep_url = extras?.[0] === "DUB" ? `${this.mainUrl}${watch_link.slice(0, -1)}-dub/${animeEpCode}/` : `${this.mainUrl}${watch_link}${animeEpCode}/`;

    const res = await this.getDOM(anime_ep_url);

    let yugen_embed_link = res.getElementById("main-embed")!.getAttribute("src")!;
    if (!yugen_embed_link.includes("https:")) yugen_embed_link = `https:${yugen_embed_link}`;

    const headers: Record<string, string> = {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "en-US,en;q=0.5",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0",
      TE: "Trailers",
      Origin: this.mainUrl,
      "X-Requested-With": "XMLHttpRequest",
      Referer: yugen_embed_link,
    };

    const req_url = `${this.mainUrl}/api/embed/`;
    const id_arr = yugen_embed_link.split("/");
    const id = id_arr[id_arr.length - 2];
    const body = { id: id, ac: "0" };

    const link_details = (await this.postJSON(req_url, headers, body))!;
    const link = link_details.hls[0];
    return { link, server: "", success: true, is_hls: true, subs_link: "" };
  }

  private async getDOM(url: string): Promise<Document> {
    const response = await request({
      method: "GET",
      url,
      parameters: ['--compressed'],
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        Connection: "keep-alive",
        "Alt-Used": "yugenanime.tv",
        Cookie: 'csrftoken=Uh8OEUJtB8nKJzASPEQUgUqMJJUpglsw',
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        TE: "trailers",
      },
    });

    return new JSDOM(response).window.document;
  }

  private async postJSON(url: string, headers: Record<string, string>, data: Record<string, string>): Promise<any> {
    // Convert the body to FormData format manually without a FormData object
    const formData = Object.keys(data).reduce((acc, key) => {
      acc.append(key, data[key]);
      return acc;
    }, new FormData());

    // Convert the formData to a string
    const formDataString = Array.from(formData.entries())
      .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
      .join("&");

    const response = await request({
      url: url,
      method: "POST",
      parameters: ["--compressed", "-s"],
      data: formDataString,
      headers: {
        ...headers,
      },
    });

    return JSON.parse(response);
  }
}
