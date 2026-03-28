import fs from "node:fs";
import path from "node:path";
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { Layouts, QuranImageCreatorType } from "./types";
import {
  calculateHeight,
  getDefaultOptions,
  getWords,
  isColorDark,
  pageFrameBox,
  splitLines,
  toArabicNumbers,
  wrapString,
} from "./utils";

export default async function QuranImageCreator(
  options: QuranImageCreatorType,
): Promise<Buffer> {
  const Layout = options.layout || "madinah-1439";

  const Words = getWords(Layout, options.selection);
  const Height = calculateHeight(
    options.selection.length,
    Words.map((e) => e.totalLines),
  );
  const defaultOptions = getDefaultOptions(Layout);

  const [backgroundColor, forgroundColor] = [
    options.theme?.backgroundColor || defaultOptions.theme.backgroundColor,
    options.theme?.forgroundColor || defaultOptions.theme.forgroundColor,
  ];

  const isDark = isColorDark(backgroundColor);
  const textColor = isDark ? "#ffffff" : "#000000";

  const canvas = createCanvas(1920, options.height || Height);
  const ctx = canvas.getContext("2d");

  // load essential fonts
  GlobalFonts.registerFromPath(
    path.join(__dirname, "./assets/fonts/Kitab.ttf"),
    "Kitab",
  );
  GlobalFonts.registerFromPath(
    path.join(__dirname, "./assets/fonts/arabic-naskh.ttf"),
    "Noto Naskh Arabic",
  );
  GlobalFonts.registerFromPath(
    path.join(__dirname, "./assets/fonts/chapters-name.ttf"),
    "chapters-name",
  );
  GlobalFonts.registerFromPath(
    path.join(__dirname, "./assets/fonts/basmalah.ttf"),
    "basmalah",
  );

  ctx.textBaseline = "middle";
  ctx.direction = "rtl";
  ctx.lang = "arabic";
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let currentHeightPosition = 150; // top padding
  for (let i = 0; i < options.selection.length; i++) {
    const selection = Words[i];
    // print chapter head
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "530px chapters-name";
    ctx.fillStyle = forgroundColor;
    ctx.fillText("118", canvas.width / 2, currentHeightPosition);
    ctx.font = "190px chapters-name";
    ctx.fillStyle = textColor;
    ctx.fillText(
      String(selection.chapter),
      canvas.width / 2,
      currentHeightPosition,
    );
    ctx.restore();
    currentHeightPosition += 250;
    // print verses
    ctx.save();

    ctx.fillStyle = textColor;
    ctx.textAlign = "right";

    // load all required fonts for the process.
    // TODO: online load from nuqayah
    for (const { pageId } of selection.words) {
      if (!GlobalFonts.has(`${Layout}-p${pageId}`)) {
        let fontName = `${Layout}.ttf`;
        if (["madinah-1405", "madinah-1422"].includes(Layout)) {
          fontName = `${Layout}/p${pageId}.ttf`;
        }
        GlobalFonts.registerFromPath(
          path.join(__dirname, "./assets/fonts/layouts/", fontName),
          `${Layout}-p${pageId}`,
        );
      }
    }

    const lines = splitLines(
      canvas,
      ctx,
      selection,
      Layout,
      options.ignoreWordsPosition,
    );

    for (let l = 0; l < lines.length; l++) {
      const words = lines[l];
      let currentWidthPosition = canvas.width - 80; // right padding
      const lastWidthPosition = 80; // left padding
      const maximumWidth = currentWidthPosition - lastWidthPosition;
      let line = words.map((word) => word.word).join(" ");
      const pageId = words[0].pageId;

      ctx.font = `100px ${Layout}-p${pageId}`;

      if (
        words[0].verseId == 1 &&
        words[0].wordId == 1 &&
        ![
          9,
          ...((["doori", "qalon", "sosi"] as Layouts[]).includes(Layout)
            ? []
            : [1]),
        ].includes(words[0].chapterId)
      ) {
        ctx.save();
        ctx.font = "320px basmalah";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("12", canvas.width / 2, currentHeightPosition);
        ctx.restore();

        currentHeightPosition += 200;
      }

      let printedLine = ctx.measureText(line).width;
      if (
        !options.ignoreWordsPosition &&
        l === 0 &&
        // TODO: temp fix.
        words.length < 7 &&
        pageId > 2
      ) {
        currentWidthPosition = lastWidthPosition + printedLine;
      }

      // first 2 pages
      if (pageId < 3) {
        ctx.save();
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(
          line,
          canvas.width / 2,
          currentHeightPosition,
          maximumWidth,
        );
        ctx.restore();
      } else {
        while (printedLine < maximumWidth && words.length > 6) {
          line = line.split(" ").join("  ");
          printedLine = ctx.measureText(line).width;
        }

        ctx.save();

        if (options.centerVerses) {
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          currentWidthPosition = canvas.width / 2;
        }
        ctx.fillText(
          line,
          currentWidthPosition,
          currentHeightPosition,
          maximumWidth,
        );
        ctx.restore();
      }

      // print page number.
      if (
        words[0].lineId === 15 ||
        (pageId < 3 && words[0].lineId == 8) ||
        l === lines.length - 1
      ) {
        currentHeightPosition += 150;
        const frameImage = await loadImage(pageFrameBox(forgroundColor));

        ctx.save();
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.drawImage(
          frameImage,
          canvas.width / 2 - frameImage.width / 2,
          currentHeightPosition,
        );
        ctx.font = "50px 'Noto Naskh Arabic'";
        ctx.fillStyle = textColor;
        ctx.fillText(
          toArabicNumbers(pageId),
          canvas.width / 2,
          currentHeightPosition,
        );
        ctx.restore();
      }
      currentHeightPosition += 200;
    }
    ctx.restore();
    currentHeightPosition -= 40;

    // print exegesis.
    if (typeof options.loadExegesis?.[selection.exegesis!] === "function") {
      let exegesisName = selection.exegesis;
      let exegeses = "";
      for (let k = selection.from; k <= selection.to; k++) {
        const exegesisOfVerse = await options.loadExegesis[
          selection.exegesis!
        ]?.({ chapterId: selection.chapter, verseId: k })?.catch(() => {});
        if (!exegesisOfVerse || !exegesisOfVerse.content) continue;
        exegesisName = exegesisOfVerse.name;
        exegeses += `${toArabicNumbers(k)}. ${exegesisOfVerse.content}` + "\n";
      }

      // process printing exegesis if found.
      if (exegeses.trim()) {
        ctx.save();
        ctx.font = `69px '${options.exegesisFont || defaultOptions.exegesisFont}'`;
        ctx.direction = "rtl";
        ctx.textBaseline = "middle";
        ctx.textAlign = "right";
        ctx.fillStyle = textColor;
        const endWidth = 80;
        const startWidth = canvas.width - endWidth;
        const maxWidth = startWidth - endWidth;
        const exegesesLines = wrapString(ctx, exegeses, maxWidth);

        ctx.save();
        ctx.font = `85px '${options.exegesisFont || defaultOptions.exegesisFont}'`;
        ctx.fillStyle = forgroundColor;
        ctx.fillText(
          exegesisName || "",
          startWidth + 30,
          currentHeightPosition,
          maxWidth,
        );
        ctx.restore();
        currentHeightPosition += 30;
        for (let n = 0; n < exegesesLines.length; n++) {
          const exegesisLine = exegesesLines[n];
          ctx.fillStyle = textColor;
          ctx.fillText(
            exegesisLine,
            canvas.width - 70,
            (currentHeightPosition += 105),
            maxWidth,
          );
        }

        ctx.restore();
        currentHeightPosition += 150;
      }
    }

    if (i !== options.selection.length - 1) currentHeightPosition += 100;
  }

  // for now, this is the best way i can find
  if (
    !options.height &&
    (canvas.height - currentHeightPosition > 150 ||
      currentHeightPosition >= canvas.height)
  ) {
    return await QuranImageCreator({
      ...options,
      height: currentHeightPosition - 50,
    });
  }

  return await canvas.toBuffer("image/jpeg", 100);
}
