import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "dist/images/phrasal-verbs");

if (!fs.existsSync(dir)) {
  console.log("No dist images folder — skip strip JPG.");
  process.exit(0);
}

let removed = 0;
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".jpg")) continue;
  fs.unlinkSync(path.join(dir, file));
  removed += 1;
}

console.log(`Removed ${removed} JPG from dist (WebP only on production).`);
