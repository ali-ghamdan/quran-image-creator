import type { QuranImageCreatorOptions } from "./types";
import printSelections from "./loaders/printSelections";
import loadEssentialFonts from "./loaders/essentialFonts";
import { createCanvas, pathJoin } from "./platforms";
import { isColorDark } from "./utils/isColorDark";
import { getDefaultOptions } from "./utils/getDefaultOptions";
import { getVersesWords } from "./utils/getVersesWords";
import { isNode } from "./constants";

export default async function QuranImageCreator(
  creatorOptions: QuranImageCreatorOptions,
  mime: "image/png" | "image/jpeg" | "image/webp" | "image/avif",
  res: "blob" | "buffer" | "base64",
  canvasEl?: HTMLCanvasElement,
): Promise<{ width: number; height: number; data: Blob | Buffer | string }> {
  let layout = creatorOptions.layout || "madinah-1439";

  if (layout === "madinah-1439-digital") {
    console.warn(`for now, ${layout} is broken, switching to 'madinah-1439'.`);
    layout = "madinah-1439";
  }

  const options = Object.assign(getDefaultOptions(layout), creatorOptions);
  const assetsDirectory = await pathJoin(options.assetsDirectory!);

  const words = await getVersesWords(
    layout,
    options.selection,
    assetsDirectory,
  );

  if (!isNode && !canvasEl) {
    canvasEl = document.createElement("canvas");
  }

  const CanvasHeight = options.height || 1080;
  const CanvasWidth = options.width || 1920;

  const isDark = isColorDark(options.theme?.backgroundColor!);
  if (layout === "madinah-tajweed" && isDark) {
    console.warn(
      "sorry, for now, madinah-tajweed is only for light backgroundColor",
    );
    options.theme!.backgroundColor = "#ffffff";
  }
  const textColor =
    isDark && layout !== "madinah-tajweed" ? "#ffffff" : "#000000";
  const canvas = await createCanvas(
    isNode ? CanvasWidth : canvasEl!,
    CanvasHeight,
  );

  // load essential fonts
  await loadEssentialFonts(layout, assetsDirectory);

  // default ctx options & print background.
  canvas.setFillStyle(options.theme?.backgroundColor!);
  canvas.fillRect(0, 0, canvas.width, canvas.height);

  const currentHeightPosition = await printSelections(
    canvas,
    options,
    words,
    textColor,
  );

  // for now, this is the best way i can find to correct the canvas height
  if (
    !options.height &&
    (canvas.height - currentHeightPosition > 150 ||
      currentHeightPosition >= canvas.height)
  ) {
    const finalCanvasHeight = currentHeightPosition - 50;
    let canvasElement: HTMLCanvasElement | undefined;

    if (canvasEl) {
      const body = document.querySelector("body");
      if (!body) throw new Error("body element must be exist.");

      canvasElement = body?.appendChild(canvasEl);

      canvasElement.style.display = "none";
      canvasElement.style.position = "absolute";
      canvasElement.width = CanvasWidth;
      canvasElement.height = finalCanvasHeight;
    }

    const data = await QuranImageCreator(
      {
        ...options,
        height: finalCanvasHeight,
        width: CanvasWidth,
      },
      mime,
      res,
      canvasElement,
    );

    if (canvasElement) canvasElement.remove();

    return data;
  }
  const img = await canvas.to(mime, res as any);

  return {
    width: CanvasHeight,
    height: CanvasHeight,
    data: img,
  };
}
