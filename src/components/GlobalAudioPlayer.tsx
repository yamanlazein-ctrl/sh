"use client";

import React, { useRef, useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
  ChevronDown,
  ChevronUp,
  Radio,
} from "lucide-react";

export default function GlobalAudioPlayer() {
  const { activeAudio, isPlaying, togglePlay, closeAudio } = useApp();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn("Audio play prevented:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeAudio]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  if (!activeAudio) return null;

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration || 9999);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const rates = [0.75, 1, 1.25, 1.5, 2];
  const nextRate = () => {
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-5xl mx-auto">
      <audio
        ref={audioRef}
        src={activeAudio.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => togglePlay()}
      />

      <div className="bg-[#1E242B]/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/70 p-3.5 transition-all">
        {/* Minimized View */}
        {isMinimized ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-[#8E2336] text-white flex items-center justify-center hover:bg-[#a1293f] transition shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{activeAudio.title}</p>
                <p className="text-[11px] text-slate-400 truncate">{activeAudio.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={closeAudio}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Full Expanded View */
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              {/* Title & Badge */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#8E2336] text-amber-200 flex items-center justify-center shrink-0">
                  <Radio className={`w-5 h-5 ${isPlaying ? "animate-pulse" : ""}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeAudio.category || "صوتيات"}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      {activeAudio.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {activeAudio.author} {activeAudio.duration ? `• ${activeAudio.duration}` : ""}
                  </p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={nextRate}
                  className="px-2 py-1 text-[11px] font-bold rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
                  title="تغيير سرعة التشغيل"
                >
                  {playbackRate}x
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  title="تصغير المشغل"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={closeAudio}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  title="إغلاق المشغل"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Timeline Progress Slider */}
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#8E2336]"
              />
              <span>{formatTime(duration)}</span>
            </div>

            {/* Main Playback Controls Bar */}
            <div className="flex items-center justify-between pt-1">
              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-16 sm:w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Middle Action Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => skipTime(-10)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition"
                  title="إرجاع 10 ثوانٍ"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-full bg-[#8E2336] hover:bg-[#a1293f] text-white flex items-center justify-center shadow-lg transition transform hover:scale-105"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <button
                  onClick={() => skipTime(10)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition"
                  title="تقديم 10 ثوانٍ"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Visualizer Status */}
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-[11px] text-slate-400">
                  {isPlaying ? "جاري الاستماع" : "متوقف مؤقتاً"}
                </span>
                <div className="flex items-end gap-0.5 h-3.5">
                  <span className={`w-0.5 bg-amber-400 rounded-full ${isPlaying ? "animate-wave-1" : "h-1"}`}></span>
                  <span className={`w-0.5 bg-amber-400 rounded-full ${isPlaying ? "animate-wave-2" : "h-2"}`}></span>
                  <span className={`w-0.5 bg-amber-400 rounded-full ${isPlaying ? "animate-wave-3" : "h-1.5"}`}></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
