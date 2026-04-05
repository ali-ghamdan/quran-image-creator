import { SKRSContext2D } from "@napi-rs/canvas";
import type { Layouts } from "../types";
import { NamedChapters } from "../constants";

export default function printChapterHeader(
  ctx: SKRSContext2D,
  layout: Layouts,
  chapter: number,
  textColor: string,
  forgroundColor: string,
  currentHeightPosition: number,
) {
  let chapterName = ["warsh", "madinah-1405"].includes(layout)
    ? NamedChapters[chapter - 1]
    : String(chapter);

  // chapter frame
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "290px chapters-frames";
  ctx.fillStyle = forgroundColor;
  ctx.fillText("17", ctx.canvas.width / 2, currentHeightPosition);

  if (layout === "warsh") {
    ctx.font = "115px warsh-chapters-name";
    currentHeightPosition -= 17;
  } else if (layout === "madinah-1405") {
    ctx.font = "150px madinah-1405-chapters-name";
    chapterName = `سورة ${chapterName}`;
  } else {
    ctx.font = "180px chapters-name";
    currentHeightPosition -= 10;
  }
  ctx.fillStyle = textColor;
  ctx.fillText(chapterName, ctx.canvas.width / 2, currentHeightPosition);
  ctx.restore();
}
