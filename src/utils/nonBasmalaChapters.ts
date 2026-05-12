import { Layouts } from "../types";

export function nonBasmalaChapters(layout: Layouts) {
  // default: al-tawbah.
  const chapters = [9];

  // al-fatihah doesn't have basmalah in these recitations, starts with al-hamd.
  if (!["doori", "qalon", "sosi", "warsh"].includes(layout)) {
    chapters.push(1);
  }

  return chapters;
}
