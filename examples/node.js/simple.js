const { writeFileSync } = require("fs");
const { default: QuranImageCreator } = require("../../dist");

(async () => {
  writeFileSync(
    "./samples/simple.webp",
    await (
      await QuranImageCreator(
        {
          selection: [{ chapter: 1, from: 1, to: 7 }],
          layout: "madinah-tajweed",
        },
        "image/webp",
        "buffer",
      )
    ).data,
  );
})();
