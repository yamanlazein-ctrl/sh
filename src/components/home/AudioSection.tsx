"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCw, RotateCcw, X, Search } from "lucide-react";
import { TRACKS, waveform, fmt } from "@/app/home-media";
import { norm, tokenize, highlight } from "@/app/home-data";
import Reveal, { useInView } from "./Reveal";

const SPEEDS = [1, 1.25, 1.5, 2];

export default function AudioSection() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [inView, setInView] = useState(false);
  const [miniClosed, setMiniClosed] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLElement | null>(null);
  const { ref: waveRef, inView: waveIn } = useInView<HTMLDivElement>("0px 0px -10% 0px");

  const track = TRACKS[idx];
  const bars = useMemo(() => waveform(track.id), [track.id]);
  const progress = Math.min(time / track.duration, 1);

  const tokens = useMemo(() => tokenize(q), [q]);
  const filtered = useMemo(
    () =>
      TRACKS.map((t, i) => ({ t, i })).filter(({ t }) => {
        if (tokens.length === 0) return true;
        const hay = norm(`${t.title} ${t.series} ${t.place}`);
        return tokens.every((k) => hay.includes(k));
      }),
    [tokens]
  );

  // Simulated playback (preview — real audio files are uploaded later)
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTime((t) => {
        const next = t + 0.25 * speed * 8;
        if (next >= track.duration) {
          setPlaying(false);
          return track.duration;
        }
        return next;
      });
    }, 250);
    return () => clearInterval(id);
  }, [playing, speed, track.duration]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pick = (i: number) => {
    if (i === idx) setPlaying((p) => !p);
    else {
      setIdx(i);
      setTime(0);
      setPlaying(true);
    }
    setMiniClosed(false);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const ratio = (r.right - e.clientX) / r.width; // RTL: fills from the right
    setTime(Math.max(0, Math.min(1, ratio)) * track.duration);
  };

  const skip = (d: number) => setTime((t) => Math.max(0, Math.min(track.duration, t + d)));

  return (
    <section id="audio" ref={ref} className="scroll-mt-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal variant="curtain" className="mb-12">
          <p className="text-base text-[#D4AF6A]">الصوتيات</p>
          <h2 className="font-display mt-2 text-4xl leading-tight sm:text-6xl">
            استمِع وأنت
            <br />
            في طريقك.
          </h2>
        </Reveal>

        {/* Player */}
        <Reveal variant="up" className="grid items-center gap-10 rounded-[2rem] border border-white/10 bg-[#12100a] p-6 sm:p-10 lg:grid-cols-12">
          {/* Disc */}
          <div className="flex justify-center lg:col-span-4">
            <Reveal variant="spin" delay={0.25} className="relative aspect-square w-full max-w-[260px]">
              <div
                className="disc absolute inset-0 rounded-full border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
                style={{
                  animationPlayState: playing ? "running" : "paused",
                  background: "repeating-radial-gradient(circle at center, #111 0 2px, #161616 2px 4px), #111",
                }}
              >
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_20deg,transparent_0deg,rgba(255,255,255,0.08)_40deg,transparent_80deg,transparent_200deg,rgba(255,255,255,0.06)_240deg,transparent_280deg)]" />
                <div className="absolute inset-[34%] grid place-items-center rounded-full bg-[#D4AF6A]">
                  <span className="font-display text-3xl text-black">ص</span>
                </div>
                <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
              </div>
            </Reveal>
          </div>

          {/* Info + waveform */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 text-base">
              <span className="rounded-full bg-[#D4AF6A]/15 px-3 py-1 text-[#D4AF6A]">{track.series}</span>
              <span className="text-white/65">{track.place}</span>
            </div>
            <h3 key={track.id} className="rise font-display mt-4 text-3xl sm:text-5xl">{track.title}</h3>

            <div
              ref={waveRef}
              onClick={seek}
              className="group mt-8 flex h-24 cursor-pointer items-center gap-[3px]"
              role="slider"
              aria-label="موضع التشغيل"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
            >
              {bars.map((h, i) => {
                const filled = i / bars.length < progress;
                return (
                  <span
                    key={`${track.id}-${i}`}
                    className={`flex-1 rounded-full ${filled ? "bg-[#D4AF6A]" : "bg-white/20 group-hover:bg-white/30"}`}
                    style={{
                      height: waveIn ? `${h * 100}%` : "6%",
                      transition: `height 0.7s cubic-bezier(.2,.7,.1,1) ${i * 0.012}s, background-color 0.2s`,
                    }}
                  />
                );
              })}
            </div>

            <div className="mt-3 flex justify-between font-sans text-sm tabular-nums text-white/65" dir="ltr">
              <span>{fmt(time)}</span>
              <span>{fmt(track.duration)}</span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button onClick={() => skip(15)} className="grid h-12 w-12 place-items-center rounded-full border border-white/20 text-white/80 hover:text-white" aria-label="تقديم ١٥ ثانية">
                <RotateCw className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setPlaying((p) => !p);
                  setMiniClosed(false);
                }}
                className="grid h-16 w-16 place-items-center rounded-full bg-[#D4AF6A] text-black transition hover:scale-105"
                aria-label={playing ? "إيقاف" : "تشغيل"}
              >
                {playing ? <Pause className="h-7 w-7 fill-black" /> : <Play className="h-7 w-7 translate-x-[-2px] fill-black" />}
              </button>
              <button onClick={() => skip(-15)} className="grid h-12 w-12 place-items-center rounded-full border border-white/20 text-white/80 hover:text-white" aria-label="رجوع ١٥ ثانية">
                <RotateCcw className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
                className="min-h-11 rounded-full border border-white/20 px-4 font-sans text-base tabular-nums text-white/80 hover:text-white"
                aria-label="سرعة التشغيل"
              >
                {speed}×
              </button>
              <span className="mr-auto hidden text-sm text-white/55 sm:block">معاينة — الملفات الصوتية تُرفع لاحقاً</span>
            </div>
          </div>
        </Reveal>

        {/* Track list with its own search */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg text-white/85">
            كل التسجيلات <span className="text-white/55">({filtered.length})</span>
          </p>
          <div className="w-full sm:w-80">
            <label htmlFor="audio-search" className="sr-only">ابحث في الصوتيات</label>
            <div className="flex h-12 items-center gap-2 rounded-2xl border border-white/15 bg-[#12100a] px-3 focus-within:border-[#D4AF6A]">
              <Search className="h-5 w-5 shrink-0 text-white/60" />
              <input
                id="audio-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث في الصوتيات: سورة، خطبة، مكان…"
                className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/45 [&::-webkit-search-cancel-button]:hidden"
              />
              {q && (
                <button onClick={() => setQ("")} className="grid h-9 w-9 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white" aria-label="مسح">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 py-10 text-center">
            <p className="text-base text-white/80">لا توجد تسجيلات بهذا الاسم.</p>
            <button onClick={() => setQ("")} className="mt-3 min-h-10 rounded-full border border-white/20 px-4 text-sm hover:border-[#D4AF6A]">
              عرض كل التسجيلات
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-x-10 sm:grid-cols-2">
            {filtered.map(({ t: tr, i }, k) => {
              const on = i === idx;
              return (
                <Reveal key={tr.id} variant="up" delay={Math.min(k, 7) * 0.05}>
                  <button onClick={() => pick(i)} className="group flex w-full items-center gap-4 border-b border-white/10 py-4 text-right">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 transition group-hover:border-[#D4AF6A]">
                      {on && playing ? (
                        <span className="eq flex items-end gap-[2px]">
                          <span />
                          <span />
                          <span />
                        </span>
                      ) : (
                        <Play className={`h-4 w-4 translate-x-[-1px] ${on ? "fill-[#D4AF6A] text-[#D4AF6A]" : "text-white/70"}`} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-lg ${on ? "text-[#D4AF6A]" : "text-white/90"}`}>
                        {highlight(tr.title, tokens).map((p, j) =>
                          p.hit ? (
                            <mark key={j} className="rounded bg-[#D4AF6A]/25 px-0.5 text-[#D4AF6A]">{p.text}</mark>
                          ) : (
                            <span key={j}>{p.text}</span>
                          )
                        )}
                      </span>
                      <span className="block truncate text-sm text-white/60">
                        {tr.series} · {tr.place}
                      </span>
                    </span>
                    <span className="font-sans text-sm tabular-nums text-white/60">{fmt(tr.duration)}</span>
                  </button>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      {/* Mini player — follows the visitor while scrolling */}
      {playing && !inView && !miniClosed && (
        <div className="rise fixed bottom-24 left-1/2 z-50 w-[min(92vw,460px)] -translate-x-1/2 lg:bottom-5">
          <div className="flex items-center gap-3 overflow-hidden rounded-full border border-white/15 bg-[#0E0E0E]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            <button onClick={() => setPlaying(false)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#D4AF6A] text-black" aria-label="إيقاف">
              <Pause className="h-4 w-4 fill-black" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base">{track.title}</p>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-[#D4AF6A]" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
            <span className="eq flex items-end gap-[2px] px-1">
              <span />
              <span />
              <span />
            </span>
            <button onClick={() => setMiniClosed(true)} className="grid h-10 w-10 place-items-center rounded-full text-white/60 hover:text-white" aria-label="إخفاء المشغّل">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
