"use client";

import React, { useState, useEffect } from "react";
import { useApp, AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import SmartSearchModal from "@/components/SmartSearchModal";
import CartDrawer from "@/components/CartDrawer";
import ContentReaderModal from "@/components/ContentReaderModal";
import {
  HelpCircle,
  Search,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

function FatwaBankContent() {
  const { openSearchWithQuery } = useApp();
  const [fatwas, setFatwas] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Form
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderCountry, setSenderCountry] = useState("سوريا");
  const [topic, setTopic] = useState("فقه العبادات");
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    // Fetch fatwas
    fetch(`/api/content?type=fatwa`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) setFatwas(data.items);
      });

    // Fetch visitor public questions
    fetch(`/api/questions`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.questions) setQuestions(data.questions);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !questionText) {
      setSubmitError("يرجى تعبئة كافة الحقول المطلوبة");
      return;
    }
    setSubmitError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          senderEmail,
          senderCountry,
          topic,
          questionText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setQuestionText("");
      } else {
        setSubmitError(data.error || "فشل إرسال السؤال");
      }
    } catch (err) {
      setSubmitError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFatwas = fatwas.filter(
    (f) =>
      !search ||
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.summary?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Banner */}
        <div className="bg-[#731A29] text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-bold">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>بنك الفتاوى المحررة وأسئلة الجمهور</span>
          </div>

          <h1 className="font-amiri text-3xl sm:text-4xl font-bold">
            بنك الفتاوى والأحكام الفقهية المعاصرة
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
            محرك بحث متخصص في فتاوى الشيخ محمد علي الصابوني في قضايا العبادات، المعاملات، الميراث، والأسرة، بالإضافة لخدمة الإجابة على الأسئلة المستجدة.
          </p>

          <div className="relative max-w-lg pt-2">
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في الفتاوى: مثل 'تأخير الصلاة'، 'زكاة الذهب'..."
              className="w-full pr-11 pl-4 py-3 bg-white text-slate-800 rounded-xl text-xs font-medium outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Grid: Fatwas List + Ask Question Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Fatwas List */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-amiri text-2xl font-bold text-slate-900 pb-2 border-b border-[#EAE3D7]">
              الفتاوى والأحكام المؤرشفة ({filteredFatwas.length})
            </h2>

            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-[#731A29] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs">جاري تحميل الفتاوى والأحكام...</p>
              </div>
            ) : filteredFatwas.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-[#E0D7C9] text-slate-500 text-xs">
                لم يتم العثور على فتوى مطابقة لكلمة البحث.
              </div>
            ) : (
              filteredFatwas.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedItem(f)}
                  className="p-5 bg-white rounded-2xl border border-[#E0D7C9] hover:border-[#731A29] hover:shadow-sm cursor-pointer transition space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {f.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {f.viewsCount?.toLocaleString("ar-SY")} مشاهدة
                    </span>
                  </div>

                  <h3 className="font-amiri text-lg font-bold text-slate-900 group-hover:text-[#731A29] transition">
                    {f.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {f.summary}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#731A29]">
                    <span>قراءة نص الفتوى والجواب الكامل</span>
                    <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition" />
                  </div>
                </div>
              ))
            )}

            {/* Public Answered Questions Section */}
            {questions.length > 0 && (
              <div className="pt-8 space-y-4">
                <h3 className="font-amiri text-xl font-bold text-slate-800">
                  أسئلة الجمهور المجاب عنها حديثاً
                </h3>
                {questions.map((q) => (
                  <div key={q.id} className="p-4 bg-[#F5EFE6] rounded-2xl border border-[#E0D7C9] space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-slate-800">السائل: {q.senderName} ({q.senderCountry})</span>
                      <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        {q.topic}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 font-amiri text-sm">
                      س: {q.questionText}
                    </p>
                    {q.answerText && (
                      <div className="p-3 bg-white rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200">
                        <span className="font-bold text-[#731A29] block mb-1">الجواب:</span>
                        {q.answerText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ask Question Form */}
          <div id="ask" className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-[#E0D7C9] p-6 sm:p-8 shadow-sm space-y-5 sticky top-28">
              <div>
                <h3 className="font-amiri text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#731A29]" />
                  <span>أرسل سؤالك الشرعي</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  تتم مراجعة الأسئلة وتحرير الإجابات بواسطة اللجنة العلمية المختصة بدار الصابوني.
                </p>
              </div>

              {submitSuccess ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">
                    تم استلام سؤالكم بنجاح!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    سيتم إرسال الإجابة إلى بريدكم الإلكتروني ونشرها في بنك الفتاوى في حال كانت ذات فائدة عامة.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    إرسال سؤال آخر
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuestionSubmit} className="space-y-4">
                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكريم *</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="مثال: عبد الله الحلبي"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني *</label>
                      <input
                        type="email"
                        required
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الدولة</label>
                      <input
                        type="text"
                        value={senderCountry}
                        onChange={(e) => setSenderCountry(e.target.value)}
                        placeholder="سوريا، تركيا، السعودية..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">موضوع السؤال</label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
                    >
                      <option value="فقه العبادات (صلاة، صيام، طهارة)">فقه العبادات (صلاة، صيام، طهارة)</option>
                      <option value="فقه المعاملات والمالية">فقه المعاملات والمالية</option>
                      <option value="المواريث والتركات">المواريث والتركات</option>
                      <option value="قضايا الأسرة والنكاح">قضايا الأسرة والنكاح</option>
                      <option value="تفسير القرآن والحديث">تفسير القرآن والحديث</option>
                      <option value="استشارة علمية عامة">استشارة علمية عامة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">نص السؤال بالتفصيل *</label>
                    <textarea
                      rows={4}
                      required
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="اكتب استفسارك الشرعي بوضوح..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#731A29] hover:bg-[#58121E] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? "جاري الإرسال..." : "إرسال السؤال للجنة الفتوى"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <GlobalAudioPlayer />
      <SmartSearchModal />
      <CartDrawer />
      <ContentReaderModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      <Footer />
    </div>
  );
}

export default function FatwaBankPage() {
  return (
    <AppProvider>
      <FatwaBankContent />
    </AppProvider>
  );
}
