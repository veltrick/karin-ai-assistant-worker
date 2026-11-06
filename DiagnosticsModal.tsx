import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Mic,
  Camera,
  Volume2,
  Cpu,
  Globe,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  X,
} from "lucide-react";
import { VoicePlayer } from "../utils/speech";

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiagnosticsModal({ isOpen, onClose }: DiagnosticsModalProps) {
  const [micStatus, setMicStatus] = useState<"checking" | "granted" | "denied" | "prompt" | "unsupported">("checking");
  const [camStatus, setCamStatus] = useState<"checking" | "granted" | "denied" | "prompt" | "unsupported">("checking");
  const [speechRecSupported, setSpeechRecSupported] = useState<boolean>(false);
  const [speechSynthSupported, setSpeechSynthSupported] = useState<boolean>(false);
  const [hasBengaliVoice, setHasBengaliVoice] = useState<boolean>(false);
  const [totalVoices, setTotalVoices] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const checkStatus = async () => {
    setIsRefreshing(true);

    // Check Speech Recognition
    if (typeof window !== "undefined") {
      const hasRec = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
      setSpeechRecSupported(hasRec);

      // Check Speech Synthesis & Voices
      const hasSynth = "speechSynthesis" in window;
      setSpeechSynthSupported(hasSynth);
      if (hasSynth) {
        const voices = VoicePlayer.getVoices();
        setTotalVoices(voices.length);
        setHasBengaliVoice(VoicePlayer.hasBengaliVoice());
      }

      // Check Permissions API
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const micPerm = await navigator.permissions.query({ name: "microphone" as PermissionName });
          setMicStatus(micPerm.state as any);
          micPerm.onchange = () => setMicStatus(micPerm.state as any);
        } catch {
          setMicStatus("prompt");
        }

        try {
          const camPerm = await navigator.permissions.query({ name: "camera" as PermissionName });
          setCamStatus(camPerm.state as any);
          camPerm.onchange = () => setCamStatus(camPerm.state as any);
        } catch {
          setCamStatus("prompt");
        }
      } else {
        setMicStatus("prompt");
        setCamStatus("prompt");
      }
    }

    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagnostics-modal-title"
    >
      <div className="bg-[#0b1329] border border-cyan-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-cyan-950/60 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-sky-950/60 to-slate-900 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 id="diagnostics-modal-title" className="text-base font-bold text-white tracking-wide">
                System & Capability Diagnostics
              </h2>
              <p className="text-xs text-cyan-300/70">KARIN AI Device Audit & Permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close diagnostics"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-200">
          {/* Hardware & Browser APIs */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Microphone */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-medium text-slate-300">Microphone</span>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  micStatus === "granted"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : micStatus === "denied"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {micStatus}
              </span>
            </div>

            {/* Camera */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-300">Camera</span>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  camStatus === "granted"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : camStatus === "denied"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {camStatus}
              </span>
            </div>

            {/* Web Speech API */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-slate-300">Speech Rec API</span>
              </div>
              {speechRecSupported ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>

            {/* Text To Speech */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium text-slate-300">TTS Engine</span>
              </div>
              {speechSynthSupported ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
          </div>

          {/* Bengali Voice Detection Card */}
          <div
            className={`p-3.5 rounded-xl border ${
              hasBengaliVoice
                ? "bg-emerald-950/20 border-emerald-500/30"
                : "bg-amber-950/20 border-amber-500/30"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {hasBengaliVoice ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs font-semibold text-white">
                  Bengali Voice Engine:{" "}
                  {hasBengaliVoice ? "Installed & Active" : "Not Detected in OS"}
                </p>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {hasBengaliVoice
                    ? `System has detected native Bengali speech synthesis (${totalVoices} total system voices installed).`
                    : `Your current operating system does not have a native Bengali TTS voice installed. KARIN speaks in natural English female voice fallback while displaying complete Bengali text.`}
                </p>
              </div>
            </div>
          </div>

          {/* Execution Environment & Platform Honesty */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
              <Cpu className="w-4 h-4" />
              <span>Platform & OS Boundary Disclosure</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              KARIN is running as a secure web application. Direct background OS control (such as natively toggling device Wi-Fi, background phone calls, or native lock-screen voice invocation) requires native Android integration via the VELTRICK Kotlin/Compose project.
            </p>
          </div>

          {/* Troubleshooting Permissions */}
          <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/20 space-y-2">
            <p className="text-xs font-semibold text-sky-300">How to Allow or Reset Microphone Access:</p>
            <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-1">
              <li>Click the lock/settings icon on the left side of your browser address bar.</li>
              <li>Toggle <strong className="text-white">Microphone</strong> and <strong className="text-white">Camera</strong> to "Allow".</li>
              <li>Click the Refresh button below or reload the page.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={checkStatus}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span>Re-scan System</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-xs font-bold text-slate-950 transition-all shadow-md shadow-cyan-950"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
