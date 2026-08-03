import * as XLSX from 'xlsx';
import { SELF_ASSESSMENT_QUESTIONS, LEADERSHIP_EVALUATION_QUESTIONS_20 } from './assessment-data';

/**
 * Calculates and sets column widths automatically for clean, readable Excel output.
 */
const setAutoColumnWidths = (worksheet: XLSX.WorkSheet, data: any[]) => {
  if (!data || data.length === 0) return;

  const keys = Object.keys(data[0]);
  const cols = keys.map(key => {
    let maxLen = key.length;
    data.forEach(row => {
      const val = row[key];
      if (val !== null && val !== undefined) {
        const len = String(val).length;
        if (len > maxLen) maxLen = len;
      }
    });
    // Extra padding for clean formatting in Excel viewers
    return { wch: Math.max(maxLen + 5, 14) };
  });

  worksheet['!cols'] = cols;
};

export const exportBulkOverview = (data: any[], fileName: string = 'assessment_overview.xlsx') => {
  const exportData = data.map(row => ({
    'ስም (Name)': row.name || '-',
    'ስልክ (Phone)': row.phone || '-',
    'ሚና (Role)': row.role || '-',
    'የራስ ምዘና (10%)': Number(Number(row.s10 || 0).toFixed(1)),
    'የመዛኞች ውጤት (20%)': Number(Number(row.s20 || 0).toFixed(1)),
    'ድምር (30%)': Number(Number(row.s30 || 0).toFixed(1)),
    'የአጽዳቂ ውጤት (70%)': Number(Number(row.s70 || 0).toFixed(1)),
    'አጠቃላይ ድምር (100%)': Number(Number(row.total || 0).toFixed(1))
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  setAutoColumnWidths(worksheet, exportData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ማጠቃለያ (Overview)');

  const safeFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, safeFileName);
};

export const exportDetailedUserReport = (
  userOverview: any,
  selfAssessmentData: any,
  evaluationsData: any[],
  approverData: any,
  fileName: string
) => {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Overview
  const overviewData = [
    { 'ክፍል (Section)': 'ስም (Name)', 'መረጃ (Details)': userOverview.name || '-' },
    { 'ክፍል (Section)': 'ስልክ (Phone)', 'መረጃ (Details)': userOverview.phone || '-' },
    { 'ክፍል (Section)': 'ሚና (Role)', 'መረጃ (Details)': userOverview.role || '-' },
    { 'ክፍል (Section)': 'የምዘና ጊዜ (Period)', 'መረጃ (Details)': userOverview.periodName || '-' },
    { 'ክፍል (Section)': 'የራስ ምዘና (10%)', 'መረጃ (Details)': Number(Number(userOverview.s10 || 0).toFixed(1)) },
    { 'ክፍል (Section)': 'የመዛኞች ውጤት (20%)', 'መረጃ (Details)': Number(Number(userOverview.s20 || 0).toFixed(1)) },
    { 'ክፍል (Section)': 'ድምር (30%)', 'መረጃ (Details)': Number(Number(userOverview.s30 || 0).toFixed(1)) },
    { 'ክፍል (Section)': 'የአጽዳቂ ውጤት (70%)', 'መረጃ (Details)': Number(Number(userOverview.s70 || 0).toFixed(1)) },
    { 'ክፍል (Section)': 'አጠቃላይ ድምር (100%)', 'መረጃ (Details)': Number(Number(userOverview.total || 0).toFixed(1)) }
  ];
  const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
  setAutoColumnWidths(overviewSheet, overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'አጠቃላይ መረጃ (Overview)');

  // Sheet 2: Self Assessment
  const selfAssessmentExport: any[] = [];
  if (selfAssessmentData && selfAssessmentData.responses) {
    SELF_ASSESSMENT_QUESTIONS.forEach(cat => {
      cat.questions.forEach(q => {
        const answer = selfAssessmentData.responses[q.question_id];
        selfAssessmentExport.push({
          'ምድብ (Category)': cat.category_name,
          'መለያ (ID)': q.question_id,
          'መስፈርት (Criteria)': q.criteria,
          'ክብደት (Weight)': q.weight,
          'የተሰጠ ውጤት (Score 1-5)': answer !== undefined ? answer : 'ያልተመለሰ (Not Answered)'
        });
      });
    });
  }
  const selfRows = selfAssessmentExport.length > 0 ? selfAssessmentExport : [{ 'መረጃ (Info)': 'የራስ ምዘና አልተገኘም' }];
  const selfSheet = XLSX.utils.json_to_sheet(selfRows);
  setAutoColumnWidths(selfSheet, selfRows);
  XLSX.utils.book_append_sheet(workbook, selfSheet, 'የራስ ምዘና (Self Assessment)');

  // Sheet 3: Evaluations
  const evalExport: any[] = [];
  if (evaluationsData && evaluationsData.length > 0) {
    evaluationsData.forEach((evaluation, index) => {
      const evaluatorName = evaluation.evaluatorName || `መዛኝ (Evaluator) ${index + 1}`;
      LEADERSHIP_EVALUATION_QUESTIONS_20.forEach(cat => {
        cat.questions.forEach(q => {
          const answer = evaluation.responses?.[q.question_id];
          const comment = evaluation.responses?.[`${q.question_id}_comment`] || '-';
          evalExport.push({
            'መዛኝ (Evaluator)': evaluatorName,
            'ምድብ (Category)': cat.category_name,
            'መለያ (ID)': q.question_id,
            'መስፈርት (Criteria)': q.criteria,
            'ክብደት (Weight)': q.weight,
            'የተሰጠ ውጤት (Score 1-5)': answer !== undefined ? answer : 'ያልተመለሰ (Not Answered)',
            'ምክንያት / ማብራሪያ (Comment / Reason)': comment
          });
        });
      });
    });
  }
  const evalRows = evalExport.length > 0 ? evalExport : [{ 'መረጃ (Info)': 'የመዛኞች ውጤት አልተገኘም' }];
  const evalSheet = XLSX.utils.json_to_sheet(evalRows);
  setAutoColumnWidths(evalSheet, evalRows);
  XLSX.utils.book_append_sheet(workbook, evalSheet, 'የመዛኞች ውጤቶች (Evaluations)');

  // Sheet 4: Approver (Status column removed)
  const approverExport = [
    {
      'አጽዳቂ (Approver)': approverData?.approverName || 'ያልታወቀ (Unknown)',
      'የተሰጠ ውጤት (70%)': Number(Number(approverData?.score_70 || 0).toFixed(1))
    }
  ];
  const apprRows = approverData ? approverExport : [{ 'መረጃ (Info)': 'የአጽዳቂ ውጤት አልተገኘም' }];
  const approverSheet = XLSX.utils.json_to_sheet(apprRows);
  setAutoColumnWidths(approverSheet, apprRows);
  XLSX.utils.book_append_sheet(workbook, approverSheet, 'የአጽዳቂ ውጤት (Approver)');

  const safeFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, safeFileName);
};
