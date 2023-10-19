import type { AnimeDetails } from "$types/AnimeDetails";
import type { AnimeStreamLink } from "$types/AnimeStreamLink";
import { AnimeRepositoryImpl } from "$utils/AnimeRepository";
import { Download } from "$utils/download";
import { downloadQueue } from "$utils/download_queue";
import type { APIRoute } from "astro";

const defaultHeaders = new Headers([
  ["Content-Type", "application/json"],
  ["Access-Control-Allow-Origin", "*"],
  ["Cache-Control", "no-store, max-age=0"],
]);

export const POST: APIRoute = async ({ request, locals }) => {
  const { episode_id, episode_dub, anime_link, anime, provider } = (<{
    episode_id: string;
    episode_dub: string;
    anime_link: string;
    anime: AnimeDetails;
    provider: string;
  }>await request.json());

  if (!episode_id || !episode_dub || !anime || !anime_link || !provider) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400,
    });
  }

  const AnimeRepository = new AnimeRepositoryImpl();
  AnimeRepository.setProvider(provider);

  let stream_link: AnimeStreamLink;
  try {
    stream_link = await AnimeRepository.getStreamLink(anime_link, episode_id, [episode_dub]);
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
    });
  }

  if (!stream_link.success) {
    return new Response(JSON.stringify({ error: "No stream link found" }), {
      status: 404,
    });
  }
  
  // Sanitise the anime name to be filename safe
  const sanitised_name = anime.anime_name.replaceAll("/", "-").replaceAll("\\", "-").trim();
  const episode_name = Object.entries(anime.anime_episodes[episode_dub]).find(([, id]) => id === episode_id)![0]
  // const downloader = new Downloader([stream_link.link], sanitised_name);
  const dl = new Download({
    url: stream_link.link,
    filename: '',
    subfolder: sanitised_name,
  })
  const info = await dl.doInfo()
  dl.file_name = `${sanitised_name} - e${episode_name.padStart(2, "0")}-${episode_dub === 'DUB' ? 'en' : 'jp'}.${info.ext}`

  const added = downloadQueue.addDownload(dl)
  if (!added) {
    return new Response(JSON.stringify({ error: `Already downloading "${dl.file_name}"` }), {
      status: 400,
    });
  }
  // downloader.download(false, file_name);

  return new Response(JSON.stringify({message: `Added "${dl.file_name}" to the queue`}), {
    headers: defaultHeaders,
  });
};
