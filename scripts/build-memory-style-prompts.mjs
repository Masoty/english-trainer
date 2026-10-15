import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const pilot = JSON.parse(
  fs.readFileSync(path.join(__dirname, "pilot-style-v1.json"), "utf8"),
);
const stylePrefix = pilot.stylePrefix;
const memorySuffix =
  "Make ONE bold unforgettable visual hook with exaggerated clear emotion so the image is easy to remember and not confused with other flashcards.";

const SETTINGS = [
  "cozy attic with sunbeam",
  "rainy bus stop",
  "bright kitchen table",
  "small theater stage",
  "forest trail at dawn",
  "city park shortcut path",
  "beach boardwalk",
  "garage workshop",
  "flower market stall",
  "school hallway lockers",
  "hospital waiting room",
  "rooftop at sunset",
  "campfire by lake",
  "subway platform",
  "bakery counter",
  "science lab bench",
  "farm field",
  "aquarium tunnel",
  "ski lodge",
  "vintage record shop",
];

const CHARACTERS = [
  "teen girl with red scarf",
  "elderly man with cane",
  "young dad with baby carrier",
  "student with backpack",
  "chef in apron",
  "doctor with stethoscope",
  "artist with paint on hands",
  "courier on bicycle",
  "twins in contrasting jackets",
  "grandmother with glasses",
  "athlete in track suit",
  "musician with instrument case",
  "hiker with huge boots",
  "office worker with coffee mug",
  "child in yellow raincoat",
];

const HOOKS = [
  "oversized symbolic object",
  "dramatic before-and-after split",
  "extreme close-up on hands and key prop",
  "character frozen mid-action",
  "unexpected funny animal helper",
  "glowing metaphorical light effect",
  "exaggerated facial expression close-up",
  "single bold color spotlight on main prop",
];

function pick(arr, n) {
  return arr[((n % arr.length) + arr.length) % arr.length];
}

function parseVerbs() {
  const entries = [];
  for (const file of ["src/data/phrasalVerbs.ts", "src/data/phrasalVerbsExtended.ts"]) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    const re =
      /id: (\d+),\s*phrase: "([^"]+)",[\s\S]*?uk: "([^"]+)",[\s\S]*?sentence: "([^"]+)",[\s\S]*?image: "\/images\/phrasal-verbs\/([^"]+)"/g;
    let m;
    while ((m = re.exec(text))) {
      entries.push({
        id: Number(m[1]),
        phrase: m[2],
        uk: m[3],
        sentence: m[4],
        filename: m[5],
        slug: m[5].replace(/\.jpg$/i, ""),
      });
    }
  }
  entries.sort((a, b) => a.id - b.id);
  return entries;
}

function buildScene(entry) {
  const { id, phrase, uk, sentence } = entry;
  const setting = pick(SETTINGS, id * 3 + phrase.length);
  const character = pick(CHARACTERS, id * 11 + uk.length);
  const hook = pick(HOOKS, id * 17 + sentence.length);
  return [
    `Phrasal verb "${phrase}".`,
    `${character} in ${setting}.`,
    `Use ${hook}.`,
    `Illustrate this exact situation visually: ${sentence}`,
    `(Meaning for artist: ${uk}.)`,
    "No readable text anywhere.",
  ].join(" ");
}

function buildPrompt(entry) {
  return [stylePrefix, memorySuffix, buildScene(entry)].join(" ");
}

const doneSlugs = new Set(pilot.items.map((i) => i.slug));
const all = parseVerbs();
const manualScenes = new Map(pilot.items.map((i) => [i.slug, i.scene]));

const manifest = all.map((entry) => {
  const manual = manualScenes.get(entry.slug);
  const scene = manual ?? buildScene(entry);
  const prompt = manual
    ? [stylePrefix, memorySuffix, manual.replace(/^MEMORABLE HOOK:\s*/i, "")].join(" ")
    : buildPrompt(entry);
  return {
    ...entry,
    status: doneSlugs.has(entry.slug) ? "done" : "todo",
    scene,
    prompt,
  };
});

const todo = manifest.filter((m) => m.status === "todo");

fs.writeFileSync(
  path.join(__dirname, "memory-regen-manifest.json"),
  JSON.stringify(manifest, null, 2),
);

const chunkSize = 5;
for (let i = 0; i < todo.length; i += chunkSize) {
  const chunk = todo.slice(i, i + chunkSize);
  fs.writeFileSync(
    path.join(__dirname, `memory-regen-chunk-${Math.floor(i / chunkSize)}.json`),
    JSON.stringify(chunk, null, 2),
  );
}

console.log(
  JSON.stringify(
    {
      total: manifest.length,
      done: manifest.length - todo.length,
      todo: todo.length,
      chunks: Math.ceil(todo.length / chunkSize),
    },
    null,
    2,
  ),
);
