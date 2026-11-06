import {
  ParsedCommand,
  ActionPayload,
  CommandIntentType,
  IntentParameters,
  LanguageCode,
} from "../types";
import {
  buildYouTubeSearchUrl,
  buildYouTubeHomeUrl,
  getWifiSettingsInstructions,
} from "./capabilities";
import {
  toBengaliNumerals,
  getCurrentLocalTime,
  getCurrentLocalDate,
} from "./dateTime";
import {
  checkIslamicGreeting,
  normalizeForSpeechSynthesis,
} from "../language/normalizeSpeechText";
import { DictionaryService } from "../language/dictionaryService";

export { toBengaliNumerals };

// Format current device time in English & Bengali using high-precision dateTime utility
export function getCurrentTimeStrings(date = new Date()): { en: string; bn: string } {
  const result = getCurrentLocalTime(date);
  return { en: result.spokenEn, bn: result.spokenBn };
}

// Format current device date in English & Bengali
export function getCurrentDateStrings(date = new Date()): { en: string; bn: string } {
  const result = getCurrentLocalDate(date);
  return { en: result.spokenEn, bn: result.spokenBn };
}

// Normalizes speech text
export function normalizeSpeech(raw: string): string {
  let t = raw.trim().toLowerCase();
  const bnToEnMap: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };
  t = t.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
  t = t.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'–—]/g, " ");
  return t.replace(/\s+/g, " ").trim();
}

// Strips wake words ("Hey Karin", "হেই কারিন", "কারিন")
export function stripWakeWord(text: string): { stripped: string; hasWakeWord: boolean } {
  const wakeEn = /^(hey\s+karin|karin|ok\s+karin|hi\s+karin)[,\s]*/i;
  const wakeBn = /^(হেই\s+কারিন|হে\s+কারিন|হাই\s+কারিন|কারিন)[,\s]*/u;

  if (wakeEn.test(text)) {
    return { stripped: text.replace(wakeEn, "").trim(), hasWakeWord: true };
  }
  if (wakeBn.test(text)) {
    return { stripped: text.replace(wakeBn, "").trim(), hasWakeWord: true };
  }
  return { stripped: text.trim(), hasWakeWord: false };
}

/**
 * Robust YouTube Query Extractor:
 * Extracts the user's actual search terms without using hardcoded defaults.
 */
export function extractYouTubeQuery(text: string): string {
  let query = text
    // English query cleanup
    .replace(/\b(search\s+for|search|play|watch|find|look\s+up|on\s+youtube|in\s+youtube|youtube|videos?)\b/gi, " ")
    // Bengali query cleanup
    .replace(/(ইউটিউবে|ইউটিউব|সার্চ\s*করো|সার্চ|চালাও|দেখাও|খুঁজছি|খোঁজো|খুঁজে\s*দাও|প্লে\s*করো|-?এর\s*ভিডিও|ভিডিও)/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return query;
}

/**
 * Central, Typed Command Router:
 * Evaluates user input against intent categories with deterministic priorities.
 */
export function parseAssistantCommand(raw: string): ParsedCommand {
  const normalized = normalizeSpeech(raw);
  const { stripped } = stripWakeWord(raw);
  const t = stripped.trim().length > 0 ? stripped.trim() : raw.trim();
  const lower = t.toLowerCase();

  if (!t) {
    return {
      intent: "unknown_command",
      parameters: {},
      payload: {
        type: "UNKNOWN",
        title: "No Command",
        details: "Empty speech or text input received.",
      },
      spokenResponseEn: "I didn't hear anything. Please try again.",
      spokenResponseBn: "আমি কিছু শুনতে পাইনি। অনুগ্রহ করে আবার বলুন।",
    };
  }

  // 1. ISLAMIC GREETINGS & COURTESIES (Deterministic priority before AI model)
  const greetingCheck = checkIslamicGreeting(t);
  if (greetingCheck.isGreeting) {
    return {
      intent: "general_question",
      parameters: { greetingType: greetingCheck.type },
      payload: {
        type: "GREETING",
        title: greetingCheck.type === "islamic" ? "Islamic Greeting" : "Greeting",
        details: greetingCheck.responseTextBn,
      },
      spokenResponseEn: greetingCheck.responseTextEn,
      spokenResponseBn: greetingCheck.responseTextBn,
    };
  }

  // 2. STOP SPEECH / LISTENING (stop_speech)
  if (
    /^(stop|stop listening|shut up|be quiet|pause|exit|quit)$/i.test(t) ||
    /^(বন্ধ করো|থামো|থামুন|শোনা বন্ধ করো|চুপ করো|কথা বন্ধ করো)$/u.test(t)
  ) {
    return {
      intent: "stop_speech",
      parameters: {},
      payload: {
        type: "STOP",
        title: "Speech Stopped",
        details: "Speech playback and voice listening stopped.",
      },
      spokenResponseEn: "Stopped speaking.",
      spokenResponseBn: "কথা বলা বন্ধ করা হয়েছে।",
    };
  }

  // 3. REPEAT RESPONSE (repeat_response)
  if (
    /^(repeat|repeat that|say that again|say again|repeat previous|what did you say)$/i.test(t) ||
    /^(আবার বলো|পুনরায় বলো|কথাটি আবার বলো|কি বললে|আরেকবার বলো)$/u.test(t)
  ) {
    return {
      intent: "repeat_response",
      parameters: {},
      payload: {
        type: "REPEAT",
        title: "Repeat Response",
        details: "Speaking the previous assistant response again.",
      },
      spokenResponseEn: "Repeating the previous response.",
      spokenResponseBn: "পূর্ববর্তী কথাটি আবার বলছি।",
    };
  }

  // 4. IDENTITY & FOUNDER ATTRIBUTION
  if (
    lower.includes("who built you") ||
    lower.includes("who developed you") ||
    lower.includes("who made you") ||
    lower.includes("who are you") ||
    lower.includes("your developer") ||
    lower.includes("veltrick founder") ||
    t.includes("কে তৈরি করেছে") ||
    t.includes("কে বানিয়েছে") ||
    t.includes("কে বানিয়েছে") ||
    t.includes("তোমার নির্মাতা") ||
    t.includes("তোমার পরিচয়") ||
    t.includes("পরিচয় কি") ||
    t.includes("ভেলট্রিক") ||
    t.includes("কামরুজ্জামান")
  ) {
    const en = "I was developed by VELTRICK, founded by MD Kamruzzaman.";
    const bn = "আমি কারিন, VELTRICK দ্বারা নির্মিত একটি এআই সহকারী। এর প্রতিষ্ঠাতা ও ব্যবস্থাপনা পরিচালক হলেন এমডি কামরুজ্জামান (MD Kamruzzaman)।";
    return {
      intent: "general_question",
      parameters: { identity: "veltrick" },
      payload: {
        type: "IDENTITY",
        title: "KARIN AI Identity",
        details: "VELTRICK — Founder & MD: MD Kamruzzaman",
      },
      spokenResponseEn: en,
      spokenResponseBn: bn,
    };
  }

  // 5. DISTINCTION: সরকারি (Government) vs সহকারী (Assistant)
  if (
    t.includes("সরকারি") && t.includes("সহকারী") ||
    t.includes("সরকারি বনাম সহকারী") ||
    t.includes("সরকারি এবং সহকারী") ||
    lower.includes("shorkari vs shohokari")
  ) {
    const distinction = DictionaryService.clarifySorkariVsShohokari();
    return {
      intent: "general_question",
      parameters: { dictionaryClarification: "sorkari_vs_shohokari" },
      payload: {
        type: "DICTIONARY",
        title: "সরকারি বনাম সহকারী (উচ্চারণ ও অর্থ)",
        details: distinction.bn,
      },
      spokenResponseEn: distinction.en,
      spokenResponseBn: distinction.bn,
    };
  }

  // 6. TELL TIME / DATE (tell_time) - Using single captured Date instance
  if (
    /(what time|the time|current time|time is it|tell me time|^time$)/i.test(t) ||
    /(এখন\s+)?(কয়টা|কটা)\s+বাজে|সময় কত|এখন সময় কত/u.test(t)
  ) {
    const timeResult = getCurrentLocalTime();
    return {
      intent: "tell_time",
      parameters: {
        periodBn: timeResult.periodBn,
        hour12: timeResult.displayHours12,
        minutes: timeResult.minutes,
      },
      payload: {
        type: "TIME",
        title: "Current Time",
        details: timeResult.displayBn,
      },
      spokenResponseEn: timeResult.spokenEn,
      spokenResponseBn: timeResult.spokenBn,
    };
  }

  if (
    /(what date|today['']?s? date|what day is today|date today|^date$)/i.test(t) ||
    /(আজকের?|আজকে)\s+তারিখ|আজ কী বার|আজ কি বার|তারিখ কত/u.test(t)
  ) {
    const dateResult = getCurrentLocalDate();
    return {
      intent: "tell_time",
      parameters: {
        dayBn: dateResult.dayOfWeekBn,
        dateNumberBn: dateResult.dayNumberBn,
        monthBn: dateResult.monthBn,
      },
      payload: {
        type: "DATE",
        title: "Calendar Date",
        details: dateResult.displayBn,
      },
      spokenResponseEn: dateResult.spokenEn,
      spokenResponseBn: dateResult.spokenBn,
    };
  }

  // 7A. YOUTUBE POSITIONAL SELECTION (youtube_select)
  // e.g. "Play the first video", "প্রথম ভিডিওটি চালাও", "Play the second video", "২ নম্বর ভিডিওটি চালাও"
  const isFirstVideo =
    /(play\s+(the\s+)?(first|1st)\s+video|play\s+first|play\s+video\s+1|^first\s+video$)/i.test(t) ||
    /(প্রথম|১ম|১\s*নম্বর|এক\s*নম্বর)\s*(ভিডিওটি?|ভিডিও)?\s*(চালাও|প্লে\s*করো)/u.test(t);

  const isSecondVideo =
    /(play\s+(the\s+)?(second|2nd)\s+video|play\s+second|play\s+video\s+2|^second\s+video$)/i.test(t) ||
    /(দ্বিতীয়|দ্বিতীয়|২য়|২\s*নম্বর|দুই\s*নম্বর)\s*(ভিডিওটি?|ভিডিও)?\s*(চালাও|প্লে\s*করো)/u.test(t);

  const isThirdVideo =
    /(play\s+(the\s+)?(third|3rd)\s+video|play\s+third|play\s+video\s+3|^third\s+video$)/i.test(t) ||
    /(তৃতীয়|তৃতীয়|৩য়|৩\s*নম্বর|তিন\s*নম্বর)\s*(ভিডিওটি?|ভিডিও)?\s*(চালাও|প্লে\s*করো)/u.test(t);

  const generalIndexMatch = t.match(/(?:play\s+video\s+|video\s+|ভিডিও\s*)(\d+)/i);

  if (isFirstVideo || isSecondVideo || isThirdVideo || generalIndexMatch) {
    const selectedIdx = isFirstVideo ? 1 : isSecondVideo ? 2 : isThirdVideo ? 3 : parseInt(generalIndexMatch![1], 10);
    const bnNums: Record<number, string> = { 1: "১", 2: "২", 3: "৩", 4: "৪", 5: "৫" };
    const bnNum = bnNums[selectedIdx] || String(selectedIdx);

    return {
      intent: "youtube_select",
      parameters: { selectedIndex: selectedIdx },
      payload: {
        type: "YOUTUBE_PLAY",
        title: `Playing Video ${selectedIdx}`,
        details: `Activating video item #${selectedIdx}`,
        capabilityNotice: "Playing video in accessible player with hands-free continuous listening active.",
      },
      spokenResponseEn: `Playing video number ${selectedIdx}.`,
      spokenResponseBn: `${bnNum} নম্বর ভিডিওটি চালু করছি।`,
    };
  }

  // 7B. YOUTUBE PLAYBACK & NAVIGATION CONTROLS (youtube_control)
  // Pause video
  if (
    /(pause\s+(the\s+)?video|pause\s+playback|ভিডিও\s*থামাও|ভিডিওটি\s*থামাও|প্লেব্যাক\s*থামাও)/i.test(t)
  ) {
    return {
      intent: "youtube_control",
      parameters: { controlAction: "pause" },
      payload: {
        type: "YOUTUBE_CONTROL",
        title: "Pause Video",
        details: "Pausing YouTube video playback.",
      },
      spokenResponseEn: "Video playback paused.",
      spokenResponseBn: "ভিডিও থামানো হয়েছে।",
    };
  }

  // Resume video
  if (
    /(resume\s+(the\s+)?video|resume\s+playback|resume|ভিডিও\s*চালু\s*করো|ভিডিওটি\s*চালু\s*করো|প্লেব্যাক\s*চালু\s*করো)/i.test(t)
  ) {
    return {
      intent: "youtube_control",
      parameters: { controlAction: "resume" },
      payload: {
        type: "YOUTUBE_CONTROL",
        title: "Resume Video",
        details: "Resuming YouTube video playback.",
      },
      spokenResponseEn: "Playback resumed.",
      spokenResponseBn: "ভিডিও পুনরায় চালু করা হয়েছে।",
    };
  }

  // Skip / Next video
  if (
    /(skip\s+(to\s+)?next\s+video|next\s+video|skip\s+video|পরের\s*ভিডিও|পরবর্তী\s*ভিডিও|পরের\s*ভিডিওটি\s*চালাও)/i.test(t)
  ) {
    return {
      intent: "youtube_control",
      parameters: { controlAction: "next" },
      payload: {
        type: "YOUTUBE_CONTROL",
        title: "Next Video",
        details: "Skipping to next video.",
      },
      spokenResponseEn: "Skipping to next video.",
      spokenResponseBn: "পরের ভিডিওতে যাচ্ছি।",
    };
  }

  // Previous video
  if (
    /(previous\s+video|prev\s+video|আগের\s*ভিডিও|আগের\s*ভিডিওটি\s*চালাও)/i.test(t)
  ) {
    return {
      intent: "youtube_control",
      parameters: { controlAction: "prev" },
      payload: {
        type: "YOUTUBE_CONTROL",
        title: "Previous Video",
        details: "Returning to previous video.",
      },
      spokenResponseEn: "Playing previous video.",
      spokenResponseBn: "আগের ভিডিওতে যাচ্ছি।",
    };
  }

  // Volume Up
  if (
    /(increase\s+volume|volume\s+up|raise\s+volume|turn\s+it\s+up|ভলিউম\s*বাড়া[ওন]|ভলিউম\s*বাড়াও|আওয়াজ\s*বাড়া[ওন]|আওয়াজ\s*বাড়াও)/i.test(t)
  ) {
    return {
      intent: "youtube_control",
      parameters: { controlAction: "volume_up" },
      payload: {
        type: "YOUTUBE_CONTROL",
        title: "Volume Up",
        details: "Increasing player volume.",
      },
      spokenResponseEn: "Volume increased.",
      spokenResponseBn: "ভলিউম বাড়ানো হয়েছে।",
    };
  }

  // Volume Down
  if (
    /(decrease\s+volume|volume\s+down|lower\s+volume|turn\s+it\s+down|ভলিউম\s*কমা[ওন]|ভলিউম\s*কমাও|আওয়াজ\s*কমা[ওন]|আওয়াজ\s*কমাও)/i.test(t)
  ) {
    return {
      intent: "youtube_control",
      parameters: { controlAction: "volume_down" },
      payload: {
        type: "YOUTUBE_CONTROL",
        title: "Volume Down",
        details: "Decreasing player volume.",
      },
      spokenResponseEn: "Volume decreased.",
      spokenResponseBn: "ভলিউম কমানো হয়েছে।",
    };
  }

  // Scroll Up
  if (
    /(scroll\s+up|উপরে\s*যাও|উপরে\s*স্ক্রোল\s*করো)/i.test(t)
  ) {
    return {
      intent: "youtube_control",
      parameters: { controlAction: "scroll_up" },
      payload: {
        type: "YOUTUBE_CONTROL",
        title: "Scroll Up",
        details: "Scrolling up in results list.",
      },
      spokenResponseEn: "Scrolled up.",
      spokenResponseBn: "উপরে স্ক্রোল করা হয়েছে।",
    };
  }

  // Scroll Down
  if (
    /(scroll\s+down|নিচে\s*যাও|নিচে\s*স্ক্রোল\s*করো)/i.test(t)
  ) {
    return {
      intent: "youtube_control",
      parameters: { controlAction: "scroll_down" },
      payload: {
        type: "YOUTUBE_CONTROL",
        title: "Scroll Down",
        details: "Scrolling down in results list.",
      },
      spokenResponseEn: "Scrolled down.",
      spokenResponseBn: "নিচে স্ক্রোল করা হয়েছে।",
    };
  }

  // Return to previous results
  if (
    /(return\s+to\s+previous\s+results|back\s+to\s+results|previous\s+results|go\s+back|return\s+to\s+results|আগের\s*ফলাফলে\s*ফিরে\s*যাও|ফলাফলে\s*ফিরে\s*যাও|আগের\s*ফলাফল)/i.test(t)
  ) {
    return {
      intent: "youtube_control",
      parameters: { controlAction: "back" },
      payload: {
        type: "YOUTUBE_CONTROL",
        title: "Return to Results",
        details: "Returning to YouTube search results list.",
      },
      spokenResponseEn: "Returned to search results.",
      spokenResponseBn: "আগের ফলাফল তালিকায় ফিরে এসেছি।",
    };
  }

  // 7C. YOUTUBE SEARCH & OPEN (search_youtube & open_youtube)
  if (/youtube|ইউটিউব/i.test(t)) {
    const isSearch = /(search|play|watch|find|look|সার্চ|চালাও|দেখাও|খুঁজছি|খোঁজো|খুঁজে)/i.test(t);
    const extractedQuery = extractYouTubeQuery(t);

    if (isSearch && extractedQuery) {
      const searchUrl = buildYouTubeSearchUrl(extractedQuery);
      return {
        intent: "search_youtube",
        parameters: { query: extractedQuery },
        payload: {
          type: "YOUTUBE_SEARCH",
          title: "YouTube Video Search",
          details: `Search Query: "${extractedQuery}"`,
          query: extractedQuery,
          externalUrl: searchUrl,
          capabilityNotice:
            "Accessible YouTube player opened with voice navigation and screen-reader controls active.",
        },
        spokenResponseEn: `Searching YouTube for ${extractedQuery}.`,
        spokenResponseBn: `ঠিক আছে, ইউটিউবে ${extractedQuery}-এর ভিডিও খুঁজছি।`,
      };
    } else {
      const homeUrl = buildYouTubeHomeUrl();
      return {
        intent: "open_youtube",
        parameters: {},
        payload: {
          type: "YOUTUBE_OPEN",
          title: "Open YouTube",
          details: "Opening YouTube player homepage",
          externalUrl: homeUrl,
          capabilityNotice: "Launching accessible YouTube interface.",
        },
        spokenResponseEn: "Opening YouTube.",
        spokenResponseBn: "ইউটিউব খুলছি।",
      };
    }
  }

  // 8. CAMERA (open_camera)
  if (/(camera|take a photo|take a picture|webcam|ক্যামেরা|ছবি তোলো|ক্যামেরা খোলো)/i.test(t)) {
    return {
      intent: "open_camera",
      parameters: {},
      payload: {
        type: "CAMERA_OPEN",
        title: "Browser Camera Viewfinder",
        details: "Accessing browser WebRTC video stream.",
        capabilityNotice:
          "Opening browser camera viewfinder. Note: Direct background launching of the phone's native camera app requires native Android integration.",
      },
      spokenResponseEn: "Opening the camera viewfinder.",
      spokenResponseBn: "ক্যামেরা ভিউফাইন্ডার চালু করছি।",
    };
  }

  // 9. WI-FI SETTINGS (open_wifi_settings)
  if (/(wifi|wi fi|ওয়াইফাই|ওয়াইফাই)/i.test(t) && /(settings|open|show|খোলো|সেটিংস)/i.test(t)) {
    const guide = getWifiSettingsInstructions("en");
    return {
      intent: "open_wifi_settings",
      parameters: {},
      payload: {
        type: "WIFI_SETTINGS",
        title: "Wi-Fi Settings Instructions",
        details: guide.explanation,
        capabilityNotice:
          "Web sandbox restrictions prevent directly opening the OS Wi-Fi screen. Manual instructions provided.",
      },
      spokenResponseEn:
        "Browser security prevents opening Wi-Fi settings directly. Please swipe down and hold the Wi-Fi icon on your device.",
      spokenResponseBn:
        "ব্রাউজারের নিরাপত্তা নীতির কারণে সরাসরি ওয়াইফাই সেটিংস খোলা সম্ভব নয়। অনুগ্রহ করে আপনার ফোনের নোটিফিকেশন বার নামিয়ে ওয়াইফাই আইকনে চেপে ধরুন।",
    };
  }

  // 10. FIND CONTACT (find_contact)
  if (
    /(find contact|search contact|look up contact|contacts|কন্টাক্ট খোঁজো|নম্বর খোঁজো)/i.test(t)
  ) {
    const contactMatch = t.match(/(?:for|contact|কন্টাক্ট)\s+([a-zA-Z0-9\u0980-\u09FF\s]+)/i);
    const target = contactMatch ? contactMatch[1].trim() : "";
    return {
      intent: "find_contact",
      parameters: { contactName: target || undefined },
      payload: {
        type: "CONTACT_PICKER",
        title: "Contact Finder",
        details: target ? `Searching contact: ${target}` : "Open Contact Picker",
        recipient: target,
        capabilityNotice:
          "Using browser Contact Picker API where supported, with manual contact entry fallback.",
      },
      spokenResponseEn: target
        ? `Looking up contact details for ${target}.`
        : "Opening contact selector.",
      spokenResponseBn: target
        ? `${target} এর কন্টাক্ট তথ্য খুঁজছি।`
        : "কন্টাক্ট নির্বাচক খুলছি।",
    };
  }

  // 11. MAKE CALL (make_call)
  const callEn = t.match(/^(?:call|make a call to|dial|phone)\s+(.+)$/i);
  const callBn = t.match(/^(.+?)\s*(?:কে|কেই)?\s*(?:কল|ফোন)\s*(?:করো|কর|দাও|দিন|করুন)$/u) ||
                 t.match(/^(?:কল|ফোন)\s+(.+?)(?:কে)?\s*করো$/u);
  if (callEn || callBn) {
    const contact = (callEn ? callEn[1] : callBn![1]).trim();
    const isPhoneNumber = /^[+0-9\s-]{6,}$/.test(contact);
    return {
      intent: "make_call",
      parameters: {
        contactName: isPhoneNumber ? undefined : contact,
        phoneNumber: isPhoneNumber ? contact : undefined,
      },
      payload: {
        type: "CALL_DIALER",
        title: "Phone Call Request",
        details: `Ready to call ${contact}`,
        recipient: contact,
        phoneNumber: isPhoneNumber ? contact : undefined,
        requiresConfirmation: true,
        capabilityNotice:
          "Web apps provide user-initiated tel: links. Direct background calling requires native Android integration.",
      },
      spokenResponseEn: `Ready to call ${contact}. Tap confirm to open your phone dialer.`,
      spokenResponseBn: `${contact} কে কল করতে প্রস্তুত। ডায়ালার খুলতে নিশ্চিত করুন।`,
    };
  }

  // 12. CHANGE LANGUAGE (change_language)
  if (/(change language|switch language|বাংলায় কথা বলো|বাংলা ভাষা|english language)/i.test(t)) {
    const isTargetBn = /(bengali|bangla|বাংলা)/i.test(t);
    const targetLang: LanguageCode = isTargetBn ? "bn" : "en";
    return {
      intent: "change_language",
      parameters: { targetLanguage: targetLang },
      payload: {
        type: "CHANGE_LANGUAGE",
        title: "Language Switched",
        details: `Switching assistant language to ${isTargetBn ? "Bengali (বাংলা)" : "English"}.`,
      },
      spokenResponseEn: isTargetBn
        ? "বাংলা ভাষা নির্বাচন করা হয়েছে। আমি আপনাকে কীভাবে সাহায্য করতে পারি?"
        : "Language switched to English. How can I help you?",
      spokenResponseBn: isTargetBn
        ? "বাংলা ভাষা নির্বাচন করা হয়েছে। আমি আপনাকে কীভাবে সাহায্য করতে পারি?"
        : "Language switched to English.",
    };
  }

  // 13. GENERAL CONVERSATION & QUESTIONS (general_question)
  return {
    intent: "general_question",
    parameters: { query: t },
    payload: {
      type: "AI_RESPONSE",
      title: "KARIN Intelligence",
      details: "Processing conversational inquiry via Gemini AI",
    },
    spokenResponseEn: "Let me check that for you.",
    spokenResponseBn: "আমি আপনার জন্য বিষয়টি দেখছি।",
  };
}
