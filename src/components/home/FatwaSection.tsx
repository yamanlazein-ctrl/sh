"use client";

import React, { useMemo, useState } from "react";
import { Plus, ArrowLeft, Search, MessageCircleQuestion } from "lucide-react";
import { ITEMS, type ArchiveItem } from "@/app/home-data";
import Reveal from "./Reveal";

const FATWAS = ITEMS.filter((i) => i.type === "fatwa");
const pad = (n: number) => String(n).padStart(2, "0");

export default function FatwaSection({ onOpen, onAsk }: { onOpen: (i: ArchiveItem) => void; onAsk: (q: string) => void }) {
  const cats = useMemo(() => ["الكل", ...Array.from(new Set(FATWAS.map((f) => f.meta)))], []);
  const [cat, setCat] = useState("الكل");
  const [openId, setOpenId] = useState<number | null>(FATWAS[0]?.id ?? null);
  const [q, setQ] = useState("");

  const list = cat === "الكل" ? FATWAS : FATWAS.filter((f) => f.meta === cat);

  return (
    <section id="fatwas" className="scroll-mt-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Sticky intro */}
          <div className="lg:col-span-4">
            <Reveal variant="blur" className="lg:sticky lg:top-28">
              <p className="text-base text-[#9EE4A9]">الفتاوى</p>
              <h2 className="font-display mt-2 text-4xl leading-tight sm:text-6xl">
                اسأل،
                <br />
                والأرشيف يجيب.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/70">أجوبة محرّرة من فتاوى الشيخ، مكتوبة بلغة واضحة يفهمها الجميع.</p>
              <div className="mt-10 border-t border-white/10 pt-6">
                <p className="text-sm text-white/65">أكثر من</p>
                <p className="font-sans text-5xl font-black tracking-tight text-[#9EE4A9]" dir="ltr" style={{ textAlign: "right" }}>
                  3,400
                </p>
                <p className="text-base text-white/80">فتوى في العبادات والمعاملات والأسرة</p>
              </div>
            </Reveal>
          </div>

          {/* Q&A list */}
          <div className="lg:col-span-8">
            <Reveal variant="up" className="mb-6 flex flex-wrap gap-2">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`min-h-10 rounded-full border px-4 text-base transition ${
                    cat === c ? "border-[#9EE4A9] bg-[#9EE4A9] text-black" : "border-white/15 text-white/70 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </Reveal>

            <div className="border-t border-white/10">
              {list.map((f, i) => {
                const open = openId === f.id;
                return (
                  <Reveal key={`${cat}-${f.id}`} variant="right" delay={Math.min(i, 6) * 0.07} className="border-b border-white/10">
                    <button onClick={() => setOpenId(open ? null : f.id)} aria-expanded={open} className="group flex w-full items-start gap-5 py-6 text-right">
                      <span className="pt-2 font-sans text-sm tabular-nums text-white/50">{pad(i + 1)}</span>
                      <span className="flex-1">
                        <span className="text-sm text-[#9EE4A9]">{f.meta}</span>
                        <span className={`font-display mt-1 block text-xl leading-snug transition sm:text-2xl ${open ? "text-white" : "text-white/85 group-hover:text-white"}`}>
                          {f.title}
                        </span>
                      </span>
                      <span
                        className={`mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full border transition duration-300 ${
                          open ? "rotate-45 border-transparent bg-[#9EE4A9] text-black" : "border-white/20 text-white/70 group-hover:border-white/50"
                        }`}
                      >
                        <Plus className="h-5 w-5" />
                      </span>
                    </button>

                    <div className="grid transition-all duration-500 ease-[cubic-bezier(.2,.7,.1,1)]" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
                      <div className="overflow-hidden">
                        <div className="mb-6 rounded-2xl border border-white/10 bg-[#0C0C0C] p-6 sm:mr-10">
                          <p className="text-sm text-white/60">الجواب باختصار</p>
                          <p className="mt-2 text-lg leading-relaxed text-white/95">{f.excerpt}</p>
                          <p className="mt-3 text-base leading-relaxed text-white/70">{f.body}</p>
                          <button onClick={() => onOpen(f)} className="mt-5 flex min-h-11 items-center gap-1.5 text-base font-bold text-[#9EE4A9] hover:gap-2.5">
                            اقرأ الفتوى كاملة
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== Centered, prominent "didn't find it?" block ===== */}
        <Reveal variant="zoom" className="relative mt-20 overflow-hidden rounded-[2.5rem] border border-[#9EE4A9]/40 bg-[#0B0B0B] px-6 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[80%] -translate-x-1/2 rounded-[50%] bg-[#9EE4A9]/15 blur-3xl" />
          <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#9EE4A9] text-black">
            <MessageCircleQuestion className="h-8 w-8" />
          </span>
          <h3 className="font-display relative mt-6 text-3xl sm:text-5xl">لم تجد سؤالك؟</h3>
          <p className="relative mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/75">
            اكتب سؤالك بكلماتك العادية — حتى لو لم تكن الصياغة دقيقة — وسنبحث لك في كل فتاوى الشيخ.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAsk(q.trim());
            }}
            className="relative mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="fatwa-ask" className="sr-only">
              اكتب سؤالك الشرعي
            </label>
            <input
              id="fatwa-ask"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="مثال: هل يجوز الجمع بين الصلاتين في العمل؟"
              className="h-16 flex-1 rounded-2xl border border-white/20 bg-black px-5 text-lg text-white outline-none placeholder:text-white/45 focus:border-[#9EE4A9]"
            />
            <button type="submit" className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-[#9EE4A9] px-8 text-lg font-bold text-black transition hover:bg-white">
              <Search className="h-6 w-6" />
              ابحث بكلماتك
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
