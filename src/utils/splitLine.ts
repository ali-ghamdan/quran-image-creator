import { ArabicNumbersRegex } from "../constants";
import { linePartType } from "../types";

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

  return lineParts.filter(Boolean);
}
