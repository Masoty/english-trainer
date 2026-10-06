import { useState } from "react";

/** Bump when replacing flashcard JPGs so browsers fetch fresh assets. */
const IMAGE_CACHE_VERSION = "2";

type PhrasalImageProps = {
  src: string;
  alt: string;
  phrase: string;
  className?: string;
};

export function PhrasalImage({ src, alt, phrase, className = "" }: PhrasalImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`phrasal-fallback ${className}`} aria-label={alt}>
        <span className="phrasal-fallback-icon">📚</span>
        <span className="phrasal-fallback-text">{phrase}</span>
      </div>
    );
  }

  const srcWithCache = src.includes("?") ? src : `${src}?v=${IMAGE_CACHE_VERSION}`;

  return (
    <img
      src={srcWithCache}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
