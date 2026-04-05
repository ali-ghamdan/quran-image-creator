import { GlobalFonts } from "@napi-rs/canvas";
import type { Layouts } from "../types";
import path from "node:path";

export default function loadEssentialFonts(layout: Layouts) {
  GlobalFonts.registerFromPath(
    path.join(__dirname, "../../assets/fonts/Kitab.woff"),
    "Kitab",
  );
  GlobalFonts.registerFromPath(
    path.join(__dirname, "../../assets/fonts/chapters-frames.ttf"),
    "chapters-frames",
  );

  if (layout === "warsh") {
    GlobalFonts.registerFromPath(
      path.join(__dirname, "../../assets/fonts", "chapters-name-warsh.ttf"),
      "warsh-chapters-name",
    );
  } else if (layout === "madinah-1405") {
    GlobalFonts.registerFromPath(
      path.join(__dirname, "../../assets/fonts/chapters-name-madinah-1405.ttf"),
      "madinah-1405-chapters-name",
    );
  } else {
    GlobalFonts.registerFromPath(
      path.join(__dirname, "../../assets/fonts", "chapters-name.ttf"),
      "chapters-name",
    );
  }
  GlobalFonts.registerFromPath(
    path.join(__dirname, "../../assets/fonts/basmalah.ttf"),
    "basmalah",
  );
}
