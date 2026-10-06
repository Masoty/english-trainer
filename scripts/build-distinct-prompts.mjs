import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SETTINGS = [
  "underwater coral reef",
  "snowy mountain village",
  "neon cyberpunk alley at night",
  "sunny sunflower field",
  "cozy wooden kitchen",
  "busy airport terminal",
  "ancient library with tall shelves",
  "rainy city street with reflections",
  "desert oasis with palm trees",
  "space station window view",
  "colorful street market",
  "quiet hospital hallway",
  "greenhouse full of plants",
  "construction site with cranes",
  "theater stage with red curtains",
  "farm barn and tractor",
  "japanese zen garden",
  "carnival with ferris wheel",
  "science lab with beakers",
  "subway platform",
  "rooftop garden at sunset",
  "bakery with fresh bread",
  "ice hockey rink",
  "art museum gallery",
  "camping tent by lake",
  "volcano landscape stylized",
  "hot air balloon sky",
  "medieval castle courtyard",
  "tropical beach hut",
  "warehouse with boxes",
  "ski slope",
  "aquarium tunnel",
  "pizza restaurant",
  "flower shop interior",
  "train compartment",
  "observatory dome",
  "skate park",
  "vineyard hills",
  "fire station",
  "record store",
];

const PALETTES = [
  "dominant teal and orange accents",
  "dominant magenta and lime green",
  "dominant navy and gold",
  "dominant coral and deep purple",
  "dominant mint and cherry red",
  "dominant mustard yellow and cobalt",
  "dominant peach and turquoise",
  "dominant indigo and pink",
  "dominant olive and bright red",
  "dominant lavender and orange",
  "dominant cyan and brown",
  "dominant ruby and sky blue",
  "dominant lemon and violet",
  "dominant emerald and peach",
  "dominant black and neon green",
  "dominant white and royal blue",
  "dominant rust and aqua",
  "dominant plum and yellow",
  "dominant scarlet and gray",
  "dominant beige and teal",
];

const CHARACTERS = [
  "elderly woman with silver hair",
  "teen boy with red hoodie",
  "young girl with braids",
  "businessman in green suit",
  "chef in white uniform",
  "scientist with goggles",
  "farmer in overalls",
  "pilot in uniform",
  "artist with paint splashes",
  "athlete in bright sportswear",
  "doctor with stethoscope",
  "musician with guitar",
  "hiker with large backpack",
  "child with yellow raincoat",
  "robot helper character",
  "cat mascot character",
  "dog mascot character",
  "twins in contrasting outfits",
  "grandfather with cane",
  "courier on scooter",
];

const COMPOSITIONS = [
  "wide shot",
  "close-up on hands and key object",
  "bird's-eye view",
  "side profile silhouette style",
  "split scene before and after",
  "centered single character",
  "two characters interacting",
  "object-focused still life",
  "dynamic motion blur accent",
  "minimal background one bold prop",
];

function slug(phrase) {
  return phrase
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function pick(arr, n) {
  return arr[((n % arr.length) + arr.length) % arr.length];
}

function buildPrompt(id, phrase, uk, sentence) {
  const setting = pick(SETTINGS, id * 3 + phrase.length);
  const palette = pick(PALETTES, id * 7 + phrase.charCodeAt(0));
  const character = pick(CHARACTERS, id * 11 + uk.length);
  const composition = pick(COMPOSITIONS, id * 13 + sentence.length);

  return [
    "Unique educational flashcard illustration, flat bold cartoon vector.",
    `Card #${id}.`,
    palette + ".",
    `Setting: ${setting} (must NOT look like a generic office).`,
    `Composition: ${composition}.`,
    `Character: ${character}.`,
    `Clear visual story for English phrasal verb "${phrase}" (${uk}).`,
    `Context: ${sentence}`,
    "High contrast, memorable silhouette, distinct props.",
    "No text, no letters, no watermarks. Square 1:1.",
  ].join(" ");
}

const group1 = JSON.parse(fs.readFileSync(path.join(__dirname, "group1-seed.json"), "utf8"));
const extended = JSON.parse(fs.readFileSync(path.join(__dirname, "phrasal-seed.json"), "utf8"));

const items = [
  ...group1.map((row, i) => ({ id: 121 + i, phrase: row[0], uk: row[1], sentence: row[2] })),
  ...extended.map((row, i) => ({ id: 141 + i, phrase: row[0], uk: row[1], sentence: row[2] })),
];

const manifest = items.map((item) => ({
  ...item,
  slug: slug(item.phrase),
  filename: `${slug(item.phrase)}.jpg`,
  prompt: buildPrompt(item.id, item.phrase, item.uk, item.sentence),
}));

fs.writeFileSync(path.join(__dirname, "regen-manifest.json"), JSON.stringify(manifest, null, 2));

const chunkSize = 22;
for (let i = 0; i < manifest.length; i += chunkSize) {
  const chunk = manifest.slice(i, i + chunkSize);
  fs.writeFileSync(
    path.join(__dirname, `regen-chunk-${Math.floor(i / chunkSize)}.json`),
    JSON.stringify(chunk, null, 2),
  );
}

console.log(`Manifest: ${manifest.length} items, ${Math.ceil(manifest.length / chunkSize)} chunks.`);
