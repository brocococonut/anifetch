<script lang="ts">
  import type { SimpleAnime } from "$types/SimpleAnime";

  export let latest: SimpleAnime[] = [];

  // Get a random entry from the latest array
  const random = latest[Math.floor(Math.random() * latest.length)];
</script>

<select name="provider" class="block py-1.5 w-32 text-center text-white bg-transparent border-0 border-b-2 border-gray-200 appearance-none peer absolute top-2 left-2">
  <option selected value="yugen">Yugen</option>
  <option value="kiss_kh">KissKH</option>
</select>

<div class="flex items-center rounded-full bg-[#2c373f] shadow-lg max-w-[30rem] mx-auto">
  <input type="text" class="w-full bg-transparent outline-none text-white px-4 rounded-l-full" placeholder={random?.anime_name ?? 'Search'} name="q" autocapitalize="off" autocomplete="off"/>
  <button
    type="submit"
    class="text-white bg-[#18a9ff] hover:bg-[#0f7ec0] focus:outline-none focus:ring-4 focus:ring-white font-medium rounded-r-full text-sm px-5 py-2.5 text-center"
    >Search</button
  >
</div>

