'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { SELF_ASSESSMENT_QUESTIONS } from '@/lib/assessment-data';

// Register Benaiah font
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
    padding: 24,
    backgroundColor: '#ffffff',
    color: '#111111',
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 10,
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
    padding: '3pt 5pt',
    width: '22%',
    fontSize: 7.5,
  },
  infoValueCell: {
    borderRight: '1pt solid #000000',
    borderBottom: '1pt solid #000000',
    padding: '3pt 5pt',
    width: '28%',
    fontSize: 7.5,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    marginBottom: 4,
    marginTop: 6,
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
    padding: '3pt 3pt',
    fontSize: 7,
    textAlign: 'center',
  },
  cellLeft: {
    borderRight: '1pt solid #000000',
    padding: '3pt 4pt',
    fontSize: 7,
    textAlign: 'left',
  },
  cellBold: {
    borderRight: '1pt solid #000000',
    padding: '3pt 3pt',
    fontSize: 7,
    textAlign: 'center',
    fontWeight: 700,
  },
  totalBlock: {
    border: '1pt solid #000000',
    padding: 8,
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalTitle: {
    fontSize: 9,
    fontWeight: 700,
  },
  totalScore: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0284c7',
  },
  gradeScaleTable: {
    width: '100%',
    border: '1pt solid #000000',
    marginTop: 6,
  },
  gradeRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #000000',
  },
  gradeLabel: {
    fontWeight: 700,
    borderRight: '1pt solid #000000',
    padding: '3pt 5pt',
    width: '40%',
    fontSize: 7.5,
  },
  gradeValue: {
    padding: '3pt 5pt',
    width: '60%',
    fontSize: 7.5,
  },
});

const getScoreText = (score?: number): string => {
  if (!score) return '-';
  switch (score) {
    case 5:
      return 'በጣም ከፍተኛ';
    case 4:
      return 'ከፍተኛ';
    case 3:
      return 'መካከለኛ';
    case 2:
      return 'ዝቅተኛ';
    case 1:
      return 'በጣም ዝቅተኛ';
    default:
      return '-';
  }
};

const getOverallGrade = (score10: number): string => {
  if (score10 > 9.5) return 'በጣም ከፍተኛ';
  if (score10 >= 8.5) return 'ከፍተኛ';
  if (score10 >= 6.5) return 'መካከለኛ';
  if (score10 >= 5.0) return 'ዝቅተኛ';
  return 'በጣም ዝቅተኛ';
};

interface SelfAssessmentReportPDFProps {
  user?: any;
  profile?: any;
  period?: any;
  responses: Record<string, number>;
  score10: number;
}

export function SelfAssessmentReportPDF({
  user,
  profile,
  period,
  responses = {},
  score10 = 0,
}: SelfAssessmentReportPDFProps) {
  const today = new Date().toLocaleDateString('en-GB');

  return (
    <Document title={`${user?.full_name || 'Self_Assessment'}_10Percent_Report`} author="Federal Inspection">
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Text style={styles.title}>{'የ 10% የራስ አፈጻጸም ምዘና ሪፖርት'}</Text>
        <Text style={styles.subtitle}>{'ቅፅ-1: የራስ ምዘና ዝርዝር ውጤት'}</Text>

        {/* User Information Table */}
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
            <Text style={[styles.infoLabelCell, { borderBottom: 'none' }]}>{'የምዘና ጊዜ'}</Text>
            <Text style={[styles.infoValueCell, { borderBottom: 'none' }]}>{period?.name || 'ዓመታዊ ምዘና'}</Text>
            <Text style={[styles.infoLabelCell, { borderBottom: 'none' }]}>{'የተመዘነበት ቀን'}</Text>
            <Text style={[styles.infoValueCell, { borderRight: 'none', borderBottom: 'none' }]}>{today}</Text>
          </View>
        </View>

        {/* Questions and Verbal Ratings Table */}
        <Text style={styles.sectionTitle}>{'የ 10% የራስ ምዘና መስፈርቶችና የተሰጠ የአፈጻጸም ደረጃ'}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.cell, { width: 35, fontWeight: 700 }]}>{'ተ.ቁ'}</Text>
            <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700 }]}>{'የምዘና መስፈርቶች'}</Text>
            <Text style={[styles.cellBold, { width: 110, borderRight: 'none' }]}>{'የአፈጻጸም ደረጃ (Result)'}</Text>
          </View>

          {SELF_ASSESSMENT_QUESTIONS.map((cat) => (
            <React.Fragment key={cat.category_id}>
              <View style={styles.categoryRow}>
                <Text style={[styles.cellBold, { width: 35 }]}>{cat.category_id}</Text>
                <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700, borderRight: 'none' }]}>
                  {`${cat.category_id}. ${cat.category_name}`}
                </Text>
              </View>

              {cat.questions.map((q) => {
                const scoreNum = responses[q.question_id];
                const ratingText = getScoreText(scoreNum);

                return (
                  <View key={q.question_id} style={styles.tableRow}>
                    <Text style={[styles.cell, { width: 35 }]}>{q.question_id}</Text>
                    <Text style={[styles.cellLeft, { flex: 1 }]}>{q.criteria}</Text>
                    <Text style={[styles.cellBold, { width: 110, borderRight: 'none', color: '#0369a1' }]}>
                      {ratingText}
                    </Text>
                  </View>
                );
              })}
            </React.Fragment>
          ))}
        </View>

        {/* Summary Block & Grade Scale (Moved to Page 2 cleanly) */}
        <View break wrap={false}>
          <View style={styles.totalBlock}>
            <View>
              <Text style={styles.totalTitle}>{'የ 10% የራስ ምዘና አጠቃላይ ውጤት (Total 10% Score)'}</Text>
              <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 2 }}>
                {`ደረጃ: ${getOverallGrade(score10)}`}
              </Text>
            </View>
            <Text style={styles.totalScore}>{`${score10.toFixed(1)} / 10`}</Text>
          </View>

          {/* Grade Legend */}
          <View style={styles.gradeScaleTable}>
            <View style={[styles.gradeRow, { backgroundColor: '#f3f4f6' }]}>
              <Text style={[styles.gradeLabel, { fontWeight: 700, width: '100%' }]}>{'የውጤት አሰጣጥ መመሪያ (Legend)'}</Text>
            </View>
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>{'5. በጣም ከፍተኛ'}</Text>
              <Text style={styles.gradeValue}>{'9.0 - 10.0 (Very High)'}</Text>
            </View>
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>{'4. ከፍተኛ'}</Text>
              <Text style={styles.gradeValue}>{'8.0 - 8.9 (High)'}</Text>
            </View>
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>{'3. መካከለኛ'}</Text>
              <Text style={styles.gradeValue}>{'7.0 - 7.9 (Medium)'}</Text>
            </View>
            <View style={[styles.gradeRow, { borderBottom: 'none' }]}>
              <Text style={styles.gradeLabel}>{'1-2. ዝቅተኛ / በጣም ዝቅተኛ'}</Text>
              <Text style={styles.gradeValue}>{'ከ 7.0 በታች (Low / Very Low)'}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
