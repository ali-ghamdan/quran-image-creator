import { isNode } from "../constants";
import { databaseImporter, pathJoin } from "../platforms";
import { BaseDatabase } from "../platforms/interfaces";
import { Layouts, VerseSelectionType, WordSelectionType } from "../types";

export async function getVersesWords(
  layout: Layouts,
  selections: VerseSelectionType[],
  assetsDirectory: string,
): Promise<WordSelectionType[]> {
  if (layout === "madinah-tajweed") layout = "madinah-1422";
  else if (layout === "madinah-1439-digital") layout = "madinah-1439";

  const wordsSelection: WordSelectionType[] = [];

  for (let i = 0; i < selections.length; i++) {
    const selection = selections[i];
    const wordSelection = { ...selection } as WordSelectionType;

    const database: BaseDatabase = new (await databaseImporter())(
      isNode ? await pathJoin(assetsDirectory) : `${layout}_json`,
    );

    await database.init(
      `https://raw.githubusercontent.com/ali-ghamdan/quran-data-resources/refs/heads/master/databases/layouts/${layout}.${isNode ? "db" : "json"}`,
    );

    wordSelection.words = database.getWords(selection.chapter, {
      from: selection.from,
      to: selection.to,
    });

    wordsSelection.push(wordSelection);
  }

  return wordsSelection;
}
