import type { QuranImageCreatorOptions, Word } from "../types";
import { ArabicNumbersRegex, forceCenteredLines } from "../constants";
import { BaseCanvas } from "../platforms/baseImplements";

// TODO: better line optimizations, (split line into parts (each verse mark is a part))
export default async function printVerseLine(
  canvas: BaseCanvas,
  words: Word[],
  options: QuranImageCreatorOptions,
  currentHeightPosition: number,
  index: number,
) {
  const pageId = words[0].pageId;
  let line = words.map((word) => word.word).join(" ");
  canvas.setFont(`100px ${options.layout}-p${pageId}`);
  if (options.layout === "madinah-1439-digital") {
    line = line
      // manually add Verse Symbol
      .replace(ArabicNumbersRegex, (n) => `۝${n}`);
  }
  let currentWidthPosition = canvas.width - 80; // right padding
  const lastWidthPosition = 80; // left padding
  let maximumWidth = currentWidthPosition - lastWidthPosition;
  let lineMeasuredWidth = canvas.measureTextWidth(line);
  let isMovedLine = false;
  // if the line have a few words, it will make it on the left instead of the right.
  if (
    !options.ignoreWordsPosition &&
    !options.centerVerses &&
    index === 0 &&
    pageId > 2 &&
    lineMeasuredWidth < maximumWidth * 0.65
  ) {
    currentWidthPosition = lastWidthPosition + lineMeasuredWidth;
    isMovedLine = true;
  }
  // stretching the line to fit the line
  while (
    lineMeasuredWidth < maximumWidth &&
    !forceCenteredLines[pageId]?.includes(words[0].lineId) &&
    // index !== lines.length - 1 &&
    lineMeasuredWidth >= maximumWidth / 2 &&
    pageId >= 3
  ) {
    line = line.split(" ").join("  ");
    lineMeasuredWidth = canvas.measureTextWidth(line);
  }

  canvas.save();
  if (
    options.centerVerses ||
    forceCenteredLines[pageId]?.includes(words[0].lineId)
  ) {
    canvas.setTextBaseLine("middle");
    canvas.setTextAlign("center");
    currentWidthPosition = canvas.width / 2;
  }
  canvas.fillText(
    line,
    currentWidthPosition,
    currentHeightPosition,
    maximumWidth,
  );
  canvas.restore();
}
