import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const imgDir = path.join(root, "public/images/phrasal-verbs");

const used = new Set();
for (const file of ["src/data/phrasalVerbs.ts", "src/data/phrasalVerbsExtended.ts"]) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  const re = /image: "\/images\/phrasal-verbs\/([^"]+)"/g;
  let match = re.exec(text);
  while (match) {
    used.add(match[1]);
    match = re.exec(text);
  }
}

function slugFromAsset(file) {
  if (file.endsWith(".thumb.webp")) return file.slice(0, -".thumb.webp".length);
  if (file.endsWith(".webp")) return file.slice(0, -".webp".length);
  if (file.endsWith(".jpg")) return file.slice(0, -".jpg".length);
  return null;
}

const usedSlugs = new Set([...used].map((f) => f.replace(/\.jpg$/i, "")));

let removed = 0;
for (const file of fs.readdirSync(imgDir)) {
  const slug = slugFromAsset(file);
  if (!slug || usedSlugs.has(slug)) continue;
  fs.unlinkSync(path.join(imgDir, file));
  removed += 1;
  console.log("removed orphan", file);
}

console.log(JSON.stringify({ used: used.size, removed }, null, 2));
