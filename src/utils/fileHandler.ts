import { readdir, stat, readFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { createHash } from "crypto";
import { env } from "process";

const sha1 = (str: string) => createHash("sha1").update(str).digest("hex");

interface File {
  name: string;
  size: string;
  lastline?: string;
  "100"?: boolean;
  ended?: boolean;
}

export class FileHandler {
  static log: boolean = env.LOG === "true";
  static log_folder: string = env.LOG_DIR || "/logs";
  static output_folder: string = env.OUT_FOLDER || "/downloads";

  constructor() {}

  async listFiles() {
    const files: File[] = [];
    const folder = this.getDownloadsFolder();

    if (!existsSync(folder)) {
      return files;
    }

    const entries = await readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && !this.isPartialFile(entry.name)) {
        const filePath = path.join(folder, entry.name);
        const stats = await stat(filePath);
        files.push({
          name: entry.name,
          size: this.toHumanFilesize(stats.size),
        });
      }
    }

    return files;
  }

  async listParts() {
    const files: File[] = [];
    const folder = this.getDownloadsFolder();

    if (!existsSync(folder)) {
      return files;
    }

    const entries = await readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && this.isPartialFile(entry.name)) {
        const filePath = path.join(folder, entry.name);
        const stats = await stat(filePath);
        files.push({
          name: entry.name,
          size: this.toHumanFilesize(stats.size),
        });
      }
    }

    return files;
  }

  isLogEnabled() {
    return FileHandler.log;
  }

  async countLogs() {
    if (!FileHandler.log) {
      return 0;
    }

    const folder = this.getLogsFolder();

    if (!existsSync(folder)) {
      return 0;
    }

    const entries = await readdir(folder, { withFileTypes: true });
    const logFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".txt"));
    return logFiles.length;
  }

  async listLogs() {
    const files: File[] = [];

    if (!FileHandler.log) {
      return files;
    }

    const folder = this.getLogsFolder();

    if (!existsSync(folder)) {
      return files;
    }

    const entries = await readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".txt")) {
        const filePath = path.join(folder, entry.name);
        const stats = await stat(filePath);
        const lines = (await readFile(filePath, "utf8")).split("\r");
        const lastLine = lines[lines.length - 1];
        files.push({
          name: entry.name,
          size: this.toHumanFilesize(stats.size),
          lastline: lastLine || "",
          "100": lastLine.includes(" 100% of "),
          ended: lastLine.endsWith("\n"),
        });
      }
    }

    return files;
  }

  async delete(id: string) {
    const folder = this.getDownloadsFolder();
    const entries = await readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && sha1(entry.name) === id) {
        const filePath = path.join(folder, entry.name);
        await unlink(filePath);
      }
    }
  }

  async deleteLog(id: string) {
    const folder = this.getLogsFolder();
    const entries = await readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && sha1(entry.name) === id) {
        const filePath = path.join(folder, entry.name);
        await unlink(filePath);
      }
    }
  }

  getDownloadsFolder() {
    let folder = FileHandler.output_folder;

    if (!folder.startsWith("/")) {
      folder = path.join(process.cwd(), folder);
    }

    return folder;
  }

  getLogsFolder(): any {
    let folder = FileHandler.log_folder;

    if (!folder.startsWith("/")) {
      folder = path.join(process.cwd(), folder);
    }

    return folder;
  }

  getRelativeDownloadsFolder() {
    const folder = FileHandler.output_folder;
    return folder.startsWith("/") ? false : folder;
  }

  getRelativeLogFolder() {
    const folder = FileHandler.log_folder;
    return folder.startsWith("/") ? false : folder;
  }

  isPartialFile(filename: string) {
    return /\.part(?:-Frag\d+)?|\.ytdl$/.test(filename);
  }

  toHumanFilesize(bytes: number, decimals = 1) {
    if (bytes === 0) {
      return "0 B";
    }

    const sz = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const factor = Math.floor(Math.log2(bytes) / 10);
    return `${(bytes / 2 ** (factor * 10)).toFixed(decimals)} ${sz[factor]}`;
  }

  async freeSpace() {
    const folder = this.getDownloadsFolder();
    const stats = await stat(folder);
    return this.toHumanFilesize(stats.size);
  }
}
