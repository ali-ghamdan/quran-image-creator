import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { Word } from "../../types";
import { BaseDatabase } from "../interfaces";
import downloadFile from "../../utils/downloadFile";
import path from "node:path";
import { pathJoin } from "..";

export class NodeDatabase implements BaseDatabase {
  private _database?: DatabaseSync;

  constructor(private _assetsDirectory: string) {}

  async init(url: string) {
    const db = await pathJoin(
      this._assetsDirectory,
      path.join("assets", "database", path.basename(url)),
    );

    if (!fs.existsSync(db)) {
      const data = await downloadFile(url);

      await fs.promises.writeFile(db, data);
    }

    this._database = new DatabaseSync(db, { readOnly: true });
    return true;
  }

  getWords(chapter: number, range: { from?: number; to?: number }) {
    if (!this._database) throw new Error("database was not found.");

    return this._database
      .prepare(
        `SELECT * FROM words WHERE chapter_id = ? AND verse_id >= ? AND verse_id <= ? AND (type = 'word' OR type = 'verse_number')`,
      )
      .all(chapter, range.from || 1, range.to || 999)
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
  }
}
