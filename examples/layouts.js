const fs = require("fs/promises");
const { default: QuranImageCreator } = require("../dist");

const layouts = [
  "madinah-tajweed",
  "madinah-1439",
  "madinah-1422",
  "madinah-1405",
  "shobah",
  "doori",
  "qalon",
  "sosi",
  "warsh",
];

(async () => {
  for (const layout of layouts) {
    const image = await QuranImageCreator({
      selection: [{ chapter: 1, from: 1, to: 7 }],
      layout: layout,
    });

    await fs.writeFile("./test.jpeg", image);
  }
})();
