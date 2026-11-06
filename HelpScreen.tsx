import React, { useState } from "react";
import { HelpCircle, Shield, Award, Info, AlertTriangle, FileText, ChevronDown, ChevronUp } from "lucide-react";

interface HelpScreenProps {
  onAnnounceTalkBack: (text: string) => void;
}

export const HelpScreen: React.FC<HelpScreenProps> = ({ onAnnounceTalkBack }) => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 text-left">
      <div className="pb-3 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-sky-400" />
          Help, Credits & Privacy Information
        </h2>
        <p className="text-xs text-slate-400">
          Official identity and engineering disclosures for KARIN AI Assistant
        </p>
      </div>

      {/* Developer & Founder Credits Card */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-sky-950/20 to-slate-900 rounded-3xl border border-sky-500/30 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/30 text-sky-400">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
              Developer Organization
            </span>
            <h3 className="text-2xl font-black tracking-tight text-white">
              VELTRICK
            </h3>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
          <span className="text-xs text-slate-400 block">Founder & Managing Director</span>
          <span className="text-base font-bold text-sky-300 block">MD Kamruzzaman</span>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            Dedicated to creating privacy-first, accessible, and high-performance intelligent mobile experiences for Bengali and global smartphone users.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Application Name</span>
            <span className="font-semibold text-slate-200">KARIN AI Assistant</span>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Package Name</span>
            <span className="font-mono text-sky-300 text-[11px]">com.veltrick.karinai</span>
          </div>
        </div>
      </div>

      {/* Honest Technical Limitations (Section 5 & 6) */}
      <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Honest Android Architectural Limitations
        </h4>
        <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
          <li>
            <strong>Wake Word Engine:</strong> True always-on wake-word detection at low power requires an acoustic DSP library (such as Picovoice Porcupine or openWakeWord). KARIN provides the modular <code>NoWakeWordEngine</code> seam in Kotlin ready to bind your acoustic model.
          </li>
          <li>
            <strong>Hands-Free Battery Usage:</strong> Continuous microphone polling in an Android foreground service drains battery. A persistent notification is displayed while active, and users can pause listening anytime.
          </li>
          <li>
            <strong>No Secret Calling or SMS:</strong> For user safety, KARIN does not use hidden <code>CALL_PHONE</code> or <code>SEND_SMS</code> intents. It reads back the details and launches the system dialer or messaging composer for explicit confirmation.
          </li>
        </ul>
      </div>

      {/* Interactive Privacy Policy Accordion */}
      <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
        <button
          onClick={() => {
            setShowPrivacyPolicy(!showPrivacyPolicy);
            onAnnounceTalkBack(`Privacy Policy ${!showPrivacyPolicy ? "expanded" : "collapsed"}`);
          }}
          className="w-full flex items-center justify-between text-left font-bold text-sm text-sky-300 hover:text-sky-200 transition"
          aria-expanded={showPrivacyPolicy}
        >
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            VELTRICK Privacy Policy & Zero-Logging Pledge
          </span>
          {showPrivacyPolicy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showPrivacyPolicy && (
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed max-h-64 overflow-y-auto pr-1">
            <p>
              <strong>1. Local-First Processing:</strong> All deterministic commands (Clock, Date, YouTube, WhatsApp, Settings, Camera, Phone Calls) execute locally on your device without transmitting audio or text to any cloud servers.
            </p>
            <p>
              <strong>2. No Audio Retention:</strong> Spoken audio is processed by Android's on-device/system SpeechRecognizer. KARIN never records, saves, or stores audio files on disk.
            </p>
            <p>
              <strong>3. Cloud AI Boundary:</strong> General conversational queries only contact the configured AI endpoint when a local command is not matched. No personal identifiable information is appended.
            </p>
            <p>
              <strong>4. Contact Security:</strong> Contacts queried for voice dialing are accessed offline through Android <code>READ_CONTACTS</code> APIs and are never synchronized or uploaded.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
