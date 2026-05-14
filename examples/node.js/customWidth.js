const { writeFileSync } = require("fs");
const { default: QuranImageCreator } = require("../../dist");

(async () => {
  writeFileSync(
    "./samples/custom-width.webp",
    await (
      await QuranImageCreator(
        {
          selection: [{ chapter: 1, from: 1, to: 7 }],
          layout: "madinah-1422",
          theme: {
            backgroundColor: "#DCE2F0",
            foregroundColor: "#50586C",
          },
          width: 2880,
          ignoreWordsPosition: true,
        },
        "image/webp",
        "buffer",
      )
    ).data,
  );
})();
