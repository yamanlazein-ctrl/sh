"use client";

import { useEffect, useRef, useState } from "react";

/* ---------------- Voice search (speech → text) ---------------- */

type Rec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> & { length: number } }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognition(): (new () => Rec) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useVoiceSearch(onText: (t: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Rec | null>(null);
  const cb = useRef(onText);
  cb.current = onText;

  useEffect(() => setSupported(!!getRecognition()), []);

  const start = () => {
    const R = getRecognition();
    if (!R) return;
    setError(null);
    const rec = new R();
    rec.lang = "ar-SA";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      cb.current(text.trim());
    };
    rec.onerror = (e) => {
      setError(e.error === "not-allowed" ? "اسمح للموقع باستخدام الميكروفون من إعدادات المتصفح" : "لم نسمع جيداً، حاول مرة أخرى");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const stop = () => {
    recRef.current?.stop();
    setListening(false);
  };

  useEffect(() => () => recRef.current?.stop(), []);

  return { supported, listening, error, start, stop };
}

/* ---------------- Read aloud (text → speech) ---------------- */

export function useReadAloud() {
  const [supported, setSupported] = useState(false);
  const [hasArabic, setHasArabic] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);
    const check = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) setHasArabic(voices.some((v) => v.lang.toLowerCase().startsWith("ar")));
    };
    check();
    window.speechSynthesis.onvoiceschanged = check;
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = (text: string, rate = 0.9) => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const ar = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("ar"));
    if (ar) u.voice = ar;
    u.lang = ar?.lang || "ar-SA";
    u.rate = rate;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  };

  const stop = () => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return { supported, hasArabic, speaking, speak, stop };
}
