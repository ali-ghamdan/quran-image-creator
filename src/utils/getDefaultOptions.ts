import { isNode } from "../constants";
import { Layouts, QuranImageCreatorOptions } from "../types";

export function getDefaultOptions(layout: Layouts = "madinah-1439") {
  const defaultOptions: QuranImageCreatorOptions = {
    layout: "madinah-1439",
    theme: {
      foregroundColor: "#64b469",
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
    assetsDirectory: isNode
      ? `${process.cwd()}/.cache/quran-image-creator`
      : "",
  };

  return defaultOptions;
}
