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
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    
    // abushakir EtDatetime can be constructed from a millisecond timestamp
    const etDate = new EtDatetime(date.getTime());
    
    const monthIndex = etDate.month;
    const monthName = amharicMonths[monthIndex] || `ወር ${monthIndex}`;
    
    return `${monthName} ${etDate.day}, ${etDate.year}`;
  } catch (error) {
    console.error('Error formatting EC date:', error);
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return '-';
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return '-';
    }
  }
}

/**
 * Formats a Gregorian date (Date object or string) into an Ethiopian Calendar date & time string in Amharic.
 * Example output: መስከረም 12, 2017 04:30 
 */
export function formatECDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '-';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    
    const etDate = new EtDatetime(date.getTime());
    
    const monthIndex = etDate.month;
    const monthName = amharicMonths[monthIndex] || `ወር ${monthIndex}`;
    
    // Format time
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${monthName} ${etDate.day}, ${etDate.year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting EC date:', error);
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return '-';
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${hours}:${minutes}`;
    } catch {
      return '-';
    }
  }
}
