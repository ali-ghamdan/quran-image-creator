import fs from "node:fs";
import QuranImageCreator from ".";

console.time();
QuranImageCreator({
  selection: [{ chapter: 1, from: 1, to: 7 }],
  layout: "madinah-1422",
  loadPageNumber: {
    pagesEnd: true,
    sectionsEnd: true,
  },
}).then((image) => {
  console.timeLog();
  fs.writeFileSync("./test.jpeg", image);
  console.timeEnd();
});
