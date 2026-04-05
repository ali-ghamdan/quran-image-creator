import { loadImage, SKRSContext2D } from "@napi-rs/canvas";
import type { QuranImageCreatorOptions, WordSelectionType } from "../types";
import printChapterHeader from "./chapterHeader";
import {
  chaptersWithoutBeginning,
  pageFrameBox,
  splitLines,
  toArabicNumbers,
  wrapString,
} from "../utils";
import { printPageNumber } from "./pageNumber";
import loadSectionFonts from "./selectionFonts";
import printVerseLine from "./printVerseLine";

export default async function printSelections(
  ctx: SKRSContext2D,
  options: QuranImageCreatorOptions,
  Words: Array<WordSelectionType>,
  textColor: string,
) {
  const { canvas } = ctx;
  const layout = options.layout || "madinah-1439";

  let currentHeightPosition = 150; // top padding
  for (let i = 0; i < options.selection.length; i++) {
    const selection = Words[i];
    // print chapter head

    printChapterHeader(
      ctx,
      layout,
      selection.chapter,
      textColor,
      options.theme!.forgroundColor!,
      currentHeightPosition,
    );
    currentHeightPosition += 250;

    // print verses
    ctx.save();

    ctx.fillStyle = textColor;
    ctx.textAlign = "right";

    // load all required fonts for the process.
    await loadSectionFonts(layout, options, selection);

    const lines = splitLines(
      ctx,
      selection,
      layout,
      options.ignoreWordsPosition,
    );

    for (let l = 0; l < lines.length; l++) {
      const words = lines[l];

      const pageId = words[0].pageId;

      // TODO: load a special basmalah if available for the choosen layout (recitation).
      // load "بسم الله الرحمن الرحيم" if was the first verse in the chapter.
      if (
        words[0].verseId == 1 &&
        // to avoid repeating the process.
        words[0].wordId == 1 &&
        !chaptersWithoutBeginning(layout).includes(words[0].chapterId)
      ) {
        ctx.save();
        ctx.font = "185px basmalah";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("5", canvas.width / 2, currentHeightPosition - 20);
        ctx.restore();

        currentHeightPosition += 160;
      }

      // print verse line
      ctx.save();
      await printVerseLine(
        ctx,
        words,
        options,
        textColor,
        currentHeightPosition,
        l,
      );
      ctx.restore();
      // print page number.

      // end of the page (last line always is 15).
      const isLastLineInPage = words[0].lineId == (pageId < 3 ? 8 : 15);
      // print if this is the last of the selection.
      const isLastLineInSection = l === lines.length - 1;
      if (
        (options.loadPageNumber!.pagesEnd && isLastLineInPage) ||
        (options.loadPageNumber!.sectionsEnd && isLastLineInSection)
      ) {
        currentHeightPosition += 150;

        printPageNumber(
          ctx,
          await loadImage(pageFrameBox(options.theme!.forgroundColor!)),
          pageId,
          textColor,
          currentHeightPosition,
        );
      }

      // end of the section (padding between selections).
      currentHeightPosition += 200;
    }
    ctx.restore();
    currentHeightPosition -= 40;

    // print exegesis.
    if (typeof options.loadExegesis?.[selection.exegesis!] === "function") {
      let exegesisName = selection.exegesis;
      let exegeses = "";
      for (let k = selection.from; k <= selection.to; k++) {
        const exegesisOfVerse = await options.loadExegesis[
          selection.exegesis!
        ]?.({ chapterId: selection.chapter, verseId: k })?.catch(() => {});
        if (!exegesisOfVerse || !exegesisOfVerse.content) continue;
        exegesisName = exegesisOfVerse.name;
        exegeses += `${toArabicNumbers(k)}. ${exegesisOfVerse.content}\n`;
      }

      // process printing exegesis if found.
      if (exegeses.trim()) {
        ctx.save();
        ctx.font = `69px '${options.exegesisFont}'`;
        ctx.direction = "rtl";
        ctx.textBaseline = "middle";
        ctx.textAlign = "right";
        ctx.fillStyle = textColor;
        const endWidth = 80;
        const startWidth = canvas.width - endWidth;
        const maxWidth = startWidth - endWidth;
        const exegesesLines = wrapString(ctx, exegeses, maxWidth);

        ctx.save();
        ctx.font = `85px '${options.exegesisFont}'`;
        ctx.fillStyle = options.theme!.forgroundColor!;
        ctx.fillText(
          exegesisName || "",
          startWidth + 30,
          currentHeightPosition,
          maxWidth,
        );
        ctx.restore();
        currentHeightPosition += 30;
        for (let n = 0; n < exegesesLines.length; n++) {
          const exegesisLine = exegesesLines[n];
          ctx.fillStyle = textColor;
          ctx.fillText(
            exegesisLine,
            canvas.width - 70,
            (currentHeightPosition += 105),
            maxWidth,
          );
        }

        ctx.restore();
        currentHeightPosition += 150;
      }
    }

    // bottom padding
    if (i !== options.selection.length - 1) currentHeightPosition += 100;
  }

  return currentHeightPosition;
}
