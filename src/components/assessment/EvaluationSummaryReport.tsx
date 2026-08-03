'use client';

import React, { forwardRef } from 'react';

export interface SummaryMemberRow {
  userId: string;
  name: string;
  institution?: string;
  responsibilityGov?: string;
  responsibilityCom?: string;
  s10: number;
  s20: number;
  s70: number;
  f100: number;
  grade: string;
}

interface EvaluationSummaryReportProps {
  periodName?: string;
  members: SummaryMemberRow[];
  minRows?: number;
}

export const EvaluationSummaryReport = forwardRef<HTMLDivElement, EvaluationSummaryReportProps>(({
  periodName,
  members = [],
  minRows = 6
}, ref) => {
  const displayRowsCount = Math.max(members.length, minRows);
  const rows = Array.from({ length: displayRowsCount }, (_, i) => members[i] || null);

  return (
    <div
      ref={ref}
      id="evaluation-summary-report"
      className="bg-white text-black p-4 sm:p-10 shadow-2xl print:shadow-none print:p-0 mx-auto w-full max-w-6xl border border-gray-300 print:border-none print:m-0"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Title Header */}
      <div className="text-center mb-6" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 
          className="text-xl sm:text-2xl font-bold tracking-wide" 
          style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '0.5px' }}
        >
          የተመዛኞች ውጤት ማጠቃለያ
        </h1>
        {periodName && (
          <p className="text-sm font-semibold text-gray-700 mt-1" style={{ fontSize: '14px', color: '#374151', marginTop: '4px' }}>
            ({periodName})
          </p>
        )}
      </div>

      {/* Main Grid Table matching EXACT layout of screenshot */}
      <table 
        className="w-full text-xs border-collapse" 
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}
      >
        <thead>
          <tr style={{ backgroundColor: '#ffffff' }}>
            <th 
              rowSpan={2} 
              style={{ border: '1px solid black', padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle', width: '4%' }}
            >
              ተ/ቁ
            </th>
            <th 
              rowSpan={2} 
              style={{ border: '1px solid black', padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle', width: '15%' }}
            >
              የአመራሩ<br/>ስም
            </th>
            <th 
              rowSpan={2} 
              style={{ border: '1px solid black', padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle', width: '15%' }}
            >
              የሚሰራበት<br/>ተቋም
            </th>
            <th 
              colSpan={2} 
              style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', verticalAlign: 'middle' }}
            >
              ኃላፊነት
            </th>
            <th 
              rowSpan={2} 
              style={{ border: '1px solid black', padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle', width: '10%' }}
            >
              የግል<br/>ምዘና<br/>ውጤት<br/>10%
            </th>
            <th 
              rowSpan={2} 
              style={{ border: '1px solid black', padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle', width: '11%' }}
            >
              በጋራ<br/>የተገመገመ<br/>ምዘና ውጤት<br/>20%
            </th>
            <th 
              rowSpan={2} 
              style={{ border: '1px solid black', padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle', width: '16%' }}
            >
              አባል የሆነበት<br/>የኮሚሽን/<br/>የመንግስት<br/>የዕቅድ<br/>አፈፃፀም<br/>ውጤት 70%
            </th>
            <th 
              rowSpan={2} 
              style={{ border: '1px solid black', padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle', width: '10%' }}
            >
              አጠቃላይ<br/>ውጤት<br/>ከ100%
            </th>
            <th 
              rowSpan={2} 
              style={{ border: '1px solid black', padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle', width: '11%' }}
            >
              የአፈፃፀም<br/>ደረጃ
            </th>
          </tr>
          <tr style={{ backgroundColor: '#ffffff' }}>
            <th style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', verticalAlign: 'middle', width: '12%' }}>
              በመንግስት
            </th>
            <th style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', verticalAlign: 'middle', width: '12%' }}>
              በኮሚሽን
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row?.userId || idx} style={{ height: '36px', pageBreakInside: 'avoid' }}>
              <td style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center' }}>
                {idx + 1}
              </td>
              <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'left', fontWeight: row ? '600' : 'normal' }}>
                {row?.name || ''}
              </td>
              <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'left' }}>
                {row?.institution || ''}
              </td>
              <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'left' }}>
                {row?.responsibilityGov || ''}
              </td>
              <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'left' }}>
                {row?.responsibilityCom || ''}
              </td>
              <td style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', fontFamily: 'monospace' }}>
                {row && row.s10 > 0 ? row.s10.toFixed(1) : (row ? '-' : '')}
              </td>
              <td style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', fontFamily: 'monospace' }}>
                {row && row.s20 > 0 ? row.s20.toFixed(1) : (row ? '-' : '')}
              </td>
              <td style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', fontFamily: 'monospace' }}>
                {row && row.s70 > 0 ? row.s70.toFixed(1) : (row ? '-' : '')}
              </td>
              <td style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold' }}>
                {row && row.f100 > 0 ? row.f100.toFixed(1) : (row ? '-' : '')}
              </td>
              <td style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', fontWeight: '600' }}>
                {row?.grade || ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

EvaluationSummaryReport.displayName = 'EvaluationSummaryReport';
