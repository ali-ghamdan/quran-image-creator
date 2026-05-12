import { BaseCanvas } from "../platforms/baseImplements";

// TODO: load a special basmalah if available for the choosen layout (recitation).
export function printBasmalah(
  canvas: BaseCanvas,
  currentHeightPosition: number,
) {
  canvas.save();
  canvas.setFont("185px basmalah");
  canvas.setTextAlign("center");
  canvas.setTextBaseLine("middle");
  canvas.fillText("5", canvas.width / 2, currentHeightPosition - 20);
  canvas.restore();
}
