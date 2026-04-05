import fs from "node:fs/promises";
import path from "node:path";
import { GlobalFonts } from "@napi-rs/canvas";
import type {
  Layouts,
  QuranImageCreatorOptions,
  WordSelectionType,
} from "../types";

export default async function loadSectionFonts(
  layout: Layouts,
  options: QuranImageCreatorOptions,
  selection: WordSelectionType,
) {
  for (const { pageId } of selection.words) {
    if (!GlobalFonts.has(`${layout}-p${pageId}`)) {
      let buffer;
      if (typeof options.loadVersesFont === "function") {
        buffer = await options.loadVersesFont(pageId, layout);
      }
      if (!buffer) {
        let fontName = `${layout}.ttf`;
        if (layout === "madinah-1439-digital") {
          fontName = `${layout}.otf`;
        }
        if (
          ["madinah-1405", "madinah-1422", "madinah-tajweed"].includes(layout)
        ) {
          fontName =
            layout === "madinah-1405"
              ? "QPC V1 Font"
              : layout === "madinah-1422"
                ? "QPC V2 Font"
                : layout === "madinah-tajweed"
                  ? "QPC V4 Tajweed Font"
                  : "unknown";

          buffer = Buffer.from(
            await (
              await fetch(
                `https://quranfonts.com/fonts/${fontName}/extracted/p${pageId}.woff2`,
              )
            ).arrayBuffer(),
          );
        } else {
          buffer = await fs.readFile(
            path.join(__dirname, "../../assets/fonts/layouts", fontName),
          );
        }
      }
      GlobalFonts.register(buffer, `${layout}-p${pageId}`);
    }
  }
}
