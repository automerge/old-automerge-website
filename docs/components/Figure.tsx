import React from "react";

interface FigureProps {
  src: string;
  alt: string;
  caption: string;
  type: "video" | "img";
}

export default function Figure({ src, alt, caption, type }: FigureProps) {
  if (type === "video") {
    return (
      <figure className="figure">
        <video src={src} />
        <figcaption>{caption}</figcaption>
      </figure>
    );
  } else {
    return (
      <figure className="figure">
        <img src={src} alt={alt} />
        <figcaption>{caption}</figcaption>
      </figure>
    );
  }
}
