export type ScreenType =
  | "home"
  | "history"
  | "language"
  | "voice"
  | "ai"
  | "accessibility"
  | "help"
  | "android_studio";

export type AssistantState = "idle" | "listening" | "processing" | "speaking" | "error";

export type LanguageCode = "en" | "bn" | "auto";

export type CommandIntentType =
  | "general_question"
  | "tell_time"
  | "open_youtube"
  | "search_youtube"
  | "youtube_select"
  | "youtube_control"
  | "open_camera"
  | "open_wifi_settings"
  | "find_contact"
  | "make_call"
  | "change_language"
  | "repeat_response"
  | "stop_speech"
  | "unknown_command";

export interface IntentParameters {
  query?: string;
  selectedIndex?: number;
  controlAction?: "pause" | "resume" | "next" | "prev" | "volume_up" | "volume_down" | "scroll_up" | "scroll_down" | "back";
  contactName?: string;
  phoneNumber?: string;
  targetLanguage?: LanguageCode;
  emailRecipient?: string;
  emailSubject?: string;
  emailBody?: string;
  messageText?: string;
  greetingType?: string;
  identity?: string;
  dictionaryClarification?: string;
  periodBn?: string;
  hour12?: number;
  minutes?: number;
  dayBn?: string;
  dateNumberBn?: string;
  monthBn?: string;
  [key: string]: any;
}

export interface MessageItem {
  id: string;
  sender: "user" | "karin";
  text: string;
  timestamp: string;
  language: "en" | "bn";
  intent?: CommandIntentType | string;
  actionExecuted?: string;
  actionPayload?: ActionPayload;
}

export interface ActionPayload {
  type:
    | "TIME"
    | "DATE"
    | "GREETING"
    | "IDENTITY"
    | "DICTIONARY"
    | "YOUTUBE_OPEN"
    | "YOUTUBE_SEARCH"
    | "YOUTUBE_PLAY"
    | "YOUTUBE_CONTROL"
    | "GMAIL_OPEN"
    | "GMAIL_DRAFT"
    | "WHATSAPP_OPEN"
    | "WHATSAPP_DRAFT"
    | "CALL_DIALER"
    | "CONTACT_PICKER"
    | "SMS_DRAFT"
    | "CAMERA_OPEN"
    | "SETTINGS"
    | "WIFI_SETTINGS"
    | "CHANGE_LANGUAGE"
    | "AI_RESPONSE"
    | "REPEAT"
    | "STOP"
    | "UNKNOWN";
  title: string;
  details: string;
  recipient?: string;
  phoneNumber?: string;
  body?: string;
  query?: string;
  appPackage?: string;
  intentAction?: string;
  requiresConfirmation?: boolean;
  externalUrl?: string;
  capabilityNotice?: string;
}

export interface ParsedCommand {
  intent: CommandIntentType;
  parameters: IntentParameters;
  payload: ActionPayload;
  spokenResponseEn: string;
  spokenResponseBn: string;
}

export interface AppSettings {
  language: LanguageCode;
  speechRate: number;
  pitch: number;
  handsFreeEnabled: boolean;
  highContrast: boolean;
  largeTouchTargets: boolean;
  talkBackSimulator: boolean;
  aiEndpointUrl: string;
  temperature: number;
  hasMicPermission: boolean;
  hasContactsPermission: boolean;
  speakerEnabled: boolean;
  selectedVoiceUri?: string;
  preferredFemaleVoice?: boolean;
  phoneticBrandAlias?: string; // e.g. "Vel-trick" or "ভেলট্রিক"
}

export interface TestCaseResult {
  name: string;
  category: string;
  input: string;
  expectedIntent: string;
  status: "PASSED" | "FAILED" | "BLOCKED" | "UNTESTABLE";
  details: string;
}
