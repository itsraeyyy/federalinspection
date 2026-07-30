'use client';

import React, { forwardRef } from 'react';
import { SELF_ASSESSMENT_QUESTIONS } from '@/lib/assessment-data';

interface PrintableReportProps {
  data: any;
  user: any;
  profile: any;
  period: any;
  evaluators: any[];
  peerRows: any[];
  peerTotalWeight: number;
  evaluatorTotals: number[];
  peerTotalScore: number;
  peer20: number;
  selfRows: any[];
  selfTotalWeight: number;
  self10: number;
  sum30: number;
  appr70: number;
  final100: number;
  grade: string;
  approverRemarks?: string;
}

export const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(({
  user, profile, period,
  peerRows = [], peer20 = 0,
  selfRows = [], self10 = 0,
  sum30 = 0, appr70 = 0, final100 = 0, grade = '-',
  approverRemarks = 'አስተያየት አልተሰጠም።'
}, ref) => {
  const today = new Date().toLocaleDateString('am-ET');

  return (
    <div 
      ref={ref}
      id="printable-report" 
      className="bg-white text-black p-4 sm:p-10 shadow-2xl print:shadow-none print:p-0 mx-auto w-full max-w-5xl border border-gray-300 print:border-none print:m-0"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <div className="text-center mb-6" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 className="text-2xl font-bold font-heading mb-2" style={{ fontSize: '22px', fontWeight: 'bold' }}>የአፈጻጸም ግምገማ ሪፖርት</h1>
      </div>

      {/* 1. Full User Profile Table */}
      <table className="w-full text-xs border-collapse mb-6" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
        <tbody>
          <tr>
            <td className="p-2 font-bold w-1/5" style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የተመዛኙ ሙሉ ስም</td>
            <td className="p-2 font-bold w-3/10" style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>{user?.full_name || '-'}</td>
            <td className="p-2 font-bold w-1/5" style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>ስልክ ቁጥር</td>
            <td className="p-2 w-3/10" style={{ border: '1px solid black', padding: '6px' }}>{user?.phone_number || '-'}</td>
          </tr>
          <tr>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የሚሰራበት ተቋም</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '6px' }}>{profile?.institution || '-'}</td>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የሙያ መስክ</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '6px' }}>{profile?.professional_field || '-'}</td>
          </tr>
          <tr>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>ኃላፊነት (መንግስት)</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '6px' }}>{profile?.current_responsibility_gov || '-'}</td>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>ኃላፊነት (ኮሚሽን)</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '6px' }}>{profile?.current_responsibility_com || '-'}</td>
          </tr>
          <tr>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>ክልል / ክፍለ ከተማ</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '6px' }}>{profile?.region || profile?.subcity || '-'}</td>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>ዞን / ወረዳ</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '6px' }}>{profile?.zone || profile?.woreda || '-'}</td>
          </tr>
          <tr>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የምዘና ጊዜ</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '6px' }}>{period?.name || 'ዓመታዊ - 6 ወር'}</td>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የተገመገመበት ቀን</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '6px' }}>{today}</td>
          </tr>
        </tbody>
      </table>

      {/* 2. Main Criteria Evaluation Table */}
      <h2 className="text-md font-bold mb-2" style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>የግምገማ መስፈርቶችና የአፈጻጸም ውጤት ዝርዝር</h2>
      <table className="w-full text-xs border-collapse mb-6" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '11.5px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '38px' }}>ተ.ቁ</th>
            <th className="p-2 text-left" style={{ border: '1px solid black', padding: '6px', textAlign: 'left' }}>የግምገማ መስፈርቶች</th>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '55px' }}>ከ 10%</th>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '55px' }}>ከ 20%</th>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '55px' }}>ከ 30%</th>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '55px' }}>ከ 70%</th>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '65px' }}>ከ 100%</th>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '6px', textAlign: 'center', width: '75px' }}>ደረጃ</th>
          </tr>
        </thead>
        <tbody>
          {SELF_ASSESSMENT_QUESTIONS.map((cat) => (
            <React.Fragment key={cat.category_id}>
              <tr className="font-bold" style={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
                <td className="p-2 text-center" style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{cat.category_id}</td>
                <td className="p-2" colSpan={7} style={{ border: '1px solid black', padding: '6px' }}>{cat.category_id}. {cat.category_name}</td>
              </tr>
              {cat.questions.map(q => {
                const sRow = selfRows.find(r => r.id === q.question_id);
                const pRow = peerRows.find(r => r.id === q.question_id);

                const sScoreVal = sRow ? parseFloat(sRow.score || '0') / 10 : 0;
                const pScoreVal = pRow ? parseFloat(pRow.score || '0') / 5 : 0;
                const sub30Val = sScoreVal + pScoreVal;

                return (
                  <tr key={q.question_id}>
                    <td className="p-1.5 text-center" style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{q.question_id}</td>
                    <td className="p-1.5 text-xs" style={{ border: '1px solid black', padding: '4px', fontSize: '11px' }}>{q.criteria}</td>
                    <td className="p-1.5 text-center" style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{sScoreVal > 0 ? sScoreVal.toFixed(2) : '-'}</td>
                    <td className="p-1.5 text-center" style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{pScoreVal > 0 ? pScoreVal.toFixed(2) : '-'}</td>
                    <td className="p-1.5 text-center font-bold" style={{ border: '1px solid black', padding: '4px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                      {sub30Val > 0 ? sub30Val.toFixed(2) : '-'}
                    </td>
                    <td className="p-1.5 text-center" style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>-</td>
                    <td className="p-1.5 text-center" style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>-</td>
                    <td className="p-1.5 text-center" style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>-</td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}

          {/* Table Final Totals Row */}
          <tr className="font-bold" style={{ backgroundColor: '#e5e7eb', fontWeight: 'bold' }}>
            <td className="p-2 text-right" colSpan={2} style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>አጠቃላይ ድምር ውጤት (Total)</td>
            <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{self10.toFixed(2)}</td>
            <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{peer20.toFixed(2)}</td>
            <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', color: '#0284c7' }}>{sum30.toFixed(2)}</td>
            <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{appr70.toFixed(2)}</td>
            <td className="p-2 text-center text-md font-extrabold" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontSize: '14px', color: '#0284c7' }}>{`${final100.toFixed(2)}%`}</td>
            <td className="p-2 text-center text-sm font-bold" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', color: '#0284c7' }}>{grade}</td>
          </tr>
        </tbody>
      </table>

      {/* 3. Approver Remarks Box */}
      <div className="mb-6 p-3 border border-black rounded" style={{ border: '1px solid black', padding: '8px', marginBottom: '16px' }}>
        <h3 className="font-bold text-xs mb-1" style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', backgroundColor: '#f3f4f6', padding: '4px' }}>
          የአጽዳቂው/የኮሚቴው አስተያየት እና ማጠቃለያ (Approver Remarks & Recommendation):
        </h3>
        <p className="text-xs text-gray-800 leading-relaxed" style={{ fontSize: '11.5px', color: '#111' }}>
          {approverRemarks}
        </p>
      </div>

      {/* 4. Grade Scale & Signatures */}
      <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
        <div style={{ width: '50%' }}>
          <table className="w-full text-xs border-collapse" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th className="p-2 text-left" colSpan={2} style={{ border: '1px solid black', padding: '6px', textAlign: 'left' }}>የውጤት አሰጣጥ መመሪያ</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-2 font-bold" style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>1. በጣም ከፍተኛ</td><td className="p-2" style={{ border: '1px solid black', padding: '5px' }}>ከ 90% እስከ 100%</td></tr>
              <tr><td className="p-2 font-bold" style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>2. ከፍተኛ</td><td className="p-2" style={{ border: '1px solid black', padding: '5px' }}>ከ 80% እስከ 89%</td></tr>
              <tr><td className="p-2 font-bold" style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>3. መካከለኛ</td><td className="p-2" style={{ border: '1px solid black', padding: '5px' }}>ከ 70% እስከ 79%</td></tr>
              <tr><td className="p-2 font-bold" style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>4. ዝቅተኛ</td><td className="p-2" style={{ border: '1px solid black', padding: '5px' }}>ከ 70% በታች</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ width: '50%', paddingTop: '10px' }}>
          <p className="font-bold mb-4" style={{ fontWeight: 'bold', marginBottom: '16px' }}>የተገመገመው ሰው ፊርማ: _________________________</p>
          <p className="font-bold" style={{ fontWeight: 'bold' }}>የበላይ ኃላፊ ፊርማ: _________________________</p>
        </div>
      </div>
    </div>
  );
});

PrintableReport.displayName = 'PrintableReport';
