"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface Prefs {
  size: 0 | 1 | 2; // حجم الخط: عادي / كبير / أكبر
  contrast: boolean; // تباين عالٍ
  calm: boolean; // إيقاف الحركة
}

const DEFAULTS: Prefs = { size: 0, contrast: false, calm: false };
const KEY = "sabuni-prefs";
const ROOT_SIZE = ["106.25%", "118.75%", "131.25%"]; // 17px / 19px / 21px

const Ctx = createContext<{ prefs: Prefs; set: (p: Partial<Prefs>) => void } | null>(null);

export function readStoredPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    const p = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) p.calm = true;
    return p;
  } catch {
    return DEFAULTS;
  }
}

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => setPrefs(readStoredPrefs()), []);

  useEffect(() => {
    const html = document.documentElement;
    html.style.fontSize = ROOT_SIZE[prefs.size];
    html.classList.toggle("hc", prefs.contrast);
    html.classList.toggle("calm", prefs.calm);
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  const set = (p: Partial<Prefs>) => setPrefs((old) => ({ ...old, ...p }));

  return <Ctx.Provider value={{ prefs, set }}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePrefs must be used inside PrefsProvider");
  return c;
}
