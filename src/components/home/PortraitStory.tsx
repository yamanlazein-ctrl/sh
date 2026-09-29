"use client";

import React, { useEffect, useRef, useState } from "react";
import CountUp from "./CountUp";
import { usePrefs } from "./prefs";

// جملة وصفية (ليست اقتباساً منسوباً للشيخ) — يمكن استبدالها لاحقاً بقول موثّق من كلامه
const LINE = "كرّس حياته ليصل معنى القرآن إلى كل بيت، فكتب بلغةٍ يفهمها العالِم والعامّي معاً.";
const WORDS = LINE.split(" ");
const KEY_WORDS = new Set(["القرآن", "بيت،", "العالِم", "والعامّي"]);

const STATS = [
  { n: 50, t: "كتاباً ومؤلَّفاً" },
  { n: 3400, t: "فتوى محرّرة" },
  { n: 600, t: "مقال وبحث" },
  { n: 850, t: "درس وخطبة" },
];

export default function PortraitStory() {
  const { prefs } = usePrefs();
  const wrap = useRef<HTMLElement | null>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      setP(travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const progress = prefs.calm ? 1 : p;
  // words finish lighting at ~75% so the full sentence rests on screen before leaving
  const lit = Math.ceil(Math.min(1, progress / 0.75) * WORDS.length);
  const scale = 1.18 - 0.18 * progress;
  const statsOn = progress > 0.55;

  return (
    <section ref={wrap} className="relative h-[190vh] border-t border-white/10" aria-labelledby="story-title">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* Portrait background — only in this section */}
        <img
          src="/images/sheikh-portrait.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[50%_20%] grayscale"
          style={{ transform: `scale(${scale})`, willChange: "transform" }}
        />
        <div className="absolute inset-0 bg-[#E8E3D7] opacity-[0.16] mix-blend-color" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/55 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,rgba(0,0,0,0.25),rgba(0,0,0,0.85))]" />

        {/* thin progress rail */}
        <div className="absolute inset-y-24 right-5 w-px bg-white/15 sm:right-8" aria-hidden>
          <div className="w-full bg-[#E8E3D7]" style={{ height: `${progress * 100}%` }} />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-8 text-center sm:px-12">
          <p className="text-base text-[#E8E3D7]">إرث عالِم واحد · في مكانٍ واحد</p>
          <h2 id="story-title" className="font-display mt-6 text-[2rem] leading-[1.45] sm:text-5xl md:text-6xl">
            {WORDS.map((w, i) => {
              const on = i < lit;
              return (
                <span
                  key={i}
                  className={`inline-block transition-all duration-500 ${on ? (KEY_WORDS.has(w) ? "text-[#E8E3D7]" : "text-white") : "text-white/15"}`}
                  style={{ transform: on ? "translateY(0)" : "translateY(0.12em)" }}
                >
                  {w}
                  {i < WORDS.length - 1 ? "\u00A0" : ""}
                </span>
              );
            })}
          </h2>
          <p className={`mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80 transition-opacity duration-700 ${progress > 0.4 ? "opacity-100" : "opacity-0"}`}>
            جمعنا ما تفرّق من كتبه وفتاواه ودروسه بين عشرات المواقع، وصنّفناه، وجعلناه قابلاً للبحث في ثوانٍ.
          </p>
        </div>

        {/* Stats glass strip */}
        <div className="relative z-10 mx-auto mb-8 w-full max-w-5xl px-5 sm:mb-12">
          <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-white/15 bg-black/45 backdrop-blur-md sm:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.t}
                className="border-white/10 p-5 text-right transition-all duration-700 [&:not(:first-child)]:sm:border-r"
                style={{
                  opacity: statsOn ? 1 : 0,
                  transform: statsOn ? "translateY(0)" : "translateY(24px)",
                  transitionDelay: `${i * 0.1}s`,
                }}
              >
                <p className="text-sm text-white/70">أكثر من</p>
                <p className="font-sans text-4xl font-black tabular-nums tracking-tight" dir="ltr" style={{ textAlign: "right" }}>
                  {statsOn ? <CountUp to={s.n} /> : "0"}
                </p>
                <p className="mt-1 text-base text-white/90">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
