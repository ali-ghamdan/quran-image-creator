import type { Layouts } from "../types";
import { NamedChapters } from "../constants";
import { BaseCanvas } from "../platforms/baseImplements";

export default function printChapterHeader(
  canvas: BaseCanvas,
  layout: Layouts,
  chapter: number,
  textColor: string,
  foregroundColor: string,
  currentHeightPosition: number,
) {
  let chapterName = ["warsh", "madinah-1405"].includes(layout)
    ? NamedChapters[chapter - 1]
    : String(chapter);

  // chapter frame
  canvas.save();
  canvas.setTextAlign("center");
  canvas.setTextBaseLine("middle");
  canvas.setFont("290px chapters-frames");
  canvas.setFillStyle(foregroundColor);
  canvas.fillText("17", canvas.width / 2, currentHeightPosition);

  if (layout === "warsh") {
    canvas.setFont("115px warsh-chapters-name");
    currentHeightPosition -= 17;
  } else if (layout === "madinah-1405") {
    canvas.setFont("150px madinah-1405-chapters-name");
    chapterName = `سورة ${chapterName}`;
  } else {
    canvas.setFont("180px chapters-name");
    currentHeightPosition -= 10;
  }
  canvas.setFillStyle(textColor);
  canvas.fillText(chapterName, canvas.width / 2, currentHeightPosition);
  canvas.restore();
}
