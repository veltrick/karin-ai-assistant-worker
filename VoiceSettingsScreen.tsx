import React, { useState, useEffect } from "react";
import { AppSettings } from "../../types";
import { Volume2, VolumeX, Sliders, Square, Play, Sparkles, Check, AlertCircle, Info, Radio } from "lucide-react";
import { VoicePlayer } from "../../utils/speech";

interface VoiceSettingsScreenProps {
  settings: AppSettings;
  onUpdateSpeechRate: (rate: number) => void;
  onUpdatePitch: (pitch: number) => void;
  onToggleSpeaker: () => void;
  onToggleFemaleVoice?: () => void;
  onTestVoice: (customText?: string) => void;
  onStopSpeech: () => void;
  onAnnounceTalkBack: (text: string) => void;
}

export const VoiceSettingsScreen: React.FC<VoiceSettingsScreenProps> = ({
  settings,
  onUpdateSpeechRate,
  onUpdatePitch,
  onToggleSpeaker,
  onToggleFemaleVoice,
  onTestVoice,
  onStopSpeech,
  onAnnounceTalkBack,
}) => {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasBengaliVoice, setHasBengaliVoice] = useState<boolean>(false);

  useEffect(() => {
    const loadVoices = () => {
      const voices = VoicePlayer.getVoices();
      setAvailableVoices(voices);
      setHasBengaliVoice(VoicePlayer.hasBengaliVoice());
    };

    loadVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleTestVoiceDefault = () => {
    onTestVoice();
  };

  const handleTestBengaliVoice = () => {
    onTestVoice("নমস্কার, আমি কারিন। এটি ভেলট্রিক এর বাংলা ভয়েস অ্যাসিস্ট্যান্ট পরীক্ষা।");
  };

  const handleTestBrandPronunciation = () => {
    onTestVoice("Hello! I am KARIN AI Assistant, proudly developed by VELTRICK.");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 text-left">
      <div className="pb-3 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-sky-400" />
          Voice & Speech Synthesis Settings
        </h2>
        <p className="text-xs text-slate-400">
          Configure TextToSpeech engine speed, tone pitch, female voice preference, and speaker output
        </p>
      </div>

      {/* Speaker Output Master Switch */}
      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            {settings.speakerEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
            <span>Master Voice Output (Speaker)</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                settings.speakerEnabled
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-rose-950 text-rose-400 border border-rose-800"
              }`}
            >
              {settings.speakerEnabled ? "Active" : "Muted"}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            When enabled, KARIN speaks all assistant responses aloud. When muted, responses are displayed on screen only.
          </p>
        </div>
        <button
          onClick={() => {
            onToggleSpeaker();
            onAnnounceTalkBack(`Voice output speaker ${settings.speakerEnabled ? "muted" : "enabled"}`);
          }}
          aria-pressed={settings.speakerEnabled}
          aria-label="Toggle speaker voice output"
          className={`w-12 h-6 rounded-full transition-colors relative ${
            settings.speakerEnabled ? "bg-emerald-500" : "bg-slate-700"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
              settings.speakerEnabled ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* Female Voice Preference Switch */}
      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Preferred Natural Female Voice</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
              {settings.preferredFemaleVoice !== false ? "Default" : "Custom"}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Prioritizes natural, female-tuned synthesis voices (e.g., Jennifer, Samantha, Victoria) across English and Bengali.
          </p>
        </div>
        {onToggleFemaleVoice && (
          <button
            onClick={() => {
              onToggleFemaleVoice();
              onAnnounceTalkBack(
                `Female voice preference ${
                  settings.preferredFemaleVoice !== false ? "disabled" : "enabled"
                }`
              );
            }}
            aria-pressed={settings.preferredFemaleVoice !== false}
            aria-label="Toggle preferred female voice"
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.preferredFemaleVoice !== false ? "bg-sky-500" : "bg-slate-700"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.preferredFemaleVoice !== false ? "left-6" : "left-1"
              }`}
            />
          </button>
        )}
      </div>

      {/* Sliders Container */}
      <div className="space-y-4 p-5 bg-slate-900/80 rounded-2xl border border-slate-800">
        {/* Speech Rate Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              Speech Rate (Speed)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-xs border border-slate-700">
              {settings.speechRate.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.6"
            step="0.05"
            value={settings.speechRate}
            onChange={(e) => onUpdateSpeechRate(parseFloat(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            aria-label="Adjust speech rate"
          />
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Slower (0.6x)</span>
            <span>Normal (1.0x)</span>
            <span>Faster (1.6x)</span>
          </div>
        </div>

        {/* Pitch Slider */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Voice Pitch (Tone)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-xs border border-slate-700">
              {settings.pitch.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.4"
            step="0.05"
            value={settings.pitch}
            onChange={(e) => onUpdatePitch(parseFloat(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            aria-label="Adjust voice pitch"
          />
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Deeper (0.8x)</span>
            <span>Natural (1.0x)</span>
            <span>Higher (1.4x)</span>
          </div>
        </div>

        {/* Audio Test & Stop Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3">
          <button
            onClick={handleTestVoiceDefault}
            className="flex-1 min-w-[130px] py-2.5 px-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-sky-500/20"
            aria-label="Test English voice: Hello, I am Karin. How can I help you?"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Test Voice</span>
          </button>

          <button
            onClick={handleTestBrandPronunciation}
            className="py-2.5 px-3.5 bg-gradient-to-r from-sky-950 to-indigo-950/80 hover:from-sky-900 text-sky-200 border border-sky-400/40 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-sky-950/40"
            aria-label="Test VELTRICK brand name pronunciation"
            title="Pronounce VELTRICK smoothly as Vel-trick"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>Pronounce VELTRICK</span>
          </button>

          <button
            onClick={handleTestBengaliVoice}
            className="py-2.5 px-3 bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-500/30 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95"
            aria-label="Test Bengali voice: নমস্কার, আমি কারিন।"
          >
            <Play className="w-3.5 h-3.5 fill-sky-300 text-sky-300" />
            <span>বাংলা টেস্ট</span>
          </button>

          <button
            onClick={onStopSpeech}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 border border-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95"
            aria-label="Stop current audio output"
          >
            <Square className="w-3.5 h-3.5 fill-rose-400" />
            <span>Stop Audio</span>
          </button>
        </div>
      </div>

      {/* Voice Diagnostics & Language Availability */}
      <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400" />
          <span>Device Voice & Language Diagnostics</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">System Voices Loaded</span>
            <span className="font-bold text-sky-300 text-sm">{availableVoices.length} voices found</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Bengali (বাংলা) Voice Support</span>
            <span
              className={`font-bold text-sm flex items-center gap-1.5 ${
                hasBengaliVoice ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {hasBengaliVoice ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Native Bengali Voice Detected
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  Fallback Voice Mode
                </>
              )}
            </span>
          </div>
        </div>

        {!hasBengaliVoice && (
          <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 leading-relaxed">
            ℹ️ <strong>Bengali Voice Availability Note:</strong> Your current operating system / browser does not have a native Bengali (`bn-BD` / `bn-IN`) Text-to-Speech voice installed. KARIN automatically uses a fallback voice so text responses can still be spoken, while Bengali responses are rendered on screen.
          </div>
        )}
      </div>

      {/* Android System Integration Notice */}
      <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1.5 leading-relaxed">
        <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          Android Native Engine Note
        </h4>
        <p>
          In the Android native application (`com.veltrick.karinai`), voice output is routed via <code>android.speech.tts.TextToSpeech</code> with automatic language availability verification (`tts.isLanguageAvailable(Locale("bn", "BD"))`).
        </p>
      </div>
    </div>
  );
};
