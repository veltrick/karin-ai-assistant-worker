/**
 * Speech Text Normalizer and Greeting Handler.
 * Integrates Islamic greeting recognition, clean TTS formatting,
 * and audio speech normalization.
 */

import { applyPronunciationOverrides } from "./pronunciationOverrides";

export interface GreetingCheckResult {
  isGreeting: boolean;
  type?: "islamic" | "general" | "time-based";
  responseTextEn: string;
  responseTextBn: string;
}

/**
 * Islamic Greeting Detector:
 * Checks for variations in Bengali script, English transliteration, and Arabic loanwords.
 */
export function checkIslamicGreeting(text: string): GreetingCheckResult {
  if (!text) {
    return {
      isGreeting: false,
      responseTextEn: "",
      responseTextBn: "",
    };
  }

  const clean = text.trim().toLowerCase();

  // Bengali script variations
  const bnIslamicPatterns = [
    /^(আসসালামু\s*আলাইকুম|আসসালামুআলাইকুম|সালামু\s*আলাইকুম|সালাম|আস-সালামু\s*আলাইকুম)[!.,\s]*$/u,
    /^(হেই\s*কারিন\s*,?\s*)?(আসসালামু\s*আলাইকুম|সালাম)[!.,\s]*$/u,
  ];

  for (const pattern of bnIslamicPatterns) {
    if (pattern.test(clean)) {
      return {
        isGreeting: true,
        type: "islamic",
        responseTextBn: "ওয়ালাইকুম আসসালাম। কেমন আছেন? কীভাবে সাহায্য করতে পারি?",
        responseTextEn: "Wa alaikum assalam. How can I help you?",
      };
    }
  }

  // English transliteration variations
  const enIslamicPatterns = [
    /^(hey\s+karin\s*,?\s*)?(assalamu\s+alaikum|as-salamu\s+alaykum|asalam\s+alaikum|assalam\s+o\s+alaikum|assalamu\s+alaikum\s+warahmatullahi|salam|salaam)[!.,\s]*$/i,
  ];

  for (const pattern of enIslamicPatterns) {
    if (pattern.test(clean)) {
      return {
        isGreeting: true,
        type: "islamic",
        responseTextBn: "ওয়ালাইকুম আসসালাম। কেমন আছেন? কীভাবে সাহায্য করতে পারি?",
        responseTextEn: "Wa alaikum assalam. How can I help you?",
      };
    }
  }

  // General "How are you" / "কেমন আছেন"
  if (
    /^(কেমন\s*আছেন|কেমন\s*আছো|কেমন\s*চলছে)[?.,\s]*$/u.test(clean) ||
    /^(hey\s+karin\s*,?\s*)?(how\s+are\s+you|how're\s+you)[?.,\s]*$/i.test(clean)
  ) {
    return {
      isGreeting: true,
      type: "general",
      responseTextBn: "আলহামদুলিল্লাহ, আমি ভালো আছি। আপনি কেমন আছেন? আপনাকে কীভাবে সাহায্য করতে পারি?",
      responseTextEn: "I am doing well, thank you! How can I assist you right now?",
    };
  }

  return {
    isGreeting: false,
    responseTextEn: "",
    responseTextBn: "",
  };
}

/**
 * Returns default proactive greeting
 */
export function getProactiveGreeting(lang: "bn" | "en" = "bn"): string {
  if (lang === "bn") {
    return "আসসালামু আলাইকুম। আমি কারিন। আপনাকে কীভাবে সাহায্য করতে পারি?";
  }
  return "Assalamu Alaikum. I am KARIN. How can I assist you?";
}

/**
 * Normalizes text solely for audio speech generation (TTS).
 * Leaves screen UI text untouched.
 */
export function normalizeForSpeechSynthesis(
  text: string,
  lang: "bn" | "en" | "hi" | "auto" = "auto"
): string {
  if (!text) return "";

  // 1. Remove markdown syntax, links, code blocks, bold markers
  let clean = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#+\s+/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove emojis that may cause TTS engines to read out unicode descriptions
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

  // 2. Apply pronunciation overrides (VELTRICK -> Vel-trick / ভেলট্রিক, etc.)
  clean = applyPronunciationOverrides(clean, lang);

  return clean;
}
