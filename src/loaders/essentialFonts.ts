import type { Layouts } from "../types";
import { fontFaceImporter } from "../platforms";

const essentialFonts = [
  {
    name: "Kitab",
    url: "https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/others/fonts/Kitab.woff",
  },
  {
    name: "chapters-frames",
    url: "https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/others/fonts/chapters-frames.ttf",
  },
  {
    name: "basmalah",
    url: "https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/others/fonts/basmalah.ttf",
  },
  {
    name: "warsh-chapters-name",
    url: "https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/others/fonts/chapters-name-warsh.ttf",
    valid(layout) {
      return layout === "warsh";
    },
  },
  {
    name: "madinah-1405-chapters-name",
    url: "https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/others/fonts/chapters-name-madinah-1405.ttf",
    valid(layout) {
      return layout === "madinah-1405";
    },
  },
  {
    name: "chapters-name",
    url: "https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/others/fonts/chapters-name.ttf",
    valid(layout) {
      return !["madinah-1405", "warsh"].includes(layout);
    },
  },
] as {
  name: string;
  url: string;
  valid?: (layout: Layouts) => boolean;
}[];

export default async function loadEssentialFonts(
  layout: Layouts,
  assetsDirectory: string,
) {
  const fontFace = await fontFaceImporter(assetsDirectory);
  for await (const font of essentialFonts) {
    if (font.valid && !font.valid(layout)) continue;
    if (fontFace.isLoaded(font.name)) continue;

    await fontFace.loadFont(font.name, font.url);
  }
}
