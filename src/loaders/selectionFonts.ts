import type {
  Layouts,
  QuranImageCreatorOptions,
  WordSelectionType,
} from "../types";
import { BaseFontFace } from "../platforms/interfaces";
import { fontFaceImporter } from "../platforms";

function getFontSource(layout: Layouts, pageId: number) {
  const remoteUrl: Record<Layouts, string> = {
    "madinah-1405": `https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v1-optimized/woff2/p${pageId}.woff2`,
    "madinah-1422": `https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v2/woff2/p${pageId}.woff2`,
    "madinah-tajweed": `https://static-cdn.tarteel.ai/qul/fonts/quran_fonts/v4-tajweed/woff2/p${pageId}.woff2`,
    doori:
      "https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/fonts/layouts/doori.ttf",
    "madinah-1439":
      "https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/fonts/layouts/madinah-1439.ttf",
    "madinah-1439-digital":
      "https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/fonts/layouts/madinah-1439-digital.otf",
    qalon:
      "https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/fonts/layouts/qalon.ttf",
    shobah:
      "https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/fonts/layouts/shobah.ttf",
    sosi: "https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/fonts/layouts/sosi.ttf",
    warsh:
      "https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/fonts/layouts/warsh.ttf",
  };

  return remoteUrl[layout];
}

export default async function loadSectionFonts(
  layout: Layouts,
  options: QuranImageCreatorOptions,
  selection: WordSelectionType,
) {
  const fontFace: BaseFontFace = await fontFaceImporter(
    options.assetsDirectory,
  );

  for (const { pageId } of selection.words) {
    const fontSource = getFontSource(layout, pageId);
    const fontKey = `${layout}-p${pageId}`;

    let buffer: Buffer<ArrayBufferLike> | string =
      (typeof options.loadVersesFont === "function"
        ? await options.loadVersesFont(pageId, layout)
        : undefined) || fontSource;

    await fontFace.loadFont(fontKey, buffer, layout);
  }
}
