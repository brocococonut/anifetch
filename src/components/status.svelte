<script lang="ts">
  import type { LogData } from "$utils/status";
  import { onMount } from "svelte";

  export let info: {
    logs: LogData[];
    cumulative_speed: number;
    cumulative_speed_str: string;
    queue: string[];
    complete: string[];
  } = {
    logs: [],
    cumulative_speed: 0,
    cumulative_speed_str: "0.00 MB/s",
    queue: [],
    complete: [],
  };

  $: logs = ignore_completed ? info.logs.filter((log) => log.currentPercentage !== 100) : info.logs;
  $: total_progress = Math.round((logs.reduce((acc, log) => acc + log.currentPercentage, 0) / logs.length || 0) * 100) / 100;
  $: queue = info.queue;
  // Get the complete list sorted alphabetically
  $: complete = info.complete.sort((a, b) => a.localeCompare(b));

  let get_logs = true;
  let ignore_completed = false;

  const loadLogs = () => {
    if (get_logs === false) return;
    get_logs = false;
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        get_logs = true;
        info = data;
      });
  };

  onMount(() => {
    setInterval(() => {
      loadLogs();
    }, 250);
  });
</script>

<!-- <input type="checkbox" bind:checked={ignore_completed}> -->

<div class="flex items-center absolute top-2 left-2 max-w-1/2 whitespace-pre">
  <input id="link-checkbox" type="checkbox" bind:checked={ignore_completed} class="w-4 h-4 text-[#18a9ff] bg-gray-100 border-none rounded" />
  <label for="link-checkbox" class="ml-2 text-lg font-medium text-gray-200">Hide completed</label>
</div>
<table class="w-full text-[#fafafa] border-separate border-spacing-y-2 top-1">
  <thead>
    <tr>
      <th scope="col" class="header max-w-[100px] lg:max-w-fit truncate">Filename</th>
      <th scope="col" class="header max-w-[80px] truncate">Speed</th>
      <th scope="col" class="header">Est. Size</th>
      <th scope="col" class="header">Progress</th>
    </tr>
  </thead>
  <tbody>
    {#each logs as log}
      <tr class="rounded-lg">
        <td class="row-entry max-w-[100px] lg:max-w-fit truncate">{log.filename}</td>
        <td class="row-entry max-w-[80px] truncate">{log.currentPercentage === 100 ? "0KiB/s" : log.currentSpeedText}</td>
        <td class="row-entry">{log.estimatedFileSize}</td>
        <td class="row-entry w-1/3 sm:w-1/3 lg:w-1/2">
          <div class="w-full bg-gray-900 rounded-full">
            <div class="progress" style="width: {log.currentPercentage}%">
              {log.currentPercentage}%
            </div>
          </div>
        </td>
      </tr>
    {/each}
    <!-- More people... -->
  </tbody>
  <tfoot>
    <tr>
      <th scope="row" colspan="2" />
      <th scope="row" class="footer-title">Total Speed</th>
      <td class="pl-3 pr-4 py-2 text-right">{info.cumulative_speed_str}</td>
    </tr>
    <tr>
      <th scope="row" colspan="2" />
      <th scope="row" class="footer-title">Total Progress</th>
      <td class="pl-3 pr-4 py-2 text-right">
        <div class="w-full bg-gray-900 rounded-full">
          <div class="progress" style="width: {total_progress}%">
            {total_progress}%
          </div>
        </div>
      </td>
    </tr>
  </tfoot>
</table>

<div class="grid grid-cols-2 gap-4">
  <div class="">
    <h2 class="text-4xl font-extrabold dark:text-white">Complete</h2>
    <table class="w-full text-[#fafafa] border-separate border-spacing-y-2 top-1">
      <tbody>
        {#each complete as entry}
          <tr class="rounded-lg">
            <td class="row-entry truncate">{entry}</td>
          </tr>
        {/each}
        <!-- More people... -->
      </tbody>
    </table>
  </div>
  <div class="">
    <h2 class="text-4xl font-extrabold dark:text-white">Queue</h2>
    <table class="w-full text-[#fafafa] border-separate border-spacing-y-2 top-1">
      <tbody>
        {#each queue as entry}
          <tr class="rounded-lg">
            <td class="row-entry truncate">{entry}</td>
          </tr>
        {/each}
        <!-- More people... -->
      </tbody>
    </table>
  </div>
</div>

<style lang="postcss">
  .header {
    @apply px-3 py-3.5 text-left font-semibold;
  }

  .row-entry {
    @apply whitespace-nowrap px-3 py-4 font-medium;
  }

  .footer-title {
    @apply pl-4 pr-3 py-2 text-right font-normal;
  }

  .progress {
    @apply bg-[#18a9ff] text-sm font-bold text-white text-center p-0.5 py-2 leading-none rounded-full transition-all;
  }

  tbody td,
  tfoot td:nth-of-type(1),
  tfoot th:nth-child(2) {
    background-color: #2c373f;
  }
  tbody tr td:first-child,
  tfoot th:nth-child(2) {
    border-top-left-radius: 9999px;
    border-bottom-left-radius: 9999px;
    padding-left: 1rem;
  }
  tbody tr td:last-child,
  tfoot td:nth-of-type(1) {
    border-top-right-radius: 9999px;
    border-bottom-right-radius: 9999px;
    padding-right: 1rem;
  }
</style>
