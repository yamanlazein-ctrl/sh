"use client";

import React, { useState } from "react";
import { Type, Contrast, Pause, Play, X, Eye } from "lucide-react";
import { usePrefs } from "./prefs";

const SIZES = [
  { v: 0 as const, label: "عادي", cls: "text-base" },
  { v: 1 as const, label: "كبير", cls: "text-xl" },
  { v: 2 as const, label: "أكبر", cls: "text-2xl" },
];

export default function ReadingToolbar() {
  const { prefs, set } = usePrefs();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[65]">
      {open && (
        <div className="rise mb-3 w-[300px] rounded-3xl border border-white/15 bg-[#0E0E0E] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)]" role="dialog" aria-label="إعدادات سهولة القراءة">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-lg">سهولة القراءة</p>
            <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white" aria-label="إغلاق">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Text size */}
          <p className="mb-2 flex items-center gap-2 text-sm text-white/70">
            <Type className="h-4 w-4" /> حجم الخط
          </p>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((s) => (
              <button
                key={s.v}
                onClick={() => set({ size: s.v })}
                aria-pressed={prefs.size === s.v}
                className={`flex h-16 flex-col items-center justify-center rounded-2xl border transition ${
                  prefs.size === s.v ? "border-[#F8E008] bg-[#F8E008] text-black" : "border-white/15 text-white hover:border-white/40"
                }`}
              >
                <span className={`font-display leading-none ${s.cls}`}>أ</span>
                <span className="mt-1 text-xs">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Toggles */}
          <div className="mt-4 space-y-2">
            <Toggle
              on={prefs.contrast}
              onClick={() => set({ contrast: !prefs.contrast })}
              icon={<Contrast className="h-5 w-5" />}
              title="تباين أعلى"
              hint="نصوص أوضح وأكثر سطوعاً"
            />
            <Toggle
              on={prefs.calm}
              onClick={() => set({ calm: !prefs.calm })}
              icon={prefs.calm ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              title="إيقاف الحركة"
              hint="تثبيت العناوين والأشرطة المتحركة"
            />
          </div>

          <button onClick={() => set({ size: 0, contrast: false, calm: false })} className="mt-4 w-full rounded-2xl py-2 text-sm text-white/60 hover:text-white">
            إعادة الإعدادات الافتراضية
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex h-14 items-center gap-2 rounded-full border border-white/15 bg-white px-5 font-bold text-black shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition hover:bg-[#F8E008]"
      >
        <Eye className="h-5 w-5" />
        <span>سهولة القراءة</span>
      </button>
    </div>
  );
}

function Toggle({ on, onClick, icon, title, hint }: { on: boolean; onClick: () => void; icon: React.ReactNode; title: string; hint: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-right transition ${on ? "border-[#F8E008] bg-[#F8E008]/10" : "border-white/15 hover:border-white/40"}`}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${on ? "bg-[#F8E008] text-black" : "bg-white/10 text-white"}`}>{icon}</span>
      <span className="flex-1">
        <span className="block font-bold">{title}</span>
        <span className="block text-xs text-white/60">{hint}</span>
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-[#F8E008]" : "bg-white/20"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-1 bg-black" : "left-6"}`} />
      </span>
    </button>
  );
}
