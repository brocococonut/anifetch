<script lang="ts">
  import type {SimpleAnime} from '$types/SimpleAnime'
  export let anime: SimpleAnime[];
  export let provider: string;
</script>

<ul role="list" class="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-8">
  {#each anime as anim}
  <li class="relative">
    <div class="group aspect-h-5 aspect-w-3 block w-full overflow-hidden rounded-lg bg-gray-100">
      <img src={anim.anime_image_url} alt={anim.anime_name} class="pointer-events-none object-cover group-hover:opacity-75">
      <a class="absolute inset-0 focus:outline-none" href="/details?anime={encodeURIComponent(anim.anime_link)}&provider={provider}">
        <span class="sr-only">View details for {anim.anime_name}</span>
      </a>
    </div>
    <p class="pointer-events-none mt-1 block text-sm font-medium text-[#fafbfc]">{anim.anime_name}</p>
  </li>
  {/each}
  <!-- More files... -->
</ul>