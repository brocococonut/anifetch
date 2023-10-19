import { Queue } from "$utils/queue";
import type { Download } from "./download";
import { isBinaryInPath, wrappedExec } from "./exec";
import { FileHandler } from "./fileHandler";
import { readdir, unlink } from "fs/promises";
import { env } from "process";

interface BJ {
  user: string;
  pid: string;
  time: string;
  cmd: string;
}

class DownloadQueue {
  static bin = env.BIN_PATH || "/usr/bin/yt-dlp";
  static concurrent_dl = parseInt(env.CONCURRENT_DL || '2');
  static extractor = env.EXTRACTOR || "/usr/bin/ffmpeg";

  queue = new Queue<Download>();
  current: Download[] = [];
  complete: string[] = [];

  constructor() {
    if (!this.checkRequirements()) {
      throw new Error("Requirements not met");
    }

    setInterval(async () => {
      this.filterComplete();

      if (DownloadQueue.concurrent_dl === 0) {
        while (this.queue.length > 0) {
          const next = this.queue.next()!;
          next.doDownload();
          this.current.push(next);
        }
      } else {
        while (this.current.length < DownloadQueue.concurrent_dl && this.queue.length > 0) {
          const next = this.queue.next()!;
          next.doDownload();
          this.current.push(next);
        }
      }
    }, 2000);
  }

  addDownload(dl: Download) {
    if (this.queue.queue.find((d) => d.file_name === dl.file_name) || this.complete.find((el) => el === dl.file_name)) {
      return false;
    }
    this.queue.add(dl);
    return true;
  }

  private filterComplete() {
    // Filter out complete jobs
    this.current.filter((dl) => dl.complete).forEach((dl) => this.complete.push(dl.file_name));
    this.current = this.current.filter((dl) => !dl.complete);
  }

  static async backgroundJobs() {
    const bin = DownloadQueue.bin;
    const { stdout } = await wrappedExec(`ps aux | grep -v grep | grep -v "${bin} -U" | grep "${bin} " | wc -l`);
    return parseInt(stdout);
  }

  static maxBackgroundJobs() {
    return DownloadQueue.concurrent_dl;
  }

  static async getCurrentBackgroundJobs() {
    const { stdout, stderr } = await wrappedExec(
      `ps -A -o user,pid,etime,cmd | grep -v grep | grep -v "${DownloadQueue.bin} -U" | grep "${DownloadQueue.bin} "`
    );
    const output = stdout.split("\n");

    const bjs: BJ[] = [];

    if (output.length > 0) {
      output.forEach((line) => {
        const [user, pid, time, cmd] = line.replace(/ +/g, " ").split(" ", 4);
        bjs.push({
          user,
          pid,
          time,
          cmd,
        });
      });

      return bjs;
    } else {
      return null;
    }
  }

  static async killAll() {
    const bin = DownloadQueue.bin;
    const { stdout } = await wrappedExec(`ps -A -o pid,cmd | grep -v grep | grep -v "${bin} -U" | grep "${bin} " | awk '{print $1}'`);
    const output = stdout.split("\n");

    if (output.length <= 0) {
      return;
    }

    output.forEach((p) => {
      wrappedExec(`kill ${p}`);
    });

    const fh = new FileHandler();
    const folder = fh.getDownloadsFolder();

    const files = await readdir(folder);
    files.forEach(async (file) => {
      if (file.endsWith(".part")) {
        await unlink(`${folder}/${file}`);
      }
    });
  }

  static async isYtdlInstalled() {
    console.log(`Finding binary "${DownloadQueue.bin}"`);
    return isBinaryInPath(DownloadQueue.bin);
  }

  static async getYtdlVersion() {
    const { stdout } = await wrappedExec(`${DownloadQueue.bin} --version`);
    return stdout.trim();
  }

  static async isExtractorInstalled() {
    console.log(`Finding extractor "${DownloadQueue.extractor}"`);
    return isBinaryInPath(DownloadQueue.extractor);
  }

  static async isPythonInstalled() {
    console.log("Finding python");
    return isBinaryInPath("python");
  }

  async checkRequirements() {
    if (!(await DownloadQueue.isYtdlInstalled())) {
      throw new Error(`Binary not found in ${DownloadQueue.bin}, see yt-dlp site !`);
    }

    if (!(await DownloadQueue.isExtractorInstalled())) {
      throw new Error("Install an audio extractor (ex: ffmpeg) !");
    }

    return true;
  }
}

export const downloadQueue = new DownloadQueue();
