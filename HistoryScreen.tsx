import React, { useState } from "react";
import { MessageItem } from "../../types";
import { History, Trash2, Download, Search, Volume2, User, Sparkles } from "lucide-react";
import { VoicePlayer } from "../../utils/speech";

interface HistoryScreenProps {
  history: MessageItem[];
  onClearHistory: () => void;
  onAnnounceTalkBack: (text: string) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  onClearHistory,
  onAnnounceTalkBack,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = history.filter(
    (item) =>
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.intent && item.intent.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `karin_assistant_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const playSpeech = (text: string, lang: "en" | "bn") => {
    VoicePlayer.speak(text, lang);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-sky-400" />
            Conversation History
          </h2>
          <p className="text-xs text-slate-400">
            Recorded interactions during current session ({history.length} items)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExport}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                aria-label="Export conversation history as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
              <button
                onClick={onClearHistory}
                className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs rounded-xl border border-rose-500/30 flex items-center gap-1.5 transition"
                aria-label="Clear all conversation history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter conversation by keyword or intent..."
          aria-label="Search conversation history"
          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400"
        />
      </div>

      {/* History List */}
      <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm bg-slate-900/40 rounded-2xl border border-slate-800/60">
            <p>No conversation records found.</p>
            <p className="text-xs text-slate-600 mt-1">
              Say or type a command on the Home screen to see records here.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition ${
                item.sender === "user"
                  ? "bg-slate-900/90 border-slate-800 text-right ml-6"
                  : "bg-sky-950/20 border-sky-500/20 text-left mr-6"
              }`}
            >
              <div
                className={`flex items-center gap-2 mb-1.5 text-xs text-slate-400 ${
                  item.sender === "user" ? "justify-end" : "justify-between"
                }`}
              >
                {item.sender === "karin" && (
                  <span className="flex items-center gap-1.5 font-semibold text-sky-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    KARIN
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.language === "bn" ? "BN" : "EN"}
                  </span>
                  {item.intent && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                      {item.intent}
                    </span>
                  )}
                </div>
                {item.sender === "user" && (
                  <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                    User
                    <User className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <p className="text-slate-200 text-sm leading-relaxed">{item.text}</p>

              {item.sender === "karin" && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-500 text-[11px]">
                    {item.actionExecuted ? `Action: ${item.actionExecuted}` : "Spoken response"}
                  </span>
                  <button
                    onClick={() => playSpeech(item.text, item.language)}
                    className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 flex items-center gap-1 text-[11px] transition"
                    aria-label={`Speak aloud: ${item.text}`}
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Play voice</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
