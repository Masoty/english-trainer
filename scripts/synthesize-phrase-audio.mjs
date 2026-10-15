import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public/audio/phrases");

function slug(phrase) {
  return phrase
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parsePhrases() {
  const phrases = new Set();
  for (const file of ["src/data/phrasalVerbs.ts", "src/data/phrasalVerbsExtended.ts"]) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    const re = /phrase: "([^"]+)"/g;
    let m;
    while ((m = re.exec(text))) phrases.add(m[1]);
  }
  return [...phrases].sort();
}

async function synthesizeMac(phrase, m4aPath) {
  const aiffPath = `${m4aPath}.aiff`;
  await execFileAsync("say", ["-v", "Daniel", "-r", "168", phrase, "-o", aiffPath]);
  await execFileAsync("afconvert", [
    "-f",
    "mp4f",
    "-d",
    "aac",
    "-b",
    "64000",
    aiffPath,
    m4aPath,
  ]);
  fs.unlinkSync(aiffPath);
}

async function main() {
  if (process.platform !== "darwin") {
    console.error("Phrase synthesis requires macOS `say` and `afconvert`.");
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });
  const phrases = parsePhrases();
  let created = 0;
  let skipped = 0;

  for (const phrase of phrases) {
    const file = `${slug(phrase)}.m4a`;
    const dest = path.join(outDir, file);
    if (fs.existsSync(dest)) {
      skipped += 1;
      continue;
    }
    await synthesizeMac(phrase, dest);
    created += 1;
    if (created % 20 === 0) console.log(`synthesized ${created}…`);
  }

  console.log(JSON.stringify({ total: phrases.length, created, skipped, outDir }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
