const { writeFileSync } = require("fs");
const { default: QuranImageCreator } = require("../../dist");

(async () => {
  writeFileSync(
    "./samples/multi-selection.webp",
    await (
      await QuranImageCreator(
        {
          selection: [
            { chapter: 2, from: 255, to: 255 },
            { chapter: 2, from: 285, to: 286 },
            { chapter: 112, from: 1, to: 4 },
            { chapter: 113, from: 1, to: 5 },
            { chapter: 114, from: 1, to: 6 },
          ],
          layout: "madinah-1422",
        },
        "image/webp",
        "buffer",
      )
    ).data,
  );
})();
