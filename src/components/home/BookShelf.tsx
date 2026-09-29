"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, ChevronLeft, BookOpen, ShoppingBag, Hand } from "lucide-react";
import { BOOKS, type Book, type Tone } from "@/app/home-media";
import Reveal, { useInView } from "./Reveal";

const TONE: Record<Tone, { bg: string; fg: string; line: string; edge: string }> = {
  gold: { bg: "#D4AF6A", fg: "#0a0806", line: "rgba(10,8,6,0.25)", edge: "#B8934C" },
  cream: { bg: "#F2EDDD", fg: "#0a0806", line: "rgba(10,8,6,0.18)", edge: "#d6cfbb" },
  black: { bg: "#14110b", fg: "#F5F0E3", line: "rgba(245,240,227,0.2)", edge: "#000" },
  gray: { bg: "#1c1812", fg: "#F5F0E3", line: "rgba(245,240,227,0.2)", edge: "#0a0806" },
};

const pad = (n: number) => String(n).padStart(2, "0");

function Cover({ b, active }: { b: Book; active: boolean }) {
  const t = TONE[b.tone];
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between rounded-l-md rounded-r-[3px] p-6"
      style={{
        background: t.bg,
        color: t.fg,
        border: b.tone === "black" ? "1px solid rgba(255,255,255,0.14)" : undefined,
        boxShadow: active
          ? `-7px 7px 0 -2px ${t.edge}, 0 40px 70px rgba(0,0,0,0.75), 0 0 0 2px rgba(212,175,106,0.9)`
          : `-6px 6px 0 -2px ${t.edge}, 0 30px 50px rgba(0,0,0,0.7)`,
      }}
    >
      <span className="pointer-events-none absolute inset-y-0 right-0 w-4 rounded-r-[3px] bg-gradient-to-l from-black/25 to-transparent" />
      <div>
        <p className="text-xs opacity-70">محمد علي الصابوني</p>
        <span className="mt-2 block h-px w-10" style={{ background: t.line }} />
      </div>
      <h3 className="font-display text-[1.7rem] leading-[1.2] sm:text-[2.1rem]">{b.title}</h3>
      <div className="flex items-end justify-between">
        <span className="text-xs opacity-70">{b.volumes}</span>
        <span className="font-display grid h-9 w-9 place-items-center rounded-full border text-base" style={{ borderColor: t.line }}>
          ص
        </span>
      </div>
    </div>
  );
}

export default function BookShelf({ onRead }: { onRead: (itemId?: number) => void }) {
  const [sel, setSel] = useState(0);
  const [entered, setEntered] = useState(false);
  const { ref: stageRef, inView } = useInView<HTMLDivElement>("0px 0px -20% 0px");
  const drag = useRef<number | null>(null);
  const moved = useRef(false);
  const b = BOOKS[sel];

  useEffect(() => {
    if (!inView) return;
    const id = setTimeout(() => setEntered(true), 1300);
    return () => clearTimeout(id);
  }, [inView]);

  const go = (d: number) => setSel((s) => Math.min(BOOKS.length - 1, Math.max(0, s + d)));

  return (
    <section id="books" className="scroll-mt-24 overflow-x-clip border-t border-white/10">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal variant="blur" className="flex flex-col items-center text-center">
          <p className="text-base text-[#D4AF6A]">المكتبة</p>
          <h2 className="font-display mt-2 text-4xl sm:text-6xl">مؤلفات الشيخ</h2>
          <p className="mt-4 max-w-xl text-lg text-white/70">تصفّح الكتب كما تتصفّحها في مكتبة حقيقية، واضغط على أي كتاب لتقرأ نبذة عنه.</p>
        </Reveal>

        {/* 3D gallery stage */}
        <div
          ref={stageRef}
          tabIndex={0}
          role="region"
          aria-roledescription="معرض كتب"
          aria-label={`الكتاب ${sel + 1} من ${BOOKS.length}: ${b.title}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") go(1);
            if (e.key === "ArrowRight") go(-1);
            if (e.key === "Enter") onRead(b.itemId);
          }}
          onPointerDown={(e) => (drag.current = e.clientX)}
          onPointerUp={(e) => {
            if (drag.current === null) return;
            const dx = e.clientX - drag.current;
            drag.current = null;
            moved.current = Math.abs(dx) > 45;
            if (dx > 45) go(1);
            else if (dx < -45) go(-1);
          }}
          className="relative mx-auto mt-14 h-[330px] touch-pan-y select-none [--gap:118px] [perspective:1800px] sm:h-[400px] sm:[--gap:180px]"
        >
          {/* floor glow */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-16 w-[70%] -translate-x-1/2 rounded-[50%] bg-[#D4AF6A]/10 blur-2xl" />

          {BOOKS.map((bk, i) => {
            const off = i - sel;
            const a = Math.abs(off);
            const hidden = a > 3;
            const placed = `translateX(calc(var(--gap) * ${-off})) translateZ(${-140 * a}px) rotateY(${off === 0 ? 0 : off > 0 ? 38 : -38}deg) scale(${off === 0 ? 1 : 0.86})`;
            const stacked = "translateX(0) translateZ(-420px) rotateY(0deg) scale(0.7)";
            return (
              <button
                key={bk.id}
                onClick={() => {
                  if (moved.current) {
                    moved.current = false;
                    return;
                  }
                  if (off === 0) onRead(bk.itemId);
                  else setSel(i);
                }}
                tabIndex={-1}
                aria-hidden={off !== 0}
                className="absolute left-1/2 top-2 h-[270px] w-[190px] -ml-[95px] [transform-style:preserve-3d] sm:h-[340px] sm:w-[240px] sm:-ml-[120px]"
                style={{
                  transform: inView ? placed : stacked,
                  opacity: !inView || hidden ? 0 : 1 - a * 0.16,
                  zIndex: 100 - a,
                  pointerEvents: hidden ? "none" : "auto",
                  transition: "transform 0.9s cubic-bezier(.2,.7,.1,1), opacity 0.7s ease",
                  transitionDelay: entered ? "0s" : `${0.15 + a * 0.1}s`,
                  filter: off === 0 ? "none" : "brightness(0.7)",
                }}
              >
                <Cover b={bk} active={off === 0} />
              </button>
            );
          })}
        </div>

        {/* controls */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => go(-1)}
            disabled={sel === 0}
            className="flex h-12 items-center gap-2 rounded-full border border-white/20 px-5 text-base transition hover:border-[#D4AF6A] disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" /> السابق
          </button>
          <span className="font-sans min-w-[4.5rem] text-center text-base tabular-nums text-white/70" dir="ltr">
            {pad(sel + 1)} / {pad(BOOKS.length)}
          </span>
          <button
            onClick={() => go(1)}
            disabled={sel === BOOKS.length - 1}
            className="flex h-12 items-center gap-2 rounded-full border border-white/20 px-5 text-base transition hover:border-[#D4AF6A] disabled:opacity-30"
          >
            التالي <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 flex items-center justify-center gap-2 text-sm text-white/55 sm:hidden">
          <Hand className="h-4 w-4" /> اسحب يميناً أو يساراً للتنقل
        </p>

        {/* details of the selected book */}
        <div key={b.id} className="rise mx-auto mt-10 max-w-3xl text-center">
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {[b.field, b.volumes, b.pages].filter((c) => c !== "—").map((c) => (
              <span key={c} className="rounded-full border border-white/20 px-3 py-1 text-white/75">
                {c}
              </span>
            ))}
          </div>
          <h3 className="font-display mt-5 text-3xl leading-tight sm:text-4xl">{b.title}</h3>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/70">{b.desc}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button onClick={() => onRead(b.itemId)} className="flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-base font-bold text-black transition hover:bg-[#D4AF6A]">
              <BookOpen className="h-5 w-5" /> اقرأ نبذة
            </button>
            <a href="#store" className="flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-base font-bold transition hover:border-[#D4AF6A] hover:text-[#D4AF6A]">
              <ShoppingBag className="h-5 w-5" /> اطلب نسخة مطبوعة
            </a>
          </div>
        </div>

        {/* quick index of all titles */}
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {BOOKS.map((bk, i) => (
            <button
              key={bk.id}
              onClick={() => setSel(i)}
              aria-current={i === sel}
              className={`min-h-10 rounded-full border px-4 text-sm transition ${
                i === sel ? "border-[#D4AF6A] bg-[#D4AF6A] text-black" : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
              }`}
            >
              {bk.short}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
