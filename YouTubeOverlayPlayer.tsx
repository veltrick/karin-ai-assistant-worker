import React from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Volume1,
  ExternalLink,
  X,
  Radio,
  ArrowLeft,
  Sparkles,
  ListVideo,
} from "lucide-react";
import { YouTubeVideoItem } from "../utils/youtubeController";

interface YouTubeOverlayPlayerProps {
  isOpen: boolean;
  activeQuery: string;
  videos: YouTubeVideoItem[];
  currentVideo: YouTubeVideoItem | null;
  isPlaying: boolean;
  volume: number;
  language: "en" | "bn";
  isHandsFreeListening: boolean;
  onSelectVideo: (video: YouTubeVideoItem, index: number) => void;
  onTogglePlayPause: () => void;
  onNextVideo: () => void;
  onPrevVideo: () => void;
  onVolumeChange: (vol: number) => void;
  onBackToResults: () => void;
  onReadResultsAloud: () => void;
  onClose: () => void;
  onAnnounceTalkBack: (text: string) => void;
}

export const YouTubeOverlayPlayer: React.FC<YouTubeOverlayPlayerProps> = ({
  isOpen,
  activeQuery,
  videos,
  currentVideo,
  isPlaying,
  volume,
  language,
  isHandsFreeListening,
  onSelectVideo,
  onTogglePlayPause,
  onNextVideo,
  onPrevVideo,
  onVolumeChange,
  onBackToResults,
  onReadResultsAloud,
  onClose,
  onAnnounceTalkBack,
}) => {
  if (!isOpen) return null;

  const bnNums = ["১", "২", "৩", "৪", "৫"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Accessible YouTube Voice Player"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="flex flex-col w-full max-w-2xl bg-slate-900 border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ListVideo className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>YouTube Voice Controller</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-500/30">
                  {language === "bn" ? "ভয়েস নিয়ন্ত্রিত" : "Voice Controlled"}
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {language === "bn"
                  ? `অনুসন্ধান: "${activeQuery || "জনপ্রিয় ভিডিও"}"`
                  : `Search: "${activeQuery || "Popular Videos"}"`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Hands-Free Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isHandsFreeListening
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 animate-pulse"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              <Radio className="w-3 h-3" />
              <span className="hidden sm:inline">
                {isHandsFreeListening ? "Mic Listening" : "Mic Idle"}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onAnnounceTalkBack("Closed YouTube Voice Player");
              }}
              aria-label="Close YouTube player"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Section */}
        {currentVideo ? (
          <div className="flex flex-col bg-black">
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              <iframe
                title={currentVideo.title}
                src={currentVideo.embedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Now Playing Title & Navigation Bar */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-left overflow-hidden">
                  <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wide">
                    {language === "bn" ? "বর্তমানে চলছে" : "Now Playing"}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {language === "bn" ? currentVideo.titleBn || currentVideo.title : currentVideo.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {currentVideo.channel} • {currentVideo.duration} • {currentVideo.views}
                  </p>
                </div>

                <a
                  href={currentVideo.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition whitespace-nowrap"
                  aria-label="Open in official YouTube"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Open YouTube</span>
                </a>
              </div>

              {/* Accessible Voice / Media Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={onPrevVideo}
                    aria-label="Previous video"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition focus:ring-2 focus:ring-sky-400"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onTogglePlayPause}
                    aria-label={isPlaying ? "Pause video" : "Resume video"}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition focus:ring-2 focus:ring-sky-300"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="text-xs">{isPlaying ? "Pause" : "Play"}</span>
                  </button>

                  <button
                    onClick={onNextVideo}
                    aria-label="Next video"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition focus:ring-2 focus:ring-sky-400"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onBackToResults}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition ml-1"
                    aria-label="Return to video results list"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{language === "bn" ? "ফলাফল তালিকা" : "Results List"}</span>
                  </button>
                </div>

                {/* Volume Slider Control */}
                <div className="flex items-center gap-1.5">
                  {volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : volume < 50 ? (
                    <Volume1 className="w-4 h-4 text-sky-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-sky-400" />
                  )}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    aria-label={`Volume: ${volume} percent`}
                    className="w-20 sm:w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                  <span className="text-[11px] text-slate-400 w-7 text-right">{volume}%</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Results List Section */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {language === "bn"
                ? `অনুসন্ধান ফলাফল (${videos.length} টি ভিডিও)`
                : `Search Results (${videos.length} videos)`}
            </span>

            {/* Read Aloud Button for Visually Impaired Users */}
            <button
              onClick={onReadResultsAloud}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950 text-sky-300 border border-sky-500/40 hover:bg-sky-900 transition"
              aria-label="Read all search results aloud with title and video number"
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              <span>{language === "bn" ? "ফলাফল শুনুন" : "Read Results Aloud"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {videos.map((item, idx) => {
              const isSelected = currentVideo?.id === item.id;
              const numLabel = language === "bn" ? `${bnNums[idx] || idx + 1} নম্বর` : `Video #${idx + 1}`;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectVideo(item, idx + 1)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`${numLabel}: ${item.title}. Channel: ${item.channel}. Duration: ${item.duration}. Tap or say 'Play video ${idx + 1}' to watch.`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectVideo(item, idx + 1);
                    }
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-left cursor-pointer transition border outline-none focus:ring-2 focus:ring-sky-400 ${
                    isSelected
                      ? "bg-sky-950/60 border-sky-500/80 shadow-[0_0_15px_rgba(14,165,233,0.2)]"
                      : "bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  {/* Position Badge */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                      isSelected
                        ? "bg-sky-500 text-slate-950 shadow-md"
                        : "bg-slate-700 text-sky-300 border border-slate-600"
                    }`}
                  >
                    {language === "bn" ? bnNums[idx] || idx + 1 : idx + 1}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-700">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] font-semibold bg-black/80 text-white px-1 py-0.5 rounded">
                      {item.duration}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-2">
                      {language === "bn" ? item.titleBn || item.title : item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {item.channel} • {item.views}
                    </p>
                    <span className="inline-block mt-1 text-[10px] text-sky-400 font-medium">
                      {language === "bn"
                        ? `বলুন: "${bnNums[idx] || idx + 1} নম্বর ভিডিওটি চালাও"`
                        : `Say: "Play video ${idx + 1}"`}
                    </span>
                  </div>

                  {/* Play Action Icon */}
                  <div className="shrink-0 p-2 text-slate-400 hover:text-sky-300">
                    {isSelected && isPlaying ? (
                      <Pause className="w-5 h-5 text-sky-400 animate-pulse" />
                    ) : (
                      <Play className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spoken Navigation Hints for Blind Users */}
          <div className="p-3 mt-2 rounded-xl bg-slate-950/70 border border-slate-800 text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "ভয়েস কমান্ড গাইড (হ্যান্ডস-ফ্রি)" : "Hands-Free Voice Commands"}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-400">
              <p>• {language === "bn" ? `"প্রথম ভিডিওটি চালাও" বা "২ নম্বর ভিডিও"` : `"Play the first video" or "Play 2nd"`}</p>
              <p>• {language === "bn" ? `"ভিডিও থামাও" / "ভিডিও চালু করো"` : `"Pause the video" / "Resume playback"`}</p>
              <p>• {language === "bn" ? `"পরের ভিডিও" / "ভলিউম বাড়াও"` : `"Skip to next video" / "Volume up"`}</p>
              <p>• {language === "bn" ? `"আগের ফলাফলে ফিরে যাও"` : `"Return to previous results"`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
