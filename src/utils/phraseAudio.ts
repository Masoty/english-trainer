import type { PhrasalVerb } from "../data/phrasalVerbs";
import { phraseToSlug } from "./phraseSlug";

const cache = new Map<string, HTMLAudioElement>();

function audioUrl(slug: string): string {
  return `/audio/phrases/${slug}.m4a`;
}

function getAudio(slug: string): HTMLAudioElement {
  let audio = cache.get(slug);
  if (!audio) {
    audio = new Audio(audioUrl(slug));
    audio.preload = "auto";
    cache.set(slug, audio);
  }
  return audio;
}

export function preloadPhraseAudio(verb: PhrasalVerb): Promise<void> {
  const slug = phraseToSlug(verb.phrase);
  const audio = getAudio(slug);

  if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const finish = () => {
      audio.removeEventListener("canplaythrough", finish);
      audio.removeEventListener("error", finish);
      resolve();
    };
    audio.addEventListener("canplaythrough", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    audio.load();
  });
}

export function playPhraseAudio(verb: PhrasalVerb): void {
  const slug = phraseToSlug(verb.phrase);
  const audio = cache.get(slug);
  if (!audio) return;
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

export function stopPhraseAudio(): void {
  for (const audio of cache.values()) {
    audio.pause();
    audio.currentTime = 0;
  }
}
