import { DatabaseSync } from "node:sqlite";
import { Layouts, VerseSelectionType, Word, WordSelectionType } from "./types";
import fs from "node:fs";
import path from "node:path";
import { Canvas, CanvasRenderingContext2D } from "@napi-rs/canvas";

export function isColorDark(c: string) {
  const color = +(
    "0x" + c.slice(1).replace((c.length < 5 && /./g) || "@", "$&$&")
  );

  const [r, g, b] = [color >> 16, (color >> 8) & 255, color & 255];

  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  return !(hsp > 127.5);
}

export function getDefaultOptions(layout: Layouts = "madinah-1439") {
  const defaultOptions = {
    theme: {
      forgroundColor: "#64b469",
      backgroundColor: "#000000",
    },
    centerVerses: false,
    ignoreWordsPosition: false,
    exegesisFont: "Kitab",
  };

  return defaultOptions;
}

export function getWords(
  layout: Layouts,
  selections: VerseSelectionType[],
): WordSelectionType[] {
  const wordsSelection: WordSelectionType[] = [];

  for (let i = 0; i < selections.length; i++) {
    const selection = selections[i];
    const wordSelection = { ...selection } as WordSelectionType;

    const database = new DatabaseSync(
      path.join(__dirname, `./database/${layout}.db`),
      {
        readOnly: true,
      },
    );

    wordSelection.words = database
      .prepare(
        "SELECT * FROM words WHERE chapter_id = ? AND verse_id >= ? AND verse_id <= ? AND (type = 'word' OR type = 'verse_number')",
      )
      .all(wordSelection.chapter, wordSelection.from, wordSelection.to)
      .map((word) => {
        return {
          chapterId: Number(word.chapter_id),
          pageId: Number(word.page_id),
          lineId: Number(word.line_id),
          verseId: Number(word.verse_id),
          word: String(word.word),
          wordId: Number(word.word_id),
        };
      }) as Word[];
    wordSelection.totalLines = new Set(
      wordSelection.words.map((w) => `${w.pageId}.${w.lineId}`),
    ).size;

    wordsSelection.push(wordSelection);
  }

  return wordsSelection;
}

export function splitLines(
  canvas: Canvas,
  ctx: CanvasRenderingContext2D,
  selection: WordSelectionType,
  layout: Layouts,
  ignoreWordsPosition?: boolean,
) {
  const lines: { [key: string]: Array<Word> } = {};

  if (ignoreWordsPosition) {
    let currentLine = 0;
    let line: Word[] = [];
    for (const word of selection.words) {
      ctx.font = `100px ${layout}-p${word.pageId}`;
      const printedLineWidth = ctx.measureText(
        line.map((w) => w.word).join(" "),
      ).width;
      let allowedWidth = canvas.width - 160;
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

export function calculateHeight(
  selectionsCount: number,
  linesCount: number[],
): number {
  return (
    50 + // default padding for top and bottom
    selectionsCount * 250 + // for each chapter framebox space
    linesCount.reduce((p, c) => p + c * 210, 0)
  ); // for each line: 210px
}

export function pageFrameBox(color: string) {
  return Buffer.from(
    fs
      .readFileSync(
        path.join(__dirname, "./assets/images/page_frame_box.svg"),
        "utf-8",
      )
      .replace(new RegExp("#64b469", "g"), color),
    "utf-8",
  );
}

export function wrapString(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.trim().split(" ");
  const lines = [];
  let currentIndex = 0;
  const wordsLength = words.length;
  for (let i = 0; i < wordsLength; i++) {
    const word = words[i];
    const line = lines[currentIndex];
    if (!line) lines[currentIndex] = "";
    lines[currentIndex] += ` ${word}`;
    const measuredLineWidth = ctx.measureText(line).width;
    if (measuredLineWidth >= maxWidth) {
      currentIndex += 1;
    }
  }

  return lines;
}

export function adjustColorBrightness(color: string, amount: number) {
  return (
    "#" + (+("0x" + color) + amount * 0x010101).toString(16).padStart(6, "0")
  );
}
export function toArabicNumbers(number: number) {
  return String(number)
    .replace(/1/g, "١")
    .replace(/2/g, "٢")
    .replace(/3/g, "٣")
    .replace(/4/g, "٤")
    .replace(/5/g, "٥")
    .replace(/6/g, "٦")
    .replace(/7/g, "٧")
    .replace(/8/g, "٨")
    .replace(/9/g, "٩")
    .replace(/0/g, "٠");
}
