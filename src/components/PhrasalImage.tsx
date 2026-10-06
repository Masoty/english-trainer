import { useState } from "react";

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

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
