/**
 * Dedicated pronunciation overrides and phonetic normalizations.
 * Ensures precise distinction between closely spelled words (such as সরকারি vs সহকারী),
 * prevents letters of VELTRICK from being spelled out individually, and provides
 * smooth, natural cadence across Bengali, English, and Hindi text-to-speech.
 */

export interface PronunciationRule {
  target: RegExp | string;
  replacement: string;
  description: string;
}

export const BENGALI_PRONUNCIATION_OVERRIDES: PronunciationRule[] = [
  {
    // Prevent VELTRICK from being spelled letter-by-letter
    target: /\bVELTRICK\b/gi,
    replacement: "ভেলট্রিক",
    description: "Pronounce VELTRICK as a unified single brand word in Bengali",
  },
  {
    // Founder name spoken smoothly
    target: /\bMD\s+Kamruzzaman\b/gi,
    replacement: "এমডি কামরুজ্জামান",
    description: "Pronounce MD Kamruzzaman in standard Bengali phonetics",
  },
  {
    // সরকারি (Government) pronunciation guidance (shorkari)
    target: /\bসরকারি\b/g,
    replacement: "সরকারী",
    description: "Enforce distinct pronunciation for সরকারি (shorkari - Government)",
  },
  {
    // সহকারী (Assistant) pronunciation guidance: Strictly prevent ever sounding like সরকারি (shorkari)
    target: /\bসহকারী\b/g,
    replacement: "শহকারী",
    description: "Strictly enforce distinct pronunciation for সহকারী (shohokari - Assistant), never sounding like সরকারি (shorkari)",
  },
  {
    // বাংলাদেশ (Bangladesh)
    target: /\bবাংলাদেশ\b/g,
    replacement: "বাংলাদেশ",
    description: "Standard pronunciation for বাংলাদেশ (Bangladesh)",
  },
  {
    // প্রযুক্তি (Technology)
    target: /\bপ্রযুক্তি\b/g,
    replacement: "প্রযুক্তি",
    description: "Standard pronunciation for প্রযুক্তি (Technology)",
  },
  {
    // যোগাযোগ (Communication)
    target: /\bযোগাযোগ\b/g,
    replacement: "যোগাযোগ",
    description: "Standard pronunciation for যোগাযোগ (Communication)",
  },
  {
    // অ্যাপ্লিকেশন (Application)
    target: /\bঅ্যাপ্লিকেশন\b/g,
    replacement: "এ্যাপ্লিকেশন",
    description: "Standard natural pronunciation for অ্যাপ্লিকেশন (Application)",
  },
  {
    // সময় (Time) pronunciation
    target: /\bসময়\b/g,
    replacement: "সময়",
    description: "Standard pronunciation for সময় (shomoy)",
  },
  {
    // এখন (Now) pronunciation
    target: /\bএখন\b/g,
    replacement: "এখন",
    description: "Standard pronunciation for এখন (ekhon)",
  },
  {
    // কৃত্রিম বুদ্ধিমত্তা (Artificial Intelligence)
    target: /\bকৃত্রিম বুদ্ধিমত্তা\b/g,
    replacement: "কৃত্রিম বুদ্ধিমত্তা",
    description: "Standard pronunciation for AI in Bengali (Krittrim Buddhimotta)",
  },
  {
    // Greetings
    target: /\bআসসালামু\s*আলাইকুম\b/g,
    replacement: "আসসালামু আলাইকুম",
    description: "Standard Islamic greeting",
  },
  {
    target: /\bওয়ালাইকুম\s*আসসালাম\b/g,
    replacement: "ওয়ালাইকুম আসসালাম",
    description: "Standard Islamic greeting reply",
  },
];

export const ENGLISH_PRONUNCIATION_OVERRIDES: PronunciationRule[] = [
  {
    // Brand pronunciation alias: "Vel-trick" prevents V-E-L-T-R-I-C-K
    target: /\bVELTRICK\b/g,
    replacement: "Vel-trick",
    description: "Pronounce VELTRICK as Vel-trick instead of individual letters",
  },
  {
    target: /\bVeltrick\b/g,
    replacement: "Vel-trick",
    description: "Pronounce Veltrick as Vel-trick",
  },
  {
    target: /\bMD\s+Kamruzzaman\b/g,
    replacement: "M D Kamruzzaman",
    description: "Smooth English pronunciation of MD Kamruzzaman",
  },
  {
    target: /\bKARIN\b/g,
    replacement: "Karin",
    description: "Pronounce KARIN smoothly as Karin",
  },
];

export const HINDI_PRONUNCIATION_OVERRIDES: PronunciationRule[] = [
  {
    target: /\bVELTRICK\b/gi,
    replacement: "वेलट्रिक",
    description: "Pronounce VELTRICK in Hindi as वेलट्रिक",
  },
  {
    target: /\bMD\s+Kamruzzaman\b/gi,
    replacement: "एमडी कमरज्जमान",
    description: "Pronounce MD Kamruzzaman in Hindi",
  },
  {
    target: /\bKARIN\b/gi,
    replacement: "करिन",
    description: "Pronounce KARIN in Hindi",
  },
];

/**
 * Apply pronunciation rules based on target language
 */
export function applyPronunciationOverrides(
  text: string,
  lang: "bn" | "en" | "hi" | "auto" = "auto"
): string {
  if (!text) return "";

  let result = text;
  const isBn = lang === "bn" || /[\u0980-\u09FF]/.test(text);
  const isHi = lang === "hi" || /[\u0900-\u097F]/.test(text);

  if (isBn) {
    for (const rule of BENGALI_PRONUNCIATION_OVERRIDES) {
      result = result.replace(rule.target, rule.replacement);
    }
  } else if (isHi) {
    for (const rule of HINDI_PRONUNCIATION_OVERRIDES) {
      result = result.replace(rule.target, rule.replacement);
    }
  } else {
    for (const rule of ENGLISH_PRONUNCIATION_OVERRIDES) {
      result = result.replace(rule.target, rule.replacement);
    }
  }

  return result;
}
