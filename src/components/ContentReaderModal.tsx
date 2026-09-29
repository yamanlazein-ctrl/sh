"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  X,
  Copy,
  Check,
  Volume2,
  Share2,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  Printer,
} from "lucide-react";

interface ContentReaderItem {
  id: number;
  title: string;
  slug: string;
  type: string;
  category: string;
  summary?: string | null;
  content?: string | null;
  author?: string | null;
  source?: string | null;
  mediaUrl?: string | null;
  coverImage?: string | null;
  metadata?: any;
  tags?: string[] | null;
  viewsCount?: number | null;
}

export default function ContentReaderModal({
  item,
  onClose,
}: {
  item: ContentReaderItem | null;
  onClose: () => void;
}) {
  const { playAudio } = useApp();
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopy = () => {
    const textToCopy = `${item.title}\n\n${item.summary ? item.summary + "\n\n" : ""}${item.content || ""}\n\n— موسوعة الشيخ محمد علي الصابوني رحمه الله`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlay = () => {
    if (item.mediaUrl) {
      playAudio({
        title: item.title,
        author: item.author || "الشيخ محمد علي الصابوني",
        url: item.mediaUrl,
        category: item.category,
      });
    }
  };

  const getTextClass = () => {
    switch (fontSize) {
      case "large":
        return "text-lg leading-loose";
      case "xlarge":
        return "text-xl leading-loose font-medium";
      default:
        return "text-base leading-relaxed";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E0D7C9] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Control Bar */}
        <div className="p-4 bg-white border-b border-[#EAE3D7] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#8E2336]/10 text-[#8E2336]">
              {item.category}
            </span>
            {item.source && (
              <span className="text-xs text-slate-500 truncate max-w-xs hidden sm:inline">
                المصدر: {item.source}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Font size toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs text-slate-600">
              <button
                onClick={() => setFontSize("normal")}
                className={`px-2 py-0.5 rounded font-bold ${fontSize === "normal" ? "bg-white shadow-sm" : ""}`}
                title="خط قياسي"
              >
                أ
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={`px-2 py-0.5 rounded font-bold text-sm ${fontSize === "large" ? "bg-white shadow-sm" : ""}`}
                title="خط متوسط"
              >
                أ+
              </button>
              <button
                onClick={() => setFontSize("xlarge")}
                className={`px-2 py-0.5 rounded font-bold text-base ${fontSize === "xlarge" ? "bg-white shadow-sm" : ""}`}
                title="خط كبير"
              >
                أ++
              </button>
            </div>

            {/* Audio Button */}
            {item.mediaUrl && (
              <button
                onClick={handlePlay}
                className="p-2 text-slate-600 hover:text-[#8E2336] bg-slate-100 hover:bg-[#8E2336]/10 rounded-lg transition"
                title="استماع صوتي"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-2 text-slate-600 hover:text-[#8E2336] bg-slate-100 hover:bg-[#8E2336]/10 rounded-lg transition"
              title="نسخ النص"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Title Header */}
          <div className="space-y-2 border-b border-[#EAE3D7] pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#8E2336] font-amiri leading-snug">
              {item.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>تحرير: {item.author || "الشيخ محمد علي الصابوني"}</span>
              {item.viewsCount ? <span>• {item.viewsCount.toLocaleString("ar-SY")} قراءة</span> : null}
              {item.source && <span className="sm:hidden">• {item.source}</span>}
            </div>
          </div>

          {/* Cover Image (if available) */}
          {item.coverImage && (
            <div className="w-full h-56 sm:h-72 rounded-2xl overflow-hidden shadow-md">
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Summary Box */}
          {item.summary && (
            <div className="p-4 bg-[#F5EFE6] border-r-4 border-[#8E2336] rounded-xl text-slate-700 text-sm leading-relaxed italic font-medium">
              {item.summary}
            </div>
          )}

          {/* Main Body Text */}
          <div
            className={`text-slate-800 whitespace-pre-line font-tajawal ${getTextClass()}`}
          >
            {item.content || "لا يتوفر نص مفصل لهذه المادة حالياً."}
          </div>

          {/* Metadata Cards */}
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <div className="p-4 bg-white border border-[#E0D7C9] rounded-2xl grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {item.metadata.narrator && (
                <div>
                  <span className="text-slate-400 block text-[10px]">راوي الحديث:</span>
                  <span className="font-semibold text-slate-700">{item.metadata.narrator}</span>
                </div>
              )}
              {item.metadata.hadithGrade && (
                <div>
                  <span className="text-slate-400 block text-[10px]">درجة الحديث:</span>
                  <span className="font-semibold text-emerald-700">{item.metadata.hadithGrade}</span>
                </div>
              )}
              {item.metadata.poemMeter && (
                <div>
                  <span className="text-slate-400 block text-[10px]">بحر القصيدة:</span>
                  <span className="font-semibold text-amber-800">{item.metadata.poemMeter}</span>
                </div>
              )}
              {item.metadata.year && (
                <div>
                  <span className="text-slate-400 block text-[10px]">سنة التوثيق:</span>
                  <span className="font-semibold text-slate-700">{item.metadata.year}</span>
                </div>
              )}
              {item.metadata.location && (
                <div>
                  <span className="text-slate-400 block text-[10px]">المكان:</span>
                  <span className="font-semibold text-slate-700">{item.metadata.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#E0D7C9] text-slate-600 text-[11px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#EAE3D7] flex items-center justify-between text-xs text-slate-500">
          <span>منصة العلامة الشيخ محمد علي الصابوني الرقمية</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold transition"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
}
