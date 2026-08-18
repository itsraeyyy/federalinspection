'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { LEADERSHIP_EVALUATION_QUESTIONS_20 } from '@/lib/assessment-data';

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
  commentBox: {
    marginTop: 3,
    padding: '2.5pt 4pt',
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    borderLeft: '1.5pt solid #0284c7',
  },
  commentTitle: {
    fontSize: 6.5,
    fontWeight: 700,
    color: '#0369a1',
    marginBottom: 1.5,
  },
  commentItem: {
    fontSize: 6.5,
    color: '#374151',
    marginBottom: 1,
    lineHeight: 1.2,
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
  const rounded = Math.round(score);
  switch (rounded) {
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

const getOverallGrade20 = (score20: number): string => {
  const pct = (score20 / 20) * 100;
  if (pct > 95) return 'በጣም ከፍተኛ';
  if (pct >= 85) return 'ከፍተኛ';
  if (pct >= 65) return 'መካከለኛ';
  if (pct >= 50) return 'ዝቅተኛ';
  return 'በጣም ዝቅተኛ';
};

interface CumulativePeerReportPDFProps {
  user?: any;
  profile?: any;
  period?: any;
  evaluatorsCount?: number;
  questionData?: Record<string, { avgScore: number; comments: string[] }>;
  score20: number;
}

export function CumulativePeerReportPDF({
  user,
  profile,
  period,
  evaluatorsCount = 0,
  questionData = {},
  score20 = 0,
}: CumulativePeerReportPDFProps) {
  return (
    <Document title={`${user?.full_name || 'Member'}_20Percent_Peer_Report`} author="Federal Inspection">
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Text style={styles.title}>{'የ 20% የአቻዎች/አመራር ድምር ምዘና ሪፖርት'}</Text>
        <Text style={styles.subtitle}>{'ቅፅ-2: የአቻዎች ምዘና ዝርዝር ውጤት እና ሂስ ማጠቃለያ'}</Text>

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
            <Text style={[styles.infoLabelCell, { borderBottom: 'none' }]}>{'የገመገሙ አቻዎች ብዛት'}</Text>
            <Text style={[styles.infoValueCell, { borderRight: 'none', borderBottom: 'none' }]}>{evaluatorsCount > 0 ? `${evaluatorsCount} አባላት` : 'የተጠናቀቀ'}</Text>
          </View>
        </View>

        {/* Questions and Verbal Ratings Table with 'ሂስ' */}
        <Text style={styles.sectionTitle}>{'የ 20% የምዘና መስፈርቶች፣ የተሰጠ የአፈጻጸም ደረጃ እና የተሰጡ ሂሶች'}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.cell, { width: 22, fontWeight: 700 }]}>{'ተ.ቁ'}</Text>
            <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700 }]}>{'የምዘና መስፈርቶች እና የተሰጡ ሂሶች'}</Text>
            <Text style={[styles.cell, { width: 44, fontSize: 6.5, fontWeight: 700 }]}>{'በጣም ዝቅተኛ\n(1)'}</Text>
            <Text style={[styles.cell, { width: 36, fontSize: 6.5, fontWeight: 700 }]}>{'ዝቅተኛ\n(2)'}</Text>
            <Text style={[styles.cell, { width: 36, fontSize: 6.5, fontWeight: 700 }]}>{'መካከለኛ\n(3)'}</Text>
            <Text style={[styles.cell, { width: 36, fontSize: 6.5, fontWeight: 700 }]}>{'ከፍተኛ\n(4)'}</Text>
            <Text style={[styles.cell, { width: 44, fontSize: 6.5, fontWeight: 700 }]}>{'በጣም ከፍተኛ\n(5)'}</Text>
            <Text style={[styles.cellBold, { width: 68, borderRight: 'none', fontSize: 6.5 }]}>{'አማካይ ውጤት'}</Text>
          </View>

          {LEADERSHIP_EVALUATION_QUESTIONS_20.map((cat) => (
            <React.Fragment key={cat.category_id}>
              <View style={styles.categoryRow}>
                <Text style={[styles.cellBold, { width: 22 }]}>{cat.category_id}</Text>
                <Text style={[styles.cellLeft, { flex: 1, fontWeight: 700, borderRight: 'none' }]}>
                  {`${cat.category_id}. ${cat.category_name}`}
                </Text>
              </View>

              {cat.questions.map((q) => {
                const item = questionData[q.question_id];
                const avgScore = item?.avgScore || 0;
                const roundedScore = Math.round(avgScore);
                const comments = item?.comments || [];
                const ratingText = getScoreText(avgScore);

                return (
                  <View key={q.question_id} style={styles.tableRow}>
                    <Text style={[styles.cell, { width: 22 }]}>{q.question_id}</Text>
                    <View style={[styles.cellLeft, { flex: 1 }]}>
                      <Text style={{ fontSize: 7 }}>{q.criteria}</Text>
                      {comments.length > 0 && (
                        <View style={styles.commentBox}>
                          <Text style={styles.commentTitle}>{'💬 የተሰጡ ሂሶች / አስተያየቶች፦'}</Text>
                          {comments.map((comm, cIdx) => (
                            <Text key={cIdx} style={styles.commentItem}>
                              {`• ${comm}`}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                    <Text style={[styles.cell, { width: 44, backgroundColor: roundedScore === 1 ? '#fee2e2' : 'transparent', fontWeight: roundedScore === 1 ? 700 : 400 }]}>
                      {roundedScore === 1 ? '✓' : ''}
                    </Text>
                    <Text style={[styles.cell, { width: 36, backgroundColor: roundedScore === 2 ? '#fef3c7' : 'transparent', fontWeight: roundedScore === 2 ? 700 : 400 }]}>
                      {roundedScore === 2 ? '✓' : ''}
                    </Text>
                    <Text style={[styles.cell, { width: 36, backgroundColor: roundedScore === 3 ? '#e0f2fe' : 'transparent', fontWeight: roundedScore === 3 ? 700 : 400 }]}>
                      {roundedScore === 3 ? '✓' : ''}
                    </Text>
                    <Text style={[styles.cell, { width: 36, backgroundColor: roundedScore === 4 ? '#dcfce7' : 'transparent', fontWeight: roundedScore === 4 ? 700 : 400 }]}>
                      {roundedScore === 4 ? '✓' : ''}
                    </Text>
                    <Text style={[styles.cell, { width: 44, backgroundColor: roundedScore === 5 ? '#d1fae5' : 'transparent', fontWeight: roundedScore === 5 ? 700 : 400 }]}>
                      {roundedScore === 5 ? '✓' : ''}
                    </Text>
                    <Text style={[styles.cellBold, { width: 68, borderRight: 'none', color: '#0284c7', fontSize: 6.5 }]}>
                      {avgScore > 0 ? `${avgScore.toFixed(1)} (${ratingText})` : ''}
                    </Text>
                  </View>
                );
              })}
            </React.Fragment>
          ))}
        </View>

        {/* Summary Block & Grade Scale (Follows immediately without page break) */}
        <View wrap={false} style={{ marginTop: 4 }}>
          <View style={styles.totalBlock}>
            <View>
              <Text style={styles.totalTitle}>{'የ 20% የአቻዎች ምዘና ድምር ውጤት (Cumulative 20% Score)'}</Text>
              <Text style={{ fontSize: 8.5, color: '#4b5563', marginTop: 3 }}>
                {`የበላይ ደረጃ: ${getOverallGrade20(score20)} (${((score20 / 20) * 100).toFixed(1)}%)`}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalScore}>{`${score20.toFixed(1)} / 20`}</Text>
              <Text style={{ fontSize: 7.5, color: '#6b7280' }}>{'ከ 20% የተሰጠ አማካይ ውጤት'}</Text>
            </View>
          </View>

          {/* Grade Legend */}
          <View style={styles.gradeScaleTable}>
            <View style={[styles.gradeRow, { backgroundColor: '#f3f4f6' }]}>
              <Text style={[styles.gradeLabel, { fontWeight: 700, width: '100%' }]}>{'የ 20% ውጤት አሰጣጥ መመሪያ (Legend)'}</Text>
            </View>
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>{'1. በጣም ከፍተኛ'}</Text>
              <Text style={styles.gradeValue}>{'ከ 19.0 በላይ (> 19.0)'}</Text>
            </View>
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>{'2. ከፍተኛ'}</Text>
              <Text style={styles.gradeValue}>{'17.0 - 19.0'}</Text>
            </View>
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>{'3. መካከለኛ'}</Text>
              <Text style={styles.gradeValue}>{'13.0 - 17.0'}</Text>
            </View>
            <View style={styles.gradeRow}>
              <Text style={styles.gradeLabel}>{'4. ዝቅተኛ'}</Text>
              <Text style={styles.gradeValue}>{'10.0 - 13.0'}</Text>
            </View>
            <View style={[styles.gradeRow, { borderBottom: 'none' }]}>
              <Text style={styles.gradeLabel}>{'5. በጣም ዝቅተኛ'}</Text>
              <Text style={styles.gradeValue}>{'ከ 10.0 በታች (< 10.0)'}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
