import path from 'path';
import fs from 'fs';
import { FileHandler } from './fileHandler';

export interface LogData {
  url: string;
  filename: string;
  estimatedFileSize: string;
  currentPercentage: number;
  currentSpeedText: string;
  currentSpeed: number;
}

export async function readLogsFromDirectory(): Promise<LogData[]> {
  const fh = new FileHandler();

  const logs_dir = fh.getLogsFolder();
  
  const log_files = await fs.promises.readdir(logs_dir);
  const logs: LogData[] = [];
  const batch_size = 20;
  for (let i = 0; i < log_files.length; i += batch_size) {
    const batch = log_files.slice(i, i + batch_size);
    const promises = batch.map(async logFile => {
      const log_path = path.join(logs_dir, logFile);
      const log = fs.readFileSync(log_path, 'utf-8');
      const log_data = parseYtdlLog(log);
      if (log_data) {
        return log_data;
      }
      return null;
    });
    const batchLogs = await Promise.all(promises);
    logs.push(...batchLogs.filter(logData => logData !== null) as LogData[]);
  }
  return logs;
}


export function parseYtdlLog(log: string): LogData | null {
  const lines = log.trim().split(/[\r\n]+/);
  if (lines.length < 20) {
    return null;
  }
  const downloadLine = lines.find(line => line.startsWith('[download]'));
  if (!downloadLine) {
    return null;
  }

  const url = lines![1].match(/Extracting URL: (.+)/)![1];
  const filename = downloadLine!.match(/Destination: (.+)/)![1];
  const progressLines = lines.filter(line => line.startsWith('[download]'));
  const lastProgressLine = progressLines[progressLines.length - 1];
  const estimatedFileSize = lastProgressLine!.match(/of ~?\s+([\d.]+[KMGT]?)iB/)![1];
  const currentPercentage = lastProgressLine!.match(/(\d+(?:\.\d+)?)%/)![1];
  const currentSpeed = (lastProgressLine!.match(/([\d.]+[KMGT]?iB\/s)/) || [,'0KiB/s'])![1];

  const fh = new FileHandler();

  const download_dir = fh.getDownloadsFolder()
  // const download_dir = download_dir_src.split('/').slice(0, -1).join('/');
  
  // Convert the speed  which is in any of the following formats: 1.2MiB/s, 1.2GiB/s, 1.2KiB/s, 1.2B/s to a number of bytes per second
  const speed_parts = currentSpeed.match(/([\d.]+)([KMGT]?iB)\/s/);
  const speed_num = parseFloat(speed_parts![1]);
  const speed_unit = speed_parts![2];
  let speed_mult = 1;
  switch (speed_unit) {
    case 'KiB':
      speed_mult = 1024;
      break;
    case 'MiB':
      speed_mult = 1024 * 1024;
      break;
    case 'GiB':
      speed_mult = 1024 * 1024 * 1024;
      break;
    case 'TiB':
      speed_mult = 1024 * 1024 * 1024 * 1024;
      break;
  }
  const speed = speed_num * speed_mult;

  return {
    url,
    filename: filename.replace(download_dir, '').split('/').pop()!,
    estimatedFileSize,
    currentPercentage: parseInt(currentPercentage),
    currentSpeedText: currentSpeed,
    currentSpeed: speed
  };
}