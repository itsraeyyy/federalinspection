import { EtDatetime } from 'abushakir';

export type ReportPeriod = 
  | '1ኛ ሩብ አመት'
  | '2ኛ ሩብ አመት'
  | 'የመጀመሪያ ግማሽ አመት'
  | '3ኛ ሩብ አመት'
  | '4ኛ ሩብ አመት'
  | '2ተኛ ግማሽ አመት'
  | 'የበጀት አመት (ሙሉ)';

export const ET_MONTHS = {
  Meskerem: 1,
  Tikimt: 2,
  Hidar: 3,
  Tahsas: 4,
  Tir: 5,
  Yekatit: 6,
  Megabit: 7,
  Miyazya: 8,
  Ginbot: 9,
  Sene: 10,
  Hamle: 11,
  Nehase: 12,
  Pagume: 13,
};

// Returns the current Ethiopian Date info
export function getCurrentEtDate() {
  const now = new EtDatetime();
  return {
    year: now.year,
    month: now.month,
    day: now.day,
  };
}

// Maps periods to their reporting months (the end month of that period)
const periodReportMonths: Record<ReportPeriod, number> = {
  '1ኛ ሩብ አመት': ET_MONTHS.Meskerem,
  '2ኛ ሩብ አመት': ET_MONTHS.Tahsas,
  'የመጀመሪያ ግማሽ አመት': ET_MONTHS.Tahsas,
  '3ኛ ሩብ አመት': ET_MONTHS.Megabit,
  '4ኛ ሩብ አመት': ET_MONTHS.Sene,
  '2ተኛ ግማሽ አመት': ET_MONTHS.Sene,
  'የበጀት አመት (ሙሉ)': ET_MONTHS.Sene,
};

/**
 * Checks if the current Ethiopian date falls within the acceptable submission window
 * for the given period.
 * Rule: Submission is ONLY allowed between the 20th and 25th day of the report month.
 */
export function canSubmitReport(period: ReportPeriod): boolean {
  const current = getCurrentEtDate();
  const reportMonth = periodReportMonths[period];

  if (current.month !== reportMonth) {
    return false;
  }

  if (current.day < 20 || current.day > 25) {
    return false;
  }

  return true;
}

/**
 * Computes the fiscal year for a given period.
 * The Ethiopian fiscal year starts in Hamle (Month 11) and ends in Sene (Month 10) of the next year.
 * For example, Hamle 2017 to Sene 2018 is considered Fiscal Year 2018.
 * This function returns the active fiscal year based on the current ET date.
 */
export function getCurrentFiscalYear(): number {
  const current = getCurrentEtDate();
  // If we are in Hamle (11), Nehase (12), or Pagume (13), we are in the start of the NEW fiscal year.
  // Example: Hamle 2017 is the start of Fiscal Year 2018.
  if (current.month >= ET_MONTHS.Hamle) {
    return current.year + 1;
  }
  return current.year;
}
