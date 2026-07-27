'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { SELF_ASSESSMENT_QUESTIONS, LEADERSHIP_EVALUATION_QUESTIONS_20 } from '@/lib/assessment-data';

// Register Benaiah (Ethiopic unicode font bundled with the project)
Font.register({
  family: 'Benaiah',
  fonts: [
    { src: '/Benaiah.ttf', fontWeight: 400 },
    { src: '/Benaiah.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Benaiah',
    fontSize: 9,
    padding: 24,
    backgroundColor: '#ffffff',
    color: '#111111',
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 14,
  },
  infoTable: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: 12,
    border: '1pt solid #000000',
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoLabelCell: {
    backgroundColor: '#f3f4f6',
    fontWeight: 700,
    borderRight: '1pt solid #000000',
    borderBottom: '1pt solid #000000',
    padding: '5pt 6pt',
    width: '25%',
    fontSize: 8,
  },
  infoValueCell: {
    borderRight: '1pt solid #000000',
    borderBottom: '1pt solid #000000',
    padding: '5pt 6pt',
    width: '25%',
    fontSize: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 5,
    marginTop: 10,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    border: '1pt solid #000000',
    marginBottom: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
  },
  tableRow: {
    flexDirection: 'row',
    borderTop: '1pt solid #000000',
  },
  categoryRow: {
    flexDirection: 'row',
    borderTop: '1pt solid #000000',
    backgroundColor: '#f9fafb',
  },
  cell: {
    borderRight: '1pt solid #000000',
    padding: '3pt 4pt',
    fontSize: 7.5,
    textAlign: 'center',
  },
  cellLeft: {
    borderRight: '1pt solid #000000',
    padding: '3pt 4pt',
    fontSize: 7.5,
    textAlign: 'left',
  },
  cellBold: {
    borderRight: '1pt solid #000000',
    padding: '3pt 4pt',
    fontSize: 7.5,
    textAlign: 'center',
    fontWeight: 700,
  },
  totalRow: {
    flexDirection: 'row',
    borderTop: '1pt solid #000000',
    backgroundColor: '#e5e7eb',
  },
  summarySection: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  summaryTable: {
    width: '50%',
    border: '1pt solid #000000',
  },
  summaryRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #000000',
  },
  summaryLabel: {
    backgroundColor: '#f3f4f6',
    fontWeight: 700,
    borderRight: '1pt solid #000000',
    padding: '4pt 5pt',
    width: '60%',
    fontSize: 8,
  },
  summaryValue: {
    padding: '4pt 5pt',
    width: '40%',
    fontWeight: 700,
    fontSize: 8,
    textAlign: 'center',
  },
  summaryFinalLabel: {
    backgroundColor: '#e5e7eb',
    fontWeight: 700,
    borderRight: '1pt solid #000000',
    padding: '6pt 5pt',
    width: '60%',
    fontSize: 10,
  },
  summaryFinalValue: {
    padding: '6pt 5pt',
    width: '40%',
    fontWeight: 700,
    fontSize: 10,
    textAlign: 'center',
    backgroundColor: '#f9fafb',
  },
  gradeTable: {
    width: '50%',
    border: '1pt solid #000000',
  },
  gradeRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #000000',
  },
  gradeLabel: {
    fontWeight: 700,
    borderRight: '1pt solid #000000',
    padding: '4pt 5pt',
    width: '40%',
    fontSize: 8,
  },
  gradeValue: {
    padding: '4pt 5pt',
    width: '60%',
    fontSize: 8,
  },
  signatureSection: {
    marginTop: 16,
    fontSize: 8,
    gap: 10,
  },
  signatureLine: {
    marginTop: 8,
  },
});

interface AssessmentReportPDFProps {
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
  data?: any;
}

export function AssessmentReportPDF({
  user, profile, period, evaluators = [],
  peerRows, peerTotalWeight, evaluatorTotals = [], peerTotalScore, peer20,
  selfRows, selfTotalWeight, self10,
  sum30, appr70, final100, grade,
  data,
}: AssessmentReportPDFProps) {
  const today = new Date().toLocaleDateString('en-GB');

  return (
    <Document title={`${user?.full_name || 'Assessment'} Report`} author="Federal Inspection">
      {/* PAGE 1: Header + Peer Evaluation (20%) */}
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Text style={styles.title}>{'የሰራተኛ የአፈጻጸም ግምገማ ቅጽ'}</Text>

        {/* Info Grid */}
        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelCell}>{'የግምገማው ዓይነት'}</Text>
            <Text style={styles.infoValueCell}>{period?.name || 'ዓመታዊ - 6 ወር'}</Text>
            <Text style={styles.infoLabelCell}>{'ዕለት'}</Text>
            <Text style={[styles.infoValueCell, { borderRight: 'none' }]}>{today}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelCell}>{'የሰራተኛው ስም'}</Text>
            <Text style={[styles.infoValueCell, { fontWeight: 700 }]}>{user?.full_name || '-'}</Text>
            <Text style={styles.infoLabelCell}>{'የተገመገመበት ቀን'}</Text>
            <Text style={[styles.infoValueCell, { borderRight: 'none' }]}>{today}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelCell}>{'የስራ መደብ'}</Text>
            <Text style={styles.infoValueCell}>{profile?.system_role || 'Member'}</Text>
            <Text style={styles.infoLabelCell}>{'ገምጋሚ(ዎች)'}</Text>
            <Text style={[styles.infoValueCell, { borderRight: 'none', fontSize: 7 }]}>
              {evaluators.length > 0 ? evaluators.map((e: any) => e?.evaluator?.full_name || '-').join(' / ') : '-'}
            </Text>
          </View>
        </View>

        {/* Peer Evaluation (20%) */}
        <Text style={styles.sectionTitle}>{`\u12A8 20% \u130D\u121D\u1308\u121B (${evaluators.length} \u130D\u121D\u130B\u121BO\u127D)`}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.cell, { width: 24, fontWeight: 700 }]}>{'ተ.ቁ'}</Text>
            <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700 }]}>{'የግምገማ መስፈርቶች'}</Text>
            <Text style={[styles.cell, { width: 32, fontWeight: 700 }]}>{'ክብደት'}</Text>
            {evaluators.map((_: any, idx: number) => (
              <Text key={idx} style={[styles.cell, { width: 28, fontWeight: 700 }]}>{`ገም.${idx + 1}`}</Text>
            ))}
            {evaluators.length === 0 && (
              <Text style={[styles.cell, { width: 28, fontWeight: 700 }]}>{'ገምጋሚዎች'}</Text>
            )}
            <Text style={[styles.cell, { width: 32, fontWeight: 700 }]}>{'አማካይ'}</Text>
            <Text style={[styles.cellBold, { width: 32 }]}>{'ውጤት'}</Text>
          </View>

          {LEADERSHIP_EVALUATION_QUESTIONS_20.map((cat) => (
            <React.Fragment key={cat.category_id}>
              <View style={styles.categoryRow}>
                <Text style={[styles.cell, { width: 24, fontWeight: 700 }]}>{cat.category_id}</Text>
                <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700 }]}>{`${cat.category_id}. ${cat.category_name}`}</Text>
                <Text style={[styles.cell, { width: 32 }]}>{''}</Text>
                {evaluators.map((_: any, idx: number) => <Text key={idx} style={[styles.cell, { width: 28 }]}>{''}</Text>)}
                {evaluators.length === 0 && <Text style={[styles.cell, { width: 28 }]}>{''}</Text>}
                <Text style={[styles.cell, { width: 32 }]}>{''}</Text>
                <Text style={[styles.cell, { width: 32 }]}>{''}</Text>
              </View>
              {cat.questions.map(q => {
                const row = peerRows.find(r => r.id === q.question_id);
                if (!row) return null;
                return (
                  <View key={q.question_id} style={styles.tableRow}>
                    <Text style={[styles.cell, { width: 24 }]}>{row.id}</Text>
                    <Text style={[styles.cellLeft, { flex: 1, fontSize: 7 }]}>{row.criteria}</Text>
                    <Text style={[styles.cell, { width: 32, fontWeight: 700 }]}>{row.weight}</Text>
                    {evaluators.map((_: any, idx: number) => (
                      <Text key={idx} style={[styles.cell, { width: 28 }]}>
                        {row.scores && row.scores[idx] !== undefined ? row.scores[idx] : '-'}
                      </Text>
                    ))}
                    {evaluators.length === 0 && <Text style={[styles.cell, { width: 28 }]}>{'-'}</Text>}
                    <Text style={[styles.cell, { width: 32, backgroundColor: '#f9fafb' }]}>{row.avgRaw}</Text>
                    <Text style={[styles.cellBold, { width: 32 }]}>{row.score}</Text>
                  </View>
                );
              })}
            </React.Fragment>
          ))}

          {/* Peer Total Row */}
          <View style={styles.totalRow}>
            <Text style={[styles.cellBold, { width: 24 }]}>{''}</Text>
            <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700 }]}>{'ወደ 20% ሲቀየር'}</Text>
            <Text style={[styles.cell, { width: 32, fontWeight: 700 }]}>{peerTotalWeight}</Text>
            {evaluators.map((_: any, idx: number) => (
              <Text key={idx} style={[styles.cell, { width: 28 }]}>
                {evaluatorTotals[idx] !== undefined ? (evaluatorTotals[idx] / 5).toFixed(2) : '-'}
              </Text>
            ))}
            {evaluators.length === 0 && <Text style={[styles.cell, { width: 28 }]}>{'-'}</Text>}
            <Text style={[styles.cell, { width: 32 }]}>{(peerTotalScore / 100 * 20).toFixed(2)}</Text>
            <Text style={[styles.cellBold, { width: 32, fontSize: 10 }]}>{peer20.toFixed(2)}</Text>
          </View>
        </View>
      </Page>

      {/* PAGE 2: Self Evaluation (10%) + Final Summary */}
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Text style={styles.sectionTitle}>{'ከ 10% ግምገማ (የራስ ግምገማ)'}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.cell, { width: 28, fontWeight: 700 }]}>{'ተ.ቁ'}</Text>
            <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700 }]}>{'የግምገማ መስፈርቶች'}</Text>
            <Text style={[styles.cell, { width: 36, fontWeight: 700 }]}>{'ክብደት'}</Text>
            <Text style={[styles.cell, { width: 36, fontWeight: 700 }]}>{'ደረጃ'}</Text>
            <Text style={[styles.cellBold, { width: 40 }]}>{'ውጤት'}</Text>
          </View>
          {selfRows.map(row => (
            <View key={row.id} style={styles.tableRow}>
              <Text style={[styles.cell, { width: 28 }]}>{row.id}</Text>
              <Text style={[styles.cellLeft, { flex: 1, fontSize: 7 }]}>{row.criteria}</Text>
              <Text style={[styles.cell, { width: 36, fontWeight: 700 }]}>{row.weight}</Text>
              <Text style={[styles.cell, { width: 36 }]}>{row.raw}</Text>
              <Text style={[styles.cellBold, { width: 40 }]}>{row.score}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={[styles.cell, { width: 28 }]}>{''}</Text>
            <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700 }]}>{'ወደ 10% ሲቀየር'}</Text>
            <Text style={[styles.cell, { width: 36, fontWeight: 700 }]}>{selfTotalWeight}</Text>
            <Text style={[styles.cell, { width: 36 }]}>{''}</Text>
            <Text style={[styles.cellBold, { width: 40, fontSize: 10 }]}>{self10.toFixed(2)}</Text>
          </View>
        </View>

        {/* Final Summary */}
        <Text style={styles.sectionTitle}>{'የግምገማ ማጠቃለያ'}</Text>
        <View style={styles.summarySection}>
          {/* Score Breakdown */}
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{'የተገመገመው ሰው ስም'}</Text>
              <Text style={styles.summaryValue}>{user?.full_name || '-'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{'ከ 10 ያገኘው ውጤት (የራስ)'}</Text>
              <Text style={styles.summaryValue}>{self10.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{'ከ 20 ያገኘው ውጤት (አቻ)'}</Text>
              <Text style={styles.summaryValue}>{peer20.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, { backgroundColor: '#e0f2fe' }]}>
              <Text style={[styles.summaryLabel, { backgroundColor: '#e0f2fe', color: '#0284c7' }]}>{'ከ 30 ያገኘው ድምር (20 + 10)'}</Text>
              <Text style={[styles.summaryValue, { color: '#0284c7' }]}>{sum30.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{'የበላይ ኃላፊ (ከ 70)'}</Text>
              <Text style={styles.summaryValue}>{appr70.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, { borderBottom: 'none' }]}>
              <Text style={styles.summaryFinalLabel}>{'ከ 100 የተገኘው ውጤት'}</Text>
              <Text style={styles.summaryFinalValue}>{`${final100.toFixed(2)}%`}</Text>
            </View>
            <View style={[styles.summaryRow, { borderBottom: 'none' }]}>
              <Text style={[styles.summaryLabel, { borderBottom: 'none' }]}>{'የውጤት ደረጃ'}</Text>
              <Text style={[styles.summaryValue, { color: '#0284c7', borderBottom: 'none' }]}>{grade}</Text>
            </View>
          </View>

          {/* Grade Scale */}
          <View style={styles.gradeTable}>
            <View style={[styles.gradeRow, { backgroundColor: '#f3f4f6' }]}>
              <Text style={[styles.gradeLabel, { fontWeight: 700, flex: 1 }]}>{'የውጤት አሰጣጥ መመሪያ'}</Text>
            </View>
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>{'1. በጣም ከፍተኛ'}</Text>
              <Text style={styles.gradeValue}>{'ከ 90% እስከ 100%'}</Text>
            </View>
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>{'2. ከፍተኛ'}</Text>
              <Text style={styles.gradeValue}>{'ከ 80% እስከ 89%'}</Text>
            </View>
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>{'3. መካከለኛ'}</Text>
              <Text style={styles.gradeValue}>{'ከ 70% እስከ 79%'}</Text>
            </View>
            <View style={[styles.gradeRow, { borderBottom: 'none' }]}>
              <Text style={styles.gradeLabel}>{'4. ዝቅተኛ'}</Text>
              <Text style={styles.gradeValue}>{'ከ 70% በታች'}</Text>
            </View>

            {/* Signatures */}
            <View style={[styles.signatureSection, { padding: 8, marginTop: 0 }]}>
              <Text style={styles.signatureLine}>{'የተገመገመው ሰው ፊርማ: _________________________'}</Text>
              <Text style={[styles.signatureLine, { marginTop: 16 }]}>{'የበላይ ኃላፊ ፊርማ: _________________________'}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
