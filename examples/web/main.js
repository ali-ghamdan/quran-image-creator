import QuranImageCreator from "../../dist/esm/index.js";

const body = document.querySelector("body");
const canvas = document.querySelector("canvas");

canvas.width = 1024;
canvas.height = 1024;

main();

async function main() {
  const image = await QuranImageCreator(
    {
      selection: [{ chapter: 1, from: 1, to: 7 }],
      layout: "madinah-1405",
    },
    "image/webp",
    "base64",
  );

  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = image.data;
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
}
