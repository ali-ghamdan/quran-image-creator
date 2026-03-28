import fs from "node:fs";
import QuranImageCreator from ".";

QuranImageCreator({
  selection: [
    { chapter: 2, from: 255, to: 255, exegesis: "السعدي" },
    { chapter: 2, from: 285, to: 286 },
    { chapter: 112, from: 1, to: 4 },
    { chapter: 113, from: 1, to: 5 },
    { chapter: 114, from: 1, to: 6 },
  ],
  layout: "madinah-1422",
  centerVerses: true,
}).then((image) => {
  fs.writeFileSync("./test.jpeg", image);
});
