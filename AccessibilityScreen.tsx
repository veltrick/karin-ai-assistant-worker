import React from "react";
import { AppSettings } from "../../types";
import {
  Eye,
  Volume2,
  Shield,
  Mic,
  Users,
  Bell,
  CheckCircle2,
  Sliders,
  Sparkles,
} from "lucide-react";

interface AccessibilityScreenProps {
  settings: AppSettings;
  onToggleHighContrast: () => void;
  onToggleLargeTargets: () => void;
  onToggleTalkBack: () => void;
  onTogglePermission: (permission: "mic" | "contacts") => void;
  onAnnounceTalkBack: (text: string) => void;
}

export const AccessibilityScreen: React.FC<AccessibilityScreenProps> = ({
  settings,
  onToggleHighContrast,
  onToggleLargeTargets,
  onToggleTalkBack,
  onTogglePermission,
  onAnnounceTalkBack,
}) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 text-left">
      <div className="pb-3 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-sky-400" />
          Accessibility & Permissions Setup
        </h2>
        <p className="text-xs text-slate-400">
          Designed for blind, elderly, and inexperienced smartphone users
        </p>
      </div>

      {/* Accessibility Toggles */}
      <div className="space-y-3">
        {/* High Contrast Mode */}
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <span>High Contrast UI</span>
              {settings.highContrast && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                  Active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Enhance contrast ratios with vibrant borders and clear separation for low-vision users.
            </p>
          </div>
          <button
            onClick={() => {
              onToggleHighContrast();
              onAnnounceTalkBack(
                `High contrast mode ${settings.highContrast ? "disabled" : "enabled"}`
              );
            }}
            aria-pressed={settings.highContrast}
            aria-label="Toggle High Contrast Mode"
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.highContrast ? "bg-sky-500" : "bg-slate-700"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.highContrast ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Large Touch Targets */}
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-white text-sm">
              Large Touch Targets Mode
            </h3>
            <p className="text-xs text-slate-400">
              Expands button click regions to at least 48dp for easier tapping by elderly users.
            </p>
          </div>
          <button
            onClick={() => {
              onToggleLargeTargets();
              onAnnounceTalkBack(
                `Large touch targets ${settings.largeTouchTargets ? "disabled" : "enabled"}`
              );
            }}
            aria-pressed={settings.largeTouchTargets}
            aria-label="Toggle Large Touch Targets Mode"
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.largeTouchTargets ? "bg-sky-500" : "bg-slate-700"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.largeTouchTargets ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Interactive TalkBack Screen Reader Simulator */}
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-sky-400" />
              <span>TalkBack Screen Reader Simulator</span>
              {settings.talkBackSimulator && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Announcing
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Audibly speaks element descriptions and button actions when focused, matching Android TalkBack.
            </p>
          </div>
          <button
            onClick={() => {
              onToggleTalkBack();
              onAnnounceTalkBack(
                `TalkBack Screen Reader simulation ${
                  settings.talkBackSimulator ? "turned off" : "turned on. Elements will now be spoken aloud."
                }`
              );
            }}
            aria-pressed={settings.talkBackSimulator}
            aria-label="Toggle TalkBack Screen Reader Simulator"
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.talkBackSimulator ? "bg-emerald-500" : "bg-slate-700"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.talkBackSimulator ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Android Permissions Audit */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          Android Runtime Permissions
        </h3>

        {/* Microphone Permission */}
        <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-sky-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-200 block">
                RECORD_AUDIO & FOREGROUND_SERVICE_MICROPHONE
              </span>
              <span className="text-slate-400 text-[11px]">
                Required for real voice input & wake word detection
              </span>
            </div>
          </div>
          <button
            onClick={() => onTogglePermission("mic")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
              settings.hasMicPermission
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {settings.hasMicPermission ? "Granted" : "Request"}
          </button>
        </div>

        {/* Contacts Permission */}
        <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-sky-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-200 block">
                READ_CONTACTS
              </span>
              <span className="text-slate-400 text-[11px]">
                Enables resolving recipient names offline for "Call Rahim"
              </span>
            </div>
          </div>
          <button
            onClick={() => onTogglePermission("contacts")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
              settings.hasContactsPermission
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {settings.hasContactsPermission ? "Granted" : "Request"}
          </button>
        </div>

        {/* Notifications Permission */}
        <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-sky-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-200 block">
                POST_NOTIFICATIONS
              </span>
              <span className="text-slate-400 text-[11px]">
                Displays persistent status notification while Hands-Free mode is listening
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            System Configured
          </span>
        </div>
      </div>
    </div>
  );
};
