import { exec } from 'child_process';

interface RequestOptions {
  method: string;
  url: string;
  headers?: Record<string, string>;
  data?: string;
  parameters?: string[]
}

export function request(options: RequestOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const { method = "GET", url, headers, data, parameters = [] } = options;
    const headers_params = headers ? Object.entries(headers).map(([key, value]) => `-H '${key}: ${value}'`) : [];

    const curlCommand = `curl -s ${(options.parameters || []).join(' ')} ${method === 'GET' ? '' : `-X ${method}`} '${url}' ${headers_params.join(' ')}${data ? ` --data-raw '${data}'` : ''}`;
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}