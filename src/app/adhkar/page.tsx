"use client";

import React, { useState } from "react";
import { useApp, AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import SmartSearchModal from "@/components/SmartSearchModal";
import CartDrawer from "@/components/CartDrawer";
import confetti from "canvas-confetti";
import {
  Heart,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  BookOpen,
} from "lucide-react";

const ADHKAR_LIST = [
  {
    id: 1,
    category: "morning",
    title: "سيد الاستغفار",
    text: "«اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ».",
    count: 1,
    virtue: "من قالها موقناً بها حين يمسي فمات من ليلته دخل الجنة، وكذلك إذا أصبح.",
  },
  {
    id: 2,
    category: "morning",
    title: "أصبحنا وأصبح الملك لله",
    text: "«أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا اليَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا اليَوْمِ وَشَرِّ مَا بَعْدَهُ».",
    count: 1,
    virtue: "دعاء نبوي مبارك لحفظ اليوم كله من كل مكروه وسوء.",
  },
  {
    id: 3,
    category: "morning",
    title: "الصلاة على النبي ﷺ",
    text: "«اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ».",
    count: 10,
    virtue: "من صلى عليّ حين يصبح عشراً وحين يمسي عشراً أدركته شفاعتي يوم القيامة.",
  },
  {
    id: 4,
    category: "evening",
    title: "أعوذ بكلمات الله التامات",
    text: "«أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ».",
    count: 3,
    virtue: "لم يضره شيء في تلك الليلة.",
  },
  {
    id: 5,
    category: "evening",
    title: "بسم الله الذي لا يضر مع اسمه شيء",
    text: "«بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ».",
    count: 3,
    virtue: "من قالها ثلاثاً لم تصبه فجأة بلاء حتى يصبح، وكذلك إذا أمسى.",
  },
  {
    id: 6,
    category: "khatm",
    title: "دعاء ختم القرآن الكريم للشيخ الصابوني",
    text: "«اللَّهُمَّ ارْحَمْنَا بِالقُرْآنِ، وَاجْعَلْهُ لَنَا إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً. اللَّهُمَّ ذَكِّرْنَا مِنْهُ مَا نَسِينَا، وَعَلِّمْنَا مِنْهُ مَا جَهِلْنَا، وَارْزُقْنَا تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لَنَا حُجَّةً يَا رَبَّ العَالَمِينَ. اللَّهُمَّ أَصْلِحْ لَنَا دِينَنَا الَّذِي هُوَ عِصْمَةُ أَمْرِنَا، وَأَصْلِحْ لَنَا دُنْيَانَا الَّتِي فِيهَا مَعَاشُنَا، وَأَصْلِحْ لَنَا آخِرَتَنَا الَّتِي إِلَيْهَا مَعَادُنَا».",
    count: 1,
    virtue: "الدعاء الجامع المأثور عن فضيلة الشيخ في ختام مجالس التفسير.",
  },
];

function AdhkarContent() {
  const [activeCategory, setActiveCategory] = useState<"morning" | "evening" | "khatm">("morning");
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredAdhkar = ADHKAR_LIST.filter((a) => a.category === activeCategory);

  const incrementCount = (id: number, targetCount: number) => {
    const current = counts[id] || 0;
    if (current < targetCount) {
      const next = current + 1;
      setCounts({ ...counts, [id]: next });
      if (next === targetCount) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
        } catch (e) {}
      }
    }
  };

  const resetCount = (id: number) => {
    setCounts({ ...counts, [id]: 0 });
  };

  const copyDhikr = (dhikr: typeof ADHKAR_LIST[0]) => {
    navigator.clipboard.writeText(`${dhikr.title}\n${dhikr.text}\n— موسوعة الشيخ الصابوني`);
    setCopiedId(dhikr.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Heart className="w-3.5 h-3.5" />
            <span>حصن المسلم والأوراد النبوية</span>
          </div>
          <h1 className="font-amiri text-3xl font-bold text-slate-900">
            الأذكار والأدعية اليومية التفاعلية
          </h1>
          <p className="text-xs text-slate-600">
            أذكار الصباح والمساء ودعاء ختم القرآن مع عداد تسبيح تفاعلي
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveCategory("morning")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeCategory === "morning"
                ? "bg-[#731A29] text-white shadow-md"
                : "bg-white border border-[#E0D7C9] text-slate-700 hover:bg-[#F5EFE6]"
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>أذكار الصباح</span>
          </button>

          <button
            onClick={() => setActiveCategory("evening")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeCategory === "evening"
                ? "bg-[#731A29] text-white shadow-md"
                : "bg-white border border-[#E0D7C9] text-slate-700 hover:bg-[#F5EFE6]"
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>أذكار المساء</span>
          </button>

          <button
            onClick={() => setActiveCategory("khatm")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeCategory === "khatm"
                ? "bg-[#731A29] text-white shadow-md"
                : "bg-white border border-[#E0D7C9] text-slate-700 hover:bg-[#F5EFE6]"
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>دعاء ختم القرآن</span>
          </button>
        </div>

        {/* Adhkar Cards */}
        <div className="space-y-6">
          {filteredAdhkar.map((dhikr) => {
            const currentCount = counts[dhikr.id] || 0;
            const isCompleted = currentCount >= dhikr.count;

            return (
              <div
                key={dhikr.id}
                className={`paper-card rounded-3xl p-6 sm:p-8 space-y-4 transition ${
                  isCompleted ? "border-emerald-400 bg-emerald-50/20" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#731A29]">{dhikr.title}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyDhikr(dhikr)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-lg"
                      title="نسخ الذكر"
                    >
                      {copiedId === dhikr.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => resetCount(dhikr.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-lg"
                      title="إعادة التصفير"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#EAE3D7] text-center">
                  <p className="font-amiri text-lg sm:text-xl font-bold text-slate-900 leading-loose">
                    {dhikr.text}
                  </p>
                </div>

                {dhikr.virtue && (
                  <p className="text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 not-italic">الفضل والمناسبة: </span>
                    {dhikr.virtue}
                  </p>
                )}

                {/* Counter Tap Button */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    التكرار المطلوب: ({dhikr.count}) مرات
                  </span>

                  <button
                    onClick={() => incrementCount(dhikr.id, dhikr.count)}
                    className={`px-6 py-2.5 rounded-2xl font-bold text-sm shadow transition flex items-center gap-2 ${
                      isCompleted
                        ? "bg-emerald-600 text-white cursor-default"
                        : "bg-[#731A29] hover:bg-[#58121E] text-white active:scale-95"
                    }`}
                  >
                    <span>{isCompleted ? "اكتمل الذكر ✓" : "اضغط للتسبيح"}</span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#273338]/20 text-xs font-mono">
                      {currentCount} / {dhikr.count}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <GlobalAudioPlayer />
      <SmartSearchModal />
      <CartDrawer />
      <Footer />
    </div>
  );
}

export default function AdhkarPage() {
  return (
    <AppProvider>
      <AdhkarContent />
    </AppProvider>
  );
}
