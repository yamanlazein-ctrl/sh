"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Clapperboard } from "lucide-react";
import { usePrefs } from "./prefs";

/**
 * نظام فيديو الهيرو — «فيلم الشيخ»
 *
 * الفكرة: شخصية واحدة ثابتة (الشيخ) و٦ لقطات سينمائية تتبدّل بسرعة
 * (كل ثانية بالضبط) مع وميض قصّ مونتاج — فيبدو المشهد كفيديو حيّ.
 *
 * 1) إن وُجد فيديو حقيقي في public/videos/sheikh-intro.mp4 يُعرض بدلاً من اللقطات
 *    تلقائياً (صامت + زر صوت).
 * 2) وضع «الهدوء» يجمّد اللقطات على لقطة واحدة بلا أي حركة.
 */

const VIDEO_SRC = "/videos/sheikh-intro.mp4";
const FRAME_MS = 1000;

interface Frame {
  src: string;
  tag: string;
  line: string;
  word: string;
}

const FRAMES: Frame[] = [
  { src: "/images/frames/sheikh-frame-1.jpg", tag: "مجالس التفسير", line: "يشرح كتابَ الله… ويقلّب الصفحة لأجيال", word: "التفسير" },
  { src: "/images/frames/sheikh-frame-2.jpg", tag: "بين يدي التفسير", line: "بين السطور يعيش الوحي", word: "التلاوة" },
  { src: "/images/frames/sheikh-frame-3.jpg", tag: "تدبّر", line: "صمتٌ… يتلو كما نزل", word: "التدبّر" },
  { src: "/images/frames/sheikh-frame-4.jpg", tag: "دعاء", line: "ويداه مرفوعتان بظهر الغيب", word: "الدعاء" },
  { src: "/images/frames/sheikh-frame-5.jpg", tag: "الإرث", line: "ورحيله… أثرٌ باقٍ", word: "الإرث" },
  { src: "/images/frames/sheikh-frame-6.jpg", tag: "خطب ومحاضرات", line: "وكلمته منبرُ حكمة", word: "المنبر" },
];

const pad2 = (n: number) => String(n).padStart(2, "0");

export default function HeroCinema() {
  const { prefs } = usePrefs();
  const [videoOk, setVideoOk] = useState(false);
  const [videoGone, setVideoGone] = useState(false);
  const [muted, setMuted] = useState(true);
  const [frame, setFrame] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /* بارالاكس: المشهد يتبع الماوس بلطف */
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (prefs.calm) return;
    const onMove = (e: MouseEvent) => {
      rootRef.current?.style.setProperty("--px", (e.clientX / window.innerWidth - 0.5).toFixed(3));
      rootRef.current?.style.setProperty("--py", (e.clientY / window.innerHeight - 0.5).toFixed(3));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [prefs.calm]);

  /* تحميل كل اللقطات مسبقاً — حتى يكون التبدّل كالفيديو بلا وميض تحميل */
  useEffect(() => {
    let done = 0;
    FRAMES.forEach((f) => {
      const img = new Image();
      const onload = () => setLoadedCount((c) => c + 1);
      img.onload = onload;
      img.onerror = onload;
      img.src = f.src;
      done++;
    });
  }, []);

  /* مُقدّم اللقطات — كل FRAME_MS لقطة جديدة (يتوقف عند الفيديو الحقيقي أو وضع الهدوء) */
  useEffect(() => {
    if (prefs.calm || videoOk) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), FRAME_MS);
    return () => clearInterval(id);
  }, [prefs.calm, videoOk]);

  const onCanPlay = useCallback(() => setVideoOk(true), []);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

  const filmOn = !videoOk; // هل نعرض اللقطات؟
  const cur = FRAMES[frame];

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* —— لقطات الشخصية تتقلب كإطارات فيلم —— */}
      {FRAMES.map((f, i) => (
        <div key={f.src} className={`scene ${filmOn && loadedCount > 0 && frame === i ? "on" : ""}`}>
          <div className="parallax-l h-full w-full">
            <img
              src={f.src}
              alt=""
              className={prefs.calm ? "" : i % 2 ? "kb-alt" : "kb"}
              style={{ willChange: "transform" }}
            />
          </div>
        </div>
      ))}
      {/* خلفية احتياطية حتى يجهز أول تحميل */}
      <div className={`scene ${filmOn && loadedCount === 0 ? "on" : ""}`}>
        <div className="h-full w-full bg-gradient-to-b from-ink3 via-bronze2 to-ink" />
      </div>

      {/* —— الفيديو الحقيقي (إن وُجد) يصعد فوق اللقطات —— */}
      {!videoGone && (
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={FRAMES[0].src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={onCanPlay}
          onError={() => setVideoGone(true)}
          className={`scene ${videoOk ? "on" : ""}`}
        />
      )}

      {/* —— وميض القص عند كل تبدّل لقطة —— */}
      {filmOn && !prefs.calm && (
        <div key={frame} className="cut-flash pointer-events-none absolute inset-0 z-10" />
      )}

      {/* —— طبقات التلوين السينمائي —— */}
      <div className="duotone-warm absolute inset-0" />
      <div className="vignette absolute inset-0" />
      <div className="gold-glow absolute inset-0" />

      {/* —— عنقود الفيلم: شارة + عدّاد + شرائط اللقطات، بمكان واحد —— */}
      <div className="absolute left-5 top-24 z-20 flex flex-col items-start gap-2 sm:left-10 sm:top-28">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-full border border-gold/30 bg-ink/55 px-3.5 py-1.5 text-xs text-gold backdrop-blur-md">
            <Clapperboard className="h-3.5 w-3.5" />
            {videoOk ? "فيديو الشيخ يُعرض الآن" : "فيلم: سبعون عاماً في خدمة القرآن"}
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
            </span>
          </span>
          {filmOn && (
            <span className="font-sans rounded-full border border-white/10 bg-ink/55 px-2.5 py-1 text-[11px] tabular-nums text-ivory/70 backdrop-blur-md" dir="ltr">
              {pad2(frame + 1)} / {pad2(FRAMES.length)}
            </span>
          )}
        </div>
        {filmOn && (
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-ink/45 px-3 py-2 backdrop-blur-md">
            {FRAMES.map((f, i) => (
              <button
                key={f.src}
                onClick={() => setFrame(i)}
                aria-label={`اللقطة ${i + 1}: ${f.tag}`}
                className="relative h-4 w-7"
              >
                <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-ivory/20">
                  {i === frame && !prefs.calm ? (
                    <span key={frame} className="fillbar block h-full w-full bg-gold" />
                  ) : (
                    <span className={`block h-full w-full ${i < frame ? "bg-gold/50" : "bg-transparent"} transition-colors`} />
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
