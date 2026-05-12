import { isNode } from "../constants";

export async function fontFaceImporter(assetsDirectory?: string) {
  const { fontFace } = isNode
    ? await import("./nodejs/fontFace.js")
    : await import("./web/fontFace.js");
  await fontFace.init(assetsDirectory);
  return fontFace;
}

export async function databaseImporter() {
  if (isNode) {
    const { NodeDatabase } = await import("./nodejs/database.js");
    return NodeDatabase;
  } else {
    const { WebDatabase } = await import("./web/database.js");
    return WebDatabase;
  }
}

export async function pathJoin(...paths: string[]): Promise<string> {
  const { pathJoin } = isNode
    ? await import("./nodejs/pathJoin.js")
    : await import("./web/pathJoin.js");
  return pathJoin(...paths);
}

export async function createCanvas(
  widthOrElement: number | HTMLCanvasElement,
  height: number,
) {
  if (isNode) {
    const { NodeCanvas } = await import("./nodejs/engine/canvas.js");
    if (typeof widthOrElement !== "number")
      throw new TypeError("width of Canvas must be a number.");
    return new NodeCanvas(widthOrElement as number, height);
  } else {
    const { WebCanvas } = await import("./web/engine/canvas.js");
    if (typeof widthOrElement !== "object")
      throw new TypeError(
        "Canvas Element must be an instance of HTMLCanvasElement.",
      );
    return new WebCanvas(widthOrElement as HTMLCanvasElement, height);
  }
}
