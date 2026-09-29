"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp, AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import SmartSearchModal from "@/components/SmartSearchModal";
import CartDrawer from "@/components/CartDrawer";
import ContentReaderModal from "@/components/ContentReaderModal";
import {
  Search,
  BookOpen,
  HelpCircle,
  Volume2,
  FileText,
  Layers,
  Sparkles,
  ArrowLeft,
  Play,
  Filter,
  CheckCircle2,
  Compass,
  Heart,
  Quote,
  Eye,
  Download,
  ShoppingBag,
} from "lucide-react";

function ArchiveContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "all";
  const initialSlug = searchParams.get("slug");

  const { playAudio, addToCart } = useApp();
  const [activeType, setActiveType] = useState<string>(initialType);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReaderItem, setSelectedReaderItem] = useState<any | null>(null);

  const CONTENT_TABS = [
    { type: "all", label: "جميع الأقسام", icon: Layers },
    { type: "fatwa", label: "الفتاوى والأحكام", icon: HelpCircle },
    { type: "book", label: "الكتب والمؤلفات", icon: BookOpen },
    { type: "hadith", label: "الأحاديث وشروحها", icon: FileText },
    { type: "fiqh_research", label: "الأبحاث الفقهية", icon: Layers },
    { type: "article", label: "المقالات الفكرية", icon: FileText },
    { type: "lecture", label: "الدروس والخطب", icon: Volume2 },
    { type: "poem", label: "الشعر والقصائد", icon: Sparkles },
    { type: "dhikr", label: "الأذكار والأدعية", icon: Heart },
    { type: "document_photo", label: "الصور والوثائق", icon: Compass },
    { type: "audio", label: "الصوتيات", icon: Volume2 },
    { type: "video", label: "المرئيات", icon: Play },
    { type: "quote", label: "الدرر والأقوال", icon: Quote },
  ];

  const CATEGORIES = [
    "all",
    "تفسير",
    "فقه وأصول",
    "حديث وسنة",
    "عقيدة",
    "سلوك ورقائق",
    "سيرة وتاريخ",
  ];

  useEffect(() => {
    if (initialType && initialType !== activeType) {
      setActiveType(initialType);
    }
  }, [initialType]);

  useEffect(() => {
    setLoading(true);
    let url = `/api/content?type=${activeType}&category=${activeCategory}`;
    if (searchQuery.trim()) {
      url += `&q=${encodeURIComponent(searchQuery.trim())}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setItems(data.items);
          if (initialSlug) {
            const matched = data.items.find((i: any) => i.slug === initialSlug);
            if (matched) setSelectedReaderItem(matched);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeType, activeCategory, searchQuery, initialSlug]);

  const getTypeLabel = (t: string) => {
    const tab = CONTENT_TABS.find((tab) => tab.type === t);
    return tab ? tab.label : t;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title & Intro */}
        <div className="bg-white rounded-3xl border border-[#E0D7C9] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#731A29] tracking-wider uppercase block mb-1">
                الأرشيف العلمي الشامل
              </span>
              <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-slate-900">
                مكتبة وتراث العلامة الشيخ محمد علي الصابوني
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
                تصفح آلاف المواد العلمية المحررة، من فتاوى، مؤلفات، أبحاث فقهية، وتسجيلات صوتية ومرئية مع فهارس دقيقة وبحث مباشر.
              </p>
            </div>

            {/* Direct Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="تصفية حسب العنوان أو النص..."
                className="w-full pr-10 pl-4 py-2.5 bg-[#FAF8F5] rounded-xl border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
              />
            </div>
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100 pb-1 scrollbar-none text-xs">
            {CONTENT_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.type}
                  onClick={() => setActiveType(tab.type)}
                  className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 shrink-0 transition ${
                    activeType === tab.type
                      ? "bg-[#731A29] text-white shadow-sm"
                      : "bg-[#FAF8F5] text-slate-700 hover:bg-[#F0EAE0] border border-[#E0D7C9]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
            <span className="text-slate-400 font-semibold shrink-0">المجال الشرعي:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
                  activeCategory === cat
                    ? "bg-slate-800 text-white font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "all" ? "كافة المجالات" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            عرض <strong className="text-slate-800">{items.length}</strong> مادة مؤرشفة
          </span>
        </div>

        {/* Content Cards Grid */}
        {loading ? (
          <div className="py-24 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-[#731A29] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">جاري تحميل المواد العلمية وتصفيتها...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E0D7C9] p-16 text-center space-y-2">
            <p className="font-bold text-slate-700 text-sm">لم يتم العثور على مواد في هذا القسم</p>
            <p className="text-xs text-slate-500">جرب تغيير كلمات البحث أو اختيار تصنيف آخر.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="paper-card rounded-2xl p-5 flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#731A29]/10 text-[#731A29]">
                      {getTypeLabel(item.type)}
                    </span>
                    <span className="text-[11px] text-amber-800 font-semibold">
                      {item.category}
                    </span>
                  </div>

                  {/* Image (if present) */}
                  {item.coverImage && (
                    <div className="h-40 w-full rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                  )}

                  {/* Title */}
                  <h3
                    onClick={() => setSelectedReaderItem(item)}
                    className="font-amiri text-lg font-bold text-slate-900 group-hover:text-[#731A29] transition cursor-pointer line-clamp-2"
                  >
                    {item.title}
                  </h3>

                  {/* Summary */}
                  {item.summary && (
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  )}

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1">
                    {item.source && (
                      <span className="truncate max-w-[160px] bg-slate-50 px-2 py-0.5 rounded">
                        {item.source}
                      </span>
                    )}
                    {item.metadata?.duration && (
                      <span className="bg-slate-50 px-2 py-0.5 rounded">
                        ⏱ {item.metadata.duration}
                      </span>
                    )}
                    {item.metadata?.narrator && (
                      <span className="bg-slate-50 px-2 py-0.5 rounded">
                        عن: {item.metadata.narrator}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Eye className="w-3.5 h-3.5 inline" />
                    <span>{item.viewsCount?.toLocaleString("ar-SY") || 0}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* If book, offer cart */}
                    {item.type === "book" && (
                      <button
                        onClick={() =>
                          addToCart({
                            id: item.id,
                            title: item.title,
                            price: item.metadata?.price || 25,
                            priceSyp: item.metadata?.priceSyp || 350000,
                            coverImage: item.coverImage,
                            format: "physical",
                          })
                        }
                        className="p-1.5 text-[#731A29] hover:bg-[#731A29]/10 rounded-lg transition"
                        title="طلب الكتاب"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    )}

                    {/* If audio, trigger player */}
                    {item.mediaUrl && (
                      <button
                        onClick={() =>
                          playAudio({
                            title: item.title,
                            author: item.author || "الشيخ محمد علي الصابوني",
                            url: item.mediaUrl,
                            category: item.category,
                          })
                        }
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        title="استماع"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#731A29]" />
                        <span>استماع</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedReaderItem(item)}
                      className="px-3 py-1.5 bg-[#731A29] hover:bg-[#58121E] text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>قراءة</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <GlobalAudioPlayer />
      <SmartSearchModal />
      <CartDrawer />
      <ContentReaderModal
        item={selectedReaderItem}
        onClose={() => setSelectedReaderItem(null)}
      />

      <Footer />
    </div>
  );
}

export default function ArchivePage() {
  return (
    <AppProvider>
      <Suspense fallback={<div className="p-12 text-center">جاري التحميل...</div>}>
        <ArchiveContent />
      </Suspense>
    </AppProvider>
  );
}
