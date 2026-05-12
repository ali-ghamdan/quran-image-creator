import { BaseCanvasInterface } from "./interfaces";

export class BaseCanvas implements BaseCanvasInterface {
  constructor(
    public width: number,
    public height: number,
  ) {}

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

  to(
    mime: unknown,
    res: unknown,
  ): Promise<Blob> | Promise<string> | Promise<Buffer<ArrayBufferLike>> {
    throw new Error("Method not implemented.");
  }
  setTextBaseLine(baseline: CanvasTextBaseline): void {
    throw new Error("Method not implemented.");
  }
  setDirection(direction: CanvasDirection): void {
    throw new Error("Method not implemented.");
  }
  setFillStyle(fillStyle: string | CanvasGradient | CanvasPattern): void {
    throw new Error("Method not implemented.");
  }
  setTextAlign(textAlign: CanvasTextAlign): void {
    throw new Error("Method not implemented.");
  }
  setFont(font: string): void {
    throw new Error("Method not implemented.");
  }
  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    throw new Error("Method not implemented.");
  }
  measureTextWidth(text: string): number {
    throw new Error("Method not implemented.");
  }
  fillRect(x: number, y: number, w: number, h: number): void {
    throw new Error("Method not implemented.");
  }
  save(): void {
    throw new Error("Method not implemented.");
  }
  restore(): void {
    throw new Error("Method not implemented.");
  }
  loadImage(source: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  drawImage(img: any, x: number, y: number): void {
    throw new Error("Method not implemented.");
  }
}
