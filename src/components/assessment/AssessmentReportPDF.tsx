'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { SELF_ASSESSMENT_QUESTIONS } from '@/lib/assessment-data';

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
    fontSize: 8,
    padding: 18,
    backgroundColor: '#ffffff',
    color: '#111111',
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 6,
  },
  infoTable: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: 8,
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
    padding: '2.5pt 4pt',
    width: '20%',
    fontSize: 7,
  },
  infoValueCell: {
    borderRight: '1pt solid #000000',
    borderBottom: '1pt solid #000000',
    padding: '2.5pt 4pt',
    width: '30%',
    fontSize: 7,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    marginBottom: 3,
    marginTop: 4,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    border: '1pt solid #000000',
    marginBottom: 8,
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
    padding: '2pt 2pt',
    fontSize: 6.5,
    textAlign: 'center',
  },
  cellLeft: {
    borderRight: '1pt solid #000000',
    padding: '2pt 3pt',
    fontSize: 6.5,
    textAlign: 'left',
  },
  cellBold: {
    borderRight: '1pt solid #000000',
    padding: '2pt 2pt',
    fontSize: 6.5,
    textAlign: 'center',
    fontWeight: 700,
  },
  totalRow: {
    flexDirection: 'row',
    borderTop: '1pt solid #000000',
    backgroundColor: '#e5e7eb',
  },
  bottomSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
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
    padding: '3pt 4pt',
    width: '45%',
    fontSize: 7,
  },
  gradeValue: {
    padding: '3pt 4pt',
    width: '55%',
    fontSize: 7,
  },
  signatureSection: {
    width: '50%',
    padding: 4,
    gap: 6,
  },
  signatureLine: {
    fontSize: 7.5,
    marginTop: 6,
  },
});

interface AssessmentReportPDFProps {
  user: any;
  profile: any;
  period: any;
  evaluators?: any[];
  peerRows?: any[];
  peerTotalWeight?: number;
  evaluatorTotals?: number[];
  peerTotalScore?: number;
  peer20?: number;
  selfRows?: any[];
  selfTotalWeight?: number;
  self10?: number;
  sum30?: number;
  appr70?: number;
  final100?: number;
  grade?: string;
  approverRemarks?: string;
  data?: any;
}

export function AssessmentReportPDF({
  user, profile, period,
  peerRows = [], peer20 = 0,
  selfRows = [], self10 = 0,
  sum30 = 0, appr70 = 0, final100 = 0, grade = '-',
  approverRemarks = 'አስተያየት አልተሰጠም።',
  data
}: AssessmentReportPDFProps) {
  const today = new Date().toLocaleDateString('en-GB');

  return (
    <Document title={`${user?.full_name || 'Assessment'} Report`} author="Federal Inspection">
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Text style={styles.title}>{'የአፈጻጸም ምዘና ሪፖርት'}</Text>

        {/* 1. Full User Profile Block */}
        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelCell}>{'የተመዛኙ ሙሉ ስም'}</Text>
            <Text style={[styles.infoValueCell, { fontWeight: 700 }]}>{user?.full_name || '-'}</Text>
            <Text style={styles.infoLabelCell}>{'ስልክ ቁጥር'}</Text>
            <Text style={[styles.infoValueCell, { borderRight: 'none' }]}>{user?.phone_number || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelCell}>{'የሚሰራበት ተቋም'}</Text>
            <Text style={styles.infoValueCell}>{profile?.institution || '-'}</Text>
            <Text style={styles.infoLabelCell}>{'የሙያ መስክ'}</Text>
            <Text style={[styles.infoValueCell, { borderRight: 'none' }]}>{profile?.professional_field || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelCell}>{'ኃላፊነት (መንግስት)'}</Text>
            <Text style={styles.infoValueCell}>{profile?.current_responsibility_gov || '-'}</Text>
            <Text style={styles.infoLabelCell}>{'ኃላፊነት (ኮሚሽን)'}</Text>
            <Text style={[styles.infoValueCell, { borderRight: 'none' }]}>{profile?.current_responsibility_com || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelCell}>{'ክልል / ክፍለ ከተማ'}</Text>
            <Text style={styles.infoValueCell}>{profile?.region || profile?.subcity || '-'}</Text>
            <Text style={styles.infoLabelCell}>{'ዞን / ወረዳ'}</Text>
            <Text style={[styles.infoValueCell, { borderRight: 'none' }]}>{profile?.zone || profile?.woreda || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabelCell, { borderBottom: 'none' }]}>{'የምዘና ጊዜ'}</Text>
            <Text style={[styles.infoValueCell, { borderBottom: 'none' }]}>{period?.name || 'ዓመታዊ - 6 ወር'}</Text>
            <Text style={[styles.infoLabelCell, { borderBottom: 'none' }]}>{'የተመዘነበት ቀን'}</Text>
            <Text style={[styles.infoValueCell, { borderRight: 'none', borderBottom: 'none' }]}>{today}</Text>
          </View>
        </View>

        {/* 2. Main Evaluation Table */}
        <Text style={styles.sectionTitle}>{'የምዘና መስፈርቶችና የአፈጻጸም ውጤት ዝርዝር'}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.cell, { width: 24, fontWeight: 700 }]}>{'ተ.ቁ'}</Text>
            <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700 }]}>{'የምዘና መስፈርቶች'}</Text>
            <Text style={[styles.cellBold, { width: 42 }]}>{'ከ 10%'}</Text>
            <Text style={[styles.cellBold, { width: 42 }]}>{'ከ 20%'}</Text>
            <Text style={[styles.cellBold, { width: 42 }]}>{'ከ 30%'}</Text>
            <Text style={[styles.cellBold, { width: 60, borderRight: 'none' }]}>{'ደረጃ'}</Text>
          </View>

          {SELF_ASSESSMENT_QUESTIONS.map((cat) => (
            <React.Fragment key={cat.category_id}>
              <View style={styles.categoryRow}>
                <Text style={[styles.cellBold, { width: 24 }]}>{cat.category_id}</Text>
                <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700, borderRight: 'none' }]}>
                  {`${cat.category_id}. ${cat.category_name}`}
                </Text>
              </View>

              {cat.questions.map(q => {
                const sRow = (selfRows || []).find((r: any) => r.id === q.question_id);
                const pRow = (peerRows || []).find((r: any) => r.id === q.question_id);

                const sScoreVal = sRow ? parseFloat(sRow.score || '0') / 10 : 0;
                const pScoreVal = pRow ? parseFloat(pRow.score || '0') / 5 : 0;
                const sub30Val = sScoreVal + pScoreVal;

                const w = q.weight || 1.0;
                const max30ForQ = (w * 0.1) + (w * 0.2); // max 30% weight component
                const pct = max30ForQ > 0 ? (sub30Val / max30ForQ) * 100 : 0;

                let rowGrade = '-';
                if (sub30Val > 0) {
                  if (pct >= 90) rowGrade = 'በጣም ከፍተኛ';
                  else if (pct >= 80) rowGrade = 'ከፍተኛ';
                  else if (pct >= 70) rowGrade = 'መካከለኛ';
                  else rowGrade = 'ዝቅተኛ';
                }

                return (
                  <View key={q.question_id} style={styles.tableRow}>
                    <Text style={[styles.cell, { width: 24 }]}>{q.question_id}</Text>
                    <Text style={[styles.cellLeft, { flex: 1, fontSize: 6.5 }]}>{q.criteria}</Text>
                    <Text style={[styles.cell, { width: 42 }]}>{sScoreVal > 0 ? sScoreVal.toFixed(1) : '-'}</Text>
                    <Text style={[styles.cell, { width: 42 }]}>{pScoreVal > 0 ? pScoreVal.toFixed(1) : '-'}</Text>
                    <Text style={[styles.cellBold, { width: 42, backgroundColor: '#f9fafb' }]}>
                      {sub30Val > 0 ? sub30Val.toFixed(1) : '-'}
                    </Text>
                    <Text style={[styles.cell, { width: 60, borderRight: 'none', fontSize: 6 }]}>
                      {rowGrade}
                    </Text>
                  </View>
                );
              })}
            </React.Fragment>
          ))}

          {/* Table 30% Subtotal Row */}
          <View style={styles.totalRow}>
            <Text style={[styles.cellBold, { width: 24 }]}>{''}</Text>
            <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700, fontSize: 7.5 }]}>{'የ30% አጠቃላይ ድምር ውጤት (30% Total)'}</Text>
            <Text style={[styles.cellBold, { width: 42 }]}>{self10.toFixed(1)}</Text>
            <Text style={[styles.cellBold, { width: 42 }]}>{peer20.toFixed(1)}</Text>
            <Text style={[styles.cellBold, { width: 42, color: '#0284c7' }]}>{sum30.toFixed(1)}</Text>
            <Text style={[styles.cellBold, { width: 60, borderRight: 'none', color: '#0284c7', fontSize: 7 }]}>
              {sum30 >= 27 ? 'በጣም ከፍተኛ' : sum30 >= 24 ? 'ከፍተኛ' : sum30 >= 21 ? 'መካከለኛ' : 'ዝቅተኛ'}
            </Text>
          </View>
        </View>

        {/* 3. Overall Summary Score Block (Includes 70%, 100%, and Final Grade) */}
        <View style={{ border: '1pt solid #000000', marginBottom: 8, backgroundColor: '#ffffff' }}>
          <View style={{ backgroundColor: '#f3f4f6', padding: '3pt 6pt', borderBottom: '1pt solid #000000' }}>
            <Text style={{ fontSize: 7.5, fontWeight: 700 }}>{'የአፈጻጸም ማጠቃለያ ውጤት (Overall Evaluation Score Summary)'}</Text>
          </View>
          <View style={{ flexDirection: 'row', borderBottom: '1pt solid #000000' }}>
            <Text style={{ width: '22%', fontSize: 7, fontWeight: 700, padding: '3pt 4pt', backgroundColor: '#f9fafb', borderRight: '1pt solid #000000' }}>{'የራስ ምዘና (10%)'}</Text>
            <Text style={{ width: '11%', fontSize: 7, padding: '3pt 4pt', borderRight: '1pt solid #000000', textAlign: 'center' }}>{self10.toFixed(1)}</Text>
            
            <Text style={{ width: '22%', fontSize: 7, fontWeight: 700, padding: '3pt 4pt', backgroundColor: '#f9fafb', borderRight: '1pt solid #000000' }}>{'የአቻዎች ምዘና (20%)'}</Text>
            <Text style={{ width: '12%', fontSize: 7, padding: '3pt 4pt', borderRight: '1pt solid #000000', textAlign: 'center' }}>{peer20.toFixed(1)}</Text>
            
            <Text style={{ width: '21%', fontSize: 7, fontWeight: 700, padding: '3pt 4pt', backgroundColor: '#f9fafb', borderRight: '1pt solid #000000' }}>{'የ30% ድምር'}</Text>
            <Text style={{ width: '14%', fontSize: 7, fontWeight: 700, color: '#0284c7', padding: '3pt 4pt', textAlign: 'center' }}>{sum30.toFixed(1)}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ width: '22%', fontSize: 7, fontWeight: 700, padding: '3pt 4pt', backgroundColor: '#f9fafb', borderRight: '1pt solid #000000' }}>{'የአጽዳቂ/ኮሚቴ (70%)'}</Text>
            <Text style={{ width: '11%', fontSize: 7, padding: '3pt 4pt', borderRight: '1pt solid #000000', textAlign: 'center' }}>{appr70.toFixed(1)}</Text>
            
            <Text style={{ width: '22%', fontSize: 7, fontWeight: 700, padding: '3pt 4pt', backgroundColor: '#f9fafb', borderRight: '1pt solid #000000' }}>{'የ100% አጠቃላይ ውጤት'}</Text>
            <Text style={{ width: '12%', fontSize: 7.5, fontWeight: 700, color: '#0284c7', padding: '3pt 4pt', borderRight: '1pt solid #000000', textAlign: 'center' }}>{`${final100.toFixed(1)}%`}</Text>
            
            <Text style={{ width: '21%', fontSize: 7, fontWeight: 700, padding: '3pt 4pt', backgroundColor: '#f9fafb', borderRight: '1pt solid #000000' }}>{'የበላይ ደረጃ'}</Text>
            <Text style={{ width: '14%', fontSize: 7.5, fontWeight: 700, color: '#0284c7', padding: '3pt 4pt', textAlign: 'center' }}>{grade}</Text>
          </View>
        </View>

        {/* 4. Grade Scale */}
        <View style={styles.bottomSection}>
          <View style={[styles.gradeTable, { width: '100%' }]}>
            <View style={[styles.gradeRow, { backgroundColor: '#f3f4f6' }]}>
              <Text style={[styles.gradeLabel, { fontWeight: 700, width: '100%' }]}>{'የውጤት አሰጣጥ መመሪያ'}</Text>
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
          </View>
        </View>
      </Page>
    </Document>
  );
}
