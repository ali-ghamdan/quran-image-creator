# Quran Image Creator

<p align="center">
  <img src="https://img.shields.io/npm/v/quran-image-creator" alt="npm version">
  <img src="https://img.shields.io/npm/dm/quran-image-creator" alt="npm downloads">
  <img src="https://img.shields.io/badge/license-Waqf--2.0-blue" alt="license">
</p>

<div align="center"><strong>
بعون الله وتوفيقه، أقدم لكم مكتبة مشاركة الآيات القرآنية كصورة.
</strong></div>

---

## المحتويات

- [المميزات](#المميزات)
- [البدء السريع](#البدء-السريع)
- [المرجع API](#المرجع-api)
- [معرض الصور](#معرض-الصور)
- [المساهمة](#المساهمة)
- [الترخيص](#الترخيص)

---

## المميزات

| #   | الميزة                                                                               |
| --- | ------------------------------------------------------------------------------------ |
| 1   | **6 روايات قرآنية**: حفص عن عاصم (4 مصاحف)، شُعبة، ورش، قالون، الدُّوري، السوسي      |
| 2   | **تخصيص كامل**: ألوان الخلفية والنص، الخطوط، رقم الصفحة، توسيط الآيات                |
| 3   | **تفسير الآيات**: إضافة تفسير مع خط مستقل لكل تفسير                                  |
| 4   | **تحديدات متعددة**: آيات من سور مختلفة في صورة واحدة                                 |
| 5   | **ويب + Node.js**: يعمل في المتصفح بدون مكاتب إضافية، و `@napi-rs/canvas` لـ Node.js |
| 6   | **صيغ متعددة**: `png` / `jpeg` / `avif` / `webp` كـ `blob` / `buffer` / `base64`     |
| 7   | **حجم خفيف**: تحميل البيانات عند التشغيل ثم تخزينها في `.cache` للمعالجات القادمة    |
| 8   | **دقة المواضع**: طباعة كل كلمة في موضعها كما في المصحف (قابل للإيقاف)                |

### المصاحف المتوفرة

لحفص: المدينة 1405 هـ | 1422 هـ | 1439 هـ | المجود

لباقي الروايات: شُعبة | ورش | قالون | الدُّوري | السوسي

> **تنويه:** المصحف المجود لا يدعم الخلفية الداكنة بعد — استخدم خلفية فاتحة.

### مصادر البيانات

[مجمع الملك فهد](https://qurancomplex.gov.sa/quran-dev/) و [QUL](https://qul.tarteel.ai/).

---

## البدء السريع

### التثبيت

```bash
npm install quran-image-creator
pnpm add quran-image-creator
yarn add quran-image-creator
```

### Node.js

```js
const { writeFileSync } = require("fs");
const QuranImageCreator = require("quran-image-creator");

(async () => {
  const { data } = await QuranImageCreator(
    { selection: [{ chapter: 1, from: 1, to: 7 }], layout: "madinah-tajweed" },
    "image/webp",
    "buffer",
  );
  writeFileSync("output.webp", data);
})();
```

### المتصفح

```js
import QuranImageCreator from "quran-image-creator";

const canvas = document.querySelector("canvas");
canvas.width = 1024;
canvas.height = 1024;

const { data } = await QuranImageCreator(
  { selection: [{ chapter: 1, from: 1, to: 7 }], layout: "madinah-1405" },
  "image/webp",
  "base64",
  canvas,
);

const img = new Image();
img.src = data;
img.onload = () => {
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};
```

لمزيد من الأمثلة: `/examples`.

---

## المرجع API

### التوقيع

```ts
QuranImageCreator(
  options: QuranImageCreatorOptions,
  mime: "image/png" | "image/jpeg" | "image/webp" | "image/avif",
  returnType: "blob" | "buffer" | "base64",
  canvasEl?: HTMLCanvasElement,
): Promise<{ width: number; height: number; data: Blob | Buffer | string }>
```

### الخيارات

`options.selection[]`: مجموعة الآيات المختارة للتصوير. <br />
`options.selection[].chapter`: رقم السورة. <br />
`options.selection[].from`, `options.selection.to`: تحديد الآيات (اختياري) <br />
`options.selection[].exegesis`: رمز التفسير لهذه المجموعة (اختياري).
`options.layout`: المصحف، اختياري `default: madinah-1439`. <br />
`options.theme.backgroundColor`: لون الخلفية. (اختياري)<br />
`options.theme.foregroundColor`: اللون الأساسي (اختياري)<br />

> **تنويه:** لون النصوص يتم تحديدها تلقائيًا بنائًا على لون الخلفية، إما أبيض أو أسود.

`options.loadExegesis`: لتسجيل دوال الحصول على نصوص التفاسير (اختياري) <br />
`options.exegesisFont`: تخصيص خط التفسير (اختياري). `default: Kitab bold`. <br />
`options.loadPageNumber.pagesEnd`: هل يتم طبع رقم الصفحة نهاية كل صفحة؟ (اختياري). <br />
`options.loadPageNumber.sectionsEnd`: هل يتم طبع رقم الصفحة نهاية كل مجموعة تحديد؟ (اختياري). <br />
`options.centerVerses`: هل يتم وزن الأسطر كلها إلى المنتصف بدلًا من اليمين والشمال؟ (اختياري). <br />
`options.ignoreWordsPosition`: هل يتم إلغاء ترتيب الكلمات بالترتيب المعروف للمصحف؟ (اختياري) <br />
`options.assetsDirectory`: مسار مجلد تخزين الخطوط وبيانات المصاحف، لتجنب تحميلها في كل عملية.

> **تنويه:** ليس هناك أي أهميه ل`options.assetsDirectory` في الweb.

### المصاحف

تستطيع اختيار أي قيمة من هذه المصاحف المتوفرة واستخدامها في `options.layout`

| القيمة              | المصحف          |
| ------------------- | --------------- |
| `"madinah-1405"`    | المدينة 1405 هـ |
| `"madinah-1422"`    | المدينة 1422 هـ |
| `"madinah-1439"`    | المدينة 1439 هـ |
| `"madinah-tajweed"` | المجود          |
| `"warsh"`           | ورش             |
| `"qalon"`           | قالون           |
| `"shobah"`          | شُعبة           |
| `"doori"`           | الدُّوري        |
| `"sosi"`            | السوسي          |

---

## مثال للمكتبة جامع

<div align="left">

```ts
import fs from "node:fs";
import QuranImageCreator from "quran-image-creator";

QuranImageCreator(
  {
    // default: madinah-1439.
    layout: "warsh",
    selection: [
      { chapter: 1 },
      { chapter: 2, from: 1, to: 15 },
      // exegesis: KEY.
      { chapter: 43, from: 64, to: 64, exegesis: "mukhtasar" },
    ],
    loadExegesis: {
      // will only load for 43:64 verse, for using this function in the selection.
      // use still can use your own database, online requests will make the operation slower.
      mukhtasar: async ({ chapterId, verseId }) => {
        const response = await fetch(
          `https://tafsir.app/get.php?src=mukhtasar&s=${chapterId}&a=${verseId}&ver=1`,
        );
        const { data } = await response.json();

        return {
          name: "المختصر في التفسير",
          content: data,
        };
      },
    },
    // custom font for exegesis (default: Kitab bold)
    // you need to load it in the canvas library
    // in node.js: use `GlobalFonts` from `@napi-rs/canvas`.
    // in web: use css font load or using `FontFace` JS API.
    exegesisFont: "Arial",
    // default: false.
    centerVerses: false,
    // default: false.
    ignoreWordsPosition: false,
    // default: $CWD/.cache
    assetsDirectory: "/home/ali-ghamdan/.cache/quran-image-creator",
    // 2 color combo source: https://2colors.colorion.co/
    theme: {
      // default: #000000
      backgroundColor: "#D4B996",
      // default: #64b469
      foregroundColor: "#A07855",
    },
    // these are default options.
    loadPageNumber: {
      pagesEnd: true,
      sectionsEnd: true,
    },
  },
  // webp are too lightweight, recommended. (required argument).
  "image/webp",
  // buffer is only available in node.js, for web use base64 or blob.
  // (required argument).
  "buffer",
).then(({ data: image }) => {
  fs.writeFileSync("./image.webp", image);
});
```

</div>

## معرض الصور

| الوصف                                  | الصورة                                           |
| -------------------------------------- | ------------------------------------------------ |
| المصحف المجود — سورة الفاتحة           | ![](./samples/simple.webp)                       |
| تحديدات متفرقة (أذكار النوم) — 1422 هـ | ![](./samples/multi-selection.webp)              |
| تفسير ابن أبي زمنين — 1422 هـ          | ![](./samples/exegesis.webp)                     |
| تخصيص 1                                | ![](./samples/custom/1.webp)                     |
| تخصيص 2                                | ![](./samples/custom/2.webp)                     |
| تخصيص 3                                | ![](./samples/custom/3.webp)                     |
| المدينة 1405 هـ                        | ![](./samples/layouts/test-madinah-1405.webp)    |
| المدينة 1422 هـ                        | ![](./samples/layouts/test-madinah-1422.webp)    |
| المدينة 1439 هـ                        | ![](./samples/layouts/test-madinah-1439.webp)    |
| المجود                                 | ![](./samples/layouts/test-madinah-tajweed.webp) |
| شُعبة                                  | ![](./samples/layouts/test-shobah.webp)          |
| ورش                                    | ![](./samples/layouts/test-warsh.webp)           |
| قالون                                  | ![](./samples/layouts/test-qalon.webp)           |
| الدوري                                 | ![](./samples/layouts/test-doori.webp)           |
| السوسي                                 | ![](./samples/layouts/test-sosi.webp)            |

---

## المساهمة

1. افتح [issue](https://github.com/ali-ghamdan/quran-image-creator/issues)
2. انسخ المستودع (`fork`)
3. أنشئ فرعًا (`git checkout -b feature/my-feature`)
4. قدّم طلب سحب (`pull request`)

---

## الترخيص

[Waqf General Public License v2.0](https://github.com/ojuba-org/waqf)
