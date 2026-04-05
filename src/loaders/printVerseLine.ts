import { loadImage, SKRSContext2D } from "@napi-rs/canvas";
import type { QuranImageCreatorOptions, Word } from "../types";
import { ArabicNumbersRegex, forceCenteredLines } from "../constants";
import { splitLine, verseFrameBox } from "../utils";

// TODO: better line optimizations, (split line into parts (each verse mark is a part))
export default async function printVerseLine(
  ctx: SKRSContext2D,
  words: Word[],
  options: QuranImageCreatorOptions,
  textColor: string,
  currentHeightPosition: number,
  index: number,
) {
  const pageId = words[0].pageId;
  let line = words.map((word) => word.word).join(" ");
  ctx.font = `100px ${options.layout}-p${pageId}`;
  if (options.layout === "madinah-1439-digital") {
    line = line
      // manually add Verse Symbol
      .replace(ArabicNumbersRegex, (n) => `۝${n}`);
  }
  let currentWidthPosition = ctx.canvas.width - 80; // right padding
  const lastWidthPosition = 80; // left padding
  let maximumWidth = currentWidthPosition - lastWidthPosition;
  let lineMeasuredWidth = ctx.measureText(line).width;
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
    lineMeasuredWidth = ctx.measureText(line).width;
  }

  // when you try to make the easy part a hard one.
  if (
    options.customVerseFrameBox &&
    !["madinah-1405", "madinah-1422", "madinah-tajweed"].includes(
      options.layout!,
    )
  ) {
    const lineParts = splitLine(line);
    const isCenteredLine =
      (options.centerVerses && index > 0) ||
      forceCenteredLines[pageId]?.includes(words[0].lineId);
    let additionWidthForEachWord =
      isMovedLine || isCenteredLine
        ? 20
        : (ctx.canvas.width + 20 - lineMeasuredWidth) /
          line.split(" ").filter((w) => !ArabicNumbersRegex.test(w)).length;
    if (isCenteredLine) {
      // starting point
      currentWidthPosition = ctx.canvas.width / 2 + lineMeasuredWidth / 2;
    }
    for (const part of lineParts) {
      ctx.save();
      const measuredPartWidth = Math.min(
        maximumWidth,
        ctx.measureText(part.data).width,
      );
      // TODO: fix to use frames
      if (part.type === "verse_number") {
        const frameWidth = 70;
        const frameHeight = 99;
        const substractedWidth = 50;
        currentWidthPosition -= substractedWidth;
        const frameY = currentHeightPosition - frameHeight / 2;
        const frameX =
          currentWidthPosition -
          (frameWidth - substractedWidth) / (pageId > 2 ? 8 : 1);

        ctx.drawImage(
          await loadImage(verseFrameBox(options.theme?.forgroundColor!)),
          frameX,
          frameY,
          frameWidth,
          frameHeight,
        );
        ctx.font = "40px Kitab";
        ctx.fillStyle = textColor;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(
          part.data,
          frameX + frameWidth / 2,
          frameY + frameHeight / 2,
          frameWidth,
        );
        currentWidthPosition -= substractedWidth;
      } else {
        ctx.fillText(
          part.data,
          currentWidthPosition,
          currentHeightPosition,
          maximumWidth,
        );
        currentWidthPosition -= measuredPartWidth + additionWidthForEachWord;
      }

      ctx.restore();
    }
  } else {
    ctx.save();
    if (
      options.centerVerses ||
      forceCenteredLines[pageId]?.includes(words[0].lineId)
    ) {
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      currentWidthPosition = ctx.canvas.width / 2;
    }

    ctx.fillText(
      line,
      currentWidthPosition,
      currentHeightPosition,
      maximumWidth,
    );
    ctx.restore();
  }
}
