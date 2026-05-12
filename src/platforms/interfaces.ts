import { Word } from "../types";

export interface BaseDatabase {
  init(url?: string): Promise<boolean>;
  getWords(chapter: number, range: { from?: number; to?: number }): Array<Word>;
}

export interface BaseFontFace {
  init(assetsDirectory?: string): Promise<void>;
  loadFont(name: string, source: string | Buffer, id?: string): Promise<void>;
  isLoaded(name: string): boolean;
}

type canvasExportMimes =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/avif";

export interface BaseCanvasInterface {
  width: number;
  height: number;

  to(mime: canvasExportMimes, res: "blob"): Promise<Blob>;
  to(mime: canvasExportMimes, res: "base64"): Promise<string>;
  to(mime: canvasExportMimes, res: "buffer"): Promise<Buffer>;

  setTextBaseLine(baseline: CanvasTextBaseline): void;
  setDirection(direction: CanvasDirection): void;
  setFillStyle(fillStyle: string | CanvasGradient | CanvasPattern): void;
  setTextAlign(textAlign: CanvasTextAlign): void;
  setFont(font: string): void;
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  measureTextWidth(text: string): number;
  loadImage(source: string): Promise<any>;
  drawImage(img: any, x: number, y: number): void;

  fillRect(x: number, y: number, w: number, h: number): void;
  save(): void;
  restore(): void;
}
