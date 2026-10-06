import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const imgDir = path.join(root, "public/images/phrasal-verbs");

const THUMB_WIDTH = 420;
const FULL_MAX_WIDTH = 960;
const WEBP_QUALITY = 78;

async function optimizeFile(jpgPath) {
  const base = jpgPath.replace(/\.jpg$/i, "");
  const webpPath = `${base}.webp`;
  const thumbPath = `${base}.thumb.webp`;

  const input = sharp(jpgPath);
  const meta = await input.metadata();

  await sharp(jpgPath)
    .rotate()
    .resize({ width: FULL_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(webpPath);

  await sharp(jpgPath)
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 72, effort: 4 })
    .toFile(thumbPath);

  const jpgSize = fs.statSync(jpgPath).size;
  const webpSize = fs.statSync(webpPath).size;
  const thumbSize = fs.statSync(thumbPath).size;

  return { name: path.basename(jpgPath), jpgSize, webpSize, thumbSize, meta };
}

async function main() {
  if (!fs.existsSync(imgDir)) {
    console.error("Missing", imgDir);
    process.exit(1);
  }

  const jpgs = fs.readdirSync(imgDir).filter((f) => f.endsWith(".jpg"));
  let totalJpg = 0;
  let totalWebp = 0;
  let totalThumb = 0;

  for (const file of jpgs) {
    const stats = await optimizeFile(path.join(imgDir, file));
    totalJpg += stats.jpgSize;
    totalWebp += stats.webpSize;
    totalThumb += stats.thumbSize;
  }

  const savedFull = ((1 - totalWebp / totalJpg) * 100).toFixed(1);
  const savedThumb = ((1 - totalThumb / totalJpg) * 100).toFixed(1);

  console.log(
    JSON.stringify(
      {
        count: jpgs.length,
        jpgBytes: totalJpg,
        webpBytes: totalWebp,
        thumbBytes: totalThumb,
        savingsFullPercent: savedFull,
        savingsThumbPercent: savedThumb,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
