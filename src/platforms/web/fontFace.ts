import { isUrl } from "../../utils/isUrl";
import { BaseFontFace } from "../interfaces";

class WebFontFace implements BaseFontFace {
  public _loadedFonts: Set<string> = new Set();

  async init(assetsDirectory?: string): Promise<void> {}

  async loadFont(name: string, source: string): Promise<void> {
    const fontFace = new FontFace(
      name,
      isUrl(source) ? `url(${source})` : source,
    );
    await fontFace.load();
    document.fonts.add(fontFace);
    this._loadedFonts.add(name);
  }

  isLoaded(name: string): boolean {
    return this._loadedFonts.has(name);
  }
}

export const fontFace = new WebFontFace();
