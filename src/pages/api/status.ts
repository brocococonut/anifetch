import type { APIRoute } from "astro";
import { readLogsFromDirectory } from "$utils/status";
import { downloadQueue } from "$utils/download_queue";

const defaultHeaders = new Headers([
  ["Content-Type", "application/json"],
  ["Access-Control-Allow-Origin", "*"],
  ["Cache-Control", "no-store, max-age=0"],
]);

const KiB = 1024;
const MiB = 1024 * KiB;
const GiB = 1024 * MiB;

// A function that converts a number of bibytes to a human readable string
// e.g. 1073741824 -> 1 GiB
// e.g. 1048576 -> 1 MiB
// e.g. 1024 -> 1 KiB
// e.g. 100 -> 100 B
function readableSpeed(bps: number): string {
  if (bps < KiB) {
    return `${bps}B/s`;
  } else if (bps < MiB) {
    return `${(bps / KiB).toFixed(1)}KiB/s`;
  } else if (bps < GiB) {
    return `${(bps / MiB).toFixed(1)}MiB/s`;
  } else {
    return `${(bps / GiB).toFixed(1)}GiB/s`;
  }
}

export const fetchLogInfo = async () => {
  const logs = await readLogsFromDirectory();

  const cumulative_speed = logs
    .filter((log) => log.currentPercentage !== 100)
    .reduce((acc, log) => {
      return acc + log.currentSpeed;
    }, 0);

  const cumulative_speed_str = readableSpeed(cumulative_speed);

  const queue = downloadQueue.queue.queue.map((item) => item.file_name);
  const complete = downloadQueue.complete;

  return { logs, cumulative_speed, cumulative_speed_str, queue, complete };
};

export const GET: APIRoute = async ({ request, locals }) => {
  const info = await fetchLogInfo();

  return new Response(JSON.stringify(info), {
    headers: defaultHeaders,
  });
};
