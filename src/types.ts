export type VerseSelectionType = {
  chapter: number;
  from: number;
  to: number;
  exegesis?: string;
};
export type Word = {
  chapterId: number;
  pageId: number;
  lineId: number;
  verseId: number;
  wordId: number;
  word: string;
};

export type WordSelectionType = {
  chapter: number;
  from: number;
  to: number;
  words: Word[];
  totalLines: number;
  exegesis?: string;
};

export type Layouts =
  | "madinah-1405"
  | "madinah-1422"
  | "madinah-1439"
  | "warsh"
  | "qalon"
  | "sosi"
  | "doori"
  | "shobah";

export type QuranImageCreatorType = {
  layout?: Layouts;
  selection: VerseSelectionType[];
  theme?: {
    forgroundColor?: string;
    backgroundColor?: string;
  };
  centerVerses?: boolean; // default false
  ignoreWordsPosition?: boolean; // default false
  exegesisFont?: string;
  height?: number;
  loadExegesis?: {
    [key: string]: (data: {
      chapterId: number;
      verseId: number;
    }) => Promise<{ name: string; content: string }>;
  };
};
