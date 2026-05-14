import { Layouts, Word, WordSelectionType } from "../types";
import { BaseCanvas } from "../platforms/baseImplements";

export function splitLines(
  canvas: BaseCanvas,
  selection: WordSelectionType,
  layout: Layouts,
  ignoreWordsPosition?: boolean,
) {
  const PADDING = 160;
  const lines: { [key: string]: Array<Word> } = {};

  if (ignoreWordsPosition) {
    let currentLine = 0;
    let line: Word[] = [];
    for (const word of selection.words) {
      canvas.setFont(`100px ${layout}-p${word.pageId}`);
      const printedLineWidth = canvas.measureTextWidth(
        line.map((w) => w.word).join(" "),
      );
      let allowedWidth = canvas.width - PADDING;
      line.push(word);
      if (printedLineWidth >= allowedWidth) {
        lines[currentLine++] = line;
        line = [];
      }
    }
    lines[currentLine++] = line;
    line = [];
  } else {
    for (const word of selection.words) {
      let index = `${word.pageId}-${word.lineId}`;
      if (!lines[index]) lines[index] = [];
      (lines[index] as Word[]).push(word);
    }
  }

  return Object.values(lines).filter(Boolean);
}
