import React from "react";
import Link from "next/link";
import { BookOpen, Send, MessageCircle, Sparkles, Heart, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1E242B] text-slate-300 border-t border-slate-800 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-700/60">
          {/* Col 1: About the Platform */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#8E2336] text-amber-200 flex items-center justify-center font-amiri text-2xl font-bold">
                ص
              </div>
              <div>
                <span className="font-amiri text-xl font-bold text-white block">
                  منصة الشيخ محمد علي الصابوني
                </span>
                <span className="text-xs text-amber-300/80">
                  (1349 - 1442 هـ / 1930 - 2021 م)
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              المنصة الرسمية الموثقة للأرشيف العلمي الشامل ومؤلفات العلامة المفسر الشيخ محمد علي الصابوني (رحمه الله)، رئيس رابطة العلماء السوريين وأستاذ التفسير بجامعة أم القرى بمكة المكرمة.
            </p>
            <div className="pt-2 flex items-center gap-3">
              {/* Telegram */}
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-[#229ED9] text-white flex items-center justify-center transition"
                title="قناة التيليجرام الرسمية"
              >
                <Send className="w-4 h-4" />
              </a>
              {/* YouTube SVG */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-[#FF0000] text-white flex items-center justify-center transition"
                title="قناة اليوتيوب"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* Facebook SVG */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-[#1877F2] text-white flex items-center justify-center transition"
                title="صفحة الفيسبوك"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-[#25D366] text-white flex items-center justify-center transition"
                title="مجتمع الواتساب"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Scientific Sections */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              الأرشيف العلمي
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/tafsir" className="hover:text-amber-300 transition">
                  صفوة التفاسير التفاعلي
                </Link>
              </li>
              <li>
                <Link href="/archive?type=fatwa" className="hover:text-amber-300 transition">
                  الفتاوى والأحكام المحررة
                </Link>
              </li>
              <li>
                <Link href="/archive?type=book" className="hover:text-amber-300 transition">
                  المؤلفات والكتب المطبوعة
                </Link>
              </li>
              <li>
                <Link href="/archive?type=hadith" className="hover:text-amber-300 transition">
                  من كنوز السنة النبوية
                </Link>
              </li>
              <li>
                <Link href="/archive?type=fiqh_research" className="hover:text-amber-300 transition">
                  الأبحاث الفقهية المقارنة
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Media & Interactive */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              الوسائط والخدمات
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/archive?type=audio" className="hover:text-amber-300 transition">
                  التسجيلات الصوتية والدروس
                </Link>
              </li>
              <li>
                <Link href="/archive?type=video" className="hover:text-amber-300 transition">
                  البرامج التلفزيونية والمرئية
                </Link>
              </li>
              <li>
                <Link href="/adhkar" className="hover:text-amber-300 transition">
                  الأذكار والأدعية اليومية
                </Link>
              </li>
              <li>
                <Link href="/fatwa-bank" className="hover:text-amber-300 transition">
                  أرسل سؤالك الشرعي
                </Link>
              </li>
              <li>
                <Link href="/biography" className="hover:text-amber-300 transition">
                  السيرة العطرة والمحطات التاريخية
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Store & Delivery */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold tracking-wider">متجر الكتب والتوصيل</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              نوفر الشحن لكافة المحافظات السورية والدول العربية بطرق دفع ميسرة (شام كاش، سيريتل كاش، الهرم، الدفع عند الاستلام).
            </p>
            <div className="pt-2">
              <Link
                href="/store"
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#8E2336] text-white text-xs font-semibold rounded-lg hover:bg-[#a1293f] transition"
              >
                <span>تصفح متجر الكتب</span>
              </Link>
            </div>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-amber-300/80 hover:text-amber-200 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>لوحة التحكم والإدارة</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} منصة الشيخ محمد علي الصابوني. جميع الحقوق محفوظة لخدمة ونشر العلم الشرعي.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>صدقة جارية عن روح العلامة الشيخ محمد علي الصابوني</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
