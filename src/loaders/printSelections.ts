import type { QuranImageCreatorOptions, WordSelectionType } from "../types";
import printChapterHeader from "./chapterHeader";
import { printPageNumber } from "./pageNumber";
import loadSectionFonts from "./selectionFonts";
import printVerseLine from "./printVerseLine";
import { pageFrameBox } from "../utils/pageFrameBox";
import { splitLines } from "../utils/splitLines";
import { nonBasmalaChapters } from "../utils/nonBasmalaChapters";
import { toArabicNumbers } from "../utils/toArabicNumbers";
import { wrapString } from "../utils/wrapString";
import { BaseCanvas } from "../platforms/baseImplements";
import { printBasmalah } from "./printBasmalah";

export default async function printSelections(
  canvas: BaseCanvas,
  options: QuranImageCreatorOptions,
  Words: Array<WordSelectionType>,
  textColor: string,
) {
  const layout = options.layout || "madinah-1439";
  let currentHeightPosition = 150; // top padding
  for (let i = 0; i < options.selection.length; i++) {
    const selection = Words[i];
    // print chapter head
    printChapterHeader(
      canvas,
      layout,
      selection.chapter,
      textColor,
      options.theme!.foregroundColor!,
      currentHeightPosition,
    );
    currentHeightPosition += 250;

    // print verses
    canvas.save();

    canvas.setFillStyle(textColor);
    canvas.setTextAlign("right");

    // load all required fonts for the process.
    await loadSectionFonts(layout, options, selection);

    const lines = splitLines(
      canvas,
      selection,
      layout,
      options.ignoreWordsPosition,
    );
    for (let l = 0; l < lines.length; l++) {
      const words = lines[l];

      const pageId = words[0].pageId;

      // load "بسم الله الرحمن الرحيم" if was the first verse in the chapter.
      if (
        words[0].verseId == 1 &&
        // to avoid repeating the process.
        words[0].wordId == 1 &&
        !nonBasmalaChapters(layout).includes(words[0].chapterId)
      ) {
        printBasmalah(canvas, currentHeightPosition);
        currentHeightPosition += 160;
      }

      // print verse line
      canvas.save();
      await printVerseLine(canvas, words, options, currentHeightPosition, l);
      canvas.restore();
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
          canvas,
          await canvas.loadImage(
            (await pageFrameBox(options.theme!.foregroundColor!)) as any,
          ),
          pageId,
          textColor,
          currentHeightPosition,
        );
      }

      // end of the section (padding between selections).
      currentHeightPosition += 200;
    }
    canvas.restore();
    currentHeightPosition -= 40;

    // print exegesis.
    if (typeof options.loadExegesis?.[selection.exegesis!] === "function") {
      let exegesisName = selection.exegesis;
      let exegeses = "";
      for (let k = selection.from; k <= selection.to; k++) {
        const exegesisOfVerse = await options.loadExegesis[
          selection.exegesis!
        ]?.({ chapterId: selection.chapter, verseId: k });
        if (!exegesisOfVerse || !exegesisOfVerse.content) continue;
        exegesisName = exegesisOfVerse.name;
        exegeses += `${toArabicNumbers(k)}. ${exegesisOfVerse.content}\n`;
      }
      // process printing exegesis if found.
      if (exegeses.trim()) {
        canvas.save();
        canvas.setFont(`69px '${options.exegesisFont}'`);
        canvas.setDirection("rtl");
        canvas.setTextBaseLine("middle");
        canvas.setTextAlign("right");
        canvas.setFillStyle(textColor);

        const endWidth = 80;
        const startWidth = canvas.width - endWidth;
        const maxWidth = startWidth - endWidth;
        const exegesesLines = wrapString(canvas, exegeses, maxWidth);

        canvas.save();
        canvas.setFont(`85px '${options.exegesisFont}'`);
        canvas.setFillStyle(options.theme!.foregroundColor!);
        canvas.fillText(
          exegesisName || "",
          startWidth + 30,
          currentHeightPosition,
          maxWidth,
        );
        canvas.restore();
        currentHeightPosition += 30;
        for (let n = 0; n < exegesesLines.length; n++) {
          const exegesisLine = exegesesLines[n];
          canvas.setFillStyle(textColor);
          canvas.fillText(
            exegesisLine,
            canvas.width - 70,
            (currentHeightPosition += exegesisLine === "\n" ? 50 : 115),
            maxWidth,
          );
        }
        currentHeightPosition += 80;

        canvas.restore();
        currentHeightPosition += 150;
      }
    }

    // bottom padding
    if (i !== options.selection.length - 1) currentHeightPosition += 100;
  }

  return currentHeightPosition;
}
