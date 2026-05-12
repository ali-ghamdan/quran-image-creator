import { Word } from "../../types";
import { BaseDatabase } from "../interfaces";

export class WebDatabase implements BaseDatabase {
  private _database: {
    page_id: number;
    line_id: number;
    chapter_id: number;
    verse_id: number;
    word_id: number;
    word: string;
  }[] = [];

  constructor(private path: string) {}

  async init(url: string) {
    try {
      const { openDB } = await import("idb");
      const db = await openDB(this.path, 1, {
        upgrade: (database) => {
          database.createObjectStore(this.path);
        },
      });
      const isSaved: boolean = await db.get(this.path, "isSaved");
      if (isSaved) {
        this._database = await db.get(this.path, "words");
      } else {
        const data: typeof this._database = await (await fetch(url)).json();

        await db.add(this.path, data, "words");
        await db.add(this.path, true, "isSaved");
      }

      if (this._database.length < 1) throw new Error("No Database was found");

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  getWords(chapter: number, range: { from?: number; to?: number }) {
    const words: Word[] = [];
    for (let i = 0; i < this._database.length; i++) {
      const word = this._database[i];
      if (word.chapter_id !== chapter) continue;
      if (!(word.verse_id >= (range.from || 0))) continue;
      if (!(word.verse_id <= (range.to || 999))) continue;

      words.push({
        chapterId: word.chapter_id,
        lineId: word.line_id,
        pageId: word.page_id,
        verseId: word.verse_id,
        word: word.word,
        wordId: word.word_id,
      });
    }
    return words;
  }
}
