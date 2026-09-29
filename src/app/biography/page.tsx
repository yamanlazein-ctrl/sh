"use client";

import React, { useState } from "react";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import SmartSearchModal from "@/components/SmartSearchModal";
import CartDrawer from "@/components/CartDrawer";
import ContentReaderModal from "@/components/ContentReaderModal";
import {
  Award,
  BookOpen,
  Calendar,
  Compass,
  MapPin,
  Sparkles,
  Users,
  CheckCircle2,
  Quote,
} from "lucide-react";

const TIMELINE_EVENTS = [
  {
    year: "١٩٣٠م (١٣٤٩هـ)",
    title: "المولد والنشأة في حلب الشهباء",
    desc: "ولد في مدينة حلب العريقة بسوريا في بيت علم وفضل. كان والده الشيخ جميل الصابوني من كبار علماء حلب ومفتياً وموجهاً، فتلقى على يديه مبادئ العلوم الشرعية وحفظ القرآن الكريم في صباه.",
    location: "حلب - سوريا",
  },
  {
    year: "١٩٤٩م",
    title: "التخرج من الثانوية الشرعية (الخسروية)",
    desc: "درس بالمدرسة الخسروية العريقة بحلب وتتلمذ على كبار أئمتها كالشيخ محمد راغب الطباخ والشيخ نجيب سراج الدين وتخرج فيها بتفوق باهر.",
    location: "المدرسة الخسروية - حلب",
  },
  {
    year: "١٩٤٩ - ١٩٥٤م",
    title: "رحلة طلب العلم بالأزهر الشريف",
    desc: "ابتُعث إلى القاهرة للدراسة بكلية الشريعة بجامعة الأزهر، ونال الشهادة العالية عام ١٩٥٢م، ثم أتبعها بالحصول على شهادة العالمية مع إجازة القضاء الشرعي بتفوق عام ١٩٥٤م.",
    location: "الأزهر الشريف - القاهرة",
  },
  {
    year: "١٩٦٢ - ١٩٩٥م",
    title: "أستاذ التفسير بجامعة أم القرى والحرم المكي",
    desc: "انتقل إلى مكة المكرمة ليدرّس في كلية الشريعة بجامعة أم القرى ومعهد البحوث العلمية وإحياء التراث، وألقى دروس التفسير المنتظمة في رحاب المسجد الحرام لأكثر من ثلاثة عقود.",
    location: "مكة المكرمة - المملكة العربية السعودية",
  },
  {
    year: "١٩٨٠م",
    title: "صدور موسوعة «صفوة التفاسير»",
    desc: "أصدر مؤلفه الخالد (صفوة التفاسير) في ثلاثة مجلدات بعد سنوات من التحقيق والتحرير، ولاقى الكتاب قبولاً وانتشاراً منقطع النظير في أنحاء المعمورة وتُرجم لعدة لغات.",
    location: "مكة المكرمة",
  },
  {
    year: "٢٠٠٧م",
    title: "نيل جائزة الشخصية الإسلامية العالمية",
    desc: "اختير فضيلة الشيخ الشخصية الإسلامية لجائزة دبي الدولية للقرآن الكريم في دورتها الحادية عشرة تقديراً لخدماته الجليلة في خدمة كتاب الله ونشر التفسير.",
    location: "دبي - الإمارات العربية المتحدة",
  },
  {
    year: "٢٠٢١م (١٤٤٢هـ)",
    title: "الوفاة والانتقال إلى رحمة الله",
    desc: "توفي رحمه الله في مدينة يالوفا بتركيا يوم الجمعة ٦ شعبان ١٤٤٢هـ الموافق ١٩ مارس ٢٠٢١م عن عمر ناهز ٩١ عاماً قضاها في محراب العلم وخدمة القرآن الكريم.",
    location: "يالوفا - تركيا",
  },
];

const TEACHERS = [
  { name: "الشيخ جميل الصابوني", role: "والده - كبير علماء حلب" },
  { name: "الشيخ محمد راغب الطباخ", role: "مؤرخ حلب ومحدثها الكبير" },
  { name: "الشيخ محمد نجيب سراج الدين", role: "من كبار فقهاء الشام" },
  { name: "الشيخ أحمد الشماع", role: "عالم الأصول واللغة" },
  { name: "الشيخ محمد سعيد الإدلبي", role: "عالم القراءات والتجويد" },
  { name: "أئمة الأزهر الشريف", role: "فقهاء الشريعة وأصول الدين بالقاهرة" },
];

function BiographyContent() {
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Scholar Profile Header */}
        <div className="bg-white rounded-3xl border border-[#E0D7C9] p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-64 h-80 rounded-2xl overflow-hidden shadow-xl border-4 border-[#FAF8F5] relative">
                <img
                  src="/images/sheikh-portrait.jpg"
                  alt="الشيخ محمد علي الصابوني"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4 text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-[#731A29]/10 text-[#731A29] text-xs font-bold">
                ترجمة وسيرة علمية موثقة
              </span>

              <h1 className="font-amiri text-3xl sm:text-4xl font-bold text-slate-900 leading-snug">
                العلامة المفسر الشيخ محمد علي الصابوني
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                أحد أبرز علماء أهل السنة والجماعة والمفسرين في العصر الحديث. اشتهر بمصنفاته الموسوعية التي يسرت فهم القرآن الكريم وقربت أمهات كتب التفسير والحديث لملايين المسلمين حول العالم.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">المولد:</span>
                  <span className="font-bold text-slate-800">١٩٣٠م - حلب، سوريا</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">الوفاة:</span>
                  <span className="font-bold text-slate-800">٢٠٢١م - يالوفا، تركيا</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">المنصب:</span>
                  <span className="font-bold text-slate-800">رئيس رابطة العلماء السوريين</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Journey */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-[#731A29] tracking-wider uppercase">
              مسيرة عطاء وتدريس
            </span>
            <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-slate-900">
              المحطات التاريخية البارزة
            </h2>
          </div>

          <div className="relative border-r-2 border-[#731A29]/30 mr-4 sm:mr-8 space-y-8 pr-6 sm:pr-8">
            {TIMELINE_EVENTS.map((event, idx) => (
              <div key={idx} className="relative group">
                {/* Dot */}
                <span className="absolute -right-[31px] sm:-right-[39px] top-1.5 w-4 h-4 rounded-full bg-[#731A29] ring-4 ring-[#FAF8F5]"></span>

                <div className="paper-card rounded-2xl p-5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#731A29] text-white">
                      {event.year}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </span>
                  </div>

                  <h3 className="font-amiri text-lg font-bold text-slate-900 group-hover:text-[#731A29] transition">
                    {event.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {event.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teachers / Mashayikh Grid */}
        <div className="bg-[#F5EFE6] rounded-3xl p-8 border border-[#E0D7C9] space-y-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-[#731A29]" />
            <div>
              <h3 className="font-amiri text-2xl font-bold text-slate-900">
                شيوخه وأساتذته الكرام
              </h3>
              <p className="text-xs text-slate-600">
                أعلام الشام ومصر الذين تلقى عنهم العلوم الشرعية واللغوية والقراءات
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEACHERS.map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl border border-[#E0D7C9] flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[#731A29]/10 text-[#731A29] flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-amiri text-sm font-bold text-slate-800">{t.name}</h4>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historic Gallery & Manuscripts */}
        <div className="space-y-4">
          <div>
            <h3 className="font-amiri text-2xl font-bold text-slate-900">
              أرشيف المخطوطات والصور النادرة
            </h3>
            <p className="text-xs text-slate-500">وثائق وصور توثق مسيرة الشيخ التدريسية والتأليفية</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="paper-card rounded-2xl overflow-hidden group">
              <div className="h-52 w-full overflow-hidden">
                <img
                  src="/images/archive-manuscripts.jpg"
                  alt="مخطوطة نادرة"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="font-amiri text-base font-bold text-slate-800 mb-1">
                  إجازات علمية بخط اليد
                </h4>
                <p className="text-xs text-slate-500">إجازة بالسند المتصل من كبار علماء حلب عام ١٩٤٩م.</p>
              </div>
            </div>

            <div className="paper-card rounded-2xl overflow-hidden group">
              <div className="h-52 w-full overflow-hidden">
                <img
                  src="/images/aleppo-scholar.jpg"
                  alt="حلب الشهباء"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="font-amiri text-base font-bold text-slate-800 mb-1">
                  المدرسة الخسروية بحلب
                </h4>
                <p className="text-xs text-slate-500">أول مدرسة شرعية بحلب تخرج منها الشيخ بتفوق.</p>
              </div>
            </div>

            <div className="paper-card rounded-2xl overflow-hidden group">
              <div className="h-52 w-full overflow-hidden">
                <img
                  src="/images/safwat-tafasir-book.jpg"
                  alt="صفوة التفاسير"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-4">
                <h4 className="font-amiri text-base font-bold text-slate-800 mb-1">
                  الطبعة الأولى لصفوة التفاسير
                </h4>
                <p className="text-xs text-slate-500">المجلدات الأصلية المعتمدة الصادرة عام ١٩٨٠م.</p>
              </div>
            </div>
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

export default function BiographyPage() {
  return (
    <AppProvider>
      <BiographyContent />
    </AppProvider>
  );
}
