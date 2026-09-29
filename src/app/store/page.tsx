"use client";

import React, { useState, useEffect } from "react";
import { useApp, AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import SmartSearchModal from "@/components/SmartSearchModal";
import CartDrawer from "@/components/CartDrawer";
import OrderLookupModal from "@/components/OrderLookupModal";
import ContentReaderModal from "@/components/ContentReaderModal";
import {
  BookOpen,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CreditCard,
  Package,
  CheckCircle2,
  Search,
  Download,
  Eye,
  Info,
} from "lucide-react";

function StoreContent() {
  const { addToCart, currency, setCurrency, setIsCartOpen } = useApp();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [selectedBookForPreview, setSelectedBookForPreview] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/content?type=book")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setBooks(data.items);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (usd: number, syp?: number) => {
    if (currency === "SYP") {
      const price = syp || usd * 13000;
      return `${price.toLocaleString("ar-SY")} ل.س`;
    }
    return `$${usd.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Banner */}
        <div className="relative bg-gradient-to-r from-[#731A29] to-[#58121E] text-white rounded-3xl p-8 sm:p-12 shadow-xl overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>دار الصابوني للنشر والتوزيع - الطبعات المعتمدة</span>
            </div>

            <h1 className="font-amiri text-3xl sm:text-4xl font-bold leading-tight">
              متجر مؤلفات وتفاسير العلامة الصابوني
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              اطلب النسخ الأصلية المجلدة الفاخرة أو النسخ الإلكترونية لكافة مؤلفات الشيخ، مع خدمة الشحن والتوصيل المباشر لجميع المحافظات السورية والدول العربية.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>عرض سلة المشتريات</span>
              </button>
              <button
                onClick={() => setIsOrderLookupOpen(true)}
                className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold border border-white/20 transition flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>تتبع شحنة سابقة</span>
              </button>
            </div>
          </div>
        </div>

        {/* Syria & International Payment Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="paper-card rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              💳
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">شام كاش وسيريتل كاش</h4>
              <p className="text-[11px] text-slate-500">دفع إلكتروني مباشر وسريع داخل سوريا</p>
            </div>
          </div>

          <div className="paper-card rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              🏢
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">حوالات الهرم والفؤاد</h4>
              <p className="text-[11px] text-slate-500">استلام وإرسال الحوالات بكل يسر</p>
            </div>
          </div>

          <div className="paper-card rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">شحن لكافة المحافظات</h4>
              <p className="text-[11px] text-slate-500">توصيل لباب المنزل في دمشق وحلب وكافة المدن</p>
            </div>
          </div>

          <div className="paper-card rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">طبعات فاخرة موثقة</h4>
              <p className="text-[11px] text-slate-500">تجليد فني مذهب وورق شاموا عالي الجودة</p>
            </div>
          </div>
        </div>

        {/* Currency Switcher & Book List Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE3D7]">
          <div>
            <h2 className="font-amiri text-2xl font-bold text-slate-900">
              قائمة الكتب والمجلدات المتاحة للطلب
            </h2>
            <p className="text-xs text-slate-500">اختر بين النسخة المطبوعة المجلدة أو النسخة الإلكترونية</p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-[#E0D7C9] rounded-xl p-1 text-xs">
            <span className="text-slate-400 px-2 font-medium">العملة المعروضة:</span>
            <button
              onClick={() => setCurrency("SYP")}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                currency === "SYP" ? "bg-[#731A29] text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              ليرة سورية (SYP)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                currency === "USD" ? "bg-[#731A29] text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              دولار (USD)
            </button>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="py-24 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-[#731A29] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">جاري تحميل قائمة الكتب والأسعار...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                id={`book-${book.id}`}
                className="paper-card rounded-2xl overflow-hidden flex flex-col justify-between group"
              >
                <div className="p-6 space-y-4">
                  {/* Cover */}
                  <div className="h-52 w-full rounded-xl bg-slate-100 overflow-hidden relative border border-slate-200">
                    <img
                      src={book.coverImage || "/images/safwat-tafasir-book.jpg"}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-[#731A29] text-white text-[11px] font-bold rounded-lg shadow">
                      {book.metadata?.volumesCount ? `${book.metadata.volumesCount} مجلدات` : "مجلد واحد"}
                    </div>
                  </div>

                  {/* Title & info */}
                  <div>
                    <h3 className="font-amiri text-lg font-bold text-slate-900 group-hover:text-[#731A29] transition mb-1.5">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {book.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-[#FAF8F5] p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block">دار النشر:</span>
                      <span className="font-semibold text-slate-700">
                        {book.metadata?.publisher || "دار الصابوني"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">الصفحات:</span>
                      <span className="font-semibold text-slate-700">
                        {book.metadata?.pagesCount ? `${book.metadata.pagesCount} صفحة` : "—"}
                      </span>
                    </div>
                    {book.metadata?.edition && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block">الطبعة:</span>
                        <span className="font-semibold text-slate-700">{book.metadata.edition}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & Cart Action Bar */}
                <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE3D7] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">السعر للنسخة المطبوعة:</span>
                    <span className="text-sm font-bold text-[#731A29]">
                      {formatPrice(book.metadata?.price || 25, book.metadata?.priceSyp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedBookForPreview(book)}
                      className="p-2 bg-white border border-[#E0D7C9] text-slate-600 hover:text-[#731A29] rounded-xl transition"
                      title="معاينة نبذة الكتاب والفهرس"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        addToCart({
                          id: book.id,
                          title: book.title,
                          price: book.metadata?.price || 25,
                          priceSyp: book.metadata?.priceSyp || 350000,
                          coverImage: book.coverImage,
                          format: "physical",
                        })
                      }
                      className="px-3 py-2 bg-[#731A29] hover:bg-[#58121E] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>إضافة للسلة</span>
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
      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
      />
      <ContentReaderModal
        item={selectedBookForPreview}
        onClose={() => setSelectedBookForPreview(null)}
      />

      <Footer />
    </div>
  );
}

export default function StorePage() {
  return (
    <AppProvider>
      <StoreContent />
    </AppProvider>
  );
}
