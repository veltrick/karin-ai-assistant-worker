/**
 * High-precision local time and date formatting utility.
 * Guarantees zero contradiction between morning/afternoon periods,
 * uses a single captured local Date object per evaluation,
 * and formats proper Bengali numerals and cultural period indicators.
 */

// Convert English digits to Bengali digits
export function toBengaliNumerals(numStr: string | number): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(numStr).replace(/[0-9]/g, (w) => bnDigits[parseInt(w, 10)]);
}

export type BengaliPeriod = "ভোর" | "সকাল" | "দুপুর" | "বিকেল" | "সন্ধ্যা" | "রাত";

/**
 * Period boundaries (24-hour clock):
 * ভোর (Dawn/Early morning): 04:00 - 05:59
 * সকাল (Morning):           06:00 - 11:59
 * দুপুর (Noon/Midday):       12:00 - 14:59
 * বিকেল (Afternoon):         15:00 - 17:59
 * সন্ধ্যা (Evening):           18:00 - 19:59
 * রাত (Night):             20:00 - 03:59
 */
export function getBengaliPeriod(hours24: number): BengaliPeriod {
  if (hours24 >= 4 && hours24 < 6) {
    return "ভোর";
  } else if (hours24 >= 6 && hours24 < 12) {
    return "সকাল";
  } else if (hours24 >= 12 && hours24 < 15) {
    return "দুপুর";
  } else if (hours24 >= 15 && hours24 < 18) {
    return "বিকেল";
  } else if (hours24 >= 18 && hours24 < 20) {
    return "সন্ধ্যা";
  } else {
    // 20:00 through 03:59
    return "রাত";
  }
}

export interface FormattedTimeResult {
  date: Date;
  periodBn: BengaliPeriod;
  displayHours12: number;
  minutes: number;
  seconds: number;
  isPM: boolean;
  ampm: "AM" | "PM";
  spokenBn: string;
  displayBn: string;
  spokenEn: string;
  displayEn: string;
}

/**
 * Capture single local Date instance and generate exact time strings
 */
export function getCurrentLocalTime(referenceDate: Date = new Date()): FormattedTimeResult {
  const hours24 = referenceDate.getHours();
  const minutes = referenceDate.getMinutes();
  const seconds = referenceDate.getSeconds();
  const isPM = hours24 >= 12;
  const ampm: "AM" | "PM" = isPM ? "PM" : "AM";
  const displayHours12 = hours24 % 12 || 12;
  const periodBn = getBengaliPeriod(hours24);

  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const displaySeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  const bnHour = toBengaliNumerals(displayHours12);
  const bnMin = toBengaliNumerals(minutes);

  // Spoken & display in Bengali (zero contradiction, e.g. "এখন সময় বিকেল ৪টা বেজে ৩০ মিনিট")
  const spokenBn = minutes === 0
    ? `এখন সময় ${periodBn} ${bnHour}টা।`
    : `এখন সময় ${periodBn} ${bnHour}টা বেজে ${bnMin} মিনিট।`;

  const displayBn = `এখন সময় ${periodBn} ${bnHour}:${toBengaliNumerals(displayMinutes)} (${ampm})।`;

  // English
  const spokenEn = minutes === 0
    ? `The current time is ${displayHours12} o'clock ${ampm}.`
    : `The current time is ${displayHours12}:${displayMinutes} ${ampm}.`;

  const displayEn = `The current time is ${displayHours12}:${displayMinutes}:${displaySeconds} ${ampm}.`;

  return {
    date: referenceDate,
    periodBn,
    displayHours12,
    minutes,
    seconds,
    isPM,
    ampm,
    spokenBn,
    displayBn,
    spokenEn,
    displayEn,
  };
}

export interface FormattedDateResult {
  date: Date;
  dayOfWeekBn: string;
  dayOfWeekEn: string;
  dayNumberBn: string;
  dayNumberEn: number;
  monthBn: string;
  monthEn: string;
  yearBn: string;
  yearEn: number;
  spokenBn: string;
  displayBn: string;
  spokenEn: string;
  displayEn: string;
}

/**
 * Capture single local Date instance and generate exact date strings
 */
export function getCurrentLocalDate(referenceDate: Date = new Date()): FormattedDateResult {
  const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthsEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysBn = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
  const monthsBn = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
  ];

  const dayOfWeekIndex = referenceDate.getDay();
  const monthIndex = referenceDate.getMonth();
  const dayNumber = referenceDate.getDate();
  const year = referenceDate.getFullYear();

  const dayOfWeekBn = daysBn[dayOfWeekIndex];
  const dayOfWeekEn = daysEn[dayOfWeekIndex];
  const monthBn = monthsBn[monthIndex];
  const monthEn = monthsEn[monthIndex];
  const dayNumberBn = toBengaliNumerals(dayNumber);
  const yearBn = toBengaliNumerals(year);

  const spokenBn = `আজ ${dayOfWeekBn}, ${dayNumberBn}ই ${monthBn}, ${yearBn} সাল।`;
  const displayBn = `আজকের তারিখ: ${dayOfWeekBn}, ${dayNumberBn} ${monthBn} ${yearBn}।`;

  const spokenEn = `Today is ${dayOfWeekEn}, ${monthEn} ${dayNumber}, ${year}.`;
  const displayEn = `Today's Date: ${dayOfWeekEn}, ${monthEn} ${dayNumber}, ${year}.`;

  return {
    date: referenceDate,
    dayOfWeekBn,
    dayOfWeekEn,
    dayNumberBn,
    dayNumberEn: dayNumber,
    monthBn,
    monthEn,
    yearBn,
    yearEn: year,
    spokenBn,
    displayBn,
    spokenEn,
    displayEn,
  };
}
