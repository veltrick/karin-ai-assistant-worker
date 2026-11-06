import React, { useState } from "react";
import { AppSettings } from "../../types";
import { Cpu, ShieldCheck, Sparkles, Server, CheckCircle2, RefreshCw } from "lucide-react";

interface AiSettingsScreenProps {
  settings: AppSettings;
  onUpdateAiEndpoint: (endpoint: string) => void;
  onAnnounceTalkBack: (text: string) => void;
}

export const AiSettingsScreen: React.FC<AiSettingsScreenProps> = ({
  settings,
  onUpdateAiEndpoint,
  onAnnounceTalkBack,
}) => {
  const [endpointInput, setEndpointInput] = useState(settings.aiEndpointUrl);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAiEndpoint(endpointInput);
    setIsSaved(true);
    onAnnounceTalkBack("AI service endpoint updated successfully");
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 text-left">
      <div className="pb-3 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-400" />
          AI Brain & Language Model Layer
        </h2>
        <p className="text-xs text-slate-400">
          Configurable intelligence service with secure server-side model routing
        </p>
      </div>

      {/* Model Status Card */}
      <div className="p-4 bg-slate-900/90 rounded-2xl border border-sky-500/30 space-y-3 shadow-lg shadow-sky-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white text-sm">
              Active Model: Gemini 3.8 Flash
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
            Server-Side Connected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Architecture</span>
            <span className="font-semibold text-slate-200">Backend Proxy</span>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Language Support</span>
            <span className="font-semibold text-sky-300">বাংলা + English</span>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-slate-400 block text-[10px]">Telemetry</span>
            <span className="font-mono text-emerald-400 text-[11px]">User-Agent: aistudio-build</span>
          </div>
        </div>
      </div>

      {/* Endpoint Configuration Form */}
      <form onSubmit={handleSave} className="p-5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-400" />
            Custom Android AI Backend Endpoint (Optional)
          </label>
          <p className="text-xs text-slate-400 mb-2 leading-relaxed">
            In native Android Studio builds, this endpoint corresponds to <code>karin.aiEndpoint</code> in <code>local.properties</code>. If left as default, KARIN routes queries to the built-in server proxy.
          </p>
          <input
            type="text"
            value={endpointInput}
            onChange={(e) => setEndpointInput(e.target.value)}
            placeholder="https://your-custom-ai-service.com/api/chat"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-sky-400"
            aria-label="Custom AI backend endpoint"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="submit"
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition active:scale-95 shadow-md shadow-sky-500/20"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            <span>{isSaved ? "Saved!" : "Update AI Endpoint"}</span>
          </button>
          {isSaved && (
            <span className="text-xs text-emerald-400 font-medium animate-fade-in">
              Endpoint saved successfully!
            </span>
          )}
        </div>
      </form>

      {/* Security Architecture Principle */}
      <div className="p-4 bg-sky-950/20 rounded-2xl border border-sky-500/20 text-xs text-sky-200 space-y-2 leading-relaxed">
        <div className="flex items-center gap-2 font-semibold text-sky-300">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>VELTRICK Zero-Secret Embedded Architecture</span>
        </div>
        <p>
          As mandated by senior Android security standards, <strong>no API secrets or production tokens are hardcoded into the APK or compiled client source</strong>. The Android client communicates via authenticated HTTPS requests or standard local intent routing.
        </p>
      </div>
    </div>
  );
};
