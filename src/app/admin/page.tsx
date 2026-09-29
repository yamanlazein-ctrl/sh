"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  PlusCircle,
  Layers,
  UploadCloud,
  Share2,
  Package,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  Send,
  FileText,
  Volume2,
  BookOpen,
  Sparkles,
  RefreshCw,
  Copy,
} from "lucide-react";

const PRELOADED_LEGACY_DATA = [
  {
    title: "حكم قراءة سورة الكهف يوم الجمعة وفضلها",
    type: "fatwa",
    category: "فقه وأصول",
    summary: "بيان استحباب قراءة سورة الكهف ليلة الجمعة ويومها وما ورد فيها من الأحاديث الثابتة.",
    content: "سؤال: هل قراءة سورة الكهف يوم الجمعة سنة ثابتة؟\nالجواب: نعم، ثبت في الأحاديث الصحيحة عن رسول الله ﷺ أن من قرأ سورة الكهف يوم الجمعة أضاء له من النور ما بين الجمعتين.",
    source: "أرشيف فتاوى الصابوني القديم",
    tags: ["سورة الكهف", "يوم الجمعة", "فتاوى العبادات"],
  },
  {
    title: "مختصر تفسير الطبري (مجلدان)",
    type: "book",
    category: "تفسير",
    summary: "تهذيب وتقريب لأعظم كتب التفسير بالمأثور للإمام ابن جرير الطبري.",
    content: "قام العلامة الصابوني باختصار جامع البيان للإمام الطبري وحذف الأسانيد المكررة والروايات الإسرائيلية الضعيفة ليقدم لطلاب العلم زبدة التفسير.",
    source: "دار الصابوني",
    metadata: { volumesCount: 2, pagesCount: 980, price: 26.0, priceSyp: 340000 },
    tags: ["الطبري", "تفسير بالمأثور", "كتب"],
  },
  {
    title: "حديث: «خيركم من تعلم القرآن وعلمه»",
    type: "hadith",
    category: "حديث وسنة",
    summary: "شرح فضل تعلم كتاب الله وتعليمه والبركة العائدة على معلمه.",
    content: "عن عثمان بن عفان رضي الله عنه عن النبي ﷺ قال: (خيركم من تعلم القرآن وعلمه). رواه البخاري.",
    source: "من كنوز السنة",
    metadata: { narrator: "عثمان بن عفان", hadithGrade: "صحيح البخاري" },
    tags: ["حديث", "تعلم القرآن", "سنة"],
  },
  {
    title: "تسجيل صوتي: فضل ليلة القدر والدعاء فيها",
    type: "audio",
    category: "سلوك ورقائق",
    summary: "مقطع صوتي للشيخ الصابوني يوضح علامات ليلة القدر وأفضل ما يدعو به المسلم.",
    mediaUrl: "https://ia800300.us.archive.org/15/items/quran-tafsir-sabuni/qadr.mp3",
    metadata: { duration: "21:10", year: "1415هـ" },
    tags: ["ليلة القدر", "رمضان", "صوتيات"],
  },
];

function AdminContent() {
  const [activeTab, setActiveTab] = useState<"add" | "items" | "import" | "broadcast" | "orders" | "questions">("add");
  const [stats, setStats] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form State for "Add Content"
  const [title, setTitle] = useState("");
  const [type, setType] = useState("fatwa");
  const [category, setCategory] = useState("فقه وأصول");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Broadcaster State
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["facebook", "telegram", "whatsapp"]);

  // Legacy Bulk Importer State
  const [importJsonText, setImportJsonText] = useState("");
  const [autoDetectCat, setAutoDetectCat] = useState(true);

  // Question Answer Modal / State
  const [answeringQuestionId, setAnsweringQuestionId] = useState<number | null>(null);
  const [answerDraft, setAnswerDraft] = useState("");

  const refreshAllData = () => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => d.success && setStats(d.stats));

    fetch("/api/content?limit=100")
      .then((r) => r.json())
      .then((d) => d.success && setItems(d.items));

    fetch("/api/store/orders")
      .then((r) => r.json())
      .then((d) => d.success && setOrders(d.orders));

    fetch("/api/questions?all=true")
      .then((r) => r.json())
      .then((d) => d.success && setQuestions(d.questions));
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const showNotify = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Create Content Form
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showNotify("العنوان مطلوب", "error");
      return;
    }
    setLoading(true);

    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          category,
          summary,
          content,
          source,
          mediaUrl,
          coverImage,
          tags,
          isFeatured,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotify("تم نشر المادة العلمية بنجاح!");
        setTitle("");
        setSummary("");
        setContent("");
        setTagsInput("");
        setMediaUrl("");
        setCoverImage("");
        refreshAllData();
      } else {
        showNotify(data.error || "فشل النشر", "error");
      }
    } catch (err) {
      showNotify("خطأ في الاتصال", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Content Item
  const handleDeleteItem = async (slug: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه المادة؟")) return;
    try {
      const res = await fetch(`/api/content/${slug}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotify("تم حذف المادة بنجاح");
        refreshAllData();
      }
    } catch (err) {
      showNotify("فشل الحذف", "error");
    }
  };

  // Handle Multi-Channel Broadcast
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || selectedChannels.length === 0) {
      showNotify("يرجى كتابة العنوان وتحديد قناة واحدة على الأقل", "error");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          contentPreview: broadcastBody,
          channels: selectedChannels,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotify(data.message || "تم النشر الخارجي بنجاح!");
        setBroadcastTitle("");
        setBroadcastBody("");
        refreshAllData();
      }
    } catch (err) {
      showNotify("فشل البث الخارجي", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Bulk Import
  const handleRunBulkImport = async (payloadItems: any[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: payloadItems,
          autoDetectCategory: autoDetectCat,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotify(data.message || "تم استيراد المحتوى القديم بنجاح!");
        setImportJsonText("");
        refreshAllData();
      } else {
        showNotify(data.error || "فشل الاستيراد", "error");
      }
    } catch (err) {
      showNotify("خطأ أثناء الاستيراد", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Answer Question
  const handleAnswerSubmit = async (id: number) => {
    if (!answerDraft) return;
    try {
      const res = await fetch("/api/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          answerText: answerDraft,
          answeredBy: "لجنة الفتوى بدار الصابوني",
          status: "answered",
          isPublic: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotify("تم حفظ ونشر الجواب بنجاح!");
        setAnsweringQuestionId(null);
        setAnswerDraft("");
        refreshAllData();
      }
    } catch (err) {
      showNotify("فشل حفظ الإجابة", "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة الإدارة والتحكم الشاملة لغير المبرمجين</span>
            </div>
            <h1 className="font-amiri text-2xl sm:text-3xl font-bold">
              إدارة موسوعة الشيخ الصابوني
            </h1>
            <p className="text-xs text-slate-400">
              إضافة المحتوى في ثوانٍ، استيراد المحتوى القديم آلياً، والنشر الموحد على شبكات التواصل.
            </p>
          </div>

          <button
            onClick={refreshAllData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث البيانات</span>
          </button>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2 ${
              notification.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
        )}

        {/* Stats Metrics Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="paper-card rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400">إجمالي المواد المؤرشفة</span>
              <p className="font-amiri text-2xl font-bold text-[#731A29]">
                {stats.totalContent} مادة
              </p>
            </div>
            <div className="paper-card rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400">إجمالي المشاهدات</span>
              <p className="font-amiri text-2xl font-bold text-slate-800">
                {stats.totalViews.toLocaleString("ar-SY")}
              </p>
            </div>
            <div className="paper-card rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400">طلبيات المتجر</span>
              <p className="font-amiri text-2xl font-bold text-slate-800">
                {stats.ordersCount} طلب
              </p>
            </div>
            <div className="paper-card rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400">أسئلة معلقة بانتظار الجواب</span>
              <p className="font-amiri text-2xl font-bold text-amber-600">
                {stats.pendingQuestions} سؤال
              </p>
            </div>
          </div>
        )}

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-[#E0D7C9] pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("add")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "add"
                ? "bg-[#731A29] text-white shadow"
                : "bg-white text-slate-700 border border-[#E0D7C9] hover:bg-slate-50"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة مادة جديدة (سريعة)</span>
          </button>

          <button
            onClick={() => setActiveTab("items")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "items"
                ? "bg-[#731A29] text-white shadow"
                : "bg-white text-slate-700 border border-[#E0D7C9] hover:bg-slate-50"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>إدارة المواد المؤرشفة ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("import")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "import"
                ? "bg-[#731A29] text-white shadow"
                : "bg-white text-slate-700 border border-[#E0D7C9] hover:bg-slate-50"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>النقل الآلي للمحتوى القديم</span>
          </button>

          <button
            onClick={() => setActiveTab("broadcast")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "broadcast"
                ? "bg-[#731A29] text-white shadow"
                : "bg-white text-slate-700 border border-[#E0D7C9] hover:bg-slate-50"
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>النشر الخارجي الموحد</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-[#731A29] text-white shadow"
                : "bg-white text-slate-700 border border-[#E0D7C9] hover:bg-slate-50"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>طلبيات الكتب ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("questions")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "questions"
                ? "bg-[#731A29] text-white shadow"
                : "bg-white text-slate-700 border border-[#E0D7C9] hover:bg-slate-50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>أسئلة الجمهور ({questions.length})</span>
          </button>
        </div>

        {/* TAB 1: ADD NEW CONTENT (Simplified 3-step for non-technical users) */}
        {activeTab === "add" && (
          <div className="bg-white rounded-3xl border border-[#E0D7C9] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="font-amiri text-xl font-bold text-slate-900">
                إضافة مادة علمية جديدة
              </h3>
              <p className="text-xs text-slate-500">
                اختر نوع المحتوى، اكتب العنوان والنص، واضغط نشر. ستظهر المادة فوراً في الأرشيف ومحرك البحث.
              </p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نوع المادة *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs font-bold outline-none focus:border-[#731A29]"
                  >
                    <option value="fatwa">فتوى شرعية</option>
                    <option value="book">كتاب أو مؤلف</option>
                    <option value="hadith">حديث نبوي وشرحه</option>
                    <option value="fiqh_research">بحث فقهي</option>
                    <option value="article">مقال فكري</option>
                    <option value="lecture">درس أو خطبة</option>
                    <option value="poem">شعر وقصيدة</option>
                    <option value="dhikr">ذكر أو دعاء</option>
                    <option value="audio">تسجيل صوتي</option>
                    <option value="video">حلقة مرئية (يوتيوب)</option>
                    <option value="quote">درة أو حكمة للشيخ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المجال الشرعي / التصنيف *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs font-bold outline-none focus:border-[#731A29]"
                  >
                    <option value="تفسير">تفسير وعلوم القرآن</option>
                    <option value="فقه وأصول">فقه وأصول ومعاملات</option>
                    <option value="حديث وسنة">حديث وسنة نبوية</option>
                    <option value="عقيدة">عقيدة وتوحيد</option>
                    <option value="سلوك ورقائق">سلوك ورقائق وتزكية</option>
                    <option value="سيرة وتاريخ">سيرة وتاريخ إسلامي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان المادة *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: حكم تأخير الصلاة، أو تفسير آية الكرسي..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نبذة مختصرة / خلاصة الجواب
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="سطران يلخصان الفائدة لمساعدة الباحثين..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  النص الكامل للمادة / الشرح / الفتوى
                </label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب أو الصق النص الكامل هنا..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المصدر أو الكتاب المأخوذ منه
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="مثال: صفوة التفاسير ج1 ص120"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رابط ملف صوتي أو فيديو (اختياري)
                  </label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://.../audio.mp3 أو رابط يوتيوب"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الكلمات المفتاحية (مفصولة بفواصل)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="صلاة, فقه, عبادات, توقيت"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#731A29]"
                />
                <label htmlFor="featuredCheck" className="text-xs font-bold text-slate-700">
                  عرض المادة في الصفحة الرئيسية (مميزة)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#731A29] hover:bg-[#58121E] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{loading ? "جاري النشر..." : "حفظ ونشر المادة الآن"}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: MANAGE ARCHIVED CONTENT */}
        {activeTab === "items" && (
          <div className="bg-white rounded-3xl border border-[#E0D7C9] p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-amiri text-xl font-bold text-slate-900">
              المواد المؤرشفة في النظام ({items.length})
            </h3>

            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.type}
                      </span>
                      <span className="text-[10px] text-amber-800 font-semibold">
                        {item.category}
                      </span>
                      {item.isFeatured && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                          مميز ★
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {item.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/archive?slug=${item.slug}`}
                      className="p-1.5 text-slate-500 hover:text-[#731A29] bg-slate-50 rounded-lg"
                      title="معاينة"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteItem(item.slug)}
                      className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AUTOMATED LEGACY BULK IMPORTER */}
        {activeTab === "import" && (
          <div className="bg-white rounded-3xl border border-[#E0D7C9] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="font-amiri text-xl font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#731A29]" />
                <span>محرك النقل الآلي للمحتوى القديم (Bulk Legacy Importer)</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                استيراد مئات المواد دفعة واحدة من الأرشيف القديم بصيغة JSON أو تفعيل الحزم التاريخية بنقرة زر واحدة.
              </p>
            </div>

            {/* Preloaded Bundle Importer */}
            <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    حزمة الأرشيف القديم النموذجية المعتمدة
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    تحتوي على نماذج جاهزة من فتاوى التفسير، كتب الطبري، والأحاديث والتسجيلات الصوتية.
                  </p>
                </div>
                <button
                  onClick={() => handleRunBulkImport(PRELOADED_LEGACY_DATA)}
                  disabled={loading}
                  className="px-4 py-2 bg-[#731A29] hover:bg-[#58121E] text-white rounded-xl text-xs font-bold transition shadow"
                >
                  {loading ? "جاري الاستيراد..." : "استيراد الحزمة الآن"}
                </button>
              </div>
            </div>

            {/* Custom JSON Importer */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                أو الصق مصفوفة JSON مخصصة للمواد القديمة:
              </label>
              <textarea
                rows={6}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[{"title": "عنوان الفتوى", "content": "نص الفتوى", "type": "fatwa", "category": "فقه"}]'
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] font-mono text-xs outline-none focus:border-[#731A29]"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoCat"
                  checked={autoDetectCat}
                  onChange={(e) => setAutoDetectCat(e.target.checked)}
                  className="w-4 h-4 accent-[#731A29]"
                />
                <label htmlFor="autoCat" className="text-xs text-slate-700 font-medium">
                  التعرف التلقائي على نوع المادة والمجال الشرعي بالذكاء الاصطناعي ومحتوى النص
                </label>
              </div>

              <button
                onClick={() => {
                  try {
                    const parsed = JSON.parse(importJsonText);
                    if (Array.isArray(parsed)) {
                      handleRunBulkImport(parsed);
                    } else {
                      showNotify("يجب أن تكون المدخلات مصفوفة JSON صالحة", "error");
                    }
                  } catch (e) {
                    showNotify("صيغة JSON غير صحيحة", "error");
                  }
                }}
                disabled={!importJsonText || loading}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-bold transition disabled:opacity-40"
              >
                تنفيذ الاستيراد الآلي
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: UNIFIED MULTI-CHANNEL BROADCASTER */}
        {activeTab === "broadcast" && (
          <div className="bg-white rounded-3xl border border-[#E0D7C9] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="font-amiri text-xl font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#731A29]" />
                <span>مركز النشر الخارجي الموحد (Multi-Channel Broadcast)</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                انشر الفتاوى والتنبيهات والمواد العلمية فوراً على شبكات التواصل الرسمية من مكان واحد.
              </p>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  اختر القنوات المستهدفة للنشر:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "telegram", name: "قناة التيليجرام", icon: Send },
                    { id: "facebook", name: "صفحة الفيسبوك", icon: Share2 },
                    { id: "whatsapp", name: "مجتمع الواتساب", icon: MessageSquare },
                    { id: "youtube", name: "منشورات اليوتيوب", icon: Sparkles },
                  ].map((ch) => {
                    const isSelected = selectedChannels.includes(ch.id);
                    return (
                      <button
                        type="button"
                        key={ch.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedChannels(selectedChannels.filter((c) => c !== ch.id));
                          } else {
                            setSelectedChannels([...selectedChannels, ch.id]);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition ${
                          isSelected
                            ? "bg-[#731A29] text-white border-[#731A29]"
                            : "bg-[#FAF8F5] text-slate-700 border-[#E0D7C9]"
                        }`}
                      >
                        <ch.icon className="w-4 h-4" />
                        <span>{ch.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان المنشور / الإشعار
                </label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="مثال: صدور كتاب جديد، أو فتوى مهمة عن زكاة الفطر..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نص المنشور الكامل ورابط التوجيه
                </label>
                <textarea
                  rows={4}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="اكتب المحتوى الذي سيتم بثه للمتابعين..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0D7C9] text-xs outline-none focus:border-[#731A29]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#731A29] hover:bg-[#58121E] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow"
              >
                <Share2 className="w-4 h-4" />
                <span>{loading ? "جاري النشر والمزامنة..." : "بث المنشور لكافة القنوات المحددة"}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: STORE ORDERS */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl border border-[#E0D7C9] p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-amiri text-xl font-bold text-slate-900">
              طلبيات شحن الكتب الواردة ({orders.length})
            </h3>

            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <div key={order.id} className="py-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#731A29] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {order.customerName} ({order.country} - {order.city})
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {order.totalAmount} {order.currency}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {order.paymentMethod}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="text-slate-400">الهاتف: </span>{order.customerPhone} |{" "}
                    <span className="text-slate-400">العنوان: </span>{order.address}
                  </div>

                  {order.items && (
                    <div className="text-[11px] text-slate-500 bg-[#FAF8F5] p-2 rounded-lg">
                      {order.items.map((i: any, idx: number) => (
                        <span key={idx} className="inline-block mr-2 font-medium">
                          • {i.title} (كمية: {i.quantity})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: VISITOR QUESTIONS MODERATION */}
        {activeTab === "questions" && (
          <div className="bg-white rounded-3xl border border-[#E0D7C9] p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-amiri text-xl font-bold text-slate-900">
              أسئلة واستفسارات الزوار ({questions.length})
            </h3>

            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E0D7C9] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      {q.senderName} ({q.senderCountry || "سوريا"}) - {q.senderEmail}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        q.status === "answered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {q.status === "answered" ? "تم الجواب ✓" : "بانتظار الإجابة"}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-800 font-amiri">
                    س: {q.questionText}
                  </p>

                  {q.answerText ? (
                    <div className="p-3 bg-white rounded-xl text-xs text-slate-700 border border-slate-200">
                      <span className="font-bold text-[#731A29] block mb-1">الجواب المحرر:</span>
                      {q.answerText}
                    </div>
                  ) : (
                    <div>
                      {answeringQuestionId === q.id ? (
                        <div className="space-y-2 pt-2">
                          <textarea
                            rows={3}
                            value={answerDraft}
                            onChange={(e) => setAnswerDraft(e.target.value)}
                            placeholder="اكتب الإجابة الفقهية الموثقة هنا..."
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E0D7C9] text-xs outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAnswerSubmit(q.id)}
                              className="px-4 py-1.5 bg-[#731A29] text-white rounded-lg text-xs font-bold"
                            >
                              حفظ ونشر الجواب
                            </button>
                            <button
                              onClick={() => setAnsweringQuestionId(null)}
                              className="px-3 py-1.5 text-slate-500 text-xs"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAnsweringQuestionId(q.id);
                            setAnswerDraft("");
                          }}
                          className="px-3 py-1.5 bg-[#731A29]/10 text-[#731A29] hover:bg-[#731A29] hover:text-white rounded-lg text-xs font-bold transition"
                        >
                          تحرير الجواب الآن
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function AdminPage() {
  return (
    <AppProvider>
      <AdminContent />
    </AppProvider>
  );
}
