"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
import HeroCinema from "@/components/home/HeroCinema";
import { PrefsProvider } from "@/components/home/prefs";
import { useVoiceSearch, useReadAloud } from "@/components/home/voice";

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

const TAPE_A = ["صفوة التفاسير", "روائع البيان", "التبيان في علوم القرآن", "المواريث في الشريعة", "من كنوز السنة"];
const TAPE_B = ["٣٤٠٠ فتوى", "٨٥٠ درساً وخطبة", "٦٠٠ مقال وبحث", "٥٠ كتاباً", "سبعون عاماً من العلم"];

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
  const [pastHero, setPastHero] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeSec, setActiveSec] = useState<string | null>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* ---------- search ---------- */
  const currentIntent = INTENTS.find((x) => x.id === intent) || null;
  const { results, tokens, ms } = useMemo(() => {
    const t0 = typeof performance !== "undefined" ? performance.now() : 0;
    const r = searchArchive(query, currentIntent?.filter);
    const t1 = typeof performance !== "undefined" ? performance.now() : 0;
    return { ...r, ms: Math.max(t1 - t0, 0.01) };
  }, [query, currentIntent]);

  const hasSearch = query.trim().length > 0 || intent !== null;
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
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? Math.min(1, window.scrollY / h) : 0);
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

  const showPanel = focused && hasSearch;
  const searching = focused && query.trim().length > 0;

  const voice = useVoiceSearch((t) => {
    setQuery(t);
    inputRef.current?.focus();
  });

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="grain pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-overlay" />
      {/* شريط تقدم القراءة — يملأ بالذهبي كلما نزلت */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[75] h-[3px] origin-right bg-gradient-to-l from-gold3 via-gold to-gold2"
        style={{ transform: `scaleX(${scrollPct})` }}
        aria-hidden
      />
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
            <span className="font-display grid h-8 w-8 place-items-center rounded-full bg-[#E8E3D7] text-lg text-black">ص</span>
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
                {activeSec === s.id && <span className="absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#E8E3D7]" />}
                {s.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => jumpToSearch(null)}
              className={`hidden items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-sm text-white/70 transition-all duration-500 hover:border-[#E8E3D7] hover:text-white sm:flex ${
                pastHero ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
              }`}
              aria-label="ابحث"
            >
              <Search className="h-4 w-4" />
              ابحث
              <kbd className="rounded border border-white/15 px-1.5 text-xs text-white/55">/</kbd>
            </button>
            <a href="#store" className="rounded-full bg-[#E8E3D7] px-5 py-2 text-sm font-bold text-ink transition hover:bg-gold2">
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
              className="mt-1 flex w-full items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-right text-[#E8E3D7]"
            >
              <Search className="h-4 w-4" /> ابحث في الأرشيف
            </button>
          </div>
        )}
      </header>

      {/* ================= HERO: الفيلم السينمائي للشيخ ================= */}
      <section
        key={ready ? "hero-on" : "hero-off"}
        className="relative min-h-[100svh] overflow-x-clip"
      >
        {/* الخلفية: فيلم الشخصية (يتحول لفيديو حقيقي عند إضافته) */}
        <HeroCinema />

        {/* تعتيم متدرّج من جهة النص (يمين) + تدرّج القاع — الفيلم يتنفس يساراً */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_left,rgba(0,0,0,0.95)_16%,rgba(0,0,0,0.75)_40%,rgba(0,0,0,0.28)_66%,rgba(0,0,0,0.04)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-ink via-ink/60 to-transparent" />

        <div className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-5 pb-44 pt-28 sm:px-8 lg:pb-32">
        <div className="max-w-2xl">
          <div
            className="grid transition-all duration-500 ease-[cubic-bezier(.2,.7,.1,1)]"
            style={{ gridTemplateRows: searching ? "0fr" : "1fr", opacity: searching ? 0 : 1 }}
            aria-hidden={searching}
          >
          <div className="min-h-0 overflow-hidden">
          <p className="rise flex items-center gap-3 text-[13px] tracking-[0.2em] text-gold2" style={{ animationDelay: "0.25s" }}>
            <span className="hairline-gold w-12" aria-hidden />
            الأرشيف الرسمي · ١٩٣٠ — ٢٠٢١
          </p>

          <h1 className="font-display mt-5 text-[3.4rem] leading-[1.06] sm:text-7xl lg:text-[5.6rem]">
            <span className="line-mask"><span className="line-in" style={{ animationDelay: "0.35s" }}>العلامة</span></span>
            <span className="line-mask"><span className="line-in" style={{ animationDelay: "0.47s" }}>محمد علي</span></span>
            <span className="line-mask"><span className="line-in gold-text" style={{ animationDelay: "0.59s" }}>الصابوني</span></span>
          </h1>

          <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-ivory/75" style={{ animationDelay: "0.7s" }}>
            سبعون عاماً من العلم — كتب وفتاوى ودروس وخطب، مجموعها هنا. ابحث بكلماتك، اقرأ، واستمع.
          </p>
          </div>
          </div>

          {/* SEARCH */}
          <div className={`rise relative max-w-xl transition-[margin] duration-500 ${searching ? "mt-0" : "mt-8"}`} style={{ animationDelay: "0.85s" }}>
            <label htmlFor="archive-search" className={`mb-3 block text-right text-base text-white/80 transition-opacity ${searching ? "opacity-100" : "sr-only"}`}>
              ابحث في أرشيف الشيخ
            </label>
            <div
              className={`relative flex items-center gap-3 rounded-2xl border bg-[#0f0f0f] px-5 py-4 transition-all duration-300 ${
                focused ? "border-[#E8E3D7] shadow-[0_0_0_6px_rgba(232,227,215,0.12)]" : "border-white/15"
              }`}
            >
              <Search className={`h-6 w-6 shrink-0 ${focused ? "text-[#E8E3D7]" : "text-white/55"}`} />

              {currentIntent && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIntent(null)}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-[#E8E3D7] px-2.5 py-1 text-xs font-bold text-black"
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
                    voice.listening ? "listening bg-[#E8E3D7] text-black" : "bg-white/10 text-white hover:bg-white/20"
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
              <div className="absolute inset-x-0 top-full z-40 mt-2 flex max-h-[min(58vh,520px)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0f0f0f] text-right shadow-[0_30px_80px_rgba(0,0,0,0.9)]" role="listbox" aria-label="نتائج البحث">
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
                                active === i ? "bg-[#E8E3D7] text-black" : "bg-white/5 text-white/60"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-bold">
                                {highlight(item.title, tokens).map((p, k) =>
                                  p.hit ? (
                                    <mark key={k} className="rounded bg-[#E8E3D7]/20 px-0.5 text-[#E8E3D7]">
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
                    ? "border-[#E8E3D7] bg-[#E8E3D7] text-black"
                    : "border-white/15 bg-black/60 text-white/70 backdrop-blur hover:border-white/40 hover:text-white"
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>
        </div>

        {/* شريط سفلي: أرقام الأرشيف فوق خلفية الفيلم */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-1.5 border-t border-gold/20 bg-ink/50 px-5 py-3.5 text-sm text-ivory/80 backdrop-blur-md">
            {[
              { n: "٥٠+", t: "كتاباً" },
              { n: "٣٤٠٠+", t: "فتوى" },
              { n: "٨٥٠+", t: "درساً وخطبة" },
              { n: "٦٠٠+", t: "مقال وبحث" },
            ].map((s) => (
              <span key={s.t} className="flex items-baseline gap-1.5">
                <span className="font-sans text-lg font-black tabular-nums text-gold">{s.n}</span>
                <span className="text-ivory/70">{s.t}</span>
              </span>
            ))}
            {hasSearch && (
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
                طابَقنا {results.length} عنواناً في الأرشيف
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ================= قصة الشيخ — مباشرة بعد الفيلم ================= */}
      <PortraitStory />

      {/* ================= KINETIC TAPES (moving text) ================= */}
      <section aria-hidden className="overflow-hidden border-t border-white/10">
        <Reveal variant="right" className="bg-[#E8E3D7] py-5" dir="ltr">
          <Marquee items={TAPE_A} duration={40} itemClass="font-display text-4xl text-black sm:text-6xl" sep="text-black/40" />
        </Reveal>
        <Reveal variant="left" delay={0.15} className="border-b border-white/10 py-5" dir="ltr">
          <Marquee items={TAPE_B} reverse duration={48} itemClass="font-display tape-gold-shine text-4xl sm:text-6xl" sep="text-gold/40" />
        </Reveal>
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
      <Reveal as="section" variant="blur" aria-hidden className="overflow-hidden border-y border-white/10 py-6" dir="ltr">
        <Marquee items={["شاهِد", "استمِع", "اقرأ", "اسأل"]} duration={30} itemClass="font-display text-stroke text-5xl sm:text-7xl" sep="text-[#E8E3D7]" />
      </Reveal>

      {/* ================= VIDEOS ================= */}
      <VideoSection />

      {/* ================= AUDIO ================= */}
      <AudioSection />

      {/* ================= الفهرس الشامل — قبل الختام ================= */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="mb-10 flex items-end justify-between">
            <Reveal variant="blur" as="h2" className="font-display text-3xl sm:text-5xl">الفهرس</Reveal>
            <p className="hidden text-sm text-white/55 sm:block">اختر باباً وننقلك إليه مباشرة</p>
          </div>

          <div className="border-t border-white/10">
            {[
              { no: "01", title: "الكتب والمؤلفات", count: "٥٠+", sub: "صفوة التفاسير · روائع البيان · المواريث", words: ["صفوة التفاسير", "روائع البيان", "المواريث", "التبيان"], img: "/images/safwat-tafasir-book.jpg", go: () => scrollToId("books") },
              { no: "02", title: "الفتاوى", count: "٣٤٠٠+", sub: "عبادات · معاملات · أسرة · مواريث", words: ["العبادات", "المعاملات", "الأسرة", "المواريث"], img: "/images/archive-manuscripts.jpg", go: () => scrollToId("fatwas") },
              { no: "03", title: "المرئيات", count: "٤٠٠+", sub: "برامج تلفزيونية · لقاءات · محاضرات", words: ["برامج تلفزيونية", "لقاءات", "محاضرات", "يوتيوب"], img: "/images/sheikh-lecture-side.jpg", go: () => scrollToId("videos") },
              { no: "04", title: "الصوتيات والخطب", count: "٨٥٠+", sub: "مجالس الحرم · خطب الجمعة · مواعظ", words: ["مجالس التفسير", "خطب الجمعة", "مواعظ", "دروس الفقه"], img: "/images/sheikh-meeting-left.jpg", go: () => scrollToId("audio") },
              { no: "05", title: "المقالات والأبحاث", count: "٦٠٠+", sub: "فكر · تجديد · بحوث محكّمة", words: ["فكر", "تجديد", "بحوث محكّمة", "سيرة"], img: "/images/aleppo-scholar.jpg", go: () => jumpToSearch("articles") },
            ].map((row, ri) => (
              <Reveal key={row.no} variant="wipe" delay={ri * 0.12}>
              <button
                onClick={row.go}
                className="sweep-hover group relative flex w-full items-center gap-6 border-b border-white/10 py-7 text-right sm:gap-10"
              >
                <span className="absolute inset-0 origin-right scale-x-0 bg-[#E8E3D7] transition-transform duration-500 ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-x-100" />
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
                  className="pointer-events-none relative hidden h-20 w-32 -rotate-3 rounded-lg object-cover opacity-0 grayscale transition duration-500 group-hover:rotate-0 group-hover:opacity-100 md:block"
                />
                <span className="relative text-lg text-white/60 transition group-hover:text-black">{row.count}</span>
                <ArrowUpLeft className="relative h-6 w-6 text-white/55 transition group-hover:-translate-x-1 group-hover:text-black" />
              </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= THE SHEIKH — تعريف بالشيخ مع لمحة فيديو ================= */}
      <section id="sheikh" className="relative scroll-mt-24 overflow-hidden border-t border-white/10">
        {/* وهج زمردي خلفي خفيف */}
        <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-gold/10 blur-[120px]" aria-hidden />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal variant="curtain" className="ornate-corner relative aspect-[4/5] overflow-hidden rounded-2xl border border-gold/25">
              <img src="/images/sheikh-portrait.jpg" alt="الشيخ محمد علي الصابوني" className="kbslow h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-2xl text-ivory">محمد علي الصابوني</p>
                <p className="mt-0.5 text-sm text-gold2">مفسّر · فقيه · معلّم</p>
              </div>
            </Reveal>

            {/* لمحة فيديو: تلاوة فجرية / فتوى */}
            <Reveal variant="up" delay={0.25} className="mt-5">
              <button
                onClick={() => scrollToId("videos")}
                className="group relative block w-full overflow-hidden rounded-2xl border border-gold/25 text-right"
                aria-label="شاهد لمحة فيديو عن الشيخ"
              >
                <div className="relative h-40 sm:h-44">
                  <img
                    src="/images/sheikh-video-poster-1.jpg"
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-ink/85 via-ink/35 to-transparent" />
                  <span className="ring-pulse absolute left-5 top-1/2 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-gold text-ink transition group-hover:scale-110">
                    <Play className="h-6 w-6 fill-current" />
                  </span>
                  <span className="absolute bottom-4 right-5">
                    <span className="block text-sm font-bold text-gold2">لمحة فيديو · تلاوة وفتوى</span>
                    <span className="mt-0.5 block text-xs text-ivory/70">من أرشيف المرئيات — شاهد الآن</span>
                  </span>
                </div>
              </button>
            </Reveal>
          </div>

          <Reveal variant="blur" delay={0.2} className="flex flex-col justify-center lg:col-span-7">
            <p className="flex items-center gap-3 text-base text-gold">
              <span className="hairline-gold w-10" aria-hidden />
              من هو الشيخ
            </p>
            <h2 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">
              من حلقات حلب
              <br />
              إلى <span className="gold-text">أروقة الحرم.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory/60">
              وُلد في حلب، ودرس في الأزهر، ثم قضى عقوداً يدرّس التفسير في مكة المكرمة. كتب «صفوة التفاسير» ليصل معنى القرآن إلى كل قارئ، متخصصاً كان أو غير متخصص.
            </p>

            <Reveal variant="wipe" className="mt-12">
              <div className="hairline-gold" />
            </Reveal>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gold/15 bg-gold/15 sm:grid-cols-4">
              {[
                { y: "1930", t: "المولد في حلب" },
                { y: "1952", t: "التخرج في الأزهر" },
                { y: "1980", t: "صفوة التفاسير" },
                { y: "2021", t: "الوفاة في تركيا" },
              ].map((m, mi) => (
                <Reveal key={m.y} variant="zoom" delay={0.4 + mi * 0.12} className="bg-ink p-5">
                  <p className="font-sans text-2xl font-black text-gold">{m.y}</p>
                  <p className="mt-1 text-base text-ivory/75">{m.t}</p>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= STORE ================= */}
      <section id="store" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Reveal
            variant="zoom"
            className="ornate-corner relative flex flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-l from-bronze2 via-bronze to-bronze2 p-8 text-ivory sm:p-12 md:flex-row md:items-center"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-[90px]" aria-hidden />
            <div className="relative max-w-xl">
              <p className="text-sm font-bold tracking-widest text-gold2">المتجر</p>
              <h2 className="font-display mt-2 text-3xl leading-tight sm:text-5xl">
                اقتنِ <span className="gold-text">النسخة المطبوعة.</span>
              </h2>
              <p className="mt-4 text-base text-ivory/70">طبعات معتمدة، وتوصيل داخل سوريا وخارجها، ودفع بالطريقة التي تناسبك.</p>
            </div>
            <div className="relative flex items-center gap-4">
              <img src="/images/safwat-tafasir-book.jpg" alt="" className="float-y hidden h-36 w-28 rounded-lg object-cover shadow-2xl ring-1 ring-gold/40 sm:block" />
              <a href="#store" className="flex items-center gap-2 rounded-full bg-gold px-7 py-4 font-bold text-ink transition hover:bg-gold2 hover:gap-3">
                <ShoppingBag className="h-4 w-4" />
                تصفّح الكتب
                <ArrowLeft className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10">
        <div className="hairline-gold" aria-hidden />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-white/55 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="font-display grid h-7 w-7 place-items-center rounded-md bg-[#E8E3D7] text-sm text-black">ص</span>
            <span className="text-white/70">الصابوني — الأرشيف العلمي</span>
          </div>
          <p>صدقة جارية عن روح الشيخ محمد علي الصابوني رحمه الله</p>
        </div>
      </footer>

      {open && <ReadingDrawer item={open} onClose={() => setOpen(null)} onOpen={setOpen} />}
    </div>
  );
}

/* ====================================================================== */


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
    : { panel: "bg-[#0f0f0f] text-white border-white/10", sub: "text-white/75", faint: "text-white/55", line: "border-white/10", chip: "border-white/15 text-white/60", btn: "border-white/15 hover:bg-white/5" };

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <aside className={`drawer-in absolute inset-y-0 left-0 flex w-full max-w-2xl flex-col border-r ${c.panel}`}>
        {/* top bar */}
        <div className={`flex items-center justify-between border-b px-5 py-3 ${c.line}`}>
          <span className={`flex items-center gap-2 text-base ${paper ? "text-black" : "text-[#E8E3D7]"}`}>
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
                tts.speaking ? "listening bg-[#E8E3D7] text-black" : paper ? "bg-black text-white" : "bg-white text-black hover:bg-[#E8E3D7]"
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

          <div className={`mt-6 rounded-2xl border-r-4 p-5 ${paper ? "border-black bg-black/5" : "border-[#E8E3D7] bg-white/[0.04]"}`}>
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
