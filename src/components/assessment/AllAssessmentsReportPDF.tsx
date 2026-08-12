'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

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
  header: {
    textAlign: 'center',
    marginBottom: 16,
    borderBottom: '2pt solid #0B2B5E',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0B2B5E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#4B5563',
  },
  userCard: {
    backgroundColor: '#F9FAFB',
    border: '1pt solid #E5E7EB',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userLabel: {
    fontWeight: 700,
    fontSize: 9,
    color: '#374151',
  },
  userValue: {
    fontSize: 9,
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0B2B5E',
    marginTop: 10,
    marginBottom: 8,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    border: '1pt solid #000000',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottom: '1pt solid #000000',
    minHeight: 24,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #E5E7EB',
    minHeight: 22,
    alignItems: 'center',
  },
  th: {
    padding: '4pt 3pt',
    fontWeight: 700,
    fontSize: 8,
    textAlign: 'center',
    borderRight: '1pt solid #000000',
  },
  td: {
    padding: '4pt 3pt',
    fontSize: 8,
    textAlign: 'center',
    borderRight: '1pt solid #E5E7EB',
  },
  tdLeft: {
    padding: '4pt 5pt',
    fontSize: 8,
    textAlign: 'left',
    borderRight: '1pt solid #E5E7EB',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
    textAlign: 'center',
    fontSize: 8,
    color: '#6B7280',
    borderTop: '1pt solid #E5E7EB',
    paddingTop: 8,
  },
});

export interface HistoryItemPDF {
  periodId: string;
  periodName: string;
  role: string;
  status: string;
  s10: number;
  s20: number;
  s70: number;
  total: number;
  grade?: string;
  date?: string;
}

interface AllAssessmentsReportPDFProps {
  user: any;
  profile: any;
  history: HistoryItemPDF[];
}

export function AllAssessmentsReportPDF({ user, profile, history = [] }: AllAssessmentsReportPDFProps) {
  const dateStr = new Date().toLocaleDateString('am-ET');

  return (
    <Document title={`${user?.full_name || 'User'}_All_Assessments_Report`} author="Federal Inspection ICODiS">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን</Text>
          <Text style={styles.subtitle}>የተጠቃሚው አጠቃላይ የምዘና ታሪክ ሪፖርት (All Assessments History Report)</Text>
        </View>

        {/* User Profile Summary */}
        <View style={styles.userCard}>
          <View style={styles.userInfoRow}>
            <Text style={styles.userLabel}>የተመዛኙ ሙሉ ስም (Full Name):</Text>
            <Text style={styles.userValue}>{user?.full_name || '-'}</Text>
            <Text style={styles.userLabel}>ስልክ ቁጥር (Phone):</Text>
            <Text style={styles.userValue}>{user?.phone_number || '-'}</Text>
          </View>
          <View style={styles.userInfoRow}>
            <Text style={styles.userLabel}>የሚሰራበት ተቋም (Institution):</Text>
            <Text style={styles.userValue}>{profile?.institution || '-'}</Text>
            <Text style={styles.userLabel}>የስራ ሀላፊነት (Responsibility):</Text>
            <Text style={styles.userValue}>{profile?.current_responsibility_gov || profile?.current_responsibility_com || '-'}</Text>
          </View>
          <View style={styles.userInfoRow}>
            <Text style={styles.userLabel}>የሪፖርቱ ቀን (Report Date):</Text>
            <Text style={styles.userValue}>{dateStr}</Text>
            <Text style={styles.userLabel}>የተመዘገቡ የምዘናዎች ብዛት (Total Assessments):</Text>
            <Text style={styles.userValue}>{history.length}</Text>
          </View>
        </View>

        {/* Main Table */}
        <Text style={styles.sectionTitle}>የምዘናዎች ማጠቃለያ ዝርዝር (Summary of All Assessments)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: '6%' }]}>ተ/ቁ</Text>
            <Text style={[styles.th, { width: '32%' }]}>የምዘና ጊዜ (Assessment Period)</Text>
            <Text style={[styles.th, { width: '12%' }]}>የራስ (10%)</Text>
            <Text style={[styles.th, { width: '12%' }]}>መዛኝ (20%)</Text>
            <Text style={[styles.th, { width: '12%' }]}>አጽዳቂ (70%)</Text>
            <Text style={[styles.th, { width: '13%' }]}>ድምር (100%)</Text>
            <Text style={[styles.th, { width: '13%', borderRight: 'none' }]}>ሁኔታ (Status)</Text>
          </View>

          {history.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.tdLeft, { width: '100%', textAlign: 'center', color: '#6B7280' }]}>
                ምንም የምዘና ታሪክ አልተገኘም።
              </Text>
            </View>
          ) : (
            history.map((item, idx) => (
              <View key={item.periodId || idx} style={styles.tableRow}>
                <Text style={[styles.td, { width: '6%' }]}>{idx + 1}</Text>
                <Text style={[styles.tdLeft, { width: '32%', fontWeight: 700 }]}>{item.periodName}</Text>
                <Text style={[styles.td, { width: '12%' }]}>{Number(item.s10 || 0).toFixed(1)}</Text>
                <Text style={[styles.td, { width: '12%' }]}>{Number(item.s20 || 0).toFixed(1)}</Text>
                <Text style={[styles.td, { width: '12%' }]}>{Number(item.s70 || 0).toFixed(1)}</Text>
                <Text style={[styles.td, { width: '13%', fontWeight: 700 }]}>{Number(item.total || 0).toFixed(1)}</Text>
                <Text style={[styles.td, { width: '13%', borderRight: 'none' }]}>
                  {item.status === 'finalized' ? 'የተጠናቀቀ' : 'በሂደት ላይ'}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን | ICODiS System — Generated Automatically</Text>
        </View>
      </Page>
    </Document>
  );
}
