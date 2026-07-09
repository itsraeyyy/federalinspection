'use client';

import React, { useRef } from 'react';
import { Download, FileText, Printer, FileSpreadsheet } from 'lucide-react';
import { SELF_ASSESSMENT_QUESTIONS, LEADERSHIP_EVALUATION_QUESTIONS_20 } from '@/lib/assessment-data';
import * as XLSX from 'xlsx';
import { PrintableReport } from './PrintableReport';

export function FinalRevealView({ data }: { data: any }) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!data || !data.details) {
    return <div className="p-8 text-center text-text-muted">No data available</div>;
  }

  const { self, evals, appr, user, period } = data.details;
  const profile = user?.user_profiles?.[0] || {};
  
  // Safe eval access
  const evaluators = evals || [];

  // -- CALCULATIONS FOR 20% (PEERS) --
  let peerTotalWeight = 0;
  let peerTotalScore = 0;
  let evaluatorTotals = new Array(evaluators.length).fill(0);

  const peerRows = LEADERSHIP_EVALUATION_QUESTIONS_20.flatMap(category => 
    category.questions.map(q => {
      const w = q.weight;
      peerTotalWeight += w;
      
      let validScores = 0;
      let sumScores = 0;
      const scores = evaluators.map((ev: any, idx: number) => {
        const s = ev.responses?.[q.question_id];
        if (s !== undefined && s !== null) {
          evaluatorTotals[idx] += s * w;
          validScores++;
          sumScores += s;
          return s;
        }
        return '-';
      });

      const avgRaw = validScores > 0 ? sumScores / validScores : 0;
      const score = avgRaw * w;
      peerTotalScore += score;

      return {
        id: q.question_id,
        criteria: q.criteria,
        weight: w,
        scores,
        avgRaw: avgRaw.toFixed(2),
        score: score.toFixed(2)
      };
    })
  );

  const peer20 = peerTotalScore / 5; // scaled from 100 to 20

  // -- CALCULATIONS FOR 10% (SELF) --
  let selfTotalWeight = 0;
  let selfTotalScore = 0;

  const selfRows = SELF_ASSESSMENT_QUESTIONS.flatMap(category => 
    category.questions.map(q => {
      const w = q.weight;
      selfTotalWeight += w;
      
      const sRaw = self?.responses?.[q.question_id];
      const score = sRaw ? sRaw * w : 0;
      selfTotalScore += score;

      return {
        id: q.question_id,
        criteria: q.criteria,
        weight: w,
        raw: sRaw || '-',
        score: score.toFixed(2)
      };
    })
  );

  const self10 = selfTotalScore / 10; // scaled from 100 to 10
  
  // -- CALCULATIONS FOR 70% (APPROVER) --
  const appr70 = Number(appr?.score_70 || 0);

  // -- SUMS --
  const sum30 = peer20 + self10;
  const final100 = sum30 + appr70;

  const getGrade = (s: number) => {
    if (s >= 90) return 'በጣም ከፍተኛ';
    if (s >= 80) return 'ከፍተኛ';
    if (s >= 70) return 'መካከለኛ';
    return 'ዝቅተኛ';
  };

  const grade = getGrade(final100);

  // --- EXPORT FUNCTIONS ---
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Controls - Hidden on Print */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-center premium-card p-4 border border-border shadow-sm gap-4">
        <h2 className="text-xl font-heading font-semibold text-text-primary">የግምገማ ሪፖርት ማውረጃ (Report Export)</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={handlePrintPDF} className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Printer className="w-4 h-4" /> PDF አውርድ (Export PDF)
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <PrintableReport
        ref={printRef}
        data={data}
        user={user}
        profile={profile}
        period={period}
        evaluators={evaluators}
        peerRows={peerRows}
        peerTotalWeight={peerTotalWeight}
        evaluatorTotals={evaluatorTotals}
        peerTotalScore={peerTotalScore}
        peer20={peer20}
        selfRows={selfRows}
        selfTotalWeight={selfTotalWeight}
        self10={self10}
        sum30={sum30}
        appr70={appr70}
        final100={final100}
        grade={grade}
      />
    </div>
  );
}
