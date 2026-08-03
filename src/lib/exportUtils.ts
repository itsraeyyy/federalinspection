import * as XLSX from 'xlsx';
import { SELF_ASSESSMENT_QUESTIONS, LEADERSHIP_EVALUATION_QUESTIONS_20 } from './assessment-data';

export const exportBulkOverview = (data: any[], fileName: string = 'assessment_overview.xlsx') => {
  const exportData = data.map(row => ({
    'ስም (Name)': row.name,
    'ስልክ (Phone)': row.phone,
    'ሚና (Role)': row.role,
    'የራስ ምዘና (Self - 10%)': row.s10,
    'የመዛኞች ውጤት (Eval - 20%)': row.s20,
    'ድምር (Subtotal - 30%)': row.s30,
    'የአጽዳቂ ውጤት (Approver - 70%)': row.s70,
    'አጠቃላይ ድምር (Total - 100%)': row.total,
    'ሁኔታ (Status)': row.status || 'ያልፀደቀ (Not Approved)'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Overview');
  
  XLSX.writeFile(workbook, fileName);
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
    { 'ክፍል (Section)': 'ስም (Name)', 'መረጃ (Details)': userOverview.name },
    { 'ክፍል (Section)': 'ስልክ (Phone)', 'መረጃ (Details)': userOverview.phone },
    { 'ክፍል (Section)': 'ሚና (Role)', 'መረጃ (Details)': userOverview.role },
    { 'ክፍል (Section)': 'የምዘና ጊዜ (Period)', 'መረጃ (Details)': userOverview.periodName },
    { 'ክፍል (Section)': 'የራስ ምዘና (10)', 'መረጃ (Details)': Number(userOverview.s10 || 0).toFixed(1) },
    { 'ክፍል (Section)': 'የመዛኞች ውጤት (20)', 'መረጃ (Details)': Number(userOverview.s20 || 0).toFixed(1) },
    { 'ክፍል (Section)': 'ድምር (30)', 'መረጃ (Details)': Number(userOverview.s30 || 0).toFixed(1) },
    { 'ክፍል (Section)': 'የአጽዳቂ ውጤት (70)', 'መረጃ (Details)': Number(userOverview.s70 || 0).toFixed(1) },
    { 'ክፍል (Section)': 'አጠቃላይ ድምር (100)', 'መረጃ (Details)': Number(userOverview.total || 0).toFixed(1) }
  ];
  const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
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
  const selfSheet = XLSX.utils.json_to_sheet(selfAssessmentExport.length > 0 ? selfAssessmentExport : [{ 'መረጃ (Info)': 'የራስ ምዘና አልተገኘም (No self assessment found)' }]);
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
  const evalSheet = XLSX.utils.json_to_sheet(evalExport.length > 0 ? evalExport : [{ 'መረጃ (Info)': 'የመዛኞች ውጤት አልተገኘም (No evaluations found)' }]);
  XLSX.utils.book_append_sheet(workbook, evalSheet, 'የመዛኞች ውጤቶች (Evaluations)');

  // Sheet 4: Approver (just the raw score since no questions are attached)
  const approverExport = [
    {
      'አጽዳቂ (Approver)': approverData?.approverName || 'ያልታወቀ (Unknown)',
      'የተሰጠ ውጤት (Score out of 70)': approverData?.score_70 || 0,
      'ሁኔታ (Status)': approverData?.is_locked ? 'የተቆለፈ (Locked)' : 'በሂደት ላይ (Draft)'
    }
  ];
  const approverSheet = XLSX.utils.json_to_sheet(approverData ? approverExport : [{ 'መረጃ (Info)': 'የአጽዳቂ ውጤት አልተገኘም (No approver evaluation found)' }]);
  XLSX.utils.book_append_sheet(workbook, approverSheet, 'የአጽዳቂ ውጤት (Approver)');

  XLSX.writeFile(workbook, fileName);
};
