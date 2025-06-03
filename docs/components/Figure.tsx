import React from "react";

interface FigureProps {
  src: string;
  alt: string;
  caption: string;
}

export default function Figure({ src, alt, caption }: FigureProps) {
  return (
    <figure className="figure">
      <img src={src} alt={alt} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
