import React from "react";

export default function Marquee({
  items,
  duration,
  reverse,
  itemClass,
  sep,
}: {
  items: string[];
  duration: number;
  reverse?: boolean;
  itemClass: string;
  sep: string;
}) {
  const loop = [...items, ...items, ...items];
  return (
    <div className={`marquee ${reverse ? "reverse" : ""}`} style={{ animationDuration: `${duration}s` }}>
      {[...loop, ...loop].map((t, i) => (
        <span key={i} dir="rtl" className={`flex shrink-0 items-center gap-8 whitespace-nowrap pr-8 ${itemClass}`}>
          {t}
          <span className={`text-[0.5em] ${sep}`}>✦</span>
        </span>
      ))}
    </div>
  );
}
