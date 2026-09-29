"use client";

import React, { useState, useEffect } from "react";
import { useApp, AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import SmartSearchModal from "@/components/SmartSearchModal";
import CartDrawer from "@/components/CartDrawer";
import {
  BookOpen,
  Volume2,
  Copy,
  Check,
  Search,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Share2,
  Bookmark,
  SlidersHorizontal,
} from "lucide-react";

const SURAHS = [
  { number: 1, name: "الفاتحة", versesCount: 7, type: "مكية" },
  { number: 2, name: "البقرة", versesCount: 286, type: "مدنية" },
  { number: 3, name: "آل عمران", versesCount: 200, type: "مدنية" },
  { number: 18, name: "الكهف", versesCount: 110, type: "مكية" },
  { number: 36, name: "يس", versesCount: 83, type: "مكية" },
  { number: 55, name: "الرحمن", versesCount: 78, type: "مدنية" },
  { number: 67, name: "الملك", versesCount: 30, type: "مكية" },
  { number: 112, name: "الإخلاص", versesCount: 4, type: "مكية" },
  { number: 113, name: "الفلق", versesCount: 5, type: "مكية" },
  { number: 114, name: "الناس", versesCount: 6, type: "مكية" },
];

function TafsirExplorerContent() {
  const { playAudio } = useApp();
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [verses, setVerses] = useState<any[]>([]);
  const [activeVerseIndex, setActiveVerseIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("large");
  const [activeTab, setActiveTab] = useState<"all" | "tafsir" | "linguistic" | "rulings">("all");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tafsir?surah=${selectedSurah}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.verses && data.verses.length > 0) {
          setVerses(data.verses);
          setActiveVerseIndex(0);
        } else {
          // If no specific seeded verse for this surah yet, fetch all available
          fetch(`/api/tafsir`)
            .then((r) => r.json())
            .then((d) => {
              if (d.success && d.verses) {
                setVerses(d.verses);
                setActiveVerseIndex(0);
              }
            });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSurah]);

  const currentVerse = verses[activeVerseIndex] || null;

  const handleCopy = () => {
    if (!currentVerse) return;
    const text = `قال تعالى: {${currentVerse.ayahText}} [سورة ${currentVerse.surahName}: ${currentVerse.ayahNumber}]\n\nتفسير صفوة التفاسير للشيخ الصابوني:\n${currentVerse.tafsirFull}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "large":
        return "text-2xl sm:text-3xl leading-loose";
      case "xlarge":
        return "text-3xl sm:text-4xl leading-loose font-bold";
      default:
        return "text-xl sm:text-2xl leading-relaxed";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Title */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>الرئيسية</span>
            <span>/</span>
            <span className="text-[#731A29] font-bold">مستكشف صفوة التفاسير</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-slate-900">
                مستكشف كتاب «صفوة التفاسير»
              </h1>
              <p className="text-xs text-slate-500">
                الموسوعة القرآنية الجامعة للعلامة الشيخ محمد علي الصابوني رحمه الله
              </p>
            </div>

            {/* Font size and options */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-[#E0D7C9] rounded-xl p-1 text-xs">
                <span className="text-slate-400 px-2">حجم الخط:</span>
                <button
                  onClick={() => setFontSize("normal")}
                  className={`px-2 py-1 rounded-lg ${fontSize === "normal" ? "bg-[#731A29] text-white" : "text-slate-700"}`}
                >
                  أ
                </button>
                <button
                  onClick={() => setFontSize("large")}
                  className={`px-2 py-1 rounded-lg ${fontSize === "large" ? "bg-[#731A29] text-white" : "text-slate-700"}`}
                >
                  أ+
                </button>
                <button
                  onClick={() => setFontSize("xlarge")}
                  className={`px-2 py-1 rounded-lg ${fontSize === "xlarge" ? "bg-[#731A29] text-white" : "text-slate-700"}`}
                >
                  أ++
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Sidebar Surahs + Verse Commentary View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar: Surahs List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E0D7C9] p-4 shadow-sm space-y-3">
              <h3 className="font-amiri text-base font-bold text-slate-800 flex items-center justify-between">
                <span>فهرس السور القرآنية</span>
                <span className="text-xs font-sans text-slate-400 font-normal">
                  {SURAHS.length} سورة متاحة
                </span>
              </h3>

              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {SURAHS.map((s) => (
                  <button
                    key={s.number}
                    onClick={() => setSelectedSurah(s.number)}
                    className={`w-full text-right p-3 rounded-xl transition flex items-center justify-between text-xs ${
                      selectedSurah === s.number
                        ? "bg-[#731A29] text-white font-bold shadow"
                        : "hover:bg-[#F5EFE6] text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold ${
                          selectedSurah === s.number
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {s.number}
                      </span>
                      <span className="font-amiri text-sm">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] opacity-80">
                      <span>{s.type}</span>
                      <span>• {s.versesCount} آية</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Area: Verse & Full Tafsir Reader */}
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <div className="bg-white rounded-2xl border border-[#E0D7C9] p-16 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-[#731A29] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs font-medium">جاري تحميل التفسير والفوائد البلاغية...</p>
              </div>
            ) : currentVerse ? (
              <div className="bg-white rounded-3xl border border-[#E0D7C9] p-6 sm:p-8 shadow-sm space-y-6">
                {/* Verse Header Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-amiri text-lg font-bold text-[#731A29]">
                      سورة {currentVerse.surahName}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
                      الآية رقم ({currentVerse.ayahNumber})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentVerse.audioUrl && (
                      <button
                        onClick={() =>
                          playAudio({
                            title: `تفسير سورة ${currentVerse.surahName} آية ${currentVerse.ayahNumber}`,
                            author: "الشيخ محمد علي الصابوني",
                            url: currentVerse.audioUrl,
                            category: "صفوة التفاسير",
                          })
                        }
                        className="px-3 py-1.5 bg-[#731A29]/10 hover:bg-[#731A29] hover:text-white text-[#731A29] rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>استماع صوتي</span>
                      </button>
                    )}

                    <button
                      onClick={handleCopy}
                      className="p-2 text-slate-600 hover:text-[#731A29] bg-slate-100 hover:bg-[#731A29]/10 rounded-xl transition"
                      title="نسخ الآية وتفسيرها"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* The Holy Quran Verse Display */}
                <div className="p-6 sm:p-8 bg-[#FAF8F5] rounded-2xl border border-[#EAE3D7] text-center shadow-inner">
                  <p className={`font-amiri font-bold text-slate-900 ${getFontSizeClass()}`}>
                    {currentVerse.ayahText}
                  </p>
                </div>

                {/* Tabs Filter (All, Tafsir, Linguistic Nuances, Legal Rulings) */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeTab === "all" ? "bg-[#731A29] text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    عرض شامل
                  </button>
                  <button
                    onClick={() => setActiveTab("tafsir")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeTab === "tafsir" ? "bg-[#731A29] text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    التفسير والبيان
                  </button>
                  {currentVerse.linguisticNuances && (
                    <button
                      onClick={() => setActiveTab("linguistic")}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        activeTab === "linguistic" ? "bg-[#731A29] text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      اللطائف البلاغية
                    </button>
                  )}
                  {currentVerse.legalRulings && (
                    <button
                      onClick={() => setActiveTab("rulings")}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        activeTab === "rulings" ? "bg-[#731A29] text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      الأحكام المستنبطة
                    </button>
                  )}
                </div>

                {/* Tafsir Content Sections */}
                <div className="space-y-6 text-slate-800">
                  {(activeTab === "all" || activeTab === "tafsir") && (
                    <div className="space-y-3">
                      <div className="p-4 bg-[#F5EFE6] border-r-4 border-[#731A29] rounded-xl text-xs sm:text-sm text-slate-700 italic font-medium leading-relaxed">
                        <span className="font-bold text-[#731A29] block mb-1 font-sans not-italic">
                          المعنى الإجمالي:
                        </span>
                        {currentVerse.tafsirSummary}
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-amiri text-lg font-bold text-slate-900">
                          الشرح التفصيلي للشيخ الصابوني:
                        </h4>
                        <p className="text-sm sm:text-base leading-loose whitespace-pre-line text-slate-700">
                          {currentVerse.tafsirFull}
                        </p>
                      </div>
                    </div>
                  )}

                  {(activeTab === "all" || activeTab === "linguistic") && currentVerse.linguisticNuances && (
                    <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        اللطائف والفوائد البلاغية والبيانية:
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {currentVerse.linguisticNuances}
                      </p>
                    </div>
                  )}

                  {(activeTab === "all" || activeTab === "rulings") && currentVerse.legalRulings && (
                    <div className="p-5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        الأحكام الفقهية المستنبطة:
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {currentVerse.legalRulings}
                      </p>
                    </div>
                  )}

                  {currentVerse.revelationReason && (
                    <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-700">أسباب النزول: </span>
                      {currentVerse.revelationReason}
                    </div>
                  )}
                </div>

                {/* Verses Pagination Navigation */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    disabled={activeVerseIndex === 0}
                    onClick={() => setActiveVerseIndex((prev) => Math.max(prev - 1, 0))}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-40 transition flex items-center gap-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>الآية السابقة</span>
                  </button>

                  <span className="text-xs font-medium text-slate-500">
                    {activeVerseIndex + 1} من {verses.length}
                  </span>

                  <button
                    disabled={activeVerseIndex >= verses.length - 1}
                    onClick={() => setActiveVerseIndex((prev) => Math.min(prev + 1, verses.length - 1))}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-40 transition flex items-center gap-1"
                  >
                    <span>الآية التالية</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E0D7C9] p-12 text-center text-slate-500">
                <p className="text-sm font-medium">اختر سورة أو آية من القائمة للبدء في القراءة.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <GlobalAudioPlayer />
      <SmartSearchModal />
      <CartDrawer />
      <Footer />
    </div>
  );
}

export default function TafsirPage() {
  return (
    <AppProvider>
      <TafsirExplorerContent />
    </AppProvider>
  );
}
