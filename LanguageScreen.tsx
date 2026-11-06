import React from "react";
import { AppSettings, LanguageCode } from "../../types";
import { Globe2, Check, Volume2, ShieldCheck, Cpu } from "lucide-react";
import { VoicePlayer } from "../../utils/speech";

interface LanguageScreenProps {
  settings: AppSettings;
  onUpdateLanguage: (lang: LanguageCode) => void;
  onAnnounceTalkBack: (text: string) => void;
}

export const LanguageScreen: React.FC<LanguageScreenProps> = ({
  settings,
  onUpdateLanguage,
  onAnnounceTalkBack,
}) => {
  const languages: {
    code: LanguageCode;
    title: string;
    nativeName: string;
    desc: string;
    testPhrase: string;
  }[] = [
    {
      code: "auto",
      title: "Auto-Detect Language",
      nativeName: "স্বয়ংক্রিয় শনাক্তকরণ",
      desc: "Automatically switches between English and Bengali based on spoken audio.",
      testPhrase: "Hello, I am KARIN. আমি কারিন, আপনাকে স্বাগতম।",
    },
    {
      code: "en",
      title: "English (US)",
      nativeName: "English (United States)",
      desc: "Optimized for English voice commands, time queries, app navigation, and AI conversations.",
      testPhrase: "Hello! I am KARIN AI Assistant. How can I help you today?",
    },
    {
      code: "bn",
      title: "Bengali (Bangladesh)",
      nativeName: "বাংলা (বাংলাদেশ)",
      desc: "বাংলা ভয়েস কমান্ড, সময়, তারিখ এবং কথোপকথনের জন্য অপ্টিমাইজড।",
      testPhrase: "নমস্কার! আমি কারিন এআই সহকারী। আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    },
  ];

  const handleTestVoice = (phrase: string, lang: LanguageCode) => {
    VoicePlayer.speak(phrase, lang === "bn" ? "bn" : "en");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
      <div className="pb-3 border-b border-slate-800 text-left">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-sky-400" />
          Language Settings
        </h2>
        <p className="text-xs text-slate-400">
          Configure recognition and speech synthesis languages for KARIN AI
        </p>
      </div>

      {/* Language Options */}
      <div className="space-y-3">
        {languages.map((item) => {
          const isSelected = settings.language === item.code;
          return (
            <div
              key={item.code}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? "bg-sky-950/30 border-sky-400 shadow-md shadow-sky-950/50 ring-1 ring-sky-400/50"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => {
                      onUpdateLanguage(item.code);
                      onAnnounceTalkBack(`Selected language: ${item.title}`);
                    }}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? "border-sky-400 bg-sky-500 text-slate-950"
                        : "border-slate-600 bg-slate-800"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">
                      {item.title}{" "}
                      <span className="text-xs font-normal text-sky-400">
                        ({item.nativeName})
                      </span>
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => handleTestVoice(item.testPhrase, item.code)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                  aria-label={`Test pronunciation for ${item.title}`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test Voice</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 pl-8 leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Offline Language Information Box */}
      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-left space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
          <Cpu className="w-4 h-4 text-sky-400" />
          <span>Android Speech Engine Language Availability</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          On Android devices, offline Bengali and English speech recognition depends on Google Speech Services / On-Device Speech Recognition packages installed on the user's device. KARIN automatically queries <code>SpeechRecognizer.isRecognitionAvailable(context)</code> and adapts gracefully.
        </p>
      </div>
    </div>
  );
};
