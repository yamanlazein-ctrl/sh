"use client";

import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  BookOpen,
  Scale,
  PenLine,
  Headphones,
  Mic,
  Play,
  ArrowUpLeft,
  ArrowLeft,
  CornerDownLeft,
  X,
  Copy,
  Check,
  Menu,
  Mic as MicIcon,
  Share2,
  Volume2,
  Square,
  Minus,
  Plus,
  BookMarked,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import {
  ITEMS,
  TYPE_LABEL,
  searchArchive,
  highlight,
  type ArchiveItem,
  type ItemType,
} from "./home-data";
import Marquee from "@/components/home/Marquee";
import BookShelf from "@/components/home/BookShelf";
import FatwaSection from "@/components/home/FatwaSection";
import VideoSection from "@/components/home/VideoSection";
import AudioSection from "@/components/home/AudioSection";
import Intro from "@/components/home/Intro";
import Reveal from "@/components/home/Reveal";
import PortraitStory from "@/components/home/PortraitStory";
import ReadingToolbar from "@/components/home/ReadingToolbar";
import { PrefsProvider } from "@/components/home/prefs";
import { useVoiceSearch, useReadAloud } from "@/components/home/voice";
import Footer from "@/components/Footer";

const SECTIONS = [
  { id: "books", label: "الكتب" },
  { id: "fatwas", label: "الفتاوى" },
  { id: "videos", label: "المرئيات" },
  { id: "audio", label: "الصوتيات" },
  { id: "sheikh", label: "من هو الشيخ" },
];

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const TYPE_ICON: Record<ItemType, React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  fatwa: Scale,
  article: PenLine,
  lesson: Headphones,
  khutba: Mic,
  video: Play,
};

type Intent = { id: string; label: string; scope: string; chip: boolean; filter: (i: ArchiveItem) => boolean };

const INTENTS: Intent[] = [
  { id: "fatwa", label: "عندي سؤال شرعي", scope: "الفتاوى", chip: true, filter: (i) => i.type === "fatwa" },
  { id: "tafsir", label: "بدي أفهم آية", scope: "التفسير", chip: true, filter: (i) => i.tags.includes("تفسير") },
  { id: "listen", label: "بدي أسمع درس", scope: "الدروس والخطب", chip: true, filter: (i) => ["lesson", "khutba", "video"].includes(i.type) },
  { id: "read", label: "بدي أقرأ كتاب", scope: "الكتب", chip: true, filter: (i) => i.type === "book" },
  { id: "articles", label: "مقالات", scope: "المقالات والأبحاث", chip: false, filter: (i) => i.type === "article" },
];

const EXAMPLES = ["تأخير الصلاة بسبب العمل", "ميراث البنت", "تفسير سورة الكهف", "زكاة المال", "الصيام للحامل"];
const ROTATING = ["العلم", "التفسير", "الفتوى", "التعليم"];

// depth: rows alternate in size, the middle one uses the display face
const ROW_SIZE = ["text-sm", "text-lg", "text-sm", "text-2xl", "text-sm", "text-lg", "text-sm"];

const TAPE_A = ["صفوة التفاسير", "روائع البيان", "التبيان في علوم القرآن", "المواريث في الشريعة", "من كنوز السنة"];

export default function HomePage() {
  return (
    <PrefsProvider>
      <Home />
      <ReadingToolbar />
    </PrefsProvider>
  );
}

function Home() {
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<ArchiveItem | null>(null);
  const [placeholder, setPlaceholder] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [word, setWord] = useState(0);
  const [pastHero, setPastHero] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeSec, setActiveSec] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  /* ---------- search ---------- */
  const currentIntent = INTENTS.find((x) => x.id === intent) || null;
  const { results, tokens, ms } = useMemo(() => {
    const t0 = typeof performance !== "undefined" ? performance.now() : 0;
    const r = searchArchive(query, currentIntent?.filter);
    const t1 = typeof performance !== "undefined" ? performance.now() : 0;
    return { ...r, ms: Math.max(t1 - t0, 0.01) };
  }, [query, currentIntent]);

  const hasSearch = query.trim().length > 0 || intent !== null;
  // River only lights the top matches shown in the results panel — not every weak hit
  const matchKey = hasSearch ? results.slice(0, 6).map((r) => r.id).join(",") : "";
  const matchIds = useMemo(() => new Set(matchKey ? matchKey.split(",").map(Number) : []), [matchKey]);
  const shown = results.slice(0, 6);

  useEffect(() => setActive(0), [query, intent]);

  /* ---------- typewriter placeholder ---------- */
  useEffect(() => {
    let ex = 0;
    let ch = 0;
    let deleting = false;
    const id = setInterval(() => {
      const w = EXAMPLES[ex];
      if (!deleting) {
        ch++;
        if (ch > w.length + 12) deleting = true;
      } else {
        ch -= 2;
        if (ch <= 0) {
          deleting = false;
          ch = 0;
          ex = (ex + 1) % EXAMPLES.length;
        }
      }
      setPlaceholder(w.slice(0, Math.min(ch, w.length)));
    }, 70);
    return () => clearInterval(id);
  }, []);

  /* ---------- rotating headline word ---------- */
  useEffect(() => {
    const id = setInterval(() => setWord((w) => (w + 1) % ROTATING.length), 2400);
    return () => clearInterval(id);
  }, []);

  /* ---------- keyboard + scroll ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") setOpen(null);
    };
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setPastHero(window.scrollY > window.innerHeight * 0.75);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* ---------- active section in header ---------- */
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSec(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!pastHero) setActiveSec(null);
  }, [pastHero]);

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, shown.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && shown[active]) {
      setOpen(shown[active]);
    } else if (e.key === "Escape") {
      setQuery("");
      setIntent(null);
      inputRef.current?.blur();
    } else if (e.key === "Backspace" && !query && intent) {
      setIntent(null);
    }
  };

  const jumpToSearch = (intentId: string | null, q = "") => {
    setIntent(intentId);
    setQuery(q);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => inputRef.current?.focus(), 450);
  };

  /* ---------- flashlight over the library ---------- */
  const onHeroMove = (e: React.MouseEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const onHeroLeave = () => {
    heroRef.current?.style.setProperty("--mx", "-999px");
    heroRef.current?.style.setProperty("--my", "-999px");
  };

  /* ---------- river rows ---------- */
  const rows = useMemo(() => {
    const out: ArchiveItem[][] = [];
    for (let r = 0; r < 7; r++) {
      const shift = (r * 5) % ITEMS.length;
      out.push([...ITEMS.slice(shift), ...ITEMS.slice(0, shift)]);
    }
    return out;
  }, []);

  const showPanel = focused && hasSearch;
  const searching = focused && query.trim().length > 0;

  const voice = useVoiceSearch((t) => {
    setQuery(t);
    inputRef.current?.focus();
  });

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="grain pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-overlay" />
      <Intro onDone={() => setReady(true)} />

      {/* ================= NAV: floating pill ================= */}
      <header
        className={`fixed inset-x-0 top-4 z-50 px-4 transition-all duration-700 ease-[cubic-bezier(.2,.7,.1,1)] ${
          ready ? "translate-y-0 opacity-100 delay-500" : "-translate-y-24 opacity-0"
        }`}
      >
        <div
          className={`mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border pl-2 pr-5 transition-all duration-500 ${
            scrolled
              ? "border-white/10 bg-black/75 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              : "border-white/10 bg-white/[0.03] backdrop-blur-md"
          }`}
        >
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5">
            <span className="font-display grid h-8 w-8 place-items-center rounded-full bg-[#F8E008] text-lg text-black">ص</span>
            <span className="font-display text-lg">الصابوني</span>
          </button>

          <nav className="hidden items-center gap-1 text-sm lg:flex">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToId(s.id)}
                className={`relative rounded-full px-4 py-1.5 transition ${
                  activeSec === s.id ? "bg-white/10 text-white" : "text-white/55 hover:text-white"
                }`}
              >
                {activeSec === s.id && <span className="absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#F8E008]" />}
                {s.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => jumpToSearch(null)}
              className={`hidden items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-sm text-white/70 transition-all duration-500 hover:border-[#F8E008] hover:text-white sm:flex ${
                pastHero ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
              }`}
              aria-label="ابحث"
            >
              <Search className="h-4 w-4" />
              ابحث
              <kbd className="rounded border border-white/15 px-1.5 text-xs text-white/55">/</kbd>
            </button>
            <a href="#store" className="rounded-full bg-[#F8E008] px-5 py-2 text-sm font-bold text-black transition hover:bg-white hover:text-black">
              المتجر
            </a>
            <button onClick={() => setMenu(!menu)} className="grid h-10 w-10 place-items-center rounded-full lg:hidden" aria-label="القائمة">
              {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menu && (
          <div className="rise mx-auto mt-2 max-w-5xl rounded-3xl border border-white/10 bg-black/95 p-3 backdrop-blur-xl lg:hidden">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setMenu(false);
                  scrollToId(s.id);
                }}
                className="block w-full rounded-2xl px-4 py-3 text-right text-white/80 hover:bg-white/5"
              >
                {s.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMenu(false);
                jumpToSearch(null);
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-right text-[#F8E008]"
            >
              <Search className="h-4 w-4" /> ابحث في الأرشيف
            </button>
          </div>
        )}
      </header>

      {/* ================= HERO: THE LIVING LIBRARY ================= */}
      <section
        key={ready ? "hero-on" : "hero-off"}
        ref={heroRef}
        onMouseMove={onHeroMove}
        onMouseLeave={onHeroLeave}
        className="relative flex min-h-[100svh] flex-col justify-center overflow-x-clip pt-24"
        style={{ ["--mx" as string]: "-999px", ["--my" as string]: "-999px" } as React.CSSProperties}
      >
        {/* base river (clickable) */}
        <River rows={rows} matchIds={matchIds} hasSearch={hasSearch} spot={false} onOpen={setOpen} />

        {/* flashlight layer: same river, brighter, revealed around the cursor */}
        {!hasSearch && (
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${hasSearch ? "opacity-0" : "opacity-100"}`}
          style={{
            WebkitMaskImage:
              "radial-gradient(260px circle at var(--mx) var(--my), #000 0%, rgba(0,0,0,0.45) 45%, transparent 75%)",
            maskImage:
              "radial-gradient(260px circle at var(--mx) var(--my), #000 0%, rgba(0,0,0,0.45) 45%, transparent 75%)",
          }}
        >
          <River rows={rows} matchIds={matchIds} hasSearch={hasSearch} spot onOpen={setOpen} />
        </div>
        )}

        {/* center vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_52%_48%_at_50%_50%,#000_48%,rgba(0,0,0,0.8)_68%,transparent_100%)]" />

        <div className="relative z-20 mx-auto w-full max-w-3xl px-5 text-center">
          <div
            className="grid transition-all duration-500 ease-[cubic-bezier(.2,.7,.1,1)]"
            style={{ gridTemplateRows: searching ? "0fr" : "1fr", opacity: searching ? 0 : 1 }}
            aria-hidden={searching}
          >
          <div className="min-h-0 overflow-hidden">
          <p className="rise mb-6 text-sm tracking-[0.15em] text-[#F8E008]" style={{ animationDelay: "0.25s" }}>
            الأرشيف الرسمي للعلّامة محمد علي الصابوني · ١٩٣٠ — ٢٠٢١
          </p>

          <h1 className="font-display text-[2.5rem] leading-[1.25] sm:text-6xl md:text-7xl">
            <span className="line-mask"><span className="line-in" style={{ animationDelay: "0.35s" }}>
            سبعون عاماً
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 96 72"
              fill="none"
              aria-hidden
              className="mx-2 inline-block h-[0.95em] w-[1.25em] translate-y-[0.08em] align-baseline sm:mx-3"
            >
              <path
                d="M48 14c-6.5-5.2-14.8-8-23.5-8C16.2 6 9.8 8.2 5 12.2v46.6C10.2 54.4 17.2 52 24.5 52c8.7 0 16.8 2.8 23.5 8 6.7-5.2 14.8-8 23.5-8 7.3 0 14.3 2.4 19.5 6.8V12.2C86.2 8.2 79.8 6 71.5 6 62.8 6 54.5 8.8 48 14Z"
                stroke="#F8E008"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path d="M48 14v46" stroke="#F8E008" strokeWidth="3" strokeLinecap="round" />
              <path d="M18 24h18M16 32h20M18 40h18" stroke="#F8E008" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
              <path d="M60 24h18M60 32h20M60 40h18" stroke="#F8E008" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
              <circle cx="48" cy="12" r="2.4" fill="#F8E008" />
            </svg>
            من{" "}
            <span className="relative inline-grid overflow-hidden align-bottom text-[#F8E008]" style={{ height: "1.3em" }}>
              {ROTATING.map((w, i) => {
                const prev = (word - 1 + ROTATING.length) % ROTATING.length;
                const state = i === word ? "translate-y-0 opacity-100" : i === prev ? "-translate-y-full opacity-0" : "translate-y-full opacity-0";
                return (
                  <span key={w} className={`[grid-area:1/1] leading-[1.3] transition-all duration-700 ease-[cubic-bezier(.2,.7,.1,1)] ${state}`}>
                    {w}
                  </span>
                );
              })}
            </span>
            </span></span>
            <span className="line-mask">
              <span className="line-in relative" style={{ animationDelay: "0.5s" }}>
                على بُعد سؤال.
                <span className="grow-x absolute inset-x-0 bottom-0 h-[0.1em] rounded-full bg-[#F8E008]/70" style={{ animationDelay: "1.15s" }} />
              </span>
            </span>
          </h1>
          </div>
          </div>

          {/* SEARCH */}
          <div className={`rise relative mx-auto max-w-2xl transition-[margin] duration-500 ${searching ? "mt-0" : "mt-10"}`} style={{ animationDelay: "0.75s" }}>
            <label htmlFor="archive-search" className={`mb-3 block text-right text-base text-white/80 transition-opacity ${searching ? "opacity-100" : "sr-only"}`}>
              ابحث في أرشيف الشيخ
            </label>
            <div
              className={`relative flex items-center gap-3 rounded-2xl border bg-[#0B0B0B] px-5 py-4 transition-all duration-300 ${
                focused ? "border-[#F8E008] shadow-[0_0_0_6px_rgba(248,224,8,0.12)]" : "border-white/15"
              }`}
            >
              <Search className={`h-6 w-6 shrink-0 ${focused ? "text-[#F8E008]" : "text-white/55"}`} />

              {currentIntent && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIntent(null)}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-[#F8E008] px-2.5 py-1 text-xs font-bold text-black"
                  title="إزالة النطاق"
                >
                  {currentIntent.scope}
                  <X className="h-3 w-3" />
                </button>
              )}

              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                  onKeyDown={onInputKey}
                  id="archive-search"
                  type="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  className="w-full bg-transparent text-xl text-white outline-none [&::-webkit-search-cancel-button]:hidden"
                  aria-label="ابحث في الأرشيف: اكتب سؤالك بكلماتك"
                />
                {!query && (
                  <span className="caret pointer-events-none absolute inset-y-0 right-0 flex items-center truncate text-lg text-white/55 sm:text-xl">
                    {voice.listening ? "تكلّم الآن، نحن نستمع..." : currentIntent ? "اكتب سؤالك..." : placeholder}
                  </span>
                )}
              </div>
              {query && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                  aria-label="مسح البحث"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              {voice.supported && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => (voice.listening ? voice.stop() : voice.start())}
                  className={`flex h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-bold transition ${
                    voice.listening ? "listening bg-[#F8E008] text-black" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  aria-label={voice.listening ? "إيقاف الاستماع" : "ابحث بصوتك"}
                  title="ابحث بصوتك"
                >
                  <MicIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">{voice.listening ? "نستمع…" : "تكلّم"}</span>
                </button>
              )}
            </div>

            {showPanel && (
              <div className="absolute inset-x-0 top-full z-40 mt-2 flex max-h-[min(58vh,520px)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0B0B0B] text-right shadow-[0_30px_80px_rgba(0,0,0,0.9)]" role="listbox" aria-label="نتائج البحث">
                <div className="flex items-center justify-between border-b border-white/5 px-5 py-2.5 text-xs text-white/55">
                  <span>
                    {results.length} نتيجة · خلال {ms.toFixed(2)} ملّي ثانية
                  </span>
                  <span className="hidden items-center gap-1 sm:flex">
                    <CornerDownLeft className="h-3 w-3" /> للفتح · ↑↓ للتنقل
                  </span>
                </div>

                {voice.error && <p className="border-b border-white/5 px-5 py-2 text-sm text-amber-300">{voice.error}</p>}
                {shown.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-white/70">ما لقينا نتيجة مطابقة تماماً.</p>
                    <p className="mt-1 text-sm text-white/55">جرّب كلمة أبسط، مثل: صلاة، ميراث، تفسير.</p>
                  </div>
                ) : (
                  <ul className="overflow-y-auto overscroll-contain">
                    {shown.map((item, i) => {
                      const Icon = TYPE_ICON[item.type];
                      return (
                        <li key={item.id}>
                          <button
                            onMouseEnter={() => setActive(i)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setOpen(item)}
                            role="option"
                            aria-selected={active === i}
                            className={`flex w-full items-start gap-4 px-5 py-4 text-right transition ${active === i ? "bg-white/[0.07]" : ""}`}
                          >
                            <span
                              className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                                active === i ? "bg-[#F8E008] text-black" : "bg-white/5 text-white/60"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-bold">
                                {highlight(item.title, tokens).map((p, k) =>
                                  p.hit ? (
                                    <mark key={k} className="rounded bg-[#F8E008]/20 px-0.5 text-[#F8E008]">
                                      {p.text}
                                    </mark>
                                  ) : (
                                    <span key={k}>{p.text}</span>
                                  )
                                )}
                              </span>
                              <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-white/60">{item.excerpt}</span>
                            </span>
                            <span className="mt-1 shrink-0 text-xs text-white/55">
                              {TYPE_LABEL[item.type]} · {item.meta}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          {voice.error && !showPanel && <p className="mt-3 text-sm text-amber-300">{voice.error}</p>}

          {/* Intents */}
          <div className="rise mt-6 flex flex-wrap justify-center gap-2" style={{ animationDelay: "0.9s" }}>
            {INTENTS.filter((i) => i.chip).map((it) => (
              <button
                key={it.id}
                onClick={() => {
                  setIntent(intent === it.id ? null : it.id);
                  inputRef.current?.focus();
                }}
                className={`min-h-11 rounded-full border px-5 py-2 text-base transition ${
                  intent === it.id
                    ? "border-[#F8E008] bg-[#F8E008] text-black"
                    : "border-white/15 bg-black/60 text-white/70 backdrop-blur hover:border-white/40 hover:text-white"
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>

        {/* bottom status */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2 text-xs">
          {hasSearch ? (
            <span className="rounded-full bg-[#F8E008]/10 px-3 py-1 text-[#F8E008]">
              أضأنا {results.length} عنواناً في الأرشيف
            </span>
          ) : (
            <span className="text-white/50">حرّك المؤشر فوق المكتبة · أو اكتب سؤالك لتضيء العناوين المطابقة</span>
          )}
          <ChevronDown className="h-4 w-4 animate-bounce text-white/25" />
        </div>

        {/* soft blend into next section — short, stays near the edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-16 bg-gradient-to-b from-transparent to-[#E6DFD0]"
        />
      </section>

      {/* ================= HOW IT WORKS — manuscript guide (not SaaS cards) ================= */}
      <section className="-mt-px bg-[#E6DFD0] text-[#111]" aria-labelledby="how-title">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:pb-20 lg:pt-14">
          <Reveal variant="blur" className="lg:col-span-4">
            <h2 id="how-title" className="font-display text-3xl leading-tight sm:text-4xl">
              أول مرة في الأرشيف؟
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-[#111]/70">
              ثلاثة أبواب تفتح لك المكتبة — اكتب، اختر، ثم اقرأ أو استمع. من دون مصطلحات تقنية.
            </p>
            <button
              onClick={() => jumpToSearch(null)}
              className="mt-8 flex min-h-12 items-center gap-2 rounded-full bg-[#111] px-6 text-base font-bold text-[#E6DFD0] transition hover:bg-[#F8E008] hover:text-black"
            >
              <Search className="h-5 w-5" /> ابدأ بالبحث
            </button>
          </Reveal>

          <Reveal variant="wipe" delay={0.15} className="lg:col-span-8">
            <ol className="relative pr-2 sm:pr-4">
              {[
                { n: "١", t: "اكتب سؤالك أو قُله", d: "اكتب بكلماتك العادية، أو اضغط «تكلّم» واسأل بصوتك. لا حاجة لكلمات دقيقة." },
                { n: "٢", t: "اختر ما يناسبك", d: "تظهر الكتب والفتاوى والدروس الأقرب لسؤالك، مرتّبة من الأكثر صلة." },
                { n: "٣", t: "اقرأ أو استمع", d: "كبّر الخط كما تحب، أو استمع للنص، ثم شاركه مع من يحبّه." },
              ].map((s) => (
                <li key={s.n} className="relative grid gap-2 py-6 sm:grid-cols-[3rem_1fr] sm:gap-6">
                  <span className="font-display text-4xl leading-none text-[#111]/25 sm:text-5xl">{s.n}</span>
                  <span>
                    <span className="font-display block text-xl sm:text-2xl">{s.t}</span>
                    <span className="mt-2 block max-w-prose text-base leading-relaxed text-[#111]/70">{s.d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ================= KINETIC TAPE ================= */}
      <section aria-hidden className="overflow-hidden">
        <Reveal variant="right" className="bg-[#F8E008] py-5" dir="ltr">
          <Marquee items={TAPE_A} duration={40} itemClass="font-display text-4xl text-black sm:text-6xl" sep="text-black/40" />
        </Reveal>
      </section>

      {/* ================= PORTRAIT STORY (replaces "في مكانٍ واحد") ================= */}
      <PortraitStory />

      {/* ================= INDEX (B) + hover marquee (A) ================= */}
      <section className="bg-black">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="mb-10 flex items-end justify-between">
            <Reveal variant="blur" as="h2" className="font-display text-3xl sm:text-5xl">الفهرس</Reveal>
            <p className="hidden text-sm text-white/55 sm:block">اختر باباً وننقلك إليه مباشرة</p>
          </div>

          <div>
            {[
              { no: "01", title: "الكتب والمؤلفات", count: "٥٠+", sub: "صفوة التفاسير · روائع البيان · المواريث", words: ["صفوة التفاسير", "روائع البيان", "المواريث", "التبيان"], img: "/images/index-books.svg", go: () => scrollToId("books") },
              { no: "02", title: "الفتاوى", count: "٣٤٠٠+", sub: "عبادات · معاملات · أسرة · مواريث", words: ["العبادات", "المعاملات", "الأسرة", "المواريث"], img: "/images/index-fatwas.svg", go: () => scrollToId("fatwas") },
              { no: "03", title: "المرئيات", count: "٤٠٠+", sub: "برامج تلفزيونية · لقاءات · محاضرات", words: ["برامج تلفزيونية", "لقاءات", "محاضرات", "يوتيوب"], img: "/images/index-videos.svg", go: () => scrollToId("videos") },
              { no: "04", title: "الصوتيات والخطب", count: "٨٥٠+", sub: "مجالس الحرم · خطب الجمعة · مواعظ", words: ["مجالس التفسير", "خطب الجمعة", "مواعظ", "دروس الفقه"], img: "/images/index-audio.svg", go: () => scrollToId("audio") },
              { no: "05", title: "المقالات والأبحاث", count: "٦٠٠+", sub: "فكر · تجديد · بحوث محكّمة", words: ["فكر", "تجديد", "بحوث محكّمة", "سيرة"], img: "/images/index-articles.svg", go: () => jumpToSearch("articles") },
            ].map((row, ri) => (
              <Reveal key={row.no} variant="wipe" delay={ri * 0.12}>
              <button
                onClick={row.go}
                className="group relative flex w-full items-center gap-6 overflow-hidden py-7 text-right sm:gap-10"
              >
                <span className="absolute inset-0 origin-right scale-x-0 bg-[#F8E008] transition-transform duration-500 ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-x-100" />
                <span className="relative w-10 text-sm text-white/55 transition group-hover:text-black/50">{row.no}</span>

                <span className="relative min-w-0 flex-1 overflow-hidden">
                  <span className="block transition duration-500 group-hover:-translate-y-4 group-hover:opacity-0">
                    <span className="font-display block text-2xl sm:text-4xl">{row.title}</span>
                    <span className="mt-1 block text-sm text-white/55">{row.sub}</span>
                  </span>
                  <span className="pointer-events-none absolute inset-0 flex items-center opacity-0 transition duration-500 group-hover:opacity-100" dir="ltr">
                    <Marquee items={[row.title, ...row.words]} duration={22} itemClass="font-display text-2xl text-black sm:text-4xl" sep="text-black/40" />
                  </span>
                </span>

                <img
                  src={row.img}
                  alt=""
                  className="pointer-events-none relative hidden h-20 w-32 -rotate-3 rounded-lg object-cover opacity-0 shadow-lg ring-1 ring-black/10 transition duration-500 group-hover:rotate-0 group-hover:opacity-100 md:block"
                />
                <span className="relative text-lg text-white/60 transition group-hover:text-black">{row.count}</span>
                <ArrowUpLeft className="relative h-6 w-6 text-white/55 transition group-hover:-translate-x-1 group-hover:text-black" />
              </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BOOKS ================= */}
      <BookShelf
        onRead={(itemId) => {
          const it = ITEMS.find((x) => x.id === itemId);
          if (it) setOpen(it);
          else jumpToSearch("read");
        }}
      />

      {/* ================= FATWAS ================= */}
      <FatwaSection onOpen={setOpen} onAsk={(q) => jumpToSearch("fatwa", q)} />

      {/* divider tape */}
      <Reveal as="section" variant="blur" aria-hidden className="overflow-hidden py-6" dir="ltr">
        <Marquee items={["شاهِد", "استمِع", "اقرأ", "اسأل"]} duration={30} itemClass="font-display text-stroke text-5xl sm:text-7xl" sep="text-[#F8E008]" />
      </Reveal>

      {/* ================= VIDEOS ================= */}
      <VideoSection />

      {/* ================= AUDIO ================= */}
      <AudioSection />

      {/* ================= THE SHEIKH — clear photo background ================= */}
      <section id="sheikh" className="relative scroll-mt-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <img
            src="/images/sheikh-section-bg.webp"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* light veil so the photo stays clear but text stays readable */}
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 py-28 sm:px-8 lg:grid-cols-12 lg:py-36">
          <Reveal variant="blur" delay={0.1} className="flex flex-col justify-center lg:col-span-7 lg:col-start-1">
            <p className="text-base text-[#F8E008]">من هو الشيخ</p>
            <h2 className="font-display mt-3 text-4xl leading-tight sm:text-5xl md:text-6xl">
              من حلقات حلب
              <br />
              إلى أروقة الحرم.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">
              وُلد في حلب، ودرس في الأزهر، ثم قضى عقوداً يدرّس التفسير في مكة المكرمة. كتب «صفوة التفاسير» ليصل معنى القرآن إلى كل قارئ، متخصصاً كان أو غير متخصص.
            </p>

            <div className="mt-10">
              <p className="font-display text-3xl text-white sm:text-4xl">محمد علي الصابوني</p>
              <p className="mt-2 text-base text-white/80">مفسّر · فقيه · معلّم</p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-black/25 backdrop-blur-sm sm:grid-cols-4">
              {[
                { y: "1930", t: "المولد في حلب" },
                { y: "1952", t: "التخرج في الأزهر" },
                { y: "1980", t: "صفوة التفاسير" },
                { y: "2021", t: "الوفاة في تركيا" },
              ].map((m, mi) => (
                <Reveal key={m.y} variant="zoom" delay={0.4 + mi * 0.12} className="bg-black/50 p-5 backdrop-blur-md">
                  <p className="font-sans text-2xl font-black text-[#F8E008]">{m.y}</p>
                  <p className="mt-1 text-base text-white/80">{m.t}</p>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= STORE ================= */}
      <section id="store" className="bg-black">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Reveal variant="zoom" className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-[#F8E008] p-8 text-black sm:p-12 md:flex-row md:items-center">
            <div className="max-w-xl">
              <p className="text-sm font-bold opacity-60">المتجر</p>
              <h2 className="font-display mt-2 text-3xl leading-tight sm:text-5xl">اقتنِ النسخة المطبوعة.</h2>
              <p className="mt-4 text-base opacity-70">طبعات معتمدة، وتوصيل داخل سوريا وخارجها، ودفع بالطريقة التي تناسبك.</p>
            </div>
            <div className="flex items-center gap-4">
              <img src="/images/safwat-tafasir-book.jpg" alt="" className="hidden h-36 w-28 rotate-[-6deg] rounded-lg object-cover shadow-2xl sm:block" />
              <a href="#store" className="flex items-center gap-2 rounded-full bg-black px-7 py-4 font-bold text-white transition hover:gap-3">
                <ShoppingBag className="h-4 w-4" />
                تصفّح الكتب
                <ArrowLeft className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />

      {open && <ReadingDrawer item={open} onClose={() => setOpen(null)} onOpen={setOpen} />}
    </div>
  );
}

/* ====================================================================== */

const River = memo(function River({
  rows,
  matchIds,
  hasSearch,
  spot,
  onOpen,
}: {
  rows: ArchiveItem[][];
  matchIds: Set<number>;
  hasSearch: boolean;
  spot: boolean;
  onOpen: (i: ArchiveItem) => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-3 py-16" aria-hidden>
      {rows.map((row, r) => (
        <div key={r} className="river-row rise" style={{ animationDelay: `${0.15 + Math.abs(r - 3) * 0.09}s` }}>
          <div
            className={`river-track ${r % 2 ? "reverse" : ""}`}
            style={{ animationDuration: `${80 + r * 14}s`, animationPlayState: hasSearch ? "paused" : "running" }}
          >
            {[...row, ...row].map((item, k) => {
              const hit = matchIds.has(item.id);
              const look = hit
                ? "border-[#F8E008] bg-[#F8E008] text-black"
                : spot
                ? "border-white/30 text-white/90"
                : hasSearch
                ? "border-white/[0.04] text-white/[0.07]"
                : "border-white/[0.07] text-white/[0.16] hover:border-white/30 hover:text-white/70";
              return (
                <button
                  key={`${item.id}-${k}`}
                  dir="rtl"
                  tabIndex={-1}
                  onClick={() => onOpen(item)}
                  className={`shrink-0 rounded-full border px-4 py-2 transition-colors duration-500 ${ROW_SIZE[r]} ${r === 3 ? "font-display" : ""} ${look}`}
                >
                  <span className={`ml-2 text-xs font-normal ${hit ? "text-black/60" : "opacity-60"}`}>{TYPE_LABEL[item.type]}</span>
                  {item.title}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});

function ReadingDrawer({
  item,
  onClose,
  onOpen,
}: {
  item: ArchiveItem;
  onClose: () => void;
  onOpen: (i: ArchiveItem) => void;
}) {
  const [copied, setCopied] = useState<"text" | "cite" | null>(null);
  const [size, setSize] = useState(1); // 0..3
  const [paper, setPaper] = useState(false);
  const tts = useReadAloud();
  const Icon = TYPE_ICON[item.type];
  const related = ITEMS.filter((i) => i.id !== item.id && (i.type === item.type || i.tags.some((t) => item.tags.includes(t)))).slice(0, 3);

  useEffect(() => {
    tts.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const BODY = ["text-lg", "text-xl", "text-2xl", "text-3xl"][size];
  const citation = `المصدر: أرشيف الشيخ محمد علي الصابوني — ${TYPE_LABEL[item.type]}: «${item.title}» (${item.meta})`;
  const fullText = `${item.title}. ${item.excerpt} ${item.body}`;

  const copy = (what: "text" | "cite") => {
    navigator.clipboard.writeText(what === "text" ? `${item.title}\n\n${item.body}\n\n${citation}` : citation);
    setCopied(what);
    setTimeout(() => setCopied(null), 1800);
  };

  const shareWhatsApp = () => {
    const text = `${item.title}\n\n${item.excerpt}\n\n${citation}\n${typeof window !== "undefined" ? window.location.href : ""}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  // colors for dark vs. paper reading mode
  const c = paper
    ? { panel: "bg-[#F2EDDD] text-[#141414] border-black/10", sub: "text-black/65", faint: "text-black/55", line: "border-black/10", chip: "border-black/15 text-black/70", btn: "border-black/15 hover:bg-black/5" }
    : { panel: "bg-[#0A0A0A] text-white border-white/10", sub: "text-white/75", faint: "text-white/55", line: "border-white/10", chip: "border-white/15 text-white/60", btn: "border-white/15 hover:bg-white/5" };

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <aside className={`drawer-in absolute inset-y-0 left-0 flex w-full max-w-2xl flex-col border-r ${c.panel}`}>
        {/* top bar */}
        <div className={`flex items-center justify-between border-b px-5 py-3 ${c.line}`}>
          <span className={`flex items-center gap-2 text-base ${paper ? "text-black" : "text-[#F8E008]"}`}>
            <Icon className="h-5 w-5" />
            {TYPE_LABEL[item.type]} · {item.meta}
          </span>
          <button onClick={onClose} className={`flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold ${c.btn}`} aria-label="إغلاق">
            <X className="h-5 w-5" /> إغلاق
          </button>
        </div>

        {/* reading tools — labelled, large targets */}
        <div className={`flex flex-wrap items-center gap-2 border-b px-5 py-3 ${c.line}`}>
          {tts.supported && (
            <button
              onClick={() => (tts.speaking ? tts.stop() : tts.speak(fullText))}
              className={`flex h-11 items-center gap-2 rounded-full px-5 text-base font-bold transition ${
                tts.speaking ? "listening bg-[#F8E008] text-black" : paper ? "bg-black text-white" : "bg-white text-black hover:bg-[#F8E008] hover:text-black"
              }`}
            >
              {tts.speaking ? <Square className="h-4 w-4 fill-current" /> : <Volume2 className="h-5 w-5" />}
              {tts.speaking ? "إيقاف القراءة" : "استمع للنص"}
            </button>
          )}
          <div className={`flex h-11 items-center rounded-full border ${c.line}`}>
            <button onClick={() => setSize((v) => Math.max(0, v - 1))} disabled={size === 0} className="grid h-11 w-11 place-items-center disabled:opacity-30" aria-label="تصغير الخط">
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-1 text-sm">حجم الخط</span>
            <button onClick={() => setSize((v) => Math.min(3, v + 1))} disabled={size === 3} className="grid h-11 w-11 place-items-center disabled:opacity-30" aria-label="تكبير الخط">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button onClick={() => setPaper(!paper)} aria-pressed={paper} className={`h-11 rounded-full border px-4 text-sm font-bold ${c.btn}`}>
            {paper ? "الوضع الداكن" : "وضع الورق"}
          </button>
        </div>
        {tts.supported && !tts.hasArabic && (
          <p className={`px-5 pt-3 text-sm ${c.faint}`}>ملاحظة: جهازك قد لا يحتوي على صوت عربي، فقد تكون القراءة الصوتية غير دقيقة.</p>
        )}

        {/* content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
          <h3 className="font-display text-3xl leading-snug sm:text-4xl">{item.title}</h3>

          <div className={`mt-6 rounded-2xl border-r-4 p-5 ${paper ? "border-black bg-black/5" : "border-[#F8E008] bg-white/[0.04]"}`}>
            <p className={`mb-1 text-sm font-bold ${c.faint}`}>الخلاصة</p>
            <p className={`${BODY} leading-relaxed`}>{item.excerpt}</p>
          </div>

          <p className={`mt-8 ${BODY} leading-[2] ${c.sub}`}>{item.body}</p>

          {/* source box — makes the site a citable reference */}
          <div className={`mt-10 rounded-2xl border p-5 ${c.line}`}>
            <p className={`flex items-center gap-2 text-sm font-bold ${c.faint}`}>
              <BookMarked className="h-4 w-4" /> المصدر والتوثيق
            </p>
            <p className="mt-2 text-base leading-relaxed">{citation}</p>
            <button onClick={() => copy("cite")} className={`mt-3 flex h-10 items-center gap-2 rounded-full border px-4 text-sm ${c.btn}`}>
              {copied === "cite" ? <Check className="h-4 w-4 text-[#2f9e44]" /> : <Copy className="h-4 w-4" />}
              {copied === "cite" ? "تم نسخ المصدر" : "انسخ المصدر"}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <span key={t} className={`rounded-full border px-3 py-1 text-sm ${c.chip}`}>
                #{t}
              </span>
            ))}
          </div>

          {related.length > 0 && (
            <div className="mt-12">
              <p className={`mb-3 text-base font-bold ${c.faint}`}>قد يهمّك أيضاً</p>
              <div className={`divide-y border-y ${c.line} ${paper ? "divide-black/10" : "divide-white/10"}`}>
                {related.map((r) => (
                  <button key={r.id} onClick={() => onOpen(r)} className="flex w-full items-center justify-between gap-4 py-4 text-right text-lg hover:underline">
                    <span>{r.title}</span>
                    <span className={`shrink-0 text-sm ${c.faint}`}>{TYPE_LABEL[r.type]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* bottom actions */}
        <div className={`grid grid-cols-2 gap-2 border-t px-5 py-4 ${c.line}`}>
          <button onClick={shareWhatsApp} className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] text-base font-bold text-black">
            <Share2 className="h-5 w-5" /> شارك عبر واتساب
          </button>
          <button onClick={() => copy("text")} className={`flex h-12 items-center justify-center gap-2 rounded-full border text-base font-bold ${c.btn}`}>
            {copied === "text" ? <Check className="h-5 w-5 text-[#2f9e44]" /> : <Copy className="h-5 w-5" />}
            {copied === "text" ? "تم النسخ" : "انسخ النص"}
          </button>
        </div>
      </aside>
    </div>
  );
}
