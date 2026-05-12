import {
  Canvas,
  createCanvas,
  Image,
  loadImage,
  SKRSContext2D,
} from "@napi-rs/canvas";
import { BaseCanvas } from "../../baseImplements";

export class NodeCanvas extends BaseCanvas {
  private _canvas: Canvas;
  private _ctx: SKRSContext2D;

  constructor(
    public width: number,
    public height: number = 1920,
  ) {
    super(width, height);

    this._canvas = createCanvas(width, height);
    this._ctx = this._canvas.getContext("2d");

    this._ctx.lang = "arabic";
    this._ctx.textBaseline = "middle";
    this._ctx.direction = "rtl";
  }

  save(): void {
    this._ctx.save();
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    this._ctx.fillRect(x, y, w, h);
  }

  measureTextWidth(text: string): number {
    return this._ctx.measureText(text).width;
  }

  restore(): void {
    this._ctx.restore();
  }

  setDirection(direction: CanvasDirection): void {
    this._ctx.direction = direction;
  }

  setFillStyle(fillStyle: string | CanvasGradient | CanvasPattern): void {
    this._ctx.fillStyle = fillStyle;
  }

  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    this._ctx.fillText(text, x, y, maxWidth);
  }

  setFont(font: string): void {
    this._ctx.font = font;
  }

  setTextAlign(textAlign: CanvasTextAlign): void {
    this._ctx.textAlign = textAlign;
  }

  setTextBaseLine(baseline: CanvasTextBaseline): void {
    this._ctx.textBaseline = baseline;
  }

  async loadImage(source: string): Promise<Image> {
    return await loadImage(source);
  }

  drawImage(img: any, x: number, y: number): void {
    this._ctx.drawImage(img, x, y);
  }

  to(
    mime: "image/png" | "image/jpeg" | "image/webp" | "image/avif",
    res: "blob",
  ): Promise<Blob>;
  to(
    mime: "image/png" | "image/jpeg" | "image/webp" | "image/avif",
    res: "base64",
  ): Promise<string>;
  to(
    mime: "image/png" | "image/jpeg" | "image/webp" | "image/avif",
    res: "buffer",
  ): Promise<Buffer>;
  async to(
    mime: "image/png" | "image/jpeg" | "image/webp" | "image/avif",
    res: string,
  ): Promise<Blob | string | Buffer> {
    if (res === "blob") {
      return new Promise<Blob>((res, rej) => {
        this._canvas.toBlob((blob) => {
          if (blob) res(blob);
          else rej(new Error("can't export as blob"));
        }, mime);
      });
    } else {
      if (mime === "image/avif") {
        if (res === "buffer") {
          return this._canvas.toBuffer(mime, { quality: 100 });
        } else {
          return this._canvas.toDataURL(mime, { quality: 100 });
        }
      } else {
        if (res === "buffer") {
          //@ts-ignore
          return this._canvas.toBuffer(mime, 100);
        } else {
          return this._canvas.toDataURL(mime, 100);
        }
      }
    }
  }
}
