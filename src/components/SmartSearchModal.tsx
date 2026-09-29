"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  BookOpen,
  HelpCircle,
  Volume2,
  FileText,
  Sparkles,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Filter,
} from "lucide-react";

interface SearchResultItem {
  id: number;
  title: string;
  slug: string;
  type: string;
  category: string;
  summary: string;
  viewsCount: number;
  author: string;
}

interface TafsirMatchItem {
  id: number;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  tafsirSummary: string;
}

export default function SmartSearchModal() {
  const { isSearchOpen, setIsSearchOpen, searchInitialQuery, playAudio } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [tafsirMatches, setTafsirMatches] = useState<TafsirMatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const SUGGESTED_TOPICS = [
    { label: "تأخير الصلاة", query: "تأخير الصلاة" },
    { label: "ميراث البنات", query: "الميراث للبنات" },
    { label: "سورة الكهف", query: "تفسير سورة الكهف" },
    { label: "صفوة التفاسير", query: "صفوة التفاسير" },
    { label: "زكاة المال", query: "زكاة المال" },
    { label: "دروس مكة وحلب", query: "حلب" },
    { label: "أذكار الصباح", query: "أذكار الصباح" },
  ];

  useEffect(() => {
    if (isSearchOpen) {
      if (searchInitialQuery) {
        setQuery(searchInitialQuery);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen, searchInitialQuery]);

  // Keyboard shortcut for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Perform search query
  useEffect(() => {
    if (!isSearchOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `/api/search?q=${encodeURIComponent(query)}&type=${activeTypeFilter}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setResults(data.results || []);
          setTafsirMatches(data.tafsirMatches || []);
          setTypeCounts(data.counts?.byType || {});
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, activeTypeFilter, isSearchOpen]);

  if (!isSearchOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "fatwa":
        return <HelpCircle className="w-4 h-4 text-emerald-600" />;
      case "book":
        return <BookOpen className="w-4 h-4 text-[#8E2336]" />;
      case "hadith":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "audio":
        return <Volume2 className="w-4 h-4 text-purple-600" />;
      case "poem":
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "fatwa":
        return "فتوى";
      case "book":
        return "كتاب";
      case "hadith":
        return "حديث نبوي";
      case "fiqh_research":
        return "بحث فقهي";
      case "article":
        return "مقال";
      case "lecture":
        return "محاضرة";
      case "poem":
        return "شعر";
      case "dhikr":
        return "أذكار ودعاء";
      case "audio":
        return "صوتيات";
      case "video":
        return "مرئيات";
      case "quote":
        return "درر وأقوال";
      default:
        return "مادة علمية";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E0D7C9] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Top Search Input Bar */}
        <div className="p-4 bg-white border-b border-[#EAE3D7] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#8E2336] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في فتاوى، مؤلفات، آيات صفوة التفاسير، الصوتيات والأبحاث..."
            className="w-full text-base sm:text-lg bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
          >
            <span className="text-xs font-semibold px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
              ESC
            </span>
          </button>
        </div>

        {/* Suggested Queries Pills */}
        <div className="px-4 py-2.5 bg-[#F5F0E8] border-b border-[#EAE3D7] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            مقترحات ذكية:
          </span>
          {SUGGESTED_TOPICS.map((topic) => (
            <button
              key={topic.label}
              onClick={() => setQuery(topic.query)}
              className="px-2.5 py-1 rounded-full bg-white text-slate-700 hover:bg-[#8E2336] hover:text-white border border-[#E2D9CC] transition shrink-0"
            >
              {topic.label}
            </button>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 bg-white border-b border-[#EAE3D7] flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTypeFilter("all")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTypeFilter === "all"
                ? "bg-[#8E2336] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setActiveTypeFilter("fatwa")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTypeFilter === "fatwa"
                ? "bg-[#8E2336] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            فتاوى {typeCounts["fatwa"] ? `(${typeCounts["fatwa"]})` : ""}
          </button>
          <button
            onClick={() => setActiveTypeFilter("book")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTypeFilter === "book"
                ? "bg-[#8E2336] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            كتب ومؤلفات {typeCounts["book"] ? `(${typeCounts["book"]})` : ""}
          </button>
          <button
            onClick={() => setActiveTypeFilter("audio")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTypeFilter === "audio"
                ? "bg-[#8E2336] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            صوتيات {typeCounts["audio"] ? `(${typeCounts["audio"]})` : ""}
          </button>
          <button
            onClick={() => setActiveTypeFilter("fiqh_research")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTypeFilter === "fiqh_research"
                ? "bg-[#8E2336] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            أبحاث
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-[#8E2336] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs">جاري البحث الذكي واستخراج النتائج...</p>
            </div>
          ) : (
            <>
              {/* Tafsir Direct Matches */}
              {tafsirMatches.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#8E2336] flex items-center gap-1.5 uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    نتائج مباشرة من تفسير "صفوة التفاسير"
                  </h4>
                  <div className="space-y-2">
                    {tafsirMatches.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push(`/tafsir?surah=${t.surahNumber}&ayah=${t.ayahNumber}`);
                        }}
                        className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl hover:bg-amber-100/70 cursor-pointer transition"
                      >
                        <div className="flex items-center justify-between text-xs text-amber-900 font-semibold mb-1">
                          <span>سورة {t.surahName} - الآية ({t.ayahNumber})</span>
                          <span className="text-[11px] text-amber-700 underline">عرض التفسير كاملاً</span>
                        </div>
                        <p className="font-amiri text-base font-bold text-slate-900 mb-1">
                          «{t.ayahText}»
                        </p>
                        <p className="text-xs text-slate-700 line-clamp-2">
                          {t.tafsirSummary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Items Matches */}
              {results.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    المواد العلمية ({results.length})
                  </h4>
                  <div className="space-y-2">
                    {results.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          if (item.type === "book") {
                            router.push(`/store#book-${item.id}`);
                          } else {
                            router.push(`/archive?slug=${item.slug}`);
                          }
                        }}
                        className="p-3.5 bg-white border border-[#EAE3D7] rounded-xl hover:border-[#8E2336] hover:shadow-sm cursor-pointer transition flex items-start justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-[#8E2336]/10 transition shrink-0">
                            {getTypeIcon(item.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {getTypeLabel(item.type)}
                              </span>
                              <span className="text-[10px] text-amber-700 font-medium">
                                {item.category}
                              </span>
                            </div>
                            <h5 className="text-sm font-bold text-slate-800 group-hover:text-[#8E2336] transition">
                              {item.title}
                            </h5>
                            {item.summary && (
                              <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                                {item.summary}
                              </p>
                            )}
                          </div>
                        </div>

                        <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-[#8E2336] shrink-0 mt-2 transition transform group-hover:-translate-x-1" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                tafsirMatches.length === 0 && (
                  <div className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">لم يتم العثور على نتائج مطابقة لكلمة البحث</p>
                    <p className="text-xs text-slate-400 mt-1">
                      جرب البحث بكلمات أخرى مثل: تأخير الصلاة، المواريث، الكهف، أو صفوة التفاسير
                    </p>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#F5F0E8] border-t border-[#EAE3D7] flex items-center justify-between text-[11px] text-slate-500">
          <span>محرك البحث الدلالي لموسوعة الشيخ الصابوني</span>
          <span>اضغط ↵ للفتح أو ESC للإغلاق</span>
        </div>
      </div>
    </div>
  );
}
