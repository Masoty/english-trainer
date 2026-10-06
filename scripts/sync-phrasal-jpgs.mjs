import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const seed = JSON.parse(fs.readFileSync(path.join(__dirname, "phrasal-seed.json"), "utf8"));
const assetsDir = path.join(
  process.env.HOME || "",
  ".cursor/projects/Users-macbook-Documents-English-Teacher/assets",
);
const publicDir = path.join(root, "public/images/phrasal-verbs");

function slug(phrase) {
  return phrase
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

fs.mkdirSync(publicDir, { recursive: true });

let copied = 0;
const missing = [];

for (const [phrase] of seed) {
  const file = `${slug(phrase)}.jpg`;
  const dest = path.join(publicDir, file);
  if (fs.existsSync(dest)) continue;

  const src = path.join(assetsDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    copied += 1;
  } else {
    missing.push({ phrase, file });
  }
}

console.log(JSON.stringify({ copied, missingCount: missing.length, missing: missing.slice(0, 20) }, null, 2));
