import React from "react";
import { ActionPayload } from "../types";
import { Phone, MessageSquare, Send, Mail, AlertTriangle, Check, X, ExternalLink, Volume2 } from "lucide-react";
import { VoicePlayer } from "../utils/speech";

interface ActionModalProps {
  action: ActionPayload | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  action,
  onConfirm,
  onCancel,
}) => {
  if (!action) return null;

  const handleReadBack = () => {
    let text = "";
    if (action.type === "CALL_DIALER") {
      text = `Call confirmation: You requested to call ${action.recipient || "the specified number"}. Press confirm to open your phone dialer.`;
    } else if (action.type === "SMS_DRAFT") {
      text = `SMS confirmation: Message to ${action.recipient || "recipient"}, saying: ${action.body || "No message body specified"}. Confirm to open your messaging app.`;
    } else if (action.type === "WHATSAPP_DRAFT") {
      text = `WhatsApp confirmation: Send message to ${action.recipient || "contact"}. Press confirm to open WhatsApp.`;
    } else if (action.type === "GMAIL_DRAFT") {
      text = `Email confirmation: Prepare email to ${action.recipient || "recipient"}. Press confirm to open Gmail draft.`;
    }
    VoicePlayer.speak(text, "en");
  };

  const getIcon = () => {
    switch (action.type) {
      case "CALL_DIALER":
        return <Phone className="w-8 h-8 text-emerald-400" />;
      case "SMS_DRAFT":
        return <MessageSquare className="w-8 h-8 text-sky-400" />;
      case "WHATSAPP_DRAFT":
        return <Send className="w-8 h-8 text-green-400" />;
      case "GMAIL_DRAFT":
        return <Mail className="w-8 h-8 text-red-400" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-amber-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-sky-500/30 rounded-3xl shadow-2xl shadow-sky-950/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            {getIcon()}
          </div>
          <div>
            <h3 id="action-modal-title" className="text-xl font-bold text-white flex items-center gap-2">
              {action.title}
            </h3>
            <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              User Confirmation Required
            </span>
          </div>
        </div>

        <div className="space-y-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-sm mb-6">
          {action.recipient && (
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Recipient / Target:</span>
              <span className="font-semibold text-sky-300 text-base">{action.recipient}</span>
            </div>
          )}

          {action.body && (
            <div className="pt-1">
              <span className="text-slate-400 text-xs block mb-1">Message Content:</span>
              <p className="p-2.5 bg-slate-900/90 rounded-xl text-slate-200 border border-slate-800 font-mono text-xs">
                "{action.body}"
              </p>
            </div>
          )}

          <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Target Intent: {action.intentAction || "Android System Intent"}</span>
          </div>

          <div className="p-2.5 bg-sky-950/30 border border-sky-500/20 rounded-xl text-xs text-sky-300/90 leading-relaxed">
            🛡️ <strong>Safety Guarantee:</strong> KARIN will never secretly place a call or send a message in the background. Pressing confirm opens the respective app for your final verification.
          </div>
        </div>

        {/* Read-Back Button */}
        <button
          onClick={handleReadBack}
          className="w-full mb-4 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition"
          aria-label="Read back action details aloud"
        >
          <Volume2 className="w-4 h-4" />
          <span>Read aloud details (TalkBack Read-Back)</span>
        </button>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition active:scale-95"
            aria-label="Cancel action"
          >
            <X className="w-4 h-4 text-slate-400" />
            <span>Cancel</span>
          </button>

          <button
            onClick={onConfirm}
            className="py-3 px-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition active:scale-95"
            aria-label="Confirm and execute action"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Open</span>
          </button>
        </div>
      </div>
    </div>
  );
};
