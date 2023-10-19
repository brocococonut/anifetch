<script lang="ts">
  import type { AnimeDetails } from "$types/AnimeDetails";
  import { toast } from "$utils/toast";

  export let anime: AnimeDetails;
  export let anime_link: string;
  export let provider: string;

  const addDownload = async (ep_id: string, dubbing: string) => {
    toast(`Adding episode ${Object.entries(anime.anime_episodes[dubbing]).find(([, id]) => id === ep_id)![0]} (${dubbing}) to the queue`, 4000, "info");
    const res = await fetch(`/api/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        episode_id: ep_id,
        episode_dub: dubbing,
        anime_link: anime_link,
        anime: anime,
        provider,
      }),
    });

    const data = await res.json();

    if (data.error) {
      toast(data.error, 4000, "error");
    } else {
      toast(data.message, 4000, "success");
    }
  };
</script>

<section class="">
  <div class="grid mx-auto lg:gap-8 xl:gap-4 lg:pt-16 lg:grid-cols-12">
    <div class="flex lg:col-span-5 items-baseline justify-center">
      <img src={anime.anime_cover} alt={anime.anime_name} class="object-contain rounded-lg sticky top-4 mb-4" />
    </div>
    <div class="mr-auto place-self-center lg:col-span-7">
      <h1 class="mb-4 font-extrabold tracking-tight leading-none text-[#fcfbfc] custom-title-size">
        {anime.anime_name}
      </h1>
      <div class="text-[#fafbfc] mb-6 lg:mb-8 custom-text-size">
        <p class="mb-6 font-light leading-tight">{anime.anime_desc}</p>
        <div class="grid grid-cols-{Object.keys(anime.anime_episodes).length} gap-1 divide-x custom-font-">
          {#each Object.keys(anime.anime_episodes) as key}
            <div class="text-center">
              <h3 class="text-2xl">{key}</h3>
              <ul>
                {#each Object.entries(anime.anime_episodes[key]) as [name, num]}
                  <li>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <button class="px-6 py-0.5 hover:bg-[#18a9ff] rounded-full transition-all" on:click={() => addDownload(num, key)}
                      ><pre>Ep. {name}</pre></button
                    >
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .custom-title-size {
    font-size: clamp(2rem, 1.7115rem + 1.2821vw, 3.25rem);
  }
  .custom-text-size {
    font-size: clamp(1rem, 0.8846rem + 0.5128vw, 1.5rem);
  }
</style>
