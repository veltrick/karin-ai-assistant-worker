/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";

const CLOUDFLARE_WORKER_URL =
  import.meta.env.VITE_CLOUDFLARE_WORKER_URL ||
  "https://karin-ai-backend.c80541622.workers.dev/";
import {
  Home,
  History,
  Globe2,
  Volume2,
  VolumeX,
  Cpu,
  Eye,
  HelpCircle,
  Layers,
  Sparkles,
  Download,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import {
  ScreenType,
  AssistantState,
  LanguageCode,
  MessageItem,
  ActionPayload,
  AppSettings,
} from "./types";
import { HomeScreen } from "./components/screens/HomeScreen";
import { HistoryScreen } from "./components/screens/HistoryScreen";
import { LanguageScreen } from "./components/screens/LanguageScreen";
import { VoiceSettingsScreen } from "./components/screens/VoiceSettingsScreen";
import { AiSettingsScreen } from "./components/screens/AiSettingsScreen";
import { AccessibilityScreen } from "./components/screens/AccessibilityScreen";
import { HelpScreen } from "./components/screens/HelpScreen";
import { AndroidStudioHub } from "./components/screens/AndroidStudioHub";
import { ActionModal } from "./components/ActionModal";
import { CameraModal } from "./components/CameraModal";
import { ContactPickerModal } from "./components/ContactPickerModal";
import { DiagnosticsModal } from "./components/DiagnosticsModal";
import { YouTubeOverlayPlayer } from "./components/YouTubeOverlayPlayer";
import {
  YouTubeVideoItem,
  searchYouTubeVideos,
  formatSpokenSearchResults,
} from "./utils/youtubeController";
import { SpeechEngine, VoicePlayer } from "./utils/speech";
import {
  parseAssistantCommand,
  stripWakeWord,
  extractYouTubeQuery,
  toBengaliNumerals,
} from "./utils/commandEngine";
import {
  buildYouTubeSearchUrl,
  buildYouTubeHomeUrl,
  getWifiSettingsInstructions,
  detectPlatformCapabilities,
} from "./utils/capabilities";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("home");
  const [assistantState, setAssistantState] = useState<AssistantState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [responseLanguage, setResponseLanguage] = useState<"en" | "bn">("bn");
  const [lastAction, setLastAction] = useState<ActionPayload | null>(null);
  const [actionConfirmation, setActionConfirmation] = useState<ActionPayload | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [voiceWarning, setVoiceWarning] = useState<string | null>(null);

  // Modals for real device/browser capabilities
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState<boolean>(false);
  const [contactPickerInitialName, setContactPickerInitialName] = useState<string>("");

  // Accessible YouTube Voice Player state
  const [isYouTubePlayerOpen, setIsYouTubePlayerOpen] = useState<boolean>(false);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideoItem[]>(() => searchYouTubeVideos("mrbeast"));
  const [currentYouTubeVideo, setCurrentYouTubeVideo] = useState<YouTubeVideoItem | null>(null);
  const [isYouTubePlaying, setIsYouTubePlaying] = useState<boolean>(false);
  const [youtubeVolume, setYoutubeVolume] = useState<number>(80);
  const [activeYouTubeQuery, setActiveYouTubeQuery] = useState<string>("MrBeast");

  const [previousResponse, setPreviousResponse] = useState<{ text: string; lang: "en" | "bn" }>({
    text: "আসসালামু আলাইকুম। আমি কারিন, VELTRICK এর এআই সহকারী। কীভাবে সাহায্য করতে পারি?",
    lang: "bn",
  });

  // History initialized and synchronized with localStorage
  const [history, setHistory] = useState<MessageItem[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("karin_chat_history");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      // ignore JSON parse or storage errors
    }
    return [
      {
        id: "init-1",
        sender: "karin",
        text: "আসসালামু আলাইকুম। আমি কারিন, VELTRICK এর ভয়েস এআই সহকারী (প্রতিষ্ঠাতা: MD Kamruzzaman)। কীভাবে সাহায্য করতে পারি?",
        timestamp: "Just now",
        language: "bn",
      },
    ];
  });

  // Persist history to localStorage whenever updated
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("karin_chat_history", JSON.stringify(history.slice(0, 50)));
      }
    } catch (e) {
      console.warn("Could not save history to localStorage:", e);
    }
  }, [history]);

  const [settings, setSettings] = useState<AppSettings>(() => {
    let savedSpeaker = true;
    let savedLang: LanguageCode = "auto";
    let savedFemaleVoice = true;
    try {
      if (typeof window !== "undefined") {
        const storedSpeaker = localStorage.getItem("karin_speaker_enabled");
        if (storedSpeaker !== null) {
          savedSpeaker = storedSpeaker === "true";
        }
        const storedLang = localStorage.getItem("karin_preferred_language") as LanguageCode | null;
        if (storedLang && ["auto", "en", "bn"].includes(storedLang)) {
          savedLang = storedLang;
        }
        const storedFemale = localStorage.getItem("karin_female_voice");
        if (storedFemale !== null) {
          savedFemaleVoice = storedFemale === "true";
        }
      }
    } catch (e) {
      // ignore storage access errors
    }
    return {
      language: savedLang,
      speechRate: 1.0,
      pitch: 1.0,
      handsFreeEnabled: false,
      highContrast: false,
      largeTouchTargets: false,
      talkBackSimulator: false,
      aiEndpointUrl: CLOUDFLARE_WORKER_URL,
      temperature: 0.7,
      hasMicPermission: true,
      hasContactsPermission: true,
      speakerEnabled: savedSpeaker,
      preferredFemaleVoice: savedFemaleVoice,
      phoneticBrandAlias: "Vel-trick",
    };
  });

  const speechEngineRef = useRef<SpeechEngine | null>(null);

  useEffect(() => {
    speechEngineRef.current = new SpeechEngine();
    speechEngineRef.current.setLanguage(settings.language);

    // Initialize TTS voices early
    VoicePlayer.initVoices();

    // Initial greeting announcement if talkBack is on
    if (settings.talkBackSimulator) {
      VoicePlayer.announceAccessibility("KARIN AI Assistant loaded. Home screen active.");
    }
  }, []);

  // Update speech engine language when settings change
  useEffect(() => {
    if (speechEngineRef.current) {
      speechEngineRef.current.setLanguage(settings.language);
    }
  }, [settings.language]);

  // Handle TalkBack audible announcements
  const handleAnnounceTalkBack = (text: string) => {
    if (settings.talkBackSimulator) {
      VoicePlayer.announceAccessibility(text);
    }
  };

  // Switch screens
  const handleNavClick = (screen: ScreenType, label: string) => {
    setCurrentScreen(screen);
    handleAnnounceTalkBack(`Switched to ${label} screen`);
  };

  // Speaker Master Toggle with localStorage persistence
  const handleToggleSpeaker = () => {
    const next = !settings.speakerEnabled;
    if (!next) {
      VoicePlayer.stop();
      setAssistantState((prev) => (prev === "speaking" ? "idle" : prev));
    }
    setSettings((prev) => ({ ...prev, speakerEnabled: next }));
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("karin_speaker_enabled", String(next));
      }
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
    handleAnnounceTalkBack(`Voice speaker output ${next ? "enabled" : "muted"}`);
  };

  // Add message to history
  const addHistoryItem = (
    sender: "user" | "karin",
    text: string,
    language: "en" | "bn",
    intent?: string,
    actionExecuted?: string
  ) => {
    const newItem: MessageItem = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      language,
      intent,
      actionExecuted,
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  /**
   * Reusable speakResponse(text, lang) function:
   * - Validates non-empty text
   * - Checks speakerEnabled setting
   * - Sets utterance properties (volume=1, pitch, rate)
   * - Selects matching voice with graceful fallback
   * - Handles onstart, onend, and onerror with visual feedback
   */
  const speakResponse = (text: string, lang: "en" | "bn") => {
    if (!text || !text.trim()) {
      console.warn("[Karin TTS] Empty text provided to speakResponse.");
      return;
    }

    if (!settings.speakerEnabled) {
      console.log("[Karin TTS] Speaker is disabled in settings. Skipping audible speech.");
      setAssistantState("idle");
      return;
    }

    setSpeechError(null);
    setVoiceWarning(null);
    setAssistantState("speaking");

    VoicePlayer.speak(text, lang, settings.speechRate, settings.pitch, {
      onStart: () => {
        setAssistantState("speaking");
        setSpeechError(null);
      },
      onEnd: () => {
        setAssistantState((prev) => (prev === "speaking" ? "idle" : prev));
      },
      onError: (err) => {
        console.warn("[Karin TTS] Speech error:", err);
        setSpeechError(err);
        setAssistantState((prev) => (prev === "speaking" ? "idle" : prev));
      },
      onWarning: (warn) => {
        console.info("[Karin TTS] Voice warning:", warn);
        setVoiceWarning(warn);
      },
    });
  };

  // Test Voice Function: Speaks Islamic greeting and assistant identity
  const handleTestVoice = (customText?: string) => {
    const defaultText =
      settings.language === "bn"
        ? "আসসালামু আলাইকুম। আমি কারিন, VELTRICK এর এআই সহকারী। কীভাবে সাহায্য করতে পারি?"
        : "Assalamu Alaikum. I am KARIN, AI Assistant developed by VELTRICK. How may I assist you?";
    const text = customText || defaultText;
    const lang: "en" | "bn" = settings.language === "bn" ? "bn" : "en";

    // Auto-enable speaker if muted when user taps test voice
    if (!settings.speakerEnabled) {
      setSettings((prev) => ({ ...prev, speakerEnabled: true }));
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("karin_speaker_enabled", "true");
        }
      } catch (e) { }
    }

    speakResponse(text, lang);
    handleAnnounceTalkBack("Playing voice test");
  };

  // Immediate Stop Control: stops speech synthesis and speech recognition
  const handleStopClick = () => {
    VoicePlayer.stop();
    speechEngineRef.current?.stopListening();
    setAssistantState("idle");
    setSpeechError(null);
    handleAnnounceTalkBack("Stopped speaking and listening.");
  };

  // Process a command (either from voice recognition or text input)
  const processCommand = async (rawText: string) => {
    if (!rawText.trim()) return;

    setTranscript(rawText);
    setAssistantState("processing");

    // Detect language of user query
    const isBengali = /[\u0980-\u09FF]/.test(rawText) || settings.language === "bn";
    const detectedLang: "en" | "bn" = isBengali ? "bn" : "en";

    addHistoryItem("user", rawText, detectedLang);

    // Check typed command router
    const parsed = parseAssistantCommand(rawText);

    // 1. STOP SPEECH / LISTENING (stop_speech)
    if (parsed.intent === "stop_speech" || parsed.payload.type === "STOP") {
      VoicePlayer.stop();
      if (speechEngineRef.current) {
        speechEngineRef.current.stopListening();
      }
      setAssistantState("idle");
      const reply = detectedLang === "bn" ? parsed.spokenResponseBn : parsed.spokenResponseEn;
      setResponse(reply);
      setResponseLanguage(detectedLang);
      addHistoryItem("karin", reply, detectedLang, "stop_speech");
      return;
    }

    // 2. REPEAT PREVIOUS RESPONSE (repeat_response)
    if (parsed.intent === "repeat_response" || parsed.payload.type === "REPEAT") {
      const reply = previousResponse.text;
      const lang = previousResponse.lang;
      setResponse(reply);
      setResponseLanguage(lang);
      addHistoryItem("karin", reply, lang, "repeat_response");
      speakResponse(reply, lang);
      return;
    }

    // 3. YOUTUBE SEARCH (search_youtube)
    if (parsed.intent === "search_youtube" || parsed.payload.type === "YOUTUBE_SEARCH") {
      const query = parsed.parameters?.query || extractYouTubeQuery(rawText) || "MrBeast";
      const results = searchYouTubeVideos(query);
      setYoutubeVideos(results);
      setActiveYouTubeQuery(query);
      setIsYouTubePlayerOpen(true);
      setCurrentYouTubeVideo(null);
      setIsYouTubePlaying(false);

      const searchUrl = buildYouTubeSearchUrl(query);
      const confirmReply = detectedLang === "bn" ? `ঠিক আছে, ইউটিউবে ${query}-এর ভিডিও খুঁজছি।` : `Searching YouTube for ${query}.`;
      const spokenResults = formatSpokenSearchResults(results, detectedLang);
      const fullSpoken = `${confirmReply} ${spokenResults}`;

      setResponse(fullSpoken);
      setResponseLanguage(detectedLang);
      const searchAction: ActionPayload = {
        ...parsed.payload,
        query,
        externalUrl: searchUrl,
        details: `YouTube Search: "${query}" (${results.length} results available)`,
      };
      setLastAction(searchAction);
      setPreviousResponse({ text: fullSpoken, lang: detectedLang });
      addHistoryItem("karin", fullSpoken, detectedLang, "search_youtube", query);
      speakResponse(fullSpoken, detectedLang);
      return;
    }

    // 3B. YOUTUBE POSITIONAL VIDEO SELECTION (youtube_select)
    if (parsed.intent === "youtube_select" || parsed.payload.type === "YOUTUBE_PLAY") {
      const idx = parsed.parameters?.selectedIndex || 1;
      let list = youtubeVideos;
      if (!list || list.length === 0) {
        list = searchYouTubeVideos(activeYouTubeQuery || "mrbeast");
        setYoutubeVideos(list);
      }
      const targetVideo = list[idx - 1] || list[0];
      if (targetVideo) {
        setCurrentYouTubeVideo(targetVideo);
        setIsYouTubePlaying(true);
        setIsYouTubePlayerOpen(true);
        const bnNum = toBengaliNumerals(idx);
        const title = detectedLang === "bn" ? targetVideo.titleBn || targetVideo.title : targetVideo.title;
        const reply = detectedLang === "bn"
          ? `${bnNum} নম্বর ভিডিওটি চালু করছি: ${title}`
          : `Playing video number ${idx}: ${title}`;
        setResponse(reply);
        setResponseLanguage(detectedLang);
        setPreviousResponse({ text: reply, lang: detectedLang });
        addHistoryItem("karin", reply, detectedLang, "youtube_select", targetVideo.title);
        speakResponse(reply, detectedLang);
      }
      return;
    }

    // 3C. YOUTUBE PLAYBACK & NAVIGATION CONTROL (youtube_control)
    if (parsed.intent === "youtube_control" || parsed.payload.type === "YOUTUBE_CONTROL") {
      const act = parsed.parameters?.controlAction;
      setIsYouTubePlayerOpen(true);
      if (act === "pause") {
        setIsYouTubePlaying(false);
        const reply = detectedLang === "bn" ? "ভিডিও থামানো হয়েছে।" : "Video paused.";
        setResponse(reply);
        speakResponse(reply, detectedLang);
      } else if (act === "resume") {
        setIsYouTubePlaying(true);
        const reply = detectedLang === "bn" ? "ভিডিও পুনরায় চালু করা হয়েছে।" : "Playback resumed.";
        setResponse(reply);
        speakResponse(reply, detectedLang);
      } else if (act === "next") {
        if (youtubeVideos.length > 0) {
          const currIdx = youtubeVideos.findIndex((v) => v.id === currentYouTubeVideo?.id);
          const nextIdx = (currIdx + 1) % youtubeVideos.length;
          const nextVid = youtubeVideos[nextIdx];
          setCurrentYouTubeVideo(nextVid);
          setIsYouTubePlaying(true);
          const reply = detectedLang === "bn"
            ? `পরের ভিডিওটি চালু করছি: ${nextVid.titleBn || nextVid.title}`
            : `Skipping to next video: ${nextVid.title}`;
          setResponse(reply);
          speakResponse(reply, detectedLang);
        }
      } else if (act === "prev") {
        if (youtubeVideos.length > 0) {
          const currIdx = youtubeVideos.findIndex((v) => v.id === currentYouTubeVideo?.id);
          const prevIdx = (currIdx - 1 + youtubeVideos.length) % youtubeVideos.length;
          const prevVid = youtubeVideos[prevIdx];
          setCurrentYouTubeVideo(prevVid);
          setIsYouTubePlaying(true);
          const reply = detectedLang === "bn"
            ? `পূর্ববর্তী ভিডিওটি চালু করছি: ${prevVid.titleBn || prevVid.title}`
            : `Playing previous video: ${prevVid.title}`;
          setResponse(reply);
          speakResponse(reply, detectedLang);
        }
      } else if (act === "volume_up") {
        const nextVol = Math.min(100, youtubeVolume + 20);
        setYoutubeVolume(nextVol);
        const reply = detectedLang === "bn"
          ? `ভলিউম বাড়ানো হয়েছে, বর্তমান ভলিউম ${toBengaliNumerals(nextVol)} শতাংশ।`
          : `Volume increased to ${nextVol} percent.`;
        setResponse(reply);
        speakResponse(reply, detectedLang);
      } else if (act === "volume_down") {
        const nextVol = Math.max(0, youtubeVolume - 20);
        setYoutubeVolume(nextVol);
        const reply = detectedLang === "bn"
          ? `ভলিউম কমানো হয়েছে, বর্তমান ভলিউম ${toBengaliNumerals(nextVol)} শতাংশ।`
          : `Volume decreased to ${nextVol} percent.`;
        setResponse(reply);
        speakResponse(reply, detectedLang);
      } else if (act === "scroll_up") {
        const reply = detectedLang === "bn" ? "উপরে স্ক্রোল করা হয়েছে।" : "Scrolled up in results.";
        setResponse(reply);
        speakResponse(reply, detectedLang);
      } else if (act === "scroll_down") {
        const reply = detectedLang === "bn" ? "নিচে স্ক্রোল করা হয়েছে।" : "Scrolled down in results.";
        setResponse(reply);
        speakResponse(reply, detectedLang);
      } else if (act === "back") {
        setCurrentYouTubeVideo(null);
        const reply = detectedLang === "bn" ? "আগের ফলাফল তালিকায় ফিরে এসেছি।" : "Returned to search results.";
        setResponse(reply);
        speakResponse(reply, detectedLang);
      }
      return;
    }

    // 4. OPEN YOUTUBE HOMEPAGE (open_youtube)
    if (parsed.intent === "open_youtube" || parsed.payload.type === "YOUTUBE_OPEN") {
      setIsYouTubePlayerOpen(true);
      setCurrentYouTubeVideo(null);
      const homeUrl = buildYouTubeHomeUrl();
      const reply = detectedLang === "bn" ? "ইউটিউব খুলছি। আপনি যেকোনো ভিডিও সার্চ করতে বা শুনতে পারেন।" : "Opening YouTube interface.";
      setResponse(reply);
      setResponseLanguage(detectedLang);
      const ytAction: ActionPayload = {
        ...parsed.payload,
        externalUrl: homeUrl,
      };
      setLastAction(ytAction);
      setPreviousResponse({ text: reply, lang: detectedLang });
      addHistoryItem("karin", reply, detectedLang, "open_youtube");
      speakResponse(reply, detectedLang);
      return;
    }

    // 5. CAMERA VIEWFINDER (open_camera)
    if (parsed.intent === "open_camera" || parsed.payload.type === "CAMERA_OPEN") {
      setIsCameraModalOpen(true);
      const reply = detectedLang === "bn" ? parsed.spokenResponseBn : parsed.spokenResponseEn;
      setResponse(reply);
      setResponseLanguage(detectedLang);
      setLastAction(parsed.payload);
      setPreviousResponse({ text: reply, lang: detectedLang });
      addHistoryItem("karin", reply, detectedLang, "open_camera");
      speakResponse(reply, detectedLang);
      return;
    }

    // 6. WI-FI SETTINGS (open_wifi_settings)
    if (parsed.intent === "open_wifi_settings" || parsed.payload.type === "WIFI_SETTINGS") {
      const guide = getWifiSettingsInstructions(detectedLang);
      const reply = detectedLang === "bn" ? parsed.spokenResponseBn : parsed.spokenResponseEn;
      setResponse(reply);
      setResponseLanguage(detectedLang);
      setLastAction({
        ...parsed.payload,
        details: guide.steps.join(" • "),
      });
      setPreviousResponse({ text: reply, lang: detectedLang });
      addHistoryItem("karin", reply, detectedLang, "open_wifi_settings");
      speakResponse(reply, detectedLang);
      return;
    }

    // 7. FIND CONTACT (find_contact)
    if (parsed.intent === "find_contact" || parsed.payload.type === "CONTACT_PICKER") {
      setContactPickerInitialName(parsed.parameters?.contactName || "");
      setIsContactModalOpen(true);
      const reply = detectedLang === "bn" ? parsed.spokenResponseBn : parsed.spokenResponseEn;
      setResponse(reply);
      setResponseLanguage(detectedLang);
      setLastAction(parsed.payload);
      setPreviousResponse({ text: reply, lang: detectedLang });
      addHistoryItem("karin", reply, detectedLang, "find_contact", parsed.parameters?.contactName);
      speakResponse(reply, detectedLang);
      return;
    }

    // 8. MAKE CALL WITH CONFIRMATION (make_call)
    if (parsed.intent === "make_call" || parsed.payload.requiresConfirmation) {
      setActionConfirmation(parsed.payload);
      setAssistantState("idle");
      const confirmReply = detectedLang === "bn" ? parsed.spokenResponseBn : parsed.spokenResponseEn;
      setResponse(confirmReply);
      setResponseLanguage(detectedLang);
      setLastAction(parsed.payload);
      setPreviousResponse({ text: confirmReply, lang: detectedLang });
      addHistoryItem("karin", confirmReply, detectedLang, "make_call", parsed.payload.recipient);
      speakResponse(confirmReply, detectedLang);
      return;
    }

    // 9. SWITCH LANGUAGE (change_language)
    if (parsed.intent === "change_language") {
      const targetLang: LanguageCode =
        parsed.parameters?.targetLanguage || (detectedLang === "bn" ? "bn" : "en");
      setSettings((prev) => ({ ...prev, language: targetLang }));
      try {
        localStorage.setItem("karin_preferred_language", targetLang);
      } catch (e) { }
      const spokenLang: "en" | "bn" = targetLang === "bn" ? "bn" : "en";
      const reply =
        spokenLang === "bn"
          ? "বাংলা ভাষা নির্বাচন করা হয়েছে। আমি আপনাকে কীভাবে সাহায্য করতে পারি?"
          : "Language switched to English. How can I help you?";
      setResponse(reply);
      setResponseLanguage(spokenLang);
      setPreviousResponse({ text: reply, lang: spokenLang });
      addHistoryItem("karin", reply, spokenLang, "change_language");
      speakResponse(reply, spokenLang);
      return;
    }

    // 10. TIME AND DATE (tell_time)
    if (parsed.intent === "tell_time") {
      const reply = detectedLang === "bn" ? parsed.spokenResponseBn : parsed.spokenResponseEn;
      setResponse(reply);
      setResponseLanguage(detectedLang);
      setLastAction(parsed.payload);
      setPreviousResponse({ text: reply, lang: detectedLang });
      addHistoryItem("karin", reply, detectedLang, "tell_time", parsed.payload.title);
      speakResponse(reply, detectedLang);
      return;
    }

    // 11. UNKNOWN COMMAND (unknown_command)
    if (parsed.intent === "unknown_command") {
      const reply = detectedLang === "bn" ? parsed.spokenResponseBn : parsed.spokenResponseEn;
      setResponse(reply);
      setResponseLanguage(detectedLang);
      setLastAction(parsed.payload);
      setPreviousResponse({ text: reply, lang: detectedLang });
      addHistoryItem("karin", reply, detectedLang, "unknown_command");
      speakResponse(reply, detectedLang);
      return;
    }

    // 12. GENERAL CONVERSATION & QUESTIONS -> Cloudflare Worker Gemini AI Backend
    try {
      const endpoint = settings.aiEndpointUrl || CLOUDFLARE_WORKER_URL;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: rawText,
          history: history.slice(0, 4).map((h) => ({
            role: h.sender === "user" ? "user" : "model",
            text: h.text,
          })),
        }),
      });

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error) {
            errorMsg = errData.error;
          }
        } catch {
          // ignore JSON parse error on error response
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const aiReply =
        data.reply ||
        data.text ||
        data.response ||
        data.message ||
        "I have received your request.";

      // Display response normally
      setResponse(aiReply);
      setResponseLanguage(detectedLang);
      setLastAction({
        type: "AI_RESPONSE",
        title: "KARIN Intelligence (VELTRICK)",
        details: "Conversational answer generated via Cloudflare Gemini Backend",
      });
      setPreviousResponse({ text: aiReply, lang: detectedLang });
      addHistoryItem("karin", aiReply, detectedLang, "general_question");

      // Connect TTS to real final AI response
      speakResponse(aiReply, detectedLang);
      if (!settings.speakerEnabled) {
        setAssistantState("idle");
      }
    } catch (err: any) {
      console.warn("AI generation error, using local fallback:", err);
      const fallbackReply =
        detectedLang === "bn"
          ? "দুঃখিত, এই মুহূর্তে এআই সার্ভারের সাথে সংযোগ করা যাচ্ছে না। তবে আমি স্থানীয় সময়, অ্যাপ্লিকেশন এবং সেটিংস কমান্ড সম্পাদন করতে পারি।"
          : "I am having trouble connecting to the AI backend right now, but all your local device commands (time, apps, calls, settings) are working.";
      setResponse(fallbackReply);
      setResponseLanguage(detectedLang);
      addHistoryItem("karin", fallbackReply, detectedLang, "FALLBACK");
      speakResponse(fallbackReply, detectedLang);
      if (!settings.speakerEnabled) {
        setAssistantState("idle");
      }
    }
  };

  // Executes auxiliary actions when needed
  const executeActionIntent = (payload: ActionPayload) => {
    if (payload.type === "YOUTUBE_OPEN") {
      window.open(buildYouTubeHomeUrl(), "_blank", "noopener,noreferrer");
    } else if (payload.type === "YOUTUBE_SEARCH" && payload.query) {
      window.open(buildYouTubeSearchUrl(payload.query), "_blank", "noopener,noreferrer");
    } else if (payload.type === "GMAIL_OPEN") {
      window.open("https://mail.google.com", "_blank", "noopener,noreferrer");
    } else if (payload.type === "CAMERA_OPEN") {
      setIsCameraModalOpen(true);
    }
  };

  // Microphone toggle button
  const handleMicClick = () => {
    if (assistantState === "listening") {
      speechEngineRef.current?.stopListening();
      setAssistantState("idle");
      return;
    }

    VoicePlayer.stop();
    setAssistantState("listening");
    handleAnnounceTalkBack("Microphone activated. Listening for command.");

    speechEngineRef.current?.startListening({
      onStart: () => {
        setAssistantState("listening");
      },
      onResult: (text: string, isFinal: boolean) => {
        setTranscript(text);
        if (isFinal) {
          processCommand(text);
        }
      },
      onError: (err: string) => {
        console.warn("Mic error:", err);
        setAssistantState("idle");
      },
      onEnd: () => {
        setAssistantState((prev) => (prev === "listening" ? "idle" : prev));
      },
    });
  };

  // Repeat Previous Response
  const handleRepeatClick = () => {
    if (previousResponse.text) {
      setResponse(previousResponse.text);
      setResponseLanguage(previousResponse.lang);
      speakResponse(previousResponse.text, previousResponse.lang);
      handleAnnounceTalkBack("Repeating last response.");
    }
  };

  // Toggle Hands-Free Mode ("Hey Karin" / "হেই কারিন")
  const handleToggleHandsFree = () => {
    const nextState = !settings.handsFreeEnabled;
    setSettings((prev) => ({ ...prev, handsFreeEnabled: nextState }));

    if (nextState) {
      handleAnnounceTalkBack("Hands-free wake-word mode activated. Listening for Hey Karin.");
      speechEngineRef.current?.startListening(
        {
          onResult: (text: string, isFinal: boolean) => {
            const { stripped, hasWakeWord } = stripWakeWord(text);
            if (hasWakeWord) {
              setTranscript(text);
              if (isFinal || stripped.length > 3) {
                processCommand(stripped || text);
              }
            }
          },
        },
        true
      );
    } else {
      handleAnnounceTalkBack("Hands-free mode deactivated.");
      speechEngineRef.current?.stopListening();
    }
  };

  // Confirm sensitive action modal
  const handleConfirmAction = () => {
    if (!actionConfirmation) return;

    if (actionConfirmation.type === "CALL_DIALER" && actionConfirmation.recipient) {
      window.location.href = `tel:${encodeURIComponent(actionConfirmation.recipient)}`;
    } else if (actionConfirmation.type === "SMS_DRAFT") {
      const url = `sms:${actionConfirmation.recipient || ""}?body=${encodeURIComponent(
        actionConfirmation.body || ""
      )}`;
      window.location.href = url;
    } else if (actionConfirmation.type === "WHATSAPP_DRAFT") {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(
          actionConfirmation.body || "Hello from KARIN"
        )}`,
        "_blank"
      );
    } else if (actionConfirmation.type === "GMAIL_DRAFT") {
      window.open(
        `mailto:${actionConfirmation.recipient || ""}?subject=Note&body=${encodeURIComponent(
          actionConfirmation.body || ""
        )}`,
        "_blank"
      );
    }

    setLastAction(actionConfirmation);
    setActionConfirmation(null);
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return (
          <HomeScreen
            state={assistantState}
            transcript={transcript}
            response={response}
            responseLanguage={responseLanguage}
            settings={settings}
            lastAction={lastAction}
            speechError={speechError}
            voiceWarning={voiceWarning}
            onMicClick={handleMicClick}
            onStopClick={handleStopClick}
            onRepeatClick={handleRepeatClick}
            onTextSubmit={processCommand}
            onPromptChipClick={processCommand}
            onReplayVoice={() => speakResponse(response, responseLanguage)}
            onToggleHandsFree={handleToggleHandsFree}
            onToggleSpeaker={handleToggleSpeaker}
            onTestVoice={handleTestVoice}
            onClearError={() => {
              setSpeechError(null);
              setVoiceWarning(null);
            }}
            onAnnounceTalkBack={handleAnnounceTalkBack}
          />
        );
      case "history":
        return (
          <HistoryScreen
            history={history}
            onClearHistory={() => setHistory([])}
            onAnnounceTalkBack={handleAnnounceTalkBack}
          />
        );
      case "language":
        return (
          <LanguageScreen
            settings={settings}
            onUpdateLanguage={(lang) => setSettings((prev) => ({ ...prev, language: lang }))}
            onAnnounceTalkBack={handleAnnounceTalkBack}
          />
        );
      case "voice":
        return (
          <VoiceSettingsScreen
            settings={settings}
            onUpdateSpeechRate={(rate) => setSettings((prev) => ({ ...prev, speechRate: rate }))}
            onUpdatePitch={(pitch) => setSettings((prev) => ({ ...prev, pitch }))}
            onToggleSpeaker={handleToggleSpeaker}
            onToggleFemaleVoice={() => {
              setSettings((prev) => {
                const next = !prev.preferredFemaleVoice;
                try {
                  localStorage.setItem("karin_female_voice", String(next));
                } catch (e) { }
                return { ...prev, preferredFemaleVoice: next };
              });
            }}
            onTestVoice={handleTestVoice}
            onStopSpeech={handleStopClick}
            onAnnounceTalkBack={handleAnnounceTalkBack}
          />
        );
      case "ai":
        return (
          <AiSettingsScreen
            settings={settings}
            onUpdateAiEndpoint={(endpoint) =>
              setSettings((prev) => ({ ...prev, aiEndpointUrl: endpoint }))
            }
            onAnnounceTalkBack={handleAnnounceTalkBack}
          />
        );
      case "accessibility":
        return (
          <AccessibilityScreen
            settings={settings}
            onToggleHighContrast={() =>
              setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }))
            }
            onToggleLargeTargets={() =>
              setSettings((prev) => ({ ...prev, largeTouchTargets: !prev.largeTouchTargets }))
            }
            onToggleTalkBack={() =>
              setSettings((prev) => ({ ...prev, talkBackSimulator: !prev.talkBackSimulator }))
            }
            onTogglePermission={(perm) => {
              if (perm === "mic") {
                setSettings((prev) => ({ ...prev, hasMicPermission: !prev.hasMicPermission }));
              } else {
                setSettings((prev) => ({ ...prev, hasContactsPermission: !prev.hasContactsPermission }));
              }
            }}
            onAnnounceTalkBack={handleAnnounceTalkBack}
          />
        );
      case "help":
        return <HelpScreen onAnnounceTalkBack={handleAnnounceTalkBack} />;
      case "android_studio":
        return <AndroidStudioHub onAnnounceTalkBack={handleAnnounceTalkBack} />;
      default:
        return null;
    }
  };

  const navItems = [
    { id: "home" as ScreenType, label: "Home", icon: Home },
    { id: "history" as ScreenType, label: "History", icon: History },
    { id: "language" as ScreenType, label: "Language", icon: Globe2 },
    { id: "voice" as ScreenType, label: "Voice/TTS", icon: Volume2 },
    { id: "ai" as ScreenType, label: "AI Brain", icon: Cpu },
    { id: "accessibility" as ScreenType, label: "Accessibility", icon: Eye },
    { id: "help" as ScreenType, label: "Help & Privacy", icon: HelpCircle },
    { id: "android_studio" as ScreenType, label: "Android Project", icon: Layers },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col justify-between ${settings.highContrast
          ? "bg-black text-white"
          : "bg-[#030712] text-slate-100"
        }`}
    >
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-[#070B19]/90 backdrop-blur-md border-b border-sky-500/20 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div
            onClick={() => handleNavClick("home", "Home")}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 p-0.5 shadow-[0_0_12px_rgba(56,189,248,0.5)] flex items-center justify-center">
              <span className="font-black text-slate-950 text-sm tracking-tighter">K</span>
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wide text-white block">
                KARIN AI
              </span>
              <span className="text-[9px] uppercase tracking-wider text-sky-400 font-bold block">
                VELTRICK
              </span>
            </div>
          </div>

          {/* Quick status & voice badges */}
          <div className="flex items-center gap-2 text-xs">
            {/* Global Speaker Toggle in Header */}
            <button
              onClick={handleToggleSpeaker}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition border ${settings.speakerEnabled
                  ? "bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/40"
                  : "bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 border-rose-500/40"
                }`}
              aria-label={settings.speakerEnabled ? "Mute voice speaker" : "Enable voice speaker"}
              title={
                settings.speakerEnabled
                  ? "Speaker Voice: ON (Click to mute)"
                  : "Speaker Voice: MUTED (Click to enable)"
              }
            >
              {settings.speakerEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="hidden sm:inline">
                {settings.speakerEnabled ? "Voice On" : "Muted"}
              </span>
            </button>

            {settings.talkBackSimulator && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                TalkBack On
              </span>
            )}

            {/* Diagnostics Button */}
            <button
              onClick={() => setIsDiagnosticsModalOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold flex items-center gap-1.5 transition"
              title="System Permissions & Audio Diagnostics"
              aria-label="Open Diagnostics"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Diagnostics</span>
            </button>

            <a
              href="/KARIN_AI_ASSISTANT.zip"
              download="KARIN_AI_ASSISTANT.zip"
              className="px-2.5 py-1 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition"
              title="Download full verified Android Studio Kotlin project"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ZIP Archive</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full max-w-4xl mx-auto pb-20 pt-2">
        {renderScreen()}
      </main>

      {/* Action Modal (Sensitive Call/Message Confirmation) */}
      <ActionModal
        action={actionConfirmation}
        onConfirm={handleConfirmAction}
        onCancel={() => setActionConfirmation(null)}
      />

      {/* Camera Viewfinder Modal */}
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
      />

      {/* Contact Picker Modal */}
      <ContactPickerModal
        isOpen={isContactModalOpen}
        initialName={contactPickerInitialName}
        onSelectContact={(name, phone) => {
          setIsContactModalOpen(false);
          if (phone) {
            setActionConfirmation({
              type: "CALL_DIALER",
              title: `Phone Call to ${name}`,
              details: `Ready to dial ${phone}.`,
              recipient: name,
              phoneNumber: phone,
              requiresConfirmation: true,
            });
          } else {
            setLastAction({
              type: "CONTACT_PICKER",
              title: `Contact: ${name}`,
              details: `Selected ${name}`,
              recipient: name,
            });
          }
        }}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* System Diagnostics Modal */}
      <DiagnosticsModal
        isOpen={isDiagnosticsModalOpen}
        onClose={() => setIsDiagnosticsModalOpen(false)}
      />

      {/* Accessible YouTube Voice Player */}
      <YouTubeOverlayPlayer
        isOpen={isYouTubePlayerOpen}
        activeQuery={activeYouTubeQuery}
        videos={youtubeVideos}
        currentVideo={currentYouTubeVideo}
        isPlaying={isYouTubePlaying}
        volume={youtubeVolume}
        language={responseLanguage}
        isHandsFreeListening={settings.handsFreeEnabled}
        onSelectVideo={(video, index) => {
          setCurrentYouTubeVideo(video);
          setIsYouTubePlaying(true);
          const reply =
            responseLanguage === "bn"
              ? `${toBengaliNumerals(index)} নম্বর ভিডিওটি চালু করছি: ${video.titleBn || video.title}`
              : `Playing video number ${index}: ${video.title}`;
          setResponse(reply);
          speakResponse(reply, responseLanguage);
          handleAnnounceTalkBack(`Selected video ${index}: ${video.title}`);
        }}
        onTogglePlayPause={() => {
          const next = !isYouTubePlaying;
          setIsYouTubePlaying(next);
          const reply = next
            ? responseLanguage === "bn"
              ? "ভিডিও পুনরায় চালু করা হয়েছে।"
              : "Playback resumed."
            : responseLanguage === "bn"
              ? "ভিডিও থামানো হয়েছে।"
              : "Video paused.";
          setResponse(reply);
          speakResponse(reply, responseLanguage);
        }}
        onNextVideo={() => {
          if (youtubeVideos.length > 0) {
            const currIdx = youtubeVideos.findIndex((v) => v.id === currentYouTubeVideo?.id);
            const nextIdx = (currIdx + 1) % youtubeVideos.length;
            const nextVid = youtubeVideos[nextIdx];
            setCurrentYouTubeVideo(nextVid);
            setIsYouTubePlaying(true);
            const reply =
              responseLanguage === "bn"
                ? `পরের ভিডিওটি চালু করছি: ${nextVid.titleBn || nextVid.title}`
                : `Skipping to next video: ${nextVid.title}`;
            setResponse(reply);
            speakResponse(reply, responseLanguage);
          }
        }}
        onPrevVideo={() => {
          if (youtubeVideos.length > 0) {
            const currIdx = youtubeVideos.findIndex((v) => v.id === currentYouTubeVideo?.id);
            const prevIdx = (currIdx - 1 + youtubeVideos.length) % youtubeVideos.length;
            const prevVid = youtubeVideos[prevIdx];
            setCurrentYouTubeVideo(prevVid);
            setIsYouTubePlaying(true);
            const reply =
              responseLanguage === "bn"
                ? `পূর্ববর্তী ভিডিওটি চালু করছি: ${prevVid.titleBn || prevVid.title}`
                : `Playing previous video: ${prevVid.title}`;
            setResponse(reply);
            speakResponse(reply, responseLanguage);
          }
        }}
        onVolumeChange={(vol) => {
          setYoutubeVolume(vol);
          handleAnnounceTalkBack(`Volume set to ${vol} percent`);
        }}
        onBackToResults={() => {
          setCurrentYouTubeVideo(null);
          const reply =
            responseLanguage === "bn"
              ? "আগের ফলাফল তালিকায় ফিরে এসেছি।"
              : "Returned to search results list.";
          setResponse(reply);
          speakResponse(reply, responseLanguage);
        }}
        onReadResultsAloud={() => {
          const spoken = formatSpokenSearchResults(youtubeVideos, responseLanguage);
          setResponse(spoken);
          speakResponse(spoken, responseLanguage);
        }}
        onClose={() => {
          setIsYouTubePlayerOpen(false);
          setIsYouTubePlaying(false);
          handleAnnounceTalkBack("Closed YouTube Player");
        }}
        onAnnounceTalkBack={handleAnnounceTalkBack}
      />

      {/* Bottom Navigation Bar */}
      <nav
        aria-label="Main Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#070B19]/95 backdrop-blur-lg border-t border-sky-500/20 px-2 py-1.5"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.label)}
                aria-label={`Go to ${item.label} screen`}
                aria-current={isSelected ? "page" : undefined}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${settings.largeTouchTargets ? "min-w-[56px] min-h-[48px]" : "min-w-[44px]"
                  } ${isSelected
                    ? "text-sky-400 font-bold scale-105"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <Icon
                  className={`w-5 h-5 ${isSelected ? "stroke-[2.5] drop-shadow-[0_0_8px_#38bdf8]" : "stroke-[1.75]"
                    }`}
                />
                <span className="text-[10px] mt-0.5 truncate max-w-[56px] text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
