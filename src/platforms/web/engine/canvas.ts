import { BaseCanvas } from "../../baseImplements";

export class WebCanvas extends BaseCanvas {
  private _ctx: CanvasRenderingContext2D;

  constructor(
    public canvas: HTMLCanvasElement,
    public height: number,
  ) {
    super(1920, height);

    this._ctx = this.canvas.getContext("2d")!;

    if (!this._ctx)
      throw new Error(
        "canvas was not found, please use an existing Canvas Element.",
      );

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

  async loadImage(source: string): Promise<HTMLImageElement> {
    const img = new Image();
    img.src = source;
    return await new Promise<HTMLImageElement>((res, rej) => {
      img.onload = () => res(img);
      img.onerror = (_1, _2, _3, _4, err) => rej(err);
    });
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
    if (res === "buffer") {
      throw new Error(
        "Buffer export is only available for node.js, use 'blob' export instead.",
      );
    } else if (res === "base64") {
      return this.canvas.toDataURL(mime, 100);
    } else {
      return new Promise<Blob>((res, rej) => {
        this.canvas.toBlob(
          (blob) => {
            if (blob) res(blob);
            else rej(new Error(`can't export as blob for '${mime}'`));
          },
          mime,
          100,
        );
      });
    }
  }
}
