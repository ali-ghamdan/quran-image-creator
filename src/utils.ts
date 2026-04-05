import { DatabaseSync } from "node:sqlite";
import type {
  Layouts,
  linePartType,
  QuranImageCreatorOptions,
  VerseSelectionType,
  Word,
  WordSelectionType,
} from "./types";
import fs from "node:fs";
import path from "node:path";
import type { SKRSContext2D } from "@napi-rs/canvas";
import { ArabicNumbersRegex } from "./constants";

export function isColorDark(c: string) {
  const color = +(
    "0x" + c.slice(1).replace((c.length < 5 && /./g) || "@", "$&$&")
  );

  const [r, g, b] = [color >> 16, (color >> 8) & 255, color & 255];

  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  return !(hsp > 127.5);
}

export function getDefaultOptions(layout: Layouts = "madinah-1439") {
  const defaultOptions: QuranImageCreatorOptions = {
    layout: "madinah-1439",
    theme: {
      forgroundColor: "#64b469",
      backgroundColor: "#000000",
    },
    loadPageNumber: {
      pagesEnd: true,
      sectionsEnd: true,
    },
    selection: [],
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
  if (layout === "madinah-tajweed") layout = "madinah-1422";
  else if (layout === "madinah-1439-digital") layout = "madinah-1439";

  const wordsSelection: WordSelectionType[] = [];

  for (let i = 0; i < selections.length; i++) {
    const selection = selections[i];
    const wordSelection = { ...selection } as WordSelectionType;

    const database = new DatabaseSync(
      path.join(__dirname, `../database/${layout}.db`),
      {
        readOnly: true,
      },
    );

    wordSelection.words = database
      .prepare(
        "SELECT * FROM words WHERE chapter_id = ? AND verse_id >= ? AND verse_id <= ? AND (type = 'word' OR type = 'verse_number')",
      )
      .all(wordSelection.chapter, wordSelection.from, wordSelection.to)
      .map((word: any) => {
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
  ctx: SKRSContext2D,
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
      let allowedWidth = ctx.canvas.width - 160;
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

// broken function
export function calculateHeight(
  options: QuranImageCreatorOptions,
  sections: WordSelectionType[],
): number {
  const basmalahCount = sections
    .map((words) => {
      return words.words.filter(
        (w) =>
          w.verseId == 1 &&
          w.wordId == 1 &&
          !chaptersWithoutBeginning(options.layout!).includes(w.chapterId),
      ).length;
    })
    .reduce((p, c) => p + c, 0);
  const pageNumberCount = sections
    .map((words) => {
      let count = 0;
      const counts = words.words.map((word, i) => {
        const pageId = word.pageId;
        const isLastLineInPage = word.lineId === (pageId < 3 ? 8 : 15);
        const isLastLineInSection = i === words.words.length - 1;

        return (options.loadPageNumber?.pagesEnd && isLastLineInPage) ||
          (options.loadPageNumber?.sectionsEnd && isLastLineInSection)
          ? 1
          : 0;
      });

      for (let i = 0; i < counts.length; i++) count += counts[i];

      return count;
    })
    .reduce((p, c) => p + c, 0);

  return (
    150 + // top padding
    450 * sections.length + // each chapter head
    basmalahCount * 160 + // each basmalah for each selection
    pageNumberCount * 150 + // each page number print
    100 * (sections.length - 1)
  );
}

export function splitLine(line: string): Array<linePartType> {
  const lineParts: Array<linePartType> = [];
  const lineWords = line.split(" ");
  let currentIndex = 0;

  for (let i = 0; i < lineWords.length; i++) {
    const word = lineWords[i];
    const isNumber = ArabicNumbersRegex.test(word);
    if (isNumber) {
      lineParts[++currentIndex] = {
        type: "verse_number",
        data: word,
      };
      currentIndex += 1;
    } else {
      lineParts[currentIndex++] = {
        type: "words",
        data: word,
      };
    }
  }
  // TODO: temp fix
  return lineParts.filter(Boolean);
}

export function chaptersWithoutBeginning(layout: Layouts) {
  return [
    // at-Tawbah chapter
    9,
    // al-Fatihah doesn't have basmalah in these selected recitations.
    ...((["doori", "qalon", "sosi", "warsh"] as Layouts[]).includes(layout)
      ? []
      : [1]),
  ];
}

export function pageFrameBox(color: string) {
  return Buffer.from(
    fs
      .readFileSync(
        path.join(__dirname, "../assets/images/page_frame_box.svg"),
        "utf-8",
      )
      .replace(new RegExp("#64b469", "g"), color),
    "utf-8",
  );
}

export function verseFrameBox(color: string) {
  return Buffer.from(
    fs
      .readFileSync(
        path.join(__dirname, "../assets/images/ayah_frame.svg"),
        "utf-8",
      )
      .replace(new RegExp("#64b469", "g"), color),
    "utf-8",
  );
}

export function wrapString(ctx: SKRSContext2D, text: string, maxWidth: number) {
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
    if (measuredLineWidth >= maxWidth || word.includes("\n")) {
      const linesCount = Math.max(1, word.match(/\n/g)?.length || 0) - 1;
      if (linesCount > 0) currentIndex += 1;
      for (let j = 0; j < linesCount; j++) {
        lines[currentIndex++] = "\n";
      }
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
