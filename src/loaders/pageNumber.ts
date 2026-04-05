import { Image, SKRSContext2D } from "@napi-rs/canvas";
import { toArabicNumbers } from "../utils";

export function printPageNumber(
  ctx: SKRSContext2D,
  frameImage: Image,
  pageId: number,
  textColor: string,
  currentHeightPosition: number,
) {
  ctx.save();
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ctx.drawImage(
    frameImage,
    ctx.canvas.width / 2 - frameImage.width / 2,
    currentHeightPosition,
  );
  ctx.font = "50px Kitab";
  ctx.fillStyle = textColor;
  ctx.fillText(
    toArabicNumbers(pageId),
    ctx.canvas.width / 2,
    currentHeightPosition - 5,
  );
  ctx.restore();
}
