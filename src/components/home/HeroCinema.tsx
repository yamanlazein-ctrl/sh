"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Clapperboard } from "lucide-react";
import { usePrefs } from "./prefs";

/**
 * نظام فيديو الهيرو — «فيلم الشيخ»
 *
 * الفكرة: شخصية واحدة ثابتة (الشيخ) و٦ لقطات سينمائية تتبدّل بسرعة
 * (كل ثانية وربع تقريباً) مع وميض قصّ مونتاج — فيبدو المشهد كفيديو حيّ.
 *
 * 1) إن وُجد فيديو حقيقي في public/videos/sheikh-intro.mp4 يُعرض بدلاً من اللقطات
 *    تلقائياً (صامت + زر صوت).
 * 2) وضع «الهدوء» يجمّد اللقطات على لقطة واحدة بلا أي حركة.
 */

const VIDEO_SRC = "/videos/sheikh-intro.mp4";
const FRAME_MS = 1150;

interface Frame {
  src: string;
  tag: string;
  line: string;
}

const FRAMES: Frame[] = [
  { src: "/images/frames/sheikh-frame-1.jpg", tag: "مجالس التفسير", line: "يشرح كتابَ الله… ويقلّب الصفحة لأجيال" },
  { src: "/images/frames/sheikh-frame-2.jpg", tag: "بين يدي التفسير", line: "بين السطور يعيش الوحي" },
  { src: "/images/frames/sheikh-frame-3.jpg", tag: "تدبّر", line: "صمتٌ… يتلو كما نزل" },
  { src: "/images/frames/sheikh-frame-4.jpg", tag: "دعاء", line: "ويداه مرفوعتان بظهر الغيب" },
  { src: "/images/frames/sheikh-frame-5.jpg", tag: "الإرث", line: "ورحيله… أثرٌ باقٍ" },
  { src: "/images/frames/sheikh-frame-6.jpg", tag: "خطب ومحاضرات", line: "وكلمته منبرُ حكمة" },
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
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* —— لقطات الشخصية تتقلب كإطارات فيلم —— */}
      {FRAMES.map((f, i) => (
        <div key={f.src} className={`scene ${filmOn && loadedCount > 0 && frame === i ? "on" : ""}`}>
          <img
            src={f.src}
            alt=""
            className={prefs.calm ? "" : i % 2 ? "kb-alt" : "kb"}
            style={{ willChange: "transform" }}
          />
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

      {/* —— شعاع ذهبي يمرّ على المشهد دورياً —— */}
      {!prefs.calm && <div className="light-sweep pointer-events-none absolute inset-y-0 right-[-30%] z-10 w-1/2" />}

      {/* —— طبقات التلوين السينمائي —— */}
      <div className="duotone-warm absolute inset-0" />
      <div className="vignette absolute inset-0" />
      <div className="gold-glow absolute inset-0" />

      {/* —— شارة الفيلم + رقم اللقطة —— */}
      <div className="absolute left-5 top-24 z-20 flex items-center gap-3 sm:left-10 sm:top-28">
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

      {/* —— شريط اللقطات (ticks) —— */}
      {filmOn && (
        <div className="absolute bottom-[8.5rem] left-5 z-20 flex items-center gap-1.5 sm:bottom-24 sm:left-10">
          {FRAMES.map((f, i) => (
            <button
              key={f.src}
              onClick={() => setFrame(i)}
              aria-label={`اللقطة ${i + 1}: ${f.tag}`}
              className="group relative h-4 w-8"
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

      {/* —— تعليق اللقطة الحالية (كتعليق فيلم وثائقي) —— */}
      <div className="absolute bottom-24 right-5 z-20 max-w-[80%] sm:bottom-28 sm:right-10">
        <div key={filmOn ? frame : "video"} className="rise">
          {filmOn ? (
            <>
              <p className="text-[11px] font-bold tracking-[0.25em] text-gold">{cur.tag}</p>
              <p className="font-display mt-1 text-xl leading-snug text-ivory drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] sm:text-3xl">
                {cur.line}
              </p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-bold tracking-[0.25em] text-gold">من أرشيف المرئيات</p>
              <p className="font-display mt-1 text-xl leading-snug text-ivory drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] sm:text-3xl">
                الشيخ محمد علي الصابوني رحمه الله
              </p>
            </>
          )}
        </div>
      </div>

      {/* —— زر الصوت عند توفر فيديو بصوت —— */}
      {videoOk && (
        <button
          onClick={toggleSound}
          className="absolute bottom-24 left-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-ink/60 text-gold backdrop-blur-md transition hover:bg-gold hover:text-ink sm:bottom-28 sm:left-10"
          aria-label={muted ? "تشغيل صوت الفيديو" : "كتم الصوت"}
          title={muted ? "تشغيل الصوت" : "كتم الصوت"}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      )}
    </div>
  );
}
