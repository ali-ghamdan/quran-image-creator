import { BaseCanvas } from "../platforms/baseImplements";

export function wrapString(canvas: BaseCanvas, text: string, maxWidth: number) {
  const words = text.trim().split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = canvas.measureTextWidth(testLine);
    if (currentLine && testWidth >= maxWidth) {
      const tempLines = currentLine.split("\n");
      for (const line of tempLines) {
        lines.push(line || "\n");
      }
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    const tempLines = currentLine.split("\n");
    for (const line of tempLines) {
      lines.push(line || "\n");
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let [currentLine, nextLine] = [lines[i], lines[i + 1]];
    if (!nextLine) continue;
    if (currentLine === "\n" && nextLine === "\n") lines[i] = "";
  }

  return lines.filter(Boolean);
}
