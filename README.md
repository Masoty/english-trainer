# English Trainer (React)

Тренажёр англійської у стилі [Ba Ba Dum](https://babadum.com/play/?lang=1&game=1): категорії, режими гри, бали.

## Запуск

```bash
npm install
npm run dev
```

Відкрийте адресу з терміналу (зазвичай http://localhost:5173).

## Структура

- `src/pages/` — екрани (категорії, режими, гра)
- `src/data/phrasalVerbs.ts` — базова група + об’єднаний список
- `src/data/phrasalVerbsExtended.ts` — ~200 додаткових (генерується скриптом)
- `public/images/phrasal-verbs/` — JPG-ілюстрації (як у першій групі), без emoji-SVG

Синхронізація згенерованих JPG з assets Cursor:

```bash
npm run sync:images
```

Промпти для перегенерації ілюстрацій (єдиний стиль + мнемонічні сцени):

```bash
npm run prompts:memory     # scripts/memory-regen-chunk-*.json (gitignored)
# GenerateImage по prompt, потім npm run images:apply && npm run images:optimize
```

Озвучка фраз (macOS `say`, один раз):

```bash
npm run audio:synthesize   # public/audio/phrases/*.m4a
```

Перегенерувати розширений каталог (після зміни `scripts/phrasal-seed.json`):

```bash
npm run build:verbs
```

## Додати категорію

1. Додайте масив слів у `src/data/`.
2. Розширте `categories` у `phrasalVerbs.ts`.
3. Підключіть слова в `GamePage.tsx` за `categoryId`.
