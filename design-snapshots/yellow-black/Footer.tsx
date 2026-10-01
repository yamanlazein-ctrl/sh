"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageCircle, Send } from "lucide-react";

const ARCHIVE = [
  { label: "صفوة التفاسير", href: "/tafsir" },
  { label: "الكتب والمؤلفات", href: "/archive?type=book" },
  { label: "الفتاوى", href: "/fatwa-bank" },
  { label: "التفسير والأبحاث", href: "/archive" },
  { label: "الأذكار والأدعية", href: "/adhkar" },
];

const MEDIA = [
  { label: "المرئيات", href: "/#videos" },
  { label: "الصوتيات والخطب", href: "/#audio" },
  { label: "متجر الكتب", href: "/store" },
  { label: "الأرشيف العلمي", href: "/archive" },
];

const ABOUT = [
  { label: "من هو الشيخ", href: "/#sheikh" },
  { label: "السيرة والتراث", href: "/biography" },
  { label: "بنك الفتاوى", href: "/fatwa-bank" },
  { label: "لوحة الإدارة", href: "/admin" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail("");
  };

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-20">
        {/* Top: link columns + newsletter */}
        <div className="grid gap-10 pb-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <h4 className="mb-5 text-sm font-semibold text-white">الأرشيف</h4>
            <ul className="space-y-3 text-sm text-white/55">
              {ARCHIVE.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="transition hover:text-[#F8E008]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold text-white">الوسائط والمتجر</h4>
            <ul className="space-y-3 text-sm text-white/55">
              {MEDIA.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="transition hover:text-[#F8E008]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold text-white">عن الشيخ</h4>
            <ul className="space-y-3 text-sm text-white/55">
              {ABOUT.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="transition hover:text-[#F8E008]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm leading-relaxed text-white/70">
              اشترك ليصلك جديد الأرشيف والفتاوى والدروس.
            </p>
            <form onSubmit={onSubscribe} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                className="min-h-11 flex-1 rounded-lg border border-white/15 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#F8E008]"
                aria-label="البريد الإلكتروني"
              />
              <button
                type="submit"
                className="min-h-11 shrink-0 rounded-lg bg-white px-5 text-sm font-bold text-black transition hover:bg-[#F8E008] hover:text-black"
              >
                اشترك
              </button>
            </form>
            {done && <p className="mt-2 text-xs text-[#F8E008]">تم التسجيل — شكراً لاهتمامك.</p>}

            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/60 transition hover:border-[#F8E008] hover:text-[#F8E008]"
                aria-label="تيليجرام"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/60 transition hover:border-[#F8E008] hover:text-[#F8E008]"
                aria-label="يوتيوب"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/60 transition hover:border-[#F8E008] hover:text-[#F8E008]"
                aria-label="واتساب"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Giant wordmark — solid fill, no negative tracking (Arabic joins break otherwise) */}
        <div className="relative mt-4 flex items-end gap-3 pb-4 pt-6 sm:gap-5" dir="rtl">
          <span className="font-display mb-[0.06em] grid h-[clamp(2.25rem,7vw,4.25rem)] w-[clamp(2.25rem,7vw,4.25rem)] shrink-0 place-items-center rounded-2xl bg-[#F8E008] text-[clamp(1.35rem,4.5vw,2.6rem)] leading-none text-black">
            ص
          </span>
          <p
            className="font-display shrink-0 whitespace-nowrap text-[clamp(2.4rem,10.5vw,7rem)] leading-none text-white/45"
            style={{ letterSpacing: 0 }}
            aria-label="محمد علي الصابوني"
          >
            الصابوني
          </p>
        </div>

        {/* Bottom meta */}
        <div className="mt-4 flex flex-col items-start justify-between gap-4 py-6 pb-28 text-xs text-white/45 sm:flex-row sm:items-center sm:pb-8">
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F8E008]" aria-hidden />
            صدقة جارية عن روح الشيخ محمد علي الصابوني رحمه الله
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/biography" className="transition hover:text-white">
              السيرة
            </Link>
            <Link href="/store" className="transition hover:text-white">
              المتجر
            </Link>
            <span>© {new Date().getFullYear()} الأرشيف العلمي</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
