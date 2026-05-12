const { writeFileSync } = require("fs");
const { default: QuranImageCreator } = require("../../dist");

(async () => {
  writeFileSync(
    "./samples/exegesis.webp",
    await (
      await QuranImageCreator(
        {
          selection: [{ chapter: 1, from: 1, to: 7, exegesis: "zimneen" }],
          layout: "madinah-1422",
          loadExegesis: {
            zimneen: async (data) => {
              // you can also use your database, no error handling here, issues are common.
              const res = await fetch(
                `https://tafsir.app/get.php?src=zimneen&s=${data.chapterId}&a=${data.verseId}&ver=1`,
              );
              const json = await res.json();
              return {
                name: "تفسير ابن أبي زمنين",
                content: json.data,
              };
            },
          },
        },
        "image/webp",
        "buffer",
      )
    ).data,
  );
})();
