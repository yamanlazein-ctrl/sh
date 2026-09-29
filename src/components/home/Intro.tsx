"use client";

import React, { useEffect, useRef, useState } from "react";
import Marquee from "./Marquee";
import { readStoredPrefs } from "./prefs";

const ROW_A = ["صفوة التفاسير", "روائع البيان", "المواريث", "التبيان", "من كنوز السنة"];
const ROW_B = ["فتوى", "درس", "خطبة", "مقال", "كتاب", "تسجيل"];
const STEPS = ["الكتب", "الفتاوى", "الدروس", "المرئيات", "الأرشيف جاهز"];

const TOTAL = 2100; // counting phase
const EXIT = 900; // curtain phase

export default function Intro({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setExiting(true);
    onDone(); // hero starts revealing as the curtain opens
    setTimeout(() => setGone(true), EXIT);
  };

  useEffect(() => {
    // Show only once per visit, and never when the visitor asked for less motion
    let seen = false;
    try {
      seen = sessionStorage.getItem("sabuni-intro") === "1";
      sessionStorage.setItem("sabuni-intro", "1");
    } catch {}
    const calm = readStoredPrefs().calm;
    if (seen || calm) {
      finished.current = true;
      onDone();
      setGone(true);
      return;
    }
    document.body.style.overflow = "hidden";
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / TOTAL, 1);
      setPct(Math.round(100 * (1 - Math.pow(1 - p, 2.2))));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(finish, 180);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (exiting) document.body.style.overflow = "";
  }, [exiting]);

  if (gone) return null;

  const step = STEPS[Math.min(Math.floor((pct / 100) * STEPS.length), STEPS.length - 1)];

  return (
    <div className={`fixed inset-0 z-[80] ${exiting ? "intro-exit pointer-events-none" : ""}`} aria-hidden>
      {/* curtain halves */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 bg-ink transition-transform ease-[cubic-bezier(.7,0,.2,1)]"
        style={{ transitionDuration: `${EXIT}ms`, transform: exiting ? "translateY(-100%)" : "translateY(0)" }}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-[#E8E3D7]/40" />
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-ink transition-transform ease-[cubic-bezier(.7,0,.2,1)]"
        style={{ transitionDuration: `${EXIT}ms`, transform: exiting ? "translateY(100%)" : "translateY(0)" }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-[#E8E3D7]/40" />
      </div>

      {/* content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
        {/* faint moving rows behind the letter */}
        <div className="intro-fade absolute inset-x-0 top-[18%] opacity-[0.12]" style={{ animationDelay: "0.3s" }} dir="ltr">
          <Marquee items={ROW_A} duration={14} itemClass="font-display text-5xl text-white sm:text-7xl" sep="text-white/50" />
        </div>
        <div className="intro-fade absolute inset-x-0 bottom-[18%] opacity-[0.12]" style={{ animationDelay: "0.45s" }} dir="ltr">
          <Marquee items={ROW_B} reverse duration={12} itemClass="font-display text-stroke text-5xl sm:text-7xl" sep="text-white/50" />
        </div>

        <span className="intro-letter font-display relative select-none text-[11rem] leading-none text-[#E8E3D7] sm:text-[16rem]">ص</span>

        <p className="intro-fade font-display mt-2 text-2xl text-white sm:text-3xl" style={{ animationDelay: "0.55s" }}>
          الصابوني
        </p>
        <p className="intro-fade mt-2 text-xs tracking-[0.3em] text-white/55" style={{ animationDelay: "0.7s" }}>
          الأرشيف العلمي
        </p>
      </div>

      {/* bottom bar: counter + step + progress line */}
      <div className="intro-fade absolute inset-x-0 bottom-0 px-6 pb-6 sm:px-10 sm:pb-8" style={{ animationDelay: "0.4s" }}>
        <div className="flex items-end justify-between">
          <span className="text-sm text-white/50">
            نفتح لك: <span className="text-white">{step}</span>
          </span>
          <span className="font-sans text-5xl font-black tabular-nums text-white sm:text-7xl" dir="ltr">
            {pct}
            <span className="text-[#E8E3D7]">%</span>
          </span>
        </div>
        <div className="mt-4 h-px w-full bg-white/10">
          <div className="h-full origin-right bg-[#E8E3D7]" style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      </div>

      {!exiting && (
        <button
          onClick={finish}
          className="intro-fade absolute left-6 top-6 rounded-full border border-white/15 px-4 py-1.5 text-xs text-white/60 transition hover:border-[#E8E3D7] hover:text-white sm:left-10 sm:top-8"
          style={{ animationDelay: "0.8s" }}
        >
          تخطّي
        </button>
      )}
    </div>
  );
}
