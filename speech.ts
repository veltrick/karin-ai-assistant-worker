import { LanguageCode } from "../types";
import { normalizeForSpeechSynthesis } from "../language/normalizeSpeechText";

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

/**
 * Normalizes text solely for speech output.
 * Preserves original displayed and stored text untouched.
 * Ensures "VELTRICK" is spoken as a complete single brand word ("Vel-trick" or "ভেলট্রিক"),
 * rather than spelled letter-by-letter (V-E-L-T-R-I-C-K).
 */
export function normalizeTextForSpeech(
  text: string,
  lang: "en" | "bn" = "en",
  phoneticAlias?: string
): string {
  if (!text) return "";
  return normalizeForSpeechSynthesis(text, lang);
}

export class SpeechEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLanguage: string = "en-US";
  private continuous: boolean = false;
  private lastProcessedTimestamp: number = 0;
  private lastProcessedTranscript: string = "";

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public setLanguage(lang: LanguageCode) {
    if (lang === "bn") {
      this.currentLanguage = "bn-BD";
    } else if (lang === "en") {
      this.currentLanguage = "en-US";
    } else {
      // Auto-detect mode: Default recognition engine to English with support for bilingual speech
      this.currentLanguage = "en-US";
    }
    if (this.recognition) {
      this.recognition.lang = this.currentLanguage;
    }
  }

  public startListening(callbacks: SpeechRecognitionCallbacks, continuous = false) {
    if (!this.recognition) {
      callbacks.onError?.(
        "Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or text input."
      );
      return;
    }

    try {
      if (this.isListening) {
        this.stopListening();
      }

      this.continuous = continuous;
      this.recognition.continuous = continuous;
      this.recognition.lang = this.currentLanguage;

      this.recognition.onstart = () => {
        this.isListening = true;
        console.log("[Karin Speech] Microphone active. Language mode:", this.currentLanguage);
        callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = (finalTranscript || interimTranscript).trim();
        const isFinal = !!finalTranscript;

        // Prevent duplicate command executions when browser emits repeated final events
        const now = Date.now();
        if (isFinal) {
          if (text === this.lastProcessedTranscript && now - this.lastProcessedTimestamp < 1500) {
            console.log("[Karin Speech] Ignored duplicate final speech recognition event:", text);
            return;
          }
          this.lastProcessedTranscript = text;
          this.lastProcessedTimestamp = now;
        }

        callbacks.onResult?.(text, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        console.warn("[Karin Speech] Recognition event error:", event.error);
        this.isListening = false;

        let userFriendlyError = `Speech recognition error: ${event.error}`;
        if (event.error === "no-speech") {
          userFriendlyError = "No speech detected. Please speak clearly into your microphone.";
        } else if (event.error === "not-allowed") {
          userFriendlyError =
            "Microphone permission was denied. Please allow microphone access in your browser site permissions.";
        } else if (event.error === "audio-capture") {
          userFriendlyError = "No microphone hardware was detected or it is in use by another application.";
        } else if (event.error === "network") {
          userFriendlyError = "Network error occurred during speech recognition. Please check your connection.";
        } else if (event.error === "service-not-allowed") {
          userFriendlyError = "Speech recognition service is blocked by the current browser or environment.";
        }

        callbacks.onError?.(userFriendlyError);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log("[Karin Speech] Recognition session closed.");
        callbacks.onEnd?.();
      };

      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      console.error("[Karin Speech] Failed to start recognition:", e);
      callbacks.onError?.(`Failed to start recognition: ${e.message}`);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore already stopped error
      }
      this.isListening = false;
    }
  }
}

export interface VoiceCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onWarning?: (warning: string) => void;
}

// Global Text-To-Speech Manager
export class VoicePlayer {
  private static synth: SpeechSynthesis | null =
    typeof window !== "undefined" && "speechSynthesis" in window
      ? window.speechSynthesis
      : null;

  // Crucial: Retain active utterance reference to prevent Chrome garbage collection
  private static activeUtterance: SpeechSynthesisUtterance | null = null;
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static voicesInitialized = false;

  static {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      VoicePlayer.initVoices();
    }
  }

  public static isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      "SpeechSynthesisUtterance" in window &&
      !!window.speechSynthesis
    );
  }

  public static initVoices() {
    if (!this.synth) return;
    try {
      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        this.cachedVoices = voices;
        this.voicesInitialized = true;
        console.log(`[Karin TTS] Loaded ${voices.length} system voices.`);
      }

      this.synth.onvoiceschanged = () => {
        if (!this.synth) return;
        const updated = this.synth.getVoices();
        if (updated && updated.length > 0) {
          this.cachedVoices = updated;
          this.voicesInitialized = true;
          console.log(`[Karin TTS] System voices updated: ${updated.length} available.`);
        }
      };
    } catch (err) {
      console.warn("[Karin TTS] Error loading voices:", err);
    }
  }

  public static getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.cachedVoices.length === 0) {
      const v = this.synth.getVoices();
      if (v && v.length > 0) {
        this.cachedVoices = v;
      }
    }
    return this.cachedVoices;
  }

  public static hasBengaliVoice(): boolean {
    const voices = this.getVoices();
    return voices.some(
      (v) =>
        v.lang.toLowerCase().startsWith("bn") ||
        v.lang.toLowerCase().includes("bengali") ||
        v.name.toLowerCase().includes("bangla") ||
        v.name.toLowerCase().includes("bengali")
    );
  }

  /**
   * Finds a suitable natural female voice by default, prioritizing Jennifer or natural/female names.
   */
  public static findBestFemaleVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Look for Jennifer if available
    const jennifer = voices.find((v) => v.name.toLowerCase().includes("jennifer"));
    if (jennifer) return jennifer;

    // 2. Look for natural female English voices
    const femaleEn = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.toLowerCase().includes("natural") ||
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("victoria") ||
          v.name.toLowerCase().includes("karen") ||
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("jenny"))
    );
    if (femaleEn) return femaleEn;

    // 3. Fallback to standard English voice
    return voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
  }

  public static stop() {
    if (!this.synth) return;
    try {
      console.log("[Karin TTS] Stopping/canceling active speech.");
      this.synth.cancel();
      this.activeUtterance = null;
    } catch (e) {
      console.warn("[Karin TTS] Error canceling speech:", e);
    }
  }

  /**
   * Primary speech synthesis function fulfilling all requirements:
   * - Validates support & input
   * - Cancels previous speech
   * - Normalizes VELTRICK brand name safely for speech output
   * - Configures volume=1, pitch, rate, language, and voice matching
   * - Handles Chrome GC & async paused-state quirks
   * - Provides event callbacks and diagnostic logging
   */
  public static speak(
    rawText: string,
    language: "en" | "bn" = "en",
    rate = 1.0,
    pitch = 1.0,
    callbacks?: VoiceCallbacks,
    options?: {
      preferredVoiceUri?: string;
      preferFemaleVoice?: boolean;
      phoneticBrandAlias?: string;
    }
  ) {
    if (!this.isSupported() || !this.synth) {
      const err = "Web Speech API Text-to-Speech is not supported in this browser.";
      console.warn(`[Karin TTS] ${err}`);
      callbacks?.onError?.(err);
      callbacks?.onEnd?.();
      return;
    }

    // Normalizes text specifically for speech output (preserves displayed VELTRICK text)
    const spokenText = normalizeTextForSpeech(
      rawText,
      language,
      options?.phoneticBrandAlias || "Vel-trick"
    );

    if (!spokenText) {
      console.warn("[Karin TTS] Skipped speech: text is empty or whitespace-only.");
      callbacks?.onEnd?.();
      return;
    }

    try {
      // 1. Cancel previous speech to prevent overlapping utterances
      this.stop();

      // 2. Resume if browser paused speech synthesis
      if (this.synth.paused) {
        console.log("[Karin TTS] Resuming paused speech synthesis.");
        this.synth.resume();
      }

      // 3. Create SpeechSynthesisUtterance
      const utterance = new SpeechSynthesisUtterance(spokenText);

      // Volume must be explicitly set to 1
      utterance.volume = 1;
      utterance.rate = Math.max(0.6, Math.min(rate, 1.8));
      utterance.pitch = Math.max(0.8, Math.min(pitch, 1.4));

      // 4. Voice and Language selection
      const voices = this.getVoices();
      const isBnQuery = language === "bn" || /[\u0980-\u09FF]/.test(spokenText);

      if (isBnQuery) {
        utterance.lang = "bn-BD";
        const bnVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith("bn") ||
            v.lang.toLowerCase().includes("bengali") ||
            v.name.toLowerCase().includes("bangla") ||
            v.name.toLowerCase().includes("bengali")
        );

        if (bnVoice) {
          utterance.voice = bnVoice;
          console.log(`[Karin TTS] Matched Bengali voice: "${bnVoice.name}" (${bnVoice.lang})`);
        } else {
          // Graceful fallback when Bengali voice is not installed on OS
          const fallbackVoice =
            (options?.preferFemaleVoice !== false ? this.findBestFemaleVoice() : null) ||
            voices.find((v) => v.lang.startsWith("en") && v.default) ||
            voices.find((v) => v.lang.startsWith("en")) ||
            voices[0] ||
            null;

          if (fallbackVoice) {
            utterance.voice = fallbackVoice;
            console.log(`[Karin TTS] No Bengali voice installed in OS. Using fallback voice: "${fallbackVoice.name}"`);
            callbacks?.onWarning?.(
              "No native Bengali TTS voice is installed on this device. Using browser default voice."
            );
          } else {
            console.log("[Karin TTS] Using browser default voice for Bengali query.");
          }
        }
      } else {
        utterance.lang = "en-US";
        let selectedVoice: SpeechSynthesisVoice | null = null;

        if (options?.preferredVoiceUri) {
          selectedVoice = voices.find((v) => v.voiceURI === options.preferredVoiceUri) || null;
        }

        if (!selectedVoice) {
          // Priority to female voice by default as requested in Phase 5
          selectedVoice = this.findBestFemaleVoice();
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`[Karin TTS] Matched English voice: "${selectedVoice.name}" (${selectedVoice.lang})`);
        }
      }

      // 5. Retain active reference to prevent garbage collection in Chromium
      this.activeUtterance = utterance;

      // 6. Event listeners
      utterance.onstart = () => {
        console.log(`[Karin TTS] Started speaking (${spokenText.length} chars).`);
        callbacks?.onStart?.();
      };

      utterance.onend = () => {
        console.log("[Karin TTS] Finished speaking successfully.");
        VoicePlayer.activeUtterance = null;
        callbacks?.onEnd?.();
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        VoicePlayer.activeUtterance = null;
        console.warn("[Karin TTS] Utterance error event:", event.error);

        if (event.error === "canceled" || event.error === "interrupted") {
          callbacks?.onEnd?.();
          return;
        }

        let friendlyError = `Speech error: ${event.error}`;
        if (event.error === "not-allowed") {
          friendlyError =
            "Audio output was blocked by browser autoplay policy. Please tap 'Test Voice' or click the Speaker button to activate speech.";
        } else if (event.error === "network") {
          friendlyError = "Network error during speech synthesis voice streaming.";
        } else if (event.error === "synthesis-unavailable" || event.error === "synthesis-failed") {
          friendlyError = "The browser Text-To-Speech engine is temporarily unavailable.";
        } else if (event.error === "language-unavailable") {
          friendlyError = "The requested voice language is not installed on this device.";
        }

        callbacks?.onError?.(friendlyError);
        callbacks?.onEnd?.();
      };

      // 7. Small micro-delay (15ms) to ensure native cancellation completes
      setTimeout(() => {
        if (!this.synth) return;
        try {
          if (this.synth.paused) {
            this.synth.resume();
          }
          this.synth.speak(utterance);
          console.log("[Karin TTS] speechSynthesis.speak() dispatched.");
        } catch (dispatchErr: any) {
          console.error("[Karin TTS] Speak dispatch error:", dispatchErr);
          VoicePlayer.activeUtterance = null;
          callbacks?.onError?.(`Failed to dispatch speech: ${dispatchErr.message}`);
          callbacks?.onEnd?.();
        }
      }, 15);
    } catch (e: any) {
      console.error("[Karin TTS] Speak preparation failed:", e);
      this.activeUtterance = null;
      callbacks?.onError?.(`Speech synthesis error: ${e.message}`);
      callbacks?.onEnd?.();
    }
  }

  // Accessibility TalkBack Simulator Speech
  public static announceAccessibility(text: string) {
    if (!this.isSupported() || !this.synth) return;
    try {
      this.stop();
      const spokenText = normalizeTextForSpeech(text, "en");
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = 1.15;
      utterance.pitch = 0.95;
      utterance.volume = 1;
      this.activeUtterance = utterance;

      utterance.onend = () => {
        VoicePlayer.activeUtterance = null;
      };
      utterance.onerror = () => {
        VoicePlayer.activeUtterance = null;
      };

      setTimeout(() => {
        if (this.synth) {
          if (this.synth.paused) this.synth.resume();
          this.synth.speak(utterance);
        }
      }, 10);
    } catch (e) {
      console.warn("[Karin TTS] TalkBack announcement failed:", e);
    }
  }
}
