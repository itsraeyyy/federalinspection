import { EtDatetime } from 'abushakir';

const amharicMonths = [
  "", // 1-indexed
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታኅሣሥ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜ"
];

/**
 * Formats a Gregorian date (Date object or string) into an Ethiopian Calendar date string in Amharic.
 * Example output: መስከረም 12, 2017
 */
export function formatECDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '-';
  if (typeof dateInput === 'string' && /ጥዋት|ከሰዓት|ምሽት|ሌሊት/.test(dateInput)) {
    return dateInput;
  }
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : '-';
    
    const etDate = new EtDatetime(date.getTime());
    
    const monthIndex = etDate.month;
    const monthName = amharicMonths[monthIndex] || `ወር ${monthIndex}`;
    
    return `${monthName} ${etDate.day}, ${etDate.year}`;
  } catch (error) {
    console.error('Error formatting EC date:', error);
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return typeof dateInput === 'string' ? dateInput : '-';
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return typeof dateInput === 'string' ? dateInput : '-';
    }
  }
}

/**
 * Converts any time string containing 24-hour or 12-hour hours (HH:mm) into Ethiopian 12-hour time (1..12) with period label.
 * Ethiopian Time shifts Gregorian EAT hours by +6 hours (mod 12).
 * If the input string is ALREADY converted (contains ጥዋት, ከሰዓት, ምሽት, or ሌሊት), it is returned untouched.
 * Example: 19:20 -> ምሽት 1:20, 16:54 -> ከሰዓት 10:54, 17:08 -> ከሰዓት 11:08
 */
export function convertToEthiopianTimeStr(str: string | null | undefined): string {
  if (!str) return '-';
  if (typeof str === 'string' && /ጥዋት|ከሰዓት|ምሽት|ሌሊት/.test(str)) {
    return str;
  }
  return str.replace(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g, (match, hStr, mStr) => {
    const gHour = parseInt(hStr, 10);
    const etHour = (gHour + 6) % 12 || 12;
    
    let period = '';
    if (gHour >= 6 && gHour < 12) period = 'ጥዋት';
    else if (gHour >= 12 && gHour < 18) period = 'ከሰዓት';
    else if (gHour >= 18 && gHour < 24) period = 'ምሽት';
    else period = 'ሌሊት';
    
    return `${period} ${etHour}:${mStr}`;
  });
}

/**
 * Formats a Gregorian date (Date object or string) into an Ethiopian Calendar date & Ethiopian Time string in Amharic.
 * Ethiopian Time hours are converted from Gregorian EAT format using (gHour + 6) % 12.
 * If the input is already a formatted Ethiopian string, it is returned untouched to prevent double conversion.
 * Example output: መስከረም 12, 2017 ከሰዓት 11:08
 */
export function formatECDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '-';
  if (typeof dateInput === 'string' && /ጥዋት|ከሰዓት|ምሽት|ሌሊት/.test(dateInput)) {
    return dateInput;
  }
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : '-';
    
    const etDate = new EtDatetime(date.getTime());
    
    const monthIndex = etDate.month;
    const monthName = amharicMonths[monthIndex] || `ወር ${monthIndex}`;
    
    // Format Ethiopian time (6-hour offset from Gregorian EAT)
    const gHour = date.getHours();
    const etHour = (gHour + 6) % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    let period = '';
    if (gHour >= 6 && gHour < 12) period = 'ጥዋት';
    else if (gHour >= 12 && gHour < 18) period = 'ከሰዓት';
    else if (gHour >= 18 && gHour < 24) period = 'ምሽት';
    else period = 'ሌሊት';
    
    return `${monthName} ${etDate.day}, ${etDate.year} ${period} ${etHour}:${minutes}`;
  } catch (error) {
    console.error('Error formatting EC date:', error);
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return typeof dateInput === 'string' ? dateInput : '-';
      const gHour = d.getHours();
      const etHour = (gHour + 6) % 12 || 12;
      const minutes = d.getMinutes().toString().padStart(2, '0');
      let period = '';
      if (gHour >= 6 && gHour < 12) period = 'ጥዋት';
      else if (gHour >= 12 && gHour < 18) period = 'ከሰዓት';
      else if (gHour >= 18 && gHour < 24) period = 'ምሽት';
      else period = 'ሌሊት';
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${period} ${etHour}:${minutes}`;
    } catch {
      return typeof dateInput === 'string' ? dateInput : '-';
    }
  }
}
