"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Check, Search, Scale, Volume2 } from "lucide-react";
import { ITEMS, type ArchiveItem } from "@/app/home-data";
import Reveal from "./Reveal";

const FATWAS = ITEMS.filter((i) => i.type === "fatwa");
const pad = (n: number) => String(n).padStart(2, "0");

const EXAMPLES = ["حكم تأخير الصلاة؟", "متى تجب الزكاة؟", "ميراث البنات؟"];

const READ_STEPS = [
  { n: "١", t: "اقرأ الخلاصة أولاً" },
  { n: "٢", t: "راجع الباب والتصنيف" },
  { n: "٣", t: "افتح النص الكامل عند الحاجة" },
];

export default function FatwaSection({ onOpen, onAsk }: { onOpen: (i: ArchiveItem) => void; onAsk: (q: string) => void }) {
  const cats = useMemo(() => {
    const map = new Map<string, number>();
    FATWAS.forEach((f) => map.set(f.meta, (map.get(f.meta) || 0) + 1));
    return [
      { name: "الكل", count: FATWAS.length },
      ...Array.from(map.entries()).map(([name, count]) => ({ name, count })),
    ];
  }, []);

  const [cat, setCat] = useState("الكل");
  const [feat, setFeat] = useState(0);
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);

  const list = cat === "الكل" ? FATWAS : FATWAS.filter((f) => f.meta === cat);
  const featured = list[Math.min(feat, Math.max(list.length - 1, 0))] || FATWAS[0];
  const grid = list.filter((f) => f.id !== featured?.id);

  const goFeat = (d: number) => {
    if (list.length === 0) return;
    setFeat((i) => (i + d + list.length) % list.length);
  };

  const copySummary = async () => {
    if (!featured) return;
    await navigator.clipboard.writeText(`${featured.title}\n\n${featured.excerpt}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const speak = () => {
    if (!featured || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`${featured.title}. ${featured.excerpt}`);
    u.lang = "ar-SA";
    window.speechSynthesis.speak(u);
  };

  return (
    <section id="fatwas" className="-mt-px scroll-mt-24 bg-[#E6DFD0] text-[#111]">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-14">
        {/* Header */}
        <Reveal variant="blur" className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 text-sm text-[#111]/55">
            <Scale className="h-4 w-4 text-[#F8E008]" />
            ديوان الفتوى — أجوبة محرّرة بلغة واضحة
          </p>
          <h2 className="font-display mt-4 text-4xl leading-tight sm:text-5xl md:text-6xl">
            اسأل كما تتكلّم…
            <br />
            وخذ الجواب.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#111]/65 sm:text-lg">
            فتاوى مصنّفة في أبوابها، وكل جواب يبدأ بخلاصة واضحة ثم التفصيل عند الحاجة.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#111]/60">
            <span>
              <span className="font-sans font-black text-[#111]" dir="ltr">
                +3,400
              </span>{" "}
              فتوى في الأرشيف
            </span>
            <span className="hidden h-4 w-px bg-[#111]/20 sm:block" aria-hidden />
            <span>
              <span className="font-sans font-black text-[#111]">{cats.length - 1}</span> أبواب فقهية
            </span>
          </div>
        </Reveal>

        {/* Category pills */}
        <Reveal variant="up" delay={0.1} className="mt-10 flex flex-wrap justify-center gap-2">
          {cats.map((c) => {
            const on = cat === c.name;
            return (
              <button
                key={c.name}
                onClick={() => {
                  setCat(c.name);
                  setFeat(0);
                }}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition ${
                  on
                    ? "border-[#111] bg-[#111] text-white"
                    : "border-[#111]/15 bg-white text-[#111]/70 hover:border-[#111]/35 hover:text-[#111]"
                }`}
              >
                {c.name}
                <span
                  className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold ${
                    on ? "bg-[#F8E008] text-black" : "bg-[#111]/8 text-[#111]/70"
                  }`}
                >
                  {c.count}
                </span>
              </button>
            );
          })}
        </Reveal>

        {/* Featured fatwa card */}
        {featured && (
          <Reveal variant="up" delay={0.15} className="relative mt-12">
            <button
              type="button"
              onClick={() => goFeat(-1)}
              className="absolute -right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#111]/10 bg-white text-[#111]/50 shadow-sm transition hover:text-[#111] lg:grid xl:-right-5"
              aria-label="السابق"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goFeat(1)}
              className="absolute -left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#111]/10 bg-white text-[#111]/50 shadow-sm transition hover:text-[#111] lg:grid xl:-left-5"
              aria-label="التالي"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="overflow-hidden rounded-[1.75rem] border border-[#111]/8 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] lg:grid lg:grid-cols-12">
              {/* How-to sidebar */}
              <aside className="bg-[#DDD6C8] p-6 sm:p-8 lg:col-span-3">
                <p className="font-display text-lg">كيف تقرأ أي فتوى هنا؟</p>
                <ul className="mt-6 space-y-4">
                  {READ_STEPS.map((s) => (
                    <li key={s.n} className="flex items-start gap-3">
                      <span className="font-display grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#111] text-sm text-[#F8E008]">
                        {s.n}
                      </span>
                      <span className="pt-1 text-sm leading-relaxed text-[#111]/75">{s.t}</span>
                    </li>
                  ))}
                </ul>
              </aside>

              {/* Featured body */}
              <div className="p-6 sm:p-8 lg:col-span-9 lg:p-10">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#111] px-3 py-1 text-xs font-bold text-[#F8E008]">الفتوى المميزة</span>
                  <span className="rounded-full bg-[#F8E008]/25 px-3 py-1 text-xs font-bold text-[#111]">{featured.meta}</span>
                </div>
                <h3 className="font-display mt-5 text-2xl leading-snug sm:text-3xl md:text-4xl">{featured.title}</h3>

                <div className="mt-6 rounded-2xl border-r-4 border-[#F8E008] bg-[#E6DFD0] p-5">
                  <p className="text-sm font-bold text-[#111]/50">خلاصة الجواب الشرعي</p>
                  <p className="mt-2 text-base leading-relaxed text-[#111]/85 sm:text-lg">{featured.excerpt}</p>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={() => onOpen(featured)}
                    className="flex min-h-12 items-center gap-2 rounded-full bg-[#111] px-6 text-sm font-bold text-white transition hover:bg-[#F8E008] hover:text-black"
                  >
                    اقرأ الفتوى كاملة بالأدلة
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={copySummary}
                    className="flex min-h-12 items-center gap-2 rounded-full border border-[#111]/15 bg-white px-5 text-sm font-bold text-[#111] transition hover:border-[#111]/35"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "تم النسخ" : "انسخ الخلاصة"}
                  </button>
                  <button
                    onClick={speak}
                    className="flex min-h-12 items-center gap-2 rounded-full border border-[#111]/15 bg-white px-5 text-sm font-bold text-[#111] transition hover:border-[#111]/35"
                  >
                    <Volume2 className="h-4 w-4" />
                    استمع
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Cards grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((f, i) => (
            <Reveal key={f.id} variant="up" delay={Math.min(i, 5) * 0.06}>
              <article className="group flex h-full flex-col rounded-3xl border border-[#111]/8 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#F8E008] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-sans text-sm tabular-nums text-[#111]/35">{pad(i + 2)}</span>
                  <span className="rounded-full bg-[#E6DFD0] px-2.5 py-1 text-xs text-[#111]/60">{f.meta}</span>
                </div>
                <h4 className="font-display mt-4 text-xl leading-snug">{f.title}</h4>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#111]/60">{f.excerpt}</p>
                <button
                  onClick={() => onOpen(f)}
                  className="mt-5 flex items-center gap-1.5 text-sm font-bold text-[#111] transition group-hover:gap-2.5"
                >
                  اقرأ الجواب الكامل
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Ask CTA — dark panel */}
        <Reveal
          variant="zoom"
          delay={0.1}
          className="relative mt-16 overflow-hidden rounded-[2rem] bg-[#111] px-6 py-10 text-white sm:px-10 sm:py-12"
        >
          <span className="pointer-events-none absolute -left-6 bottom-0 select-none font-display text-[12rem] leading-none text-white/[0.04]" aria-hidden>
            ؟
          </span>
          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <h3 className="font-display text-3xl leading-tight sm:text-4xl">لم تجد مسألتك؟ اسأل بكلماتك</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">
                اكتب سؤالك كما تتكلّم — حتى لو الصياغة غير دقيقة — وسنبحث لك في فتاوى الشيخ.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setQ(ex)}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:border-[#F8E008] hover:text-[#F8E008]"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onAsk(q.trim());
              }}
              className="flex flex-col gap-3 lg:col-span-6"
            >
              <label htmlFor="fatwa-ask" className="sr-only">
                اكتب سؤالك الشرعي
              </label>
              <input
                id="fatwa-ask"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="مثال: حكم تأخير الصلاة بسبب العمل..."
                className="h-14 rounded-2xl border border-white/20 bg-black/30 px-5 text-base text-white outline-none placeholder:text-white/40 focus:border-[#F8E008]"
              />
              <button
                type="submit"
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-base font-bold text-[#111] transition hover:bg-[#F8E008]"
              >
                <Search className="h-5 w-5" />
                ابحث في الفتاوى الآن
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
