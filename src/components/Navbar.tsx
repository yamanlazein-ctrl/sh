"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Search,
  BookOpen,
  ShoppingBag,
  Volume2,
  Menu,
  X,
  Sparkles,
  Layers,
  HelpCircle,
  ShieldCheck,
  Compass,
  FileText,
  User,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { setIsSearchOpen, setIsCartOpen, cartTotalCount, activeAudio } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [archiveDropdownOpen, setArchiveDropdownOpen] = useState(false);

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "صفوة التفاسير", href: "/tafsir", highlight: true },
    { name: "الأرشيف العلمي", href: "/archive" },
    { name: "متجر الكتب", href: "/store" },
    { name: "السيرة والتراث", href: "/biography" },
    { name: "الأذكار والأدعية", href: "/adhkar" },
    { name: "بنك الفتاوى", href: "/fatwa-bank" },
  ];

  const archiveCategories = [
    { name: "الفتاوى والأحكام", type: "fatwa", icon: HelpCircle },
    { name: "الكتب والمؤلفات", type: "book", icon: BookOpen },
    { name: "الأحاديث وشروحها", type: "hadith", icon: FileText },
    { name: "الأبحاث الفقهية", type: "fiqh_research", icon: Layers },
    { name: "المقالات الفكرية", type: "article", icon: FileText },
    { name: "الدروس والخطب", type: "lecture", icon: Volume2 },
    { name: "الشعر والقصائد", type: "poem", icon: Sparkles },
    { name: "الصوتيات والمرئيات", type: "audio", icon: Volume2 },
    { name: "الوثائق والصور", type: "document_photo", icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EAE3D7] transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-[#731A29] text-[#FAF8F5] text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-medium">
              المنصة الرقمية الموثقة لتراث العلامة الشيخ محمد علي الصابوني (رحمه الله)
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-amber-200">
            <Link href="/admin" className="hover:text-white flex items-center gap-1 transition">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>لوحة الإدارة والمزامنة</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Calligraphy badge */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#731A29] to-[#58121E] text-white flex items-center justify-center shadow-md shadow-[#731A29]/15 group-hover:scale-105 transition transform">
              <span className="font-amiri text-2xl font-bold leading-none select-none text-amber-200">
                ص
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-amiri text-xl sm:text-2xl font-bold text-[#731A29] tracking-tight group-hover:text-[#58121E] transition">
                الشيخ محمد علي الصابوني
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-wider">
                الأرشيف العلمي والمكتبة الرقمية الشاملة
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#731A29] text-white shadow-sm"
                      : link.highlight
                      ? "text-[#731A29] bg-[#731A29]/8 hover:bg-[#731A29]/15 font-semibold"
                      : "text-slate-700 hover:text-[#731A29] hover:bg-[#F0EAE1]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons: Search, Cart, Audio Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Smart Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2D9CC] text-slate-600 hover:border-[#731A29] hover:text-[#731A29] shadow-sm transition group"
              title="بحث ذكي في الموسوعة (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-slate-400 group-hover:text-[#731A29]" />
              <span className="hidden md:inline text-xs font-medium">بحث ذكي...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-400 rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-white border border-[#E2D9CC] text-slate-700 hover:text-[#731A29] hover:border-[#731A29] shadow-sm transition"
              title="سلة الكتب والمشتريات"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#731A29] text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {cartTotalCount}
                </span>
              )}
            </button>

            {/* Active Audio Pulse Indicator */}
            {activeAudio && (
              <div
                onClick={() => {}}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#731A29]/10 border border-[#731A29]/20 rounded-xl text-[#731A29] text-xs font-medium cursor-pointer"
              >
                <div className="flex items-end gap-0.5 h-4">
                  <span className="w-1 bg-[#731A29] rounded-full animate-wave-1"></span>
                  <span className="w-1 bg-[#731A29] rounded-full animate-wave-2"></span>
                  <span className="w-1 bg-[#731A29] rounded-full animate-wave-3"></span>
                </div>
                <span className="truncate max-w-[120px]">{activeAudio.title}</span>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white border border-[#E2D9CC] text-slate-700 hover:text-[#731A29]"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-b border-[#EAE3D7] px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2.5 rounded-lg text-sm font-medium text-center ${
                  pathname === link.href
                    ? "bg-[#731A29] text-white"
                    : link.highlight
                    ? "bg-[#731A29]/10 text-[#731A29] font-semibold"
                    : "bg-white border border-[#EAE3D7] text-slate-700"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-[#EAE3D7]">
            <p className="text-xs font-semibold text-slate-400 mb-2">أقسام الأرشيف المباشرة</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {archiveCategories.map((c) => (
                <Link
                  key={c.type}
                  href={`/archive?type=${c.type}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/70 hover:bg-[#731A29]/10 text-slate-700"
                >
                  <c.icon className="w-3.5 h-3.5 text-[#731A29]" />
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 text-amber-300 rounded-xl text-xs font-semibold"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة الإدارة والتحكم والنشر</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
