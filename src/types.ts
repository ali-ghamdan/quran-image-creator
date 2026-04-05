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
  | "madinah-1439-digital"
  // | "madinah-1441"
  | "madinah-tajweed"
  | "warsh"
  | "qalon"
  | "sosi"
  | "doori"
  | "shobah";

export type QuranImageCreatorOptions = {
  selection: VerseSelectionType[];
  readonly height?: number;
  layout?: Layouts;
  centerVerses?: boolean; // default false
  ignoreWordsPosition?: boolean; // default false
  loadPageNumber?: {
    pagesEnd?: boolean;
    sectionsEnd?: boolean;
  };
  theme?: {
    forgroundColor?: string;
    backgroundColor?: string;
  };
  exegesisFont?: string;
  loadExegesis?: {
    [key: string]: (data: {
      chapterId: number;
      verseId: number;
    }) => Promise<{ name: string; content: string }>;
  };
  customVerseFrameBox?: boolean;
  loadVersesFont?: (pageId: number, layout: Layouts) => Promise<Buffer | void>;
};

export interface linePartType {
  data: string;
  type: "words" | "verse_number";
}
