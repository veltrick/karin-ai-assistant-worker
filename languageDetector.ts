/**
 * Language detector for Bengali, English, Hindi, and transliterated Banglish
 */

export type DetectedLanguage = "bn" | "en" | "hi";

export interface LanguageDetectionResult {
  detectedLanguage: DetectedLanguage;
  confidence: number;
  hasBengaliScript: boolean;
  hasDevanagariScript: boolean;
  hasTransliteratedBangla: boolean;
}

const BANGLA_UNICODE_REGEX = /[\u0980-\u09FF]/;
const DEVANAGARI_UNICODE_REGEX = /[\u0900-\u097F]/;

// Common phonetic transliterated Bengali words (Banglish)
const BANGLISH_KEYWORDS = [
  "kemon", "achen", "acho", "valo", "bhalo", "ki", "korcho", "korchen",
  "somoy", "shomoy", "koto", "baje", "koyta", "ekhon", "ajke", "ajker",
  "tarikh", "dhonnobad", "thik", "ase", "ache", "bolo", "bolun",
  "assalamu", "alaikum", "salam", "khobor", "bujhte", "parchi",
  "shuno", "shunun", "dekhao", "khujo", "gaan", "natok"
];

export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || typeof text !== "string") {
    return {
      detectedLanguage: "en",
      confidence: 1.0,
      hasBengaliScript: false,
      hasDevanagariScript: false,
      hasTransliteratedBangla: false,
    };
  }

  const bnMatches = text.match(/[\u0980-\u09FF]/g) || [];
  const hiMatches = text.match(/[\u0900-\u097F]/g) || [];
  const totalLength = text.trim().length;

  const hasBengaliScript = bnMatches.length > 0;
  const hasDevanagariScript = hiMatches.length > 0;

  if (hasBengaliScript && bnMatches.length >= hiMatches.length) {
    return {
      detectedLanguage: "bn",
      confidence: Math.min(1.0, bnMatches.length / (totalLength * 0.5 || 1)),
      hasBengaliScript: true,
      hasDevanagariScript: false,
      hasTransliteratedBangla: false,
    };
  }

  if (hasDevanagariScript && hiMatches.length > bnMatches.length) {
    return {
      detectedLanguage: "hi",
      confidence: Math.min(1.0, hiMatches.length / (totalLength * 0.5 || 1)),
      hasBengaliScript: false,
      hasDevanagariScript: true,
      hasTransliteratedBangla: false,
    };
  }

  // Check for transliterated Banglish
  const words = text.toLowerCase().split(/\s+/);
  let banglishCount = 0;
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, "");
    if (BANGLISH_KEYWORDS.includes(cleanWord)) {
      banglishCount++;
    }
  }

  const hasTransliteratedBangla = banglishCount > 0 && (banglishCount / words.length >= 0.25 || banglishCount >= 2);

  if (hasTransliteratedBangla) {
    return {
      detectedLanguage: "bn",
      confidence: 0.85,
      hasBengaliScript: false,
      hasDevanagariScript: false,
      hasTransliteratedBangla: true,
    };
  }

  return {
    detectedLanguage: "en",
    confidence: 0.95,
    hasBengaliScript: false,
    hasDevanagariScript: false,
    hasTransliteratedBangla: false,
  };
}
