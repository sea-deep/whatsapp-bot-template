import { readdirSync, statSync } from "fs";
import { join, extname } from "path";

/**
 * Recursively resolves all files within a given directory inside 'dist/'.
 */
export async function resolveFiles(dir: string): Promise<string[]> {
  const directoryPath = join(process.cwd(), "dist", dir);
  const files: string[] = [];

  function readDirRecursively(currentPath: string) {
    let entries: string[] = [];
    try {
      entries = readdirSync(currentPath);
    } catch (err) {
      // If directory doesn't exist, just return empty array
      return;
    }

    for (const entry of entries) {
      const entryPath = join(currentPath, entry);
      const isDirectory = statSync(entryPath).isDirectory();

      if (isDirectory) {
        readDirRecursively(entryPath);
      } else if (extname(entryPath) === ".js") {
        files.push(entryPath);
      }
    }
  }

  readDirRecursively(directoryPath);
  return files;
}
