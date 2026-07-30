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
        <Text style={styles.title}>{'የአፈጻጸም ግምገማ ሪፖርት'}</Text>

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
            <Text style={[styles.infoLabelCell, { borderBottom: 'none' }]}>{'የተገመገመበት ቀን'}</Text>
            <Text style={[styles.infoValueCell, { borderRight: 'none', borderBottom: 'none' }]}>{today}</Text>
          </View>
        </View>

        {/* 2. Main Evaluation Table (Columns: ተ.ቁ | የግምገማ መስፈርቶች | ከ10% | ከ20% | ከ30% | ከ70% | ከ100% | ደረጃ) */}
        <Text style={styles.sectionTitle}>{'የግምገማ መስፈርቶችና የአፈጻጸም ውጤት ዝርዝር'}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.cell, { width: 22, fontWeight: 700 }]}>{'ተ.ቁ'}</Text>
            <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700 }]}>{'የግምገማ መስፈርቶች'}</Text>
            <Text style={[styles.cellBold, { width: 34 }]}>{'ከ 10%'}</Text>
            <Text style={[styles.cellBold, { width: 34 }]}>{'ከ 20%'}</Text>
            <Text style={[styles.cellBold, { width: 34 }]}>{'ከ 30%'}</Text>
            <Text style={[styles.cellBold, { width: 34 }]}>{'ከ 70%'}</Text>
            <Text style={[styles.cellBold, { width: 38 }]}>{'ከ 100%'}</Text>
            <Text style={[styles.cellBold, { width: 44, borderRight: 'none' }]}>{'ደረጃ'}</Text>
          </View>

          {SELF_ASSESSMENT_QUESTIONS.map((cat) => (
            <React.Fragment key={cat.category_id}>
              <View style={styles.categoryRow}>
                <Text style={[styles.cellBold, { width: 22 }]}>{cat.category_id}</Text>
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

                return (
                  <View key={q.question_id} style={styles.tableRow}>
                    <Text style={[styles.cell, { width: 22 }]}>{q.question_id}</Text>
                    <Text style={[styles.cellLeft, { flex: 1, fontSize: 6.5 }]}>{q.criteria}</Text>
                    <Text style={[styles.cell, { width: 34 }]}>{sScoreVal > 0 ? sScoreVal.toFixed(2) : '-'}</Text>
                    <Text style={[styles.cell, { width: 34 }]}>{pScoreVal > 0 ? pScoreVal.toFixed(2) : '-'}</Text>
                    <Text style={[styles.cellBold, { width: 34, backgroundColor: '#f9fafb' }]}>
                      {sub30Val > 0 ? sub30Val.toFixed(2) : '-'}
                    </Text>
                    <Text style={[styles.cell, { width: 34 }]}>{'-'}</Text>
                    <Text style={[styles.cell, { width: 38 }]}>{'-'}</Text>
                    <Text style={[styles.cell, { width: 44, borderRight: 'none' }]}>{'-'}</Text>
                  </View>
                );
              })}
            </React.Fragment>
          ))}

          {/* Table Final Totals Row (Sums 10%, 20%, 30%, 70%, 100%, & Grade) */}
          <View style={styles.totalRow}>
            <Text style={[styles.cellBold, { width: 22 }]}>{''}</Text>
            <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700, fontSize: 7.5 }]}>{'አጠቃላይ ድምር ውጤት (Total)'}</Text>
            <Text style={[styles.cellBold, { width: 34 }]}>{self10.toFixed(2)}</Text>
            <Text style={[styles.cellBold, { width: 34 }]}>{peer20.toFixed(2)}</Text>
            <Text style={[styles.cellBold, { width: 34, color: '#0284c7' }]}>{sum30.toFixed(2)}</Text>
            <Text style={[styles.cellBold, { width: 34 }]}>{appr70.toFixed(2)}</Text>
            <Text style={[styles.cellBold, { width: 38, fontSize: 8, color: '#0284c7' }]}>{`${final100.toFixed(2)}%`}</Text>
            <Text style={[styles.cellBold, { width: 44, borderRight: 'none', color: '#0284c7', fontSize: 7.5 }]}>{grade}</Text>
          </View>
        </View>

        {/* 3. Approver Remarks Box */}
        <View style={{ border: '1pt solid #000000', padding: 5, marginBottom: 8 }}>
          <Text style={{ fontSize: 7.5, fontWeight: 700, marginBottom: 2, backgroundColor: '#f3f4f6', padding: 2 }}>
            {'የአጽዳቂው/የኮሚቴው አስተያየት እና ማጠቃለያ (Approver Remarks & Recommendation):'}
          </Text>
          <Text style={{ fontSize: 7, color: '#111111', lineHeight: 1.2 }}>
            {approverRemarks || data?.appr?.comments || data?.appr?.remarks || 'አስተያየት አልተሰጠም።'}
          </Text>
        </View>

        {/* 4. Grade Scale & Signatures */}
        <View style={styles.bottomSection}>
          <View style={styles.gradeTable}>
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

          <View style={styles.signatureSection}>
            <Text style={styles.signatureLine}>{'የተገመገመው ሰው ፊርማ: ___________________'}</Text>
            <Text style={[styles.signatureLine, { marginTop: 12 }]}>{'የበላይ ኃላፊ ፊርማ: ___________________'}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
