'use client';

import React, { forwardRef } from 'react';
import { SELF_ASSESSMENT_QUESTIONS, LEADERSHIP_EVALUATION_QUESTIONS_20 } from '@/lib/assessment-data';

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
}

export const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(({
  data, user, profile, period,
  evaluators = [],
  peerRows, peerTotalWeight, evaluatorTotals = [], peerTotalScore, peer20,
  selfRows, selfTotalWeight, self10,
  sum30, appr70, final100, grade
}, ref) => {
  return (
    <div 
      ref={ref}
      id="printable-report" 
      className="bg-white text-black p-4 sm:p-12 shadow-2xl print:shadow-none print:p-0 mx-auto w-full max-w-5xl border border-gray-300 print:border-none print:m-0"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <div className="text-center mb-8" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 className="text-2xl font-bold font-heading mb-4" style={{ fontSize: '24px', fontWeight: 'bold' }}>የሰራተኛ የአፈጻጸም ግምገማ ቅጽ</h1>
      </div>

      <table className="w-full text-sm border-collapse mb-8" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '14px' }}>
        <tbody>
          <tr>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የግምገማው ዓይነት</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '8px' }}>{period?.name || 'ዓመታዊ - 6 ወር'}</td>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>ዕለት</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '8px' }}>{new Date().toLocaleDateString('am-ET')}</td>
          </tr>
          <tr>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የሰራተኛው ስም</td>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>{user?.full_name}</td>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የተገመገመበት ቀን</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '8px' }}>{new Date().toLocaleDateString('am-ET')}</td>
          </tr>
          <tr>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የስራ መደብ</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '8px' }}>{profile.system_role || 'Member'}</td>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የተገመገመበት ሰዓት</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '8px' }}>
              {data?.created_at ? new Date(data.created_at).toLocaleTimeString('am-ET', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('am-ET', { hour: '2-digit', minute: '2-digit' })}
            </td>
          </tr>
          <tr>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የክፍል ስም</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '8px' }}>-</td>
            <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>ገምጋሚ(ዎች)</td>
            <td className="p-2 text-xs" style={{ border: '1px solid black', padding: '8px', fontSize: '12px' }}>
              {evaluators.length > 0 
                ? evaluators.map(e => e?.evaluator?.full_name || '-').join(' / ') 
                : '-'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 20% Peer Evaluation */}
      <h2 className="text-md font-bold mb-2" style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>ከ 20% ግምገማ ({evaluators.length} ገምጋሚዎች)</h2>
      <table className="w-full text-sm border-collapse mb-8" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '12px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '40px' }}>ተ.ቁ</th>
            <th className="p-2 text-left" style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>የግምገማ መስፈርቶች</th>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '60px' }}>ክብደት</th>
            {evaluators.map((_, idx) => (
              <th key={idx} className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '60px' }}>ገም. {idx + 1}</th>
            ))}
            {evaluators.length === 0 && (
              <th className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '60px' }}>ገምጋሚዎች የሉም</th>
            )}
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '60px' }}>አማካይ</th>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '60px' }}>ውጤት</th>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '80px' }}>ምርመራ</th>
          </tr>
        </thead>
        <tbody>
          {LEADERSHIP_EVALUATION_QUESTIONS_20.map((cat) => (
            <React.Fragment key={cat.category_id}>
              <tr className="font-bold" style={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
                <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{cat.category_id}</td>
                <td className="p-2" colSpan={8} style={{ border: '1px solid black', padding: '8px' }}>{cat.category_id}. {cat.category_name}</td>
              </tr>
              {cat.questions.map(q => {
                const row = peerRows.find(r => r.id === q.question_id);
                if (!row) return null;
                return (
                  <tr key={q.question_id}>
                    <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{row.id}</td>
                    <td className="p-2 text-xs" style={{ border: '1px solid black', padding: '8px', fontSize: '11px' }}>{row.criteria}</td>
                    <td className="p-2 text-center font-semibold" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: '600' }}>{row.weight}</td>
                    {evaluators.map((_, idx) => (
                      <td key={idx} className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                        {row.scores && row.scores[idx] !== undefined ? row.scores[idx] : '-'}
                      </td>
                    ))}
                    {evaluators.length === 0 && (
                      <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>-</td>
                    )}
                    <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', backgroundColor: '#f9fafb' }}>{row.avgRaw}</td>
                    <td className="p-2 text-center font-bold" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{row.score}</td>
                    <td className="p-2" style={{ border: '1px solid black', padding: '8px' }}></td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
          <tr className="font-bold" style={{ backgroundColor: '#f3f4f6', fontWeight: 'bold' }}>
            <td className="p-2 text-right" colSpan={2} style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>ወደ 20% ሲቀየር</td>
            <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{peerTotalWeight}</td>
            {evaluators.map((_, idx) => (
              <td key={idx} className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                {evaluatorTotals[idx] !== undefined ? (evaluatorTotals[idx] / 5).toFixed(2) : '-'}
              </td>
            ))}
            {evaluators.length === 0 && (
              <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>-</td>
            )}
            <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{(peerTotalScore/100*20).toFixed(2)}</td>
            <td className="p-2 text-center text-lg" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontSize: '16px' }}>{peer20.toFixed(2)}</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '8px' }}></td>
          </tr>
        </tbody>
      </table>

      {/* 10% Self Evaluation */}
      <div className="break-before-page" style={{ pageBreakBefore: 'always', marginTop: '40px' }}></div>
      <h2 className="text-md font-bold mb-2 mt-8" style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>ከ 10% ግምገማ (የራስ ግምገማ)</h2>
      <table className="w-full text-sm border-collapse mb-8" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '12px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '40px' }}>ተ.ቁ</th>
            <th className="p-2 text-left" style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>የግምገማ መስፈርቶች</th>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '60px' }}>ክብደት</th>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '60px' }}>ደረጃ</th>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '60px' }}>ውጤት</th>
            <th className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '80px' }}>ምርመራ</th>
          </tr>
        </thead>
        <tbody>
          {selfRows.map(row => (
            <tr key={row.id}>
              <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{row.id}</td>
              <td className="p-2 text-xs" style={{ border: '1px solid black', padding: '8px', fontSize: '11px' }}>{row.criteria}</td>
              <td className="p-2 text-center font-semibold" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: '600' }}>{row.weight}</td>
              <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{row.raw}</td>
              <td className="p-2 text-center font-bold" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{row.score}</td>
              <td className="p-2" style={{ border: '1px solid black', padding: '8px' }}></td>
            </tr>
          ))}
          <tr className="font-bold" style={{ backgroundColor: '#f3f4f6', fontWeight: 'bold' }}>
            <td className="p-2 text-right" colSpan={2} style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>ወደ 10% ሲቀየር</td>
            <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{selfTotalWeight}</td>
            <td className="p-2 text-center" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}></td>
            <td className="p-2 text-center text-lg" style={{ border: '1px solid black', padding: '8px', textAlign: 'center', fontSize: '16px' }}>{self10.toFixed(2)}</td>
            <td className="p-2" style={{ border: '1px solid black', padding: '8px' }}></td>
          </tr>
        </tbody>
      </table>

      {/* Final Summary */}
      <h2 className="text-md font-bold mb-2" style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>የግምገማ ማጠቃለያ</h2>
      <div style={{ display: 'flex', gap: '30px' }}>
        <table className="text-sm border-collapse" style={{ width: '50%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <tbody>
            <tr>
              <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የተገመገመው ሰው ስም</td>
              <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>{user?.full_name}</td>
            </tr>
            <tr>
              <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>ከ 10 ያገኘው ውጤት (የራስ)</td>
              <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>{self10.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>ከ 20 ያገኘው ውጤት (አቻ)</td>
              <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>{peer20.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#e0f2fe', color: '#0284c7' }}>ከ 30 ያገኘው ድምር (20 + 10)</td>
              <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#e0f2fe', color: '#0284c7' }}>{sum30.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የበላይ ኃላፊ (ከ 70)</td>
              <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>{appr70.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="p-3 font-bold text-lg" style={{ border: '1px solid black', padding: '12px', fontWeight: 'bold', backgroundColor: '#e5e7eb', fontSize: '18px' }}>ከ 100 የተገኘው ውጤት</td>
              <td className="p-3 font-bold text-lg" style={{ border: '1px solid black', padding: '12px', fontWeight: 'bold', backgroundColor: '#f9fafb', fontSize: '18px' }}>{final100.toFixed(2)}%</td>
            </tr>
            <tr>
              <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>የውጤት ደረጃ</td>
              <td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', color: '#0284c7' }}>{grade}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ width: '50%' }}>
          <table className="w-full text-sm border-collapse mb-4" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th className="p-2 text-left" colSpan={2} style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>የውጤት አሰጣጥ መመሪያ</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>1. በጣም ከፍተኛ</td><td className="p-2" style={{ border: '1px solid black', padding: '8px' }}>ከ 90% እስከ 100%</td></tr>
              <tr><td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>2. ከፍተኛ</td><td className="p-2" style={{ border: '1px solid black', padding: '8px' }}>ከ 80% እስከ 89%</td></tr>
              <tr><td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>3. መካከለኛ</td><td className="p-2" style={{ border: '1px solid black', padding: '8px' }}>ከ 70% እስከ 79%</td></tr>
              <tr><td className="p-2 font-bold" style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>4. ዝቅተኛ</td><td className="p-2" style={{ border: '1px solid black', padding: '8px' }}>ከ 70% በታች</td></tr>
            </tbody>
          </table>
          
          <div style={{ marginTop: '40px' }}>
            <p className="font-bold mb-6" style={{ fontWeight: 'bold', marginBottom: '24px' }}>የተገመገመው ሰው ፊርማ: _________________________</p>
            <p className="font-bold mb-6" style={{ fontWeight: 'bold', marginBottom: '24px' }}>የበላይ ኃላፊ ፊርማ: _________________________</p>
          </div>
        </div>
      </div>
    </div>
  );
});

PrintableReport.displayName = 'PrintableReport';
