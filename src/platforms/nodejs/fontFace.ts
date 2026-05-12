import fs from "node:fs";
import path from "node:path";
import { GlobalFonts } from "@napi-rs/canvas";
import { BaseFontFace } from "../interfaces";
import downloadFile from "../../utils/downloadFile";
import { pathJoin } from "..";
import { isUrl } from "../../utils/isUrl";

class NodeFontFace implements BaseFontFace {
  public _assetsDirectory: string = "";

  async init(assetsDirectory?: string): Promise<void> {
    this._assetsDirectory = assetsDirectory || "";
  }

  async loadFont(
    name: string,
    source: string | Buffer,
    id?: string,
  ): Promise<void> {
    const fileName = `${typeof source === "string" ? path.basename(source) : name}`;
    const directory = await pathJoin(
      this._assetsDirectory,
      path.join("assets", id || "others", fileName),
    );
    if (
      typeof source === "string" &&
      isUrl(source) &&
      !fs.existsSync(directory)
    ) {
      source = await downloadFile(source);
    }

    if (!fs.existsSync(directory))
      await fs.promises.writeFile(directory, source);

    GlobalFonts.registerFromPath(directory, name);
  }

  isLoaded(name: string): boolean {
    return GlobalFonts.has(name);
  }
}

export const fontFace = new NodeFontFace();
