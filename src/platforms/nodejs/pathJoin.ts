import fs from "node:fs";
import path from "node:path";

export async function pathJoin(...paths: string[]) {
  const joinedPath = path.join(...paths);
  const dir = path.dirname(joinedPath);

  if (!fs.existsSync(dir)) {
    try {
      await fs.promises.mkdir(dir, { recursive: true });
    } catch (error) {
      throw new Error(
        `Can't access/create '${dir}', please specify accessible directory using \`assetsDirectory\` option.`,
      );
    }
  }

  return joinedPath;
}
