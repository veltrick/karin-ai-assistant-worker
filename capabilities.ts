/**
 * Platform Capabilities & Action Handlers
 * Distinguishes between browser web capabilities and native Android features.
 */

export interface PlatformCapabilities {
  hasContactPicker: boolean;
  hasCamera: boolean;
  hasTelProtocol: boolean;
  hasNativeWifiSettings: boolean;
}

export function detectPlatformCapabilities(): PlatformCapabilities {
  const hasContactPicker =
    typeof navigator !== "undefined" &&
    "contacts" in navigator &&
    "ContactsManager" in window &&
    typeof (navigator as any).contacts?.select === "function";

  const hasCamera =
    typeof navigator !== "undefined" &&
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const hasTelProtocol = typeof window !== "undefined";

  // Web browsers cannot directly open Android system Wi-Fi settings
  const hasNativeWifiSettings = false;

  return {
    hasContactPicker,
    hasCamera,
    hasTelProtocol,
    hasNativeWifiSettings,
  };
}

/**
 * Builds a secure, correctly encoded YouTube search URL using URLSearchParams.
 */
export function buildYouTubeSearchUrl(query: string): string {
  const safeQuery = query.trim();
  const url = new URL("https://www.youtube.com/results");
  url.searchParams.set("search_query", safeQuery);
  return url.toString();
}

/**
 * YouTube home URL
 */
export function buildYouTubeHomeUrl(): string {
  return "https://www.youtube.com";
}

/**
 * Attempts to trigger the browser Contact Picker API if supported.
 * Returns selected contact or null if canceled / unsupported.
 */
export async function requestBrowserContact(): Promise<{
  name: string;
  tel?: string;
  source: "browser_picker" | "unsupported";
} | null> {
  const caps = detectPlatformCapabilities();
  if (caps.hasContactPicker) {
    try {
      const contacts = await (navigator as any).contacts.select(["name", "tel"], {
        multiple: false,
      });
      if (contacts && contacts.length > 0) {
        const c = contacts[0];
        const name = Array.isArray(c.name) ? c.name[0] : c.name || "Contact";
        const tel = Array.isArray(c.tel) ? c.tel[0] : c.tel || undefined;
        return { name, tel, source: "browser_picker" };
      }
      return null; // user canceled
    } catch (err: any) {
      console.warn("[Karin Contacts] Browser contact picker failed or was dismissed:", err);
      return null;
    }
  }
  return { name: "", source: "unsupported" };
}

/**
 * Generates clear, step-by-step instructions for opening Wi-Fi settings manually.
 */
export function getWifiSettingsInstructions(lang: "en" | "bn" = "en"): {
  title: string;
  explanation: string;
  steps: string[];
} {
  if (lang === "bn") {
    return {
      title: "ওয়াই-ফাই সেটিংস নির্দেশিকা",
      explanation:
        "ওয়েব ব্রাউজার নিরাপত্তা সীমাবদ্ধতার কারণে কোনো ওয়েব অ্যাপ সরাসরি ডিভাইসের সিস্টেম ওয়াই-ফাই সেটিংস খুলতে পারে না। এটি করতে আপনার ডিভাইসের সেটিংস অ্যাপ ব্যবহার করুন।",
      steps: [
        "আপনার ফোনের নোটিফিকেশন বারটি নিচে নামান এবং 'Wi-Fi' আইকনে চেপে ধরে রাখুন।",
        "অথবা আপনার ফোনের 'Settings' অ্যাপে যান > 'Network & internet' বা 'Wi-Fi' সিলেক্ট করুন।",
        "কাঙ্ক্ষিত ওয়াই-ফাই নেটওয়ার্কটি বেছে নিয়ে পাসওয়ার্ড দিয়ে সংযুক্ত হন।",
      ],
    };
  }

  return {
    title: "Wi-Fi Settings Manual Guide",
    explanation:
      "Due to browser sandbox security policies, web applications cannot directly launch the Android operating system Wi-Fi settings menu. Please follow these manual steps:",
    steps: [
      "Swipe down from the top of your screen to open the Quick Settings panel, then tap and hold the Wi-Fi icon.",
      "Alternatively, open your device's 'Settings' app > select 'Network & internet' or 'Connections' > 'Wi-Fi'.",
      "Select your preferred network and enter the security password to connect.",
    ],
  };
}
