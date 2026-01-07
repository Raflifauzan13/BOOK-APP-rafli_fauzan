import { useState } from "react";

interface BookCoverProps {
  src: string;
  alt: string;
}

const BookCover = ({ src, alt }: BookCoverProps) => {
  const [idx, setIdx] = useState(0);

  const makeCandidates = (srcVal: string, title: string) => {
    const candidates: string[] = [];
    const clean = (s: string) => s.replace(/[\\/:*?"<>|]/g, "").trim();
    const base = clean(title);
    if (base) {
      const encoded = encodeURIComponent(base);
      const lower = base.toLowerCase();
      const hyphen = lower.replace(/\s+/g, "-");
      const underscore = lower.replace(/\s+/g, "_");
      const exts = ["webp", "jpg", "jpeg", "png"];
      for (const ext of exts) {
        candidates.push(`/cover/${base}.${ext}`);
        candidates.push(`/cover/${encoded}.${ext}`);
        candidates.push(`/cover/${lower}.${ext}`);
        candidates.push(`/cover/${hyphen}.${ext}`);
        candidates.push(`/cover/${underscore}.${ext}`);
      }
      candidates.push(`/cover/${base}`);
      candidates.push(`/cover/${encoded}`);
      candidates.push(`/cover/${lower}`);
      candidates.push(`/cover/${hyphen}`);
    }
    if (srcVal) candidates.push(srcVal);
    candidates.push("https://via.placeholder.com/300x450?text=No+Cover");
    return Array.from(new Set(candidates));
  };

  const candidates = makeCandidates(src, alt);
  const current = candidates[Math.min(idx, candidates.length - 1)];

  return (
    <img
      src={current}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => {
        if (idx < candidates.length - 1) setIdx((i) => i + 1);
      }}
    />
  );
};

export default BookCover;
