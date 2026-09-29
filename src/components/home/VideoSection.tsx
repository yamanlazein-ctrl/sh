"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Play, X, Search } from "lucide-react";
import { VIDEOS, VIDEO_SERIES } from "@/app/home-media";
import { norm, tokenize, highlight } from "@/app/home-data";
import Reveal from "./Reveal";

export default function VideoSection() {
  const [series, setSeries] = useState("الكل");
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState(VIDEOS[0].id);
  const [playing, setPlaying] = useState(false);

  const tokens = useMemo(() => tokenize(q), [q]);
  const list = useMemo(
    () =>
      VIDEOS.filter((v) => series === "الكل" || v.series === series).filter((v) => {
        if (tokens.length === 0) return true;
        const hay = norm(`${v.title} ${v.series}`);
        return tokens.every((t) => hay.includes(t));
      }),
    [series, tokens]
  );

  useEffect(() => {
    if (list.length && !list.some((v) => v.id === activeId)) setActiveId(list[0].id);
    setPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const v = VIDEOS.find((x) => x.id === activeId) || VIDEOS[0];

  return (
    <section id="videos" className="scroll-mt-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal variant="wipe">
            <p className="text-base text-[#E8E3D7]">المرئيات</p>
            <h2 className="font-display mt-2 text-4xl leading-tight sm:text-6xl">
              شاهِد الشيخ
              <br />
              يشرح بنفسه.
            </h2>
          </Reveal>
          <Reveal variant="up" delay={0.15} className="flex flex-wrap gap-2">
            {VIDEO_SERIES.map((s) => (
              <button
                key={s}
                onClick={() => setSeries(s)}
                className={`min-h-10 rounded-full border px-4 text-base transition ${
                  series === s ? "border-[#E8E3D7] bg-[#E8E3D7] text-black" : "border-white/15 text-white/70 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </Reveal>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Featured player */}
          <Reveal variant="tilt" className="lg:col-span-8">
            <div className="sweep-hover group relative aspect-video rounded-3xl border border-white/10 bg-[#0f0f0f]">
              {playing && v.youtubeId ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`}
                  title={v.title}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    key={v.id}
                    src={v.poster}
                    alt={v.title}
                    className="rise absolute inset-0 h-full w-full object-cover grayscale transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />

                  <span className="absolute right-5 top-5 rounded-full bg-black/70 px-3 py-1 text-sm text-white/90 backdrop-blur">يوتيوب · {v.duration}</span>

                  <button
                    onClick={() => setPlaying(true)}
                    className="ring-pulse absolute left-1/2 top-1/2 z-10 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#E8E3D7] text-black transition hover:scale-110"
                    aria-label={`تشغيل: ${v.title}`}
                  >
                    <Play className="h-8 w-8 translate-x-[-2px] fill-black" />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <p className="text-base text-[#E8E3D7]">{v.series}</p>
                    <h3 className="font-display mt-1 text-2xl sm:text-4xl">{v.title}</h3>
                    <p className="mt-2 text-sm text-white/70">{v.views}</p>
                  </div>

                  {playing && !v.youtubeId && (
                    <div className="absolute inset-0 z-20 grid place-items-center bg-black/85 p-6 text-center backdrop-blur-sm">
                      <div>
                        <p className="font-display text-2xl">هنا يُعرض الفيديو من يوتيوب</p>
                        <p className="mt-2 text-base text-white/70">معاينة تصميم — يُضاف رابط الفيديو من لوحة الإدارة</p>
                        <button onClick={() => setPlaying(false)} className="mx-auto mt-6 flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-base hover:border-[#E8E3D7]">
                          <X className="h-4 w-4" /> رجوع
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </Reveal>

          {/* Playlist with its own small search */}
          <Reveal variant="left" delay={0.2} className="lg:col-span-4">
            <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0f0f0f]">
              <div className="border-b border-white/10 p-3">
                <label htmlFor="video-search" className="sr-only">ابحث في المرئيات</label>
                <div className="flex h-12 items-center gap-2 rounded-2xl border border-white/15 bg-black px-3 focus-within:border-[#E8E3D7]">
                  <Search className="h-5 w-5 shrink-0 text-white/60" />
                  <input
                    id="video-search"
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="ابحث في المرئيات…"
                    className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/45 [&::-webkit-search-cancel-button]:hidden"
                  />
                  {q && (
                    <button onClick={() => setQ("")} className="grid h-9 w-9 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white" aria-label="مسح">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mt-2 px-1 text-sm text-white/60">{list.length} مقاطع</p>
              </div>

              <div className="flex-1 overflow-y-auto p-2 lg:max-h-[400px]">
                {list.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <p className="text-base text-white/80">لا توجد مقاطع بهذا الاسم.</p>
                    <button onClick={() => { setQ(""); setSeries("الكل"); }} className="mt-3 min-h-10 rounded-full border border-white/20 px-4 text-sm hover:border-[#E8E3D7]">
                      عرض كل المقاطع
                    </button>
                  </div>
                ) : (
                  list.map((item, i) => {
                    const on = item.id === v.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveId(item.id);
                          setPlaying(false);
                        }}
                        className={`relative flex w-full items-center gap-3 rounded-2xl p-2.5 text-right transition ${on ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"}`}
                      >
                        {on && <span className="absolute inset-y-3 right-0 w-[3px] rounded-full bg-[#E8E3D7]" />}
                        <span className="w-5 text-center font-sans text-sm text-white/55">{on ? "▶" : i + 1}</span>
                        <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl">
                          <img src={item.poster} alt="" className={`h-full w-full object-cover ${on ? "" : "grayscale"}`} />
                          <span className="absolute bottom-1 left-1 rounded bg-black/80 px-1.5 font-sans text-xs">{item.duration}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`line-clamp-2 text-base leading-snug ${on ? "text-white" : "text-white/80"}`}>
                            {highlight(item.title, tokens).map((p, k) =>
                              p.hit ? (
                                <mark key={k} className="rounded bg-[#E8E3D7]/25 px-0.5 text-[#E8E3D7]">{p.text}</mark>
                              ) : (
                                <span key={k}>{p.text}</span>
                              )
                            )}
                          </span>
                          <span className="mt-1 block text-sm text-white/55">{item.series}</span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
