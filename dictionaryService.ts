/**
 * Multilingual Dictionary Service.
 * Provides word lookups, phonetic guides, and definitions across
 * Bengali, English, and Hindi.
 */

import dictionaryBn from "./dictionary.bn.json";
import dictionaryEn from "./dictionary.en.json";
import dictionaryHi from "./dictionary.hi.json";
import { checkIslamicGreeting, getProactiveGreeting } from "./normalizeSpeechText";

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  meaning: string;
  spoken?: string;
  response?: string;
  category: string;
}

export class DictionaryService {
  /**
   * Look up a term in the multilingual dictionaries
   */
  public static lookup(term: string): {
    found: boolean;
    entry?: DictionaryEntry;
    language?: "bn" | "en" | "hi";
  } {
    if (!term) return { found: false };
    const clean = term.trim().toLowerCase();

    // Check Bengali terms
    for (const key in (dictionaryBn as any).terms) {
      const item = (dictionaryBn as any).terms[key];
      if (item.word.toLowerCase() === clean || key.toLowerCase() === clean || item.phonetic.toLowerCase() === clean) {
        return { found: true, entry: item, language: "bn" };
      }
    }

    // Check English terms
    for (const key in (dictionaryEn as any).terms) {
      const item = (dictionaryEn as any).terms[key];
      if (item.word.toLowerCase() === clean || key.toLowerCase() === clean) {
        return { found: true, entry: item, language: "en" };
      }
    }

    // Check Hindi terms
    for (const key in (dictionaryHi as any).terms) {
      const item = (dictionaryHi as any).terms[key];
      if (item.word.toLowerCase() === clean || key.toLowerCase() === clean) {
        return { found: true, entry: item, language: "hi" };
      }
    }

    return { found: false };
  }

  /**
   * Check if query is an Islamic or standard greeting
   */
  public static checkGreeting(query: string) {
    return checkIslamicGreeting(query);
  }

  /**
   * Get proactive greeting
   */
  public static getProactiveGreeting(lang: "bn" | "en" = "bn") {
    return getProactiveGreeting(lang);
  }

  /**
   * Distinguish between সরকারি (Government) and সহকারী (Assistant)
   */
  public static clarifySorkariVsShohokari(): {
    bn: string;
    en: string;
  } {
    return {
      bn: "‘সরকারি’ (shorkari) অর্থ রাষ্ট্র বা সরকারের সাথে সম্পর্কিত (যেমন: সরকারি চাকরি)। অপরপক্ষে ‘সহকারী’ (shohokari) অর্থ সাহায্যকারী বা অ্যাসিস্ট্যান্ট (যেমন: এআই সহকারী কারিন)।",
      en: "‘সরকারি’ (shorkari) means Government/official state matters. ‘সহকারী’ (shohokari) means Assistant or associate (like KARIN AI Assistant).",
    };
  }
}
