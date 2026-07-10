import { EtDatetime } from 'abushakir';
import { getCurrentEtDate, canSubmitReport, ReportPeriod, getCurrentFiscalYear } from '../src/lib/et-calendar';

const d = new EtDatetime();
console.log("Current ET Date:", d.year, d.month, d.day);
console.log("Fiscal Year:", getCurrentFiscalYear());

const periods: ReportPeriod[] = ['1ኛ ሩብ አመት', '2ኛ ሩብ አመት', '3ኛ ሩብ አመት', '4ኛ ሩብ አመት'];
for (const p of periods) {
  console.log(`Can submit ${p}:`, canSubmitReport(p));
}
