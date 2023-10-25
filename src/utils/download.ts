import { constants, rename } from "fs/promises";
import { existsSync, mkdirSync, accessSync, openSync, closeSync } from "fs";
import { FileHandler } from "$utils/fileHandler";
import { join } from "path";
import { wrappedExec } from "./exec";
import { env } from "process";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class Download {
  static bin = env.BIN_PATH || "/usr/bin/yt-dlp";
  static outfilename = env.OUT_FILENAME || "%(title)s-%(id)s.%(ext)s";
  static log_path = env.LOG_DIR || "/logs";
  static download_path = env.OUT_FOLDER || "/downloads";
  static log = env.LOG === "true";
  url: string;
  errors: string[] = [];
  vformat: boolean = false;
  audio_only: boolean = false;
  download_path: string;
  full_download_path: string;
  log_path: string = Download.log_path;
  file_name: string = Download.outfilename;
  complete = false;

  constructor(opts: { url: string; filename: string; audio_only?: boolean; subfolder?: string }) {
    const { url, filename: file_name, audio_only = false, subfolder = undefined } = opts;

    const fh = new FileHandler();
    this.download_path = join(fh.getDownloadsFolder(), ".tmp");
    this.full_download_path = subfolder ? join(fh.getDownloadsFolder(), subfolder) : fh.getDownloadsFolder();

    if (Download.log) {
      this.log_path = fh.getLogsFolder();
    }

    this.checkOutputFolder();
    if (!Download.isValidUrl(url)) {
      this.errors.push(`"${url}" is not a valid url !`);
    }

    this.url = url;
    this.file_name = file_name;
    this.audio_only = audio_only;

    if (this.errors.length > 0) {
      console.error(this.errors);
      return;
    }
  }

  static isValidUrl(url: string) {
    return url.match(/^https?:\/\/[^\s/$.?#].[^\s]*$/i);
  }

  checkOutputFolder() {
    if (!existsSync(this.download_path)) {
      // Folder doesn't exist
      try {
        mkdirSync(this.download_path, { recursive: true, mode: 0o775 });
        closeSync(openSync(join(this.download_path, ".ignore"), "w"));
      } catch (err) {
        this.errors.push(`Output folder doesn't exist and creation failed! (${this.download_path})`);
      }
    } else {
      // Exists but can I write ?
      try {
        accessSync(this.download_path, constants.W_OK);
      } catch (err) {
        this.errors.push(`Output folder isn't writable! (${this.download_path})`);
      }
    }

    if (!existsSync(this.full_download_path)) {
      // Folder doesn't exist
      try {
        mkdirSync(this.full_download_path, { recursive: true, mode: 0o777 });
      } catch (err) {
        this.errors.push(`Output folder doesn't exist and creation failed! (${this.full_download_path})`);
      }
    } else {
      // Exists but can I write ?
      try {
        accessSync(this.full_download_path, constants.W_OK);
      } catch (err) {
        this.errors.push(`Output folder isn't writable! (${this.full_download_path})`);
      }
    }

    // LOG folder
    if (Download.log) {
      if (!existsSync(this.log_path)) {
        // Folder doesn't exist
        try {
          mkdirSync(this.log_path, { recursive: true, mode: 0o775 });
        } catch (err) {
          this.errors.push(`Log folder doesn't exist and creation failed! (${this.log_path})`);
        }
      } else {
        // Exists but can I write ?
        try {
          accessSync(this.log_path, constants.W_OK);
        } catch (err) {
          this.errors.push(`Log folder isn't writable! (${this.log_path})`);
        }
      }
    }
  }

  async doDownload() {
    let cmd = Download.bin;
    cmd += " --ignore-error -o";
    cmd += ` '${this.download_path}/${this.file_name}'`;

    if (this.vformat) {
      cmd += ` --format '${this.vformat}'`;
    }
    if (this.audio_only) {
      cmd += " -x ";
    }
    cmd += " --restrict-filenames"; // --restrict-filenames is for specials chars
    cmd += ` '${this.url}'`;
    if (Download.log) {
      cmd = ` { echo Command: '${cmd}'; ${cmd} ; }`;
      cmd += ` > '${this.log_path}/${this.file_name}.log.txt'`;
    } else {
      cmd += " > /dev/null";
    }

    cmd += " & echo $!";

    try {
      await wrappedExec(cmd);
      await rename(`${this.download_path}/${this.file_name}`, `${this.full_download_path}/${this.file_name}`);
      if (Download.log) {
        sleep(2000).then(() => wrappedExec(`rm -f '${this.log_path}/${this.file_name}.log.txt'`));
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.complete = true;
      // Delete the log file
      if (Download.log) {
        await sleep(2000);
        await wrappedExec(`rm -f '${this.log_path}/${this.file_name}.log.txt'`);
      }
    }
  }

  async doInfo() {
    let cmd = `${Download.bin} -J `;

    // this.urls.forEach((url) => {
    cmd += ` '${this.url}'`;
    // });

    cmd += " | python -m json.tool";

    const { stdout } = await wrappedExec(cmd);
    if (!stdout) {
      this.errors.push("No video found");
    }
    return JSON.parse(stdout);
  }
}
