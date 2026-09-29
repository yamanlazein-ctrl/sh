"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Clapperboard } from "lucide-react";
import { usePrefs } from "./prefs";

/**
 * الخلفية السينمائية للواجهة — «فيلم الشيخ»
 *
 * كيف تعمل؟
 * 1) إن وُجد فيديو حقيقي للشيخ في  public/videos/sheikh-intro.mp4
 *    (مثلاً مقطع تلاوة فجرية أو فتوى قصيرة) يُشغَّل تلقائياً بصمت مع زر للصوت.
 * 2) إن لم يوجد، تعمل «مشاهد» سينمائية ثابتة بحركة Ken Burns وتقاطع ناعم،
 *    فتبقى الواجهة حيّة دائماً بلا ملفات خارجية.
 */

const VIDEO_SRC = "/videos/sheikh-intro.mp4";

const SCENES = [
  {
    src: "/images/sheikh-video-poster-1.jpg",
    line: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    sub: "تلاوةُ فجرٍ من مجالس الشيخ",
  },
  {
    src: "/images/sheikh-video-poster-2.jpg",
    line: "عقودٌ بين يدي التفسير",
    sub: "من ورق الشيخ… ذاكرةُ أمّة",
  },
  {
    src: "/images/sheikh-video-poster-3.jpg",
    line: "مجالسُ العلم باقيةٌ بأهلها",
    sub: "سبعون عاماً في خدمة كتاب الله",
  },
];

const SCENE_MS = 9000;

export default function HeroCinema() {
  const { prefs } = usePrefs();
  const [videoOk, setVideoOk] = useState(false);
  const [videoGone, setVideoGone] = useState(false); // لا يوجد ملف فيديو بعد
  const [muted, setMuted] = useState(true);
  const [scene, setScene] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>(() => SCENES.map(() => false));
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /* تحميل مسبق لأول مشهدين لتفادي الوميض */
  useEffect(() => {
    SCENES.slice(0, 2).forEach((s, i) => {
      const img = new Image();
      img.onload = () => setLoaded((l) => l.map((v, k) => (k === i ? true : v)));
      img.src = s.src;
    });
  }, []);

  /* تقديم المشاهد — يتوقف في وضع الهدوء أو عند تشغيل فيديو حقيقي */
  useEffect(() => {
    if (prefs.calm || videoOk) return;
    const id = setInterval(() => setScene((s) => (s + 1) % SCENES.length), SCENE_MS);
    return () => clearInterval(id);
  }, [prefs.calm, videoOk]);

  /* تحميل المشهد التالي خلف الكواليس */
  useEffect(() => {
    const next = (scene + 1) % SCENES.length;
    if (!loaded[next]) {
      const img = new Image();
      img.onload = () => setLoaded((l) => l.map((v, k) => (k === next ? true : v)));
      img.src = SCENES[next].src;
    }
  }, [scene, loaded]);

  const onCanPlay = useCallback(() => setVideoOk(true), []);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

  const showScenes = !videoOk;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* —— المشاهد السينمائية (خلفية أساسية) —— */}
      {SCENES.map((s, i) => (
        <div
          key={s.src}
          className={`scene ${showScenes && scene === i && loaded[i] ? "on" : ""}`}
        >
          <img
            src={s.src}
            alt=""
            className={prefs.calm ? "" : i % 2 ? "kb-alt" : "kb"}
            style={{ willChange: "transform" }}
          />
        </div>
      ))}
      {/* مشهد أول احتياطي إن لم يُحمّل شيء بعد */}
      <div className={`scene ${showScenes && !loaded[0] && !loaded[1] ? "on" : ""}`}>
        <div className="h-full w-full bg-gradient-to-b from-ink3 via-emd2 to-ink" />
      </div>

      {/* —— الفيديو الحقيقي للشيخ (إن وُجد) يصعد فوق المشاهد —— */}
      {!videoGone && (
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={SCENES[0].src}
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

      {/* —— طبقات التلوين السينمائي —— */}
      <div className="duotone-emerald absolute inset-0" />
      <div className="vignette absolute inset-0" />
      <div className="gold-glow absolute inset-0" />

      {/* —— شارة «عرض» + تعليق المشهد —— */}
      <div className="absolute bottom-24 right-5 z-10 max-w-[78%] sm:bottom-28 sm:right-10">
        <div
          className={`transition-all duration-1000 ${
            showScenes && loaded[scene] ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          key={showScenes ? scene : "video"}
        >
          <p className="font-quran text-xl leading-relaxed text-gold2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-3xl">
            {showScenes ? SCENES[scene].line : "الشيخ محمد علي الصابوني رحمه الله"}
          </p>
          <p className="mt-1 text-sm text-ivory/70 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-base">
            {showScenes ? SCENES[scene].sub : "لمحةٌ تعريفية — من أرشيف المرئيات"}
          </p>
        </div>
      </div>

      {/* —— حالة العرض: فيديو أم مشاهد —— */}
      <div className="absolute left-5 top-24 z-10 flex items-center gap-2 sm:left-10 sm:top-28">
        <span className="flex items-center gap-2 rounded-full border border-gold/30 bg-ink/55 px-3.5 py-1.5 text-xs text-gold backdrop-blur-md">
          <Clapperboard className="h-3.5 w-3.5" />
          {videoOk ? "فيديو الشيخ يُعرض الآن" : "من أرشيف الشيخ"}
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
          </span>
        </span>
      </div>

      {/* —— زر الصوت عند توفر فيديو بصوت —— */}
      {videoOk && (
        <button
          onClick={toggleSound}
          className="absolute bottom-24 left-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-ink/60 text-gold backdrop-blur-md transition hover:bg-gold hover:text-ink sm:bottom-28 sm:left-10"
          aria-label={muted ? "تشغيل صوت الفيديو" : "كتم الصوت"}
          title={muted ? "تشغيل الصوت" : "كتم الصوت"}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      )}
    </div>
  );
}
