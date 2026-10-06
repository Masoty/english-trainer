import { useState } from "react";

/** Bump when image assets change so browsers fetch fresh files. */
const IMAGE_CACHE_VERSION = "4";

export type PhrasalImageVariant = "thumb" | "full";

type PhrasalImageProps = {
  src: string;
  alt: string;
  phrase: string;
  className?: string;
  /** Smaller WebP for 4-up grid; full for hero card. */
  variant?: PhrasalImageVariant;
};

function withCache(url: string) {
  return url.includes("?") ? url : `${url}?v=${IMAGE_CACHE_VERSION}`;
}

function resolveSources(src: string, variant: PhrasalImageVariant) {
  const clean = src.replace(/\?.*$/, "");
  const base = clean.replace(/\.jpg$/i, "");
  const jpg = withCache(clean.endsWith(".jpg") ? clean : `${base}.jpg`);
  const webp = withCache(
    variant === "thumb" ? `${base}.thumb.webp` : `${base}.webp`,
  );
  return { webp, jpg };
}

export function PhrasalImage({
  src,
  alt,
  phrase,
  className = "",
  variant = "full",
}: PhrasalImageProps) {
  const [failed, setFailed] = useState(false);
  const { webp, jpg } = resolveSources(src, variant);

  if (failed) {
    return (
      <div className={`phrasal-fallback ${className}`} aria-label={alt}>
        <span className="phrasal-fallback-icon">📚</span>
        <span className="phrasal-fallback-text">{phrase}</span>
      </div>
    );
  }

  return (
    <picture className={className ? `phrasal-picture ${className}` : "phrasal-picture"}>
      <source type="image/webp" srcSet={webp} />
      <img
        src={jpg}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        fetchPriority={variant === "full" ? "high" : "auto"}
        onError={() => setFailed(true)}
      />
    </picture>
  );
}
