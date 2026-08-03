'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { SummaryMemberRow } from './EvaluationSummaryReport';

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
    padding: 20,
    backgroundColor: '#ffffff',
    color: '#111111',
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    color: '#374151',
    marginBottom: 14,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    border: '1pt solid #000000',
  },
  headerRow1: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottom: '1pt solid #000000',
  },
  headerRow2: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottom: '1pt solid #000000',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #000000',
    minHeight: 22,
  },
  th: {
    borderRight: '1pt solid #000000',
    padding: '4pt 3pt',
    fontWeight: 700,
    textAlign: 'center',
    fontSize: 7.5,
  },
  td: {
    borderRight: '1pt solid #000000',
    padding: '3pt 4pt',
    fontSize: 7.5,
    textAlign: 'center',
  },
  tdLeft: {
    borderRight: '1pt solid #000000',
    padding: '3pt 4pt',
    fontSize: 7.5,
    textAlign: 'left',
  },
  tdBold: {
    borderRight: '1pt solid #000000',
    padding: '3pt 4pt',
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center',
  },
});

interface SummaryReportPDFProps {
  periodName?: string;
  members: SummaryMemberRow[];
}

export function SummaryReportPDF({ periodName, members = [] }: SummaryReportPDFProps) {
  // Ensure at least 6 rows shown (empty rows for blank form)
  const minRows = Math.max(members.length, 6);
  const rows = Array.from({ length: minRows }, (_, i) => members[i] || null);

  return (
    <Document title={`${periodName || 'Evaluation'} Summary`} author="Federal Inspection">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{'የተመዛኞች ውጤት ማጠቃለያ'}</Text>
        {periodName && <Text style={styles.subtitle}>{`(${periodName})`}</Text>}

        <View style={styles.table}>
          {/* Header Row 1 - multi-span cells */}
          <View style={styles.headerRow1}>
            <Text style={[styles.th, { width: 22 }]}>{'ተ/ቁ'}</Text>
            <Text style={[styles.th, { width: 90 }]}>{'የአመራሩ ስም'}</Text>
            <Text style={[styles.th, { width: 90 }]}>{'የሚሰራበት ተቋም'}</Text>
            {/* Responsibility spans 2 sub-columns - simulated with parent */}
            <Text style={[styles.th, { width: 120 }]}>{'ኃላፊነት'}</Text>
            <Text style={[styles.th, { width: 52 }]}>{'የግል ምዘና ውጤት 10%'}</Text>
            <Text style={[styles.th, { width: 58 }]}>{'በጋራ የተገመገመ ምዘና ውጤት 20%'}</Text>
            <Text style={[styles.th, { width: 80 }]}>{'አባል የሆነበት የኮሚሽን/የመንግስት የዕቅድ አፈፃፀም ውጤት 70%'}</Text>
            <Text style={[styles.th, { width: 52 }]}>{'አጠቃላይ ውጤት ከ100%'}</Text>
            <Text style={[styles.th, { width: 56, borderRight: 'none' }]}>{'የአፈፃፀም ደረጃ'}</Text>
          </View>

          {/* Header Row 2 - responsibility sub-headers */}
          <View style={styles.headerRow2}>
            <Text style={[styles.th, { width: 22 }]}>{''}</Text>
            <Text style={[styles.th, { width: 90 }]}>{''}</Text>
            <Text style={[styles.th, { width: 90 }]}>{''}</Text>
            <Text style={[styles.th, { width: 60 }]}>{'በመንግስት'}</Text>
            <Text style={[styles.th, { width: 60 }]}>{'በኮሚሽን'}</Text>
            <Text style={[styles.th, { width: 52 }]}>{''}</Text>
            <Text style={[styles.th, { width: 58 }]}>{''}</Text>
            <Text style={[styles.th, { width: 80 }]}>{''}</Text>
            <Text style={[styles.th, { width: 52 }]}>{''}</Text>
            <Text style={[styles.th, { width: 56, borderRight: 'none' }]}>{''}</Text>
          </View>

          {/* Data Rows */}
          {rows.map((row, idx) => (
            <View key={row?.userId || idx} style={styles.dataRow}>
              <Text style={[styles.td, { width: 22 }]}>{idx + 1}</Text>
              <Text style={[styles.tdLeft, { width: 90, fontWeight: row ? 600 : 400 }]}>{row?.name || ''}</Text>
              <Text style={[styles.tdLeft, { width: 90 }]}>{row?.institution || ''}</Text>
              <Text style={[styles.tdLeft, { width: 60 }]}>{row?.responsibilityGov || ''}</Text>
              <Text style={[styles.tdLeft, { width: 60 }]}>{row?.responsibilityCom || ''}</Text>
              <Text style={[styles.td, { width: 52 }]}>
                {row && row.s10 > 0 ? row.s10.toFixed(1) : (row ? '-' : '')}
              </Text>
              <Text style={[styles.td, { width: 58 }]}>
                {row && row.s20 > 0 ? row.s20.toFixed(1) : (row ? '-' : '')}
              </Text>
              <Text style={[styles.td, { width: 80 }]}>
                {row && row.s70 > 0 ? row.s70.toFixed(1) : (row ? '-' : '')}
              </Text>
              <Text style={[styles.tdBold, { width: 52 }]}>
                {row && row.f100 > 0 ? row.f100.toFixed(1) : (row ? '-' : '')}
              </Text>
              <Text style={[styles.td, { width: 56, borderRight: 'none', fontWeight: 600 }]}>
                {row?.grade || ''}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
