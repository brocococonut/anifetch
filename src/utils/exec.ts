import { exec } from "child_process";

export async function isBinaryInPath(binary_name: string): Promise<boolean> {
  const { stdout } = await wrappedExec(`which ${binary_name}`);
  const paths = stdout.trim().split("\n");
  for (const path of paths) {
    if (path.endsWith(binary_name)) {
      return true;
    }
  }
  return false;
}

export const wrappedExec = (command: string): Promise<{ stdout: string; stderr: string }> =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });