import { createCanvas } from "@napi-rs/canvas";
import type { QuranImageCreatorOptions } from "./types";
import { getDefaultOptions, getWords, isColorDark } from "./utils";
import printSelections from "./loaders/printSelections";
import loadEssentialFonts from "./loaders/essentialFonts";

export default async function QuranImageCreator(
  creatorOptions: QuranImageCreatorOptions,
): Promise<Buffer> {
  let layout = creatorOptions.layout || "madinah-1439";

  if (layout === "madinah-1439-digital") {
    console.warn(`for now, ${layout} is broken, switching to 'madinah-1439'.`);
    layout = "madinah-1439";
  }

  const options = Object.assign(getDefaultOptions(layout), creatorOptions);

  if (options.customVerseFrameBox) {
    console.warn(
      "This is a very-experimental feature, words may not display correctly, for now its not recommended to use.",
    );
  }

  const words = getWords(layout, options.selection);
  const Height = options.height || 1080;
  const Width = 1920;

  const isDark = isColorDark(options.theme?.backgroundColor!);
  if (layout === "madinah-tajweed" && isDark) {
    console.warn(
      "sorry, for now, madinah-tajweed is only for light backgroundColor",
    );
    options.theme!.backgroundColor = "#ffffff";
  }
  const textColor =
    isDark && layout !== "madinah-tajweed" ? "#ffffff" : "#000000";
  const canvas = createCanvas(Width, Height);
  const ctx = canvas.getContext("2d");

  // load essential fonts
  loadEssentialFonts(layout);

  // default ctx options & print background.
  ctx.textBaseline = "middle";
  ctx.direction = "rtl";
  ctx.lang = "arabic";
  ctx.fillStyle = options.theme?.backgroundColor!;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const currentHeightPosition = await printSelections(
    ctx,
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
    return await QuranImageCreator({
      ...options,
      height: currentHeightPosition - 50,
    });
  }

  return await canvas.toBuffer("image/jpeg", 100);
}
