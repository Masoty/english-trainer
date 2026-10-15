import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const assetsDir = path.join(
  process.env.HOME || "",
  ".cursor/projects/Users-macbook-Documents-English-Teacher/assets",
);
const publicDir = path.join(root, "public/images/phrasal-verbs");

const manifestPath = path.join(__dirname, "memory-regen-manifest.json");
if (!fs.existsSync(manifestPath)) {
  console.error("Run node scripts/build-memory-style-prompts.mjs first");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
let copied = 0;
const missing = [];

for (const item of manifest) {
  const src = path.join(assetsDir, item.filename);
  const dest = path.join(publicDir, item.filename);
  if (!fs.existsSync(src)) {
    missing.push(item.slug);
    continue;
  }
  fs.copyFileSync(src, dest);
  copied += 1;
}

console.log(JSON.stringify({ copied, missingCount: missing.length, missing: missing.slice(0, 30) }, null, 2));
