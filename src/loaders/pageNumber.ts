import { isNode } from "../constants";
import { BaseCanvas } from "../platforms/baseImplements";
import { toArabicNumbers } from "../utils/toArabicNumbers";

export function printPageNumber(
  canvas: BaseCanvas,
  frameImage: any,
  pageId: number,
  textColor: string,
  currentHeightPosition: number,
) {
  canvas.save();
  canvas.setTextBaseLine("top");
  canvas.setTextAlign("center");
  canvas.drawImage(
    frameImage,
    canvas.width / 2 - frameImage.width / 2,
    currentHeightPosition,
  );

  canvas.setFont("50px Kitab");
  canvas.setFillStyle(textColor);
  canvas.fillText(
    toArabicNumbers(pageId),
    canvas.width / 2,
    currentHeightPosition - (isNode ? 5 : -10),
  );
  canvas.restore();
}
