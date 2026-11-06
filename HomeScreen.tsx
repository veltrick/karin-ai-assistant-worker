import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Square,
  RotateCcw,
  Send,
  Volume2,
  VolumeX,
  Play,
  Sparkles,
  Radio,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  X,
} from "lucide-react";
import { KarinLogo } from "../KarinLogo";
import { AudioVisualizer } from "../AudioVisualizer";
import { AssistantState, AppSettings, ActionPayload } from "../../types";

interface HomeScreenProps {
  state: AssistantState;
  transcript: string;
  response: string;
  responseLanguage: "en" | "bn";
  settings: AppSettings;
  lastAction: ActionPayload | null;
  speechError: string | null;
  voiceWarning: string | null;
  onMicClick: () => void;
  onStopClick: () => void;
  onRepeatClick: () => void;
  onTextSubmit: (text: string) => void;
  onPromptChipClick: (text: string) => void;
  onReplayVoice: () => void;
  onToggleHandsFree: () => void;
  onToggleSpeaker: () => void;
  onTestVoice: (customText?: string) => void;
  onClearError: () => void;
  onAnnounceTalkBack: (text: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  state,
  transcript,
  response,
  responseLanguage,
  settings,
  lastAction,
  speechError,
  voiceWarning,
  onMicClick,
  onStopClick,
  onRepeatClick,
  onTextSubmit,
  onPromptChipClick,
  onReplayVoice,
  onToggleHandsFree,
  onToggleSpeaker,
  onTestVoice,
  onClearError,
  onAnnounceTalkBack,
}) => {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onTextSubmit(inputText.trim());
    setInputText("");
  };

  const samplePrompts = [
    { en: "Assalamu Alaikum", bn: "আসসালামু আলাইকুম" },
    { en: "Hey Karin, what time is it?", bn: "কারিন, এখন কয়টা বাজে?" },
    { en: "Distinguish Shorkari vs Shohokari", bn: "সরকারি ও সহকারীর পার্থক্য কী?" },
    { en: "Search MrBeast videos on YouTube", bn: "ইউটিউবে MrBeast-এর ভিডিও খুঁজছি" },
    { en: "Play the first video", bn: "প্রথম ভিডিওটি চালাও" },
    { en: "Play the second video", bn: "২ নম্বর ভিডিওটি চালাও" },
    { en: "Who built you?", bn: "তোমাকে কে তৈরি করেছে?" },
    { en: "Pause the video", bn: "ভিডিও থামাও" },
    { en: "Call Rahim", bn: "রহিমকে কল করো" },
    { en: "Open camera", bn: "ক্যামেরা খোলো" },
  ];

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-140px)] max-w-2xl mx-auto px-4 py-3 text-center">
      {/* Top Branding Section */}
      <div className="flex flex-col items-center space-y-2 mb-2">
        <div
          tabIndex={0}
          role="button"
          aria-label="KARIN AI Assistant Logo. Developed by VELTRICK, MD Kamruzzaman Founder and Managing Director."
          onFocus={() =>
            onAnnounceTalkBack(
              "KARIN AI Assistant Logo. Developed by VELTRICK, MD Kamruzzaman Founder and Managing Director."
            )
          }
          className="transition-transform hover:scale-105 cursor-pointer outline-none focus:ring-2 focus:ring-sky-400 rounded-3xl"
        >
          <KarinLogo
            size={76}
            glow={true}
            pulsing={state === "listening" || state === "speaking"}
          />
        </div>

        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
            KARIN AI ASSISTANT
          </h1>
          <p className="text-xs text-sky-400/80 font-medium tracking-wide">
            Voice-First Personal Assistant • VELTRICK
          </p>
          <p className="text-[10px] text-slate-400">
            Founder & Managing Director: <span className="text-slate-300">MD Kamruzzaman</span>
          </p>
        </div>

        {/* Quick Voice & Audio Control Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {/* Hands-Free Mode Toggle */}
          <button
            onClick={onToggleHandsFree}
            aria-pressed={settings.handsFreeEnabled}
            aria-label={`Hands-free mode is currently ${
              settings.handsFreeEnabled ? "enabled" : "disabled"
            }. Tap to toggle.`}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border ${
              settings.handsFreeEnabled
                ? "bg-sky-950/70 text-sky-300 border-sky-500/50 shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-300"
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                settings.handsFreeEnabled
                  ? "text-sky-400 animate-pulse"
                  : "text-slate-500"
              }`}
            />
            <span>
              Hands-Free:{" "}
              <strong className={settings.handsFreeEnabled ? "text-sky-300" : "text-slate-400"}>
                {settings.handsFreeEnabled ? "On" : "Off"}
              </strong>
            </span>
          </button>

          {/* Speaker On/Off Toggle */}
          <button
            onClick={onToggleSpeaker}
            aria-pressed={settings.speakerEnabled}
            aria-label={`Speaker voice output is currently ${
              settings.speakerEnabled ? "enabled" : "muted"
            }. Tap to toggle.`}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border ${
              settings.speakerEnabled
                ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                : "bg-rose-950/50 text-rose-300 border-rose-500/40"
            }`}
          >
            {settings.speakerEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>
              Voice Audio:{" "}
              <strong className={settings.speakerEnabled ? "text-emerald-300" : "text-rose-300"}>
                {settings.speakerEnabled ? "Enabled" : "Muted"}
              </strong>
            </span>
          </button>

          {/* Test Voice Button */}
          <button
            onClick={() => onTestVoice()}
            aria-label="Test Text-to-Speech voice output: Hello, I am Karin. How can I help you?"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-900/60 hover:bg-sky-800 text-sky-200 border border-sky-500/40 transition active:scale-95 shadow-sm"
          >
            <Play className="w-3 h-3 fill-sky-300 text-sky-300" />
            <span>Test Voice</span>
          </button>
        </div>
      </div>

      {/* Voice Warning / Fallback Notice */}
      {voiceWarning && (
        <div className="w-full max-w-lg mb-2 p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{voiceWarning}</span>
          </div>
          <button
            onClick={onClearError}
            className="p-1 hover:bg-amber-900/50 rounded-lg text-amber-300"
            aria-label="Dismiss warning"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Voice Error Notice with Autoplay Unlock Action */}
      {speechError && (
        <div className="w-full max-w-lg mb-2 p-3 bg-rose-950/70 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-left shadow-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold text-rose-100">Voice Output Notice:</strong>
              <span className="text-[11px] text-rose-200/90">{speechError}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onTestVoice()}
              className="px-2.5 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition"
            >
              Unlock Audio
            </button>
            <button
              onClick={onClearError}
              className="p-1 hover:bg-rose-900 rounded-lg text-rose-300"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Reactive Display Area */}
      <div className="w-full space-y-3 my-2">
        {/* Audio Visualizer Wave */}
        <AudioVisualizer
          isActive={state === "listening" || state === "speaking"}
          mode={state === "listening" ? "listening" : state === "speaking" ? "speaking" : "idle"}
        />

        {/* Real-Time Audio Speaking Indicator Banner */}
        {state === "speaking" && (
          <div className="w-full flex items-center justify-between px-3.5 py-1.5 bg-indigo-950/50 border border-indigo-500/40 rounded-xl text-xs text-indigo-200 animate-pulse">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-sky-400" />
              <span>KARIN is speaking aloud now...</span>
            </span>
            <button
              onClick={onStopClick}
              className="px-2 py-0.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-md text-[11px] font-bold transition"
            >
              Stop
            </button>
          </div>
        )}

        {/* Recognized Command Banner */}
        <div
          role="region"
          aria-live="polite"
          aria-label="Recognized voice command"
          className="p-3.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-sky-500/20 text-left min-h-[64px] flex flex-col justify-center"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  state === "listening"
                    ? "bg-sky-400 animate-ping"
                    : state === "processing"
                    ? "bg-amber-400 animate-bounce"
                    : state === "speaking"
                    ? "bg-indigo-400 animate-pulse"
                    : "bg-slate-600"
                }`}
              />
              {state === "listening"
                ? "Listening now (Speak English or বাংলা)..."
                : state === "processing"
                ? "Processing your voice command..."
                : state === "speaking"
                ? "Speaking Voice Response"
                : "User Voice / Text Command"}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
              {settings.language === "bn"
                ? "বাংলা (Bengali)"
                : settings.language === "en"
                ? "English (US)"
                : "Auto-Detect (EN/BN)"}
            </span>
          </div>
          <p className="text-white font-medium text-base sm:text-lg italic line-clamp-2">
            {transcript || (
              <span className="text-slate-500 not-italic text-sm">
                Tap the microphone or say "Hey Karin" to begin...
              </span>
            )}
          </p>
        </div>

        {/* KARIN Spoken Response Banner */}
        {response && (
          <div
            role="region"
            aria-live="assertive"
            aria-label="KARIN AI Response"
            className="p-4 bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-2xl border border-sky-400/30 text-left shadow-lg shadow-sky-950/40"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
                KARIN Voice Response
              </span>
              <div className="flex items-center gap-1">
                {state === "speaking" ? (
                  <button
                    onClick={onStopClick}
                    className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs flex items-center gap-1 border border-rose-500/40 transition"
                    aria-label="Stop speaking current response"
                  >
                    <Square className="w-3.5 h-3.5 fill-rose-400" />
                    <span className="text-[11px]">Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={onReplayVoice}
                    className="p-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 text-xs flex items-center gap-1 border border-sky-500/30 transition"
                    aria-label="Replay voice response"
                    title="Speak again"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Speak Aloud</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-slate-100 text-base sm:text-lg leading-relaxed font-sans">
              {response}
            </p>

            {/* Action Feedback & Interactive Action Execution Card */}
            {lastAction && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-sky-300/90">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Action: <strong>{lastAction.title}</strong></span>
                  </div>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {lastAction.intentAction || lastAction.type}
                  </span>
                </div>

                {/* Interactive Direct External Link Button (YouTube / URLs) */}
                {lastAction.externalUrl && (
                  <div className="pt-1">
                    <a
                      href={lastAction.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3.5 bg-gradient-to-r from-red-600/30 to-sky-600/30 hover:from-red-600/40 hover:to-sky-600/40 border border-sky-400/40 rounded-xl text-xs font-semibold text-sky-200 flex items-center justify-center gap-2 transition shadow-md shadow-sky-950/40"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-sky-300" />
                      <span>
                        {lastAction.type === "YOUTUBE_SEARCH"
                          ? `Open YouTube: "${lastAction.query || "Search"}"`
                          : "Open Link in New Tab"}
                      </span>
                    </a>
                  </div>
                )}

                {/* Step-by-Step Wi-Fi Settings Guide */}
                {lastAction.type === "WIFI_SETTINGS" && (
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-sky-500/20 text-xs text-left space-y-1 text-slate-300">
                    <span className="font-semibold text-sky-300 block mb-1">
                      📱 Android / Mobile Wi-Fi Instructions:
                    </span>
                    <ol className="list-decimal list-inside space-y-0.5 text-slate-400">
                      <li>Swipe down from the top edge of your device screen.</li>
                      <li>Press and hold the <strong className="text-white">Wi-Fi</strong> quick settings tile.</li>
                      <li>Select your desired Wi-Fi network and connect.</li>
                    </ol>
                  </div>
                )}

                {/* Transparent Web Capability Disclaimer */}
                {lastAction.capabilityNotice && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                    ℹ️ {lastAction.capabilityNotice}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Primary Interaction Controls */}
      <div className="w-full flex flex-col items-center gap-3 my-2">
        {/* Large Tactile Microphone Button */}
        <div className="relative flex items-center justify-center">
          {/* Animated Glow Rings when listening */}
          {state === "listening" && (
            <>
              <div className="absolute w-32 h-32 rounded-full bg-sky-400/20 animate-ping" />
              <div className="absolute w-28 h-28 rounded-full bg-sky-500/30 animate-pulse" />
            </>
          )}

          <button
            onClick={onMicClick}
            aria-label={
              state === "listening"
                ? "Microphone is listening. Tap to finish listening."
                : "Tap to start voice recognition in English or Bengali"
            }
            className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl focus:outline-none focus:ring-4 focus:ring-sky-400/60 active:scale-95 ${
              state === "listening"
                ? "bg-gradient-to-tr from-sky-400 to-cyan-300 text-slate-950 shadow-sky-400/50 ring-4 ring-sky-300 scale-105"
                : state === "processing"
                ? "bg-amber-500 text-slate-950 shadow-amber-500/30 animate-pulse"
                : state === "speaking"
                ? "bg-gradient-to-tr from-indigo-500 to-sky-400 text-white shadow-indigo-500/40 ring-4 ring-indigo-400/60"
                : "bg-gradient-to-b from-sky-500 via-sky-600 to-slate-900 text-white border-2 border-sky-400/60 shadow-sky-600/30 hover:border-sky-300 hover:shadow-sky-500/40"
            }`}
          >
            {state === "listening" ? (
              <Mic className="w-10 h-10 animate-bounce" />
            ) : state === "processing" ? (
              <Sparkles className="w-10 h-10 animate-spin" />
            ) : state === "speaking" ? (
              <Volume2 className="w-10 h-10 animate-pulse" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
              {state === "listening"
                ? "Listening"
                : state === "processing"
                ? "Thinking"
                : state === "speaking"
                ? "Speaking"
                : "Tap to Talk"}
            </span>
          </button>
        </div>

        {/* Secondary Voice Controls: Stop, Repeat, Test */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={onStopClick}
            aria-label="Stop speech and listening immediately"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold transition active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-rose-400" />
            <span>Stop Speech</span>
          </button>

          <button
            onClick={onRepeatClick}
            aria-label="Repeat the previous response"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-sky-300 hover:text-sky-200 border border-sky-500/30 text-xs font-semibold transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repeat Response</span>
          </button>

          <button
            onClick={() => onTestVoice()}
            aria-label="Test voice speaking aloud"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/30 text-xs font-semibold transition active:scale-95"
          >
            <Play className="w-3 h-3 fill-sky-300" />
            <span>Test Voice</span>
          </button>

          <button
            onClick={() =>
              onTestVoice("Hello, I am KARIN AI Assistant, developed by VELTRICK.")
            }
            aria-label="Test VELTRICK brand name pronunciation aloud"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-950 to-indigo-950/80 hover:from-sky-900 hover:to-indigo-900 text-sky-200 border border-sky-400/40 text-xs font-semibold transition active:scale-95"
            title="Hear how VELTRICK is pronounced as a single brand word"
          >
            <Sparkles className="w-3 h-3 text-sky-300" />
            <span>Say VELTRICK</span>
          </button>
        </div>

        {/* Suggested Voice Commands Chips */}
        <div className="w-full mt-2">
          <span className="text-[11px] text-slate-400 font-medium block mb-2 text-left">
            💡 Tap or speak a suggested command (English & বাংলা):
          </span>
          <div className="flex flex-wrap gap-1.5 justify-start max-h-24 overflow-y-auto pr-1">
            {samplePrompts.map((p, idx) => {
              const display = settings.language === "bn" ? p.bn : p.en;
              return (
                <button
                  key={idx}
                  onClick={() => onPromptChipClick(display)}
                  aria-label={`Prompt sample: ${display}`}
                  className="px-2.5 py-1 text-xs rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-200/90 border border-slate-800 hover:border-sky-500/40 transition active:scale-95 text-left"
                >
                  "{display}"
                </button>
              );
            })}
          </div>
        </div>

        {/* Fallback Text Input Form */}
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2 mt-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              settings.language === "bn"
                ? "কমান্ড টাইপ করুন (উদা: কয়টা বাজে?)..."
                : "Type a command (e.g. what time is it?)..."
            }
            aria-label="Type assistant command"
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
          />
          <button
            type="submit"
            aria-label="Submit command"
            className="p-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-2xl transition active:scale-95 shadow-md shadow-sky-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
