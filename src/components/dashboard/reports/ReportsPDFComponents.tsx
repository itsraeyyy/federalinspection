'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { FormSchema } from '@/components/dashboard/forms/FormTableRenderer';

// Register Benaiah font (Ethiopic Unicode font bundled in /public/Benaiah.ttf)
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
    color: '#0f172a',
  },
  header: {
    marginBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 3,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    color: '#475569',
    marginBottom: 8,
  },
  formContainer: {
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    backgroundColor: '#f1f5f9',
    padding: '4pt 6pt',
    marginBottom: 4,
    borderLeft: '3pt solid #0284c7',
    color: '#0f172a',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#475569',
  },
  headerRow1: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
  },
  headerRow2: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    minHeight: 16,
  },
  totalsRow: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    borderTopWidth: 1,
    borderTopColor: '#0284c7',
    minHeight: 18,
  },
  th: {
    borderRightWidth: 1,
    borderRightColor: '#475569',
    padding: '3pt 2pt',
    fontWeight: 700,
    textAlign: 'center',
  },
  td: {
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
    padding: '2pt 2pt',
    textAlign: 'center',
  },
  tdLeft: {
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
    padding: '2pt 4pt',
    textAlign: 'left',
    fontWeight: 600,
  },
  tdTotals: {
    borderRightWidth: 1,
    borderRightColor: '#0284c7',
    padding: '2pt 2pt',
    fontWeight: 700,
    textAlign: 'center',
    color: '#0369a1',
  },
});

const ALL_REGIONS = [
  'ኦሮሚያ', 'አማራ', 'ሶማሌ', 'አፋር', 'ቤንሻንጉል ጉሙዝ', 'ጋምቤላ', 
  'ሀረሪ', 'ሲዳማ', 'ደቡብ ምዕራብ ኢትዮጵያ', 'ደቡብ ኢትዮጵያ', 'ማዕከላዊ ኢትዮጵያ', 
  'አዲስ አበባ', 'ድሬዳዋ', 'ፌዴራል'
];

interface AggregatedReportPDFProps {
  year: number;
  period: string;
  reports: any[];
  schemas: FormSchema[];
}

export function AggregatedReportPDF({ year, period, reports, schemas }: AggregatedReportPDFProps) {
  const PRINTABLE_WIDTH = 801.89; // A4 Landscape width (841.89) minus 40pt padding

  return (
    <Document title={`Aggregated Report ${year} ${period}`} author="Federal Inspection">
      {schemas.map((schema) => {
        const totalSubCols = schema.columns.reduce(
          (acc, col) => acc + (col.subKeys.length > 0 ? col.subKeys.length : 1),
          0
        );

        const regionColWidth = 85;
        const remainingWidth = PRINTABLE_WIDTH - regionColWidth;
        const cellWidth = Math.max(remainingWidth / Math.max(totalSubCols, 1), 25);
        const fontSize = totalSubCols > 14 ? 6 : totalSubCols > 10 ? 6.5 : 7.5;

        // Calculate Totals per cell index
        const colTotals: (number | string)[] = new Array(totalSubCols).fill(0);
        const colHasValue: boolean[] = new Array(totalSubCols).fill(false);

        ALL_REGIONS.forEach((region) => {
          const regionReport = reports.find((r) => r.region === region);
          const data = regionReport?.forms_data?.[schema.id] || {};
          let cIdx = 0;

          schema.columns.forEach((col) => {
            if (col.subKeys.length > 0) {
              col.subKeys.forEach((sub) => {
                const val = data[col.key]?.[sub];
                if (!isNaN(Number(val)) && val !== undefined && val !== '') {
                  colTotals[cIdx] = (colTotals[cIdx] as number) + Number(val);
                  colHasValue[cIdx] = true;
                }
                cIdx++;
              });
            } else {
              const val = data[col.key];
              if (!isNaN(Number(val)) && val !== undefined && val !== '') {
                colTotals[cIdx] = (colTotals[cIdx] as number) + Number(val);
                colHasValue[cIdx] = true;
              }
              cIdx++;
            }
          });
        });

        return (
          <Page key={schema.id} size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>{`የ ${year} ${period} የተጠቃለለ አሃዛዊ አፈጻጸም ሪፖርት`}</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>{`ቅፅ: ${schema.table_title}`}</Text>

              <View style={styles.table}>
                {/* Header Row 1 */}
                <View style={styles.headerRow1}>
                  <Text style={[styles.th, { width: regionColWidth, fontSize, textAlign: 'left', paddingLeft: 4 }]}>
                    {'ክልል (Region)'}
                  </Text>
                  {schema.columns.map((col, idx) => {
                    const numSubs = col.subKeys.length > 0 ? col.subKeys.length : 1;
                    const w = numSubs * cellWidth;
                    const isLast = idx === schema.columns.length - 1;
                    return (
                      <Text
                        key={idx}
                        style={[styles.th, { width: w, fontSize, borderRightWidth: isLast ? 0 : 1 }]}
                      >
                        {col.key}
                      </Text>
                    );
                  })}
                </View>

                {/* Header Row 2 */}
                <View style={styles.headerRow2}>
                  <Text style={[styles.th, { width: regionColWidth, fontSize }]}>{''}</Text>
                  {(() => {
                    let totalRendered = 0;
                    return schema.columns.map((col) => {
                      if (col.subKeys.length > 0) {
                        return col.subKeys.map((sub, sIdx) => {
                          totalRendered++;
                          const isLast = totalRendered === totalSubCols;
                          return (
                            <Text
                              key={`${col.key}-${sIdx}`}
                              style={[styles.th, { width: cellWidth, fontSize, borderRightWidth: isLast ? 0 : 1 }]}
                            >
                              {sub}
                            </Text>
                          );
                        });
                      } else {
                        totalRendered++;
                        const isLast = totalRendered === totalSubCols;
                        return (
                          <Text
                            key={col.key}
                            style={[styles.th, { width: cellWidth, fontSize, borderRightWidth: isLast ? 0 : 1 }]}
                          >
                            {'መረጃ'}
                          </Text>
                        );
                      }
                    });
                  })()}
                </View>

                {/* Data Rows */}
                {ALL_REGIONS.map((region) => {
                  const regionReport = reports.find((r) => r.region === region);
                  const data = regionReport?.forms_data?.[schema.id] || {};
                  let totalRendered = 0;

                  return (
                    <View key={region} style={styles.dataRow}>
                      <Text style={[styles.tdLeft, { width: regionColWidth, fontSize }]}>{region}</Text>
                      {schema.columns.map((col) => {
                        if (col.subKeys.length > 0) {
                          return col.subKeys.map((sub, sIdx) => {
                            totalRendered++;
                            const isLast = totalRendered === totalSubCols;
                            const val = data[col.key]?.[sub];
                            return (
                              <Text
                                key={`${col.key}-${sIdx}`}
                                style={[styles.td, { width: cellWidth, fontSize, borderRightWidth: isLast ? 0 : 1 }]}
                              >
                                {val !== undefined && val !== '' ? String(val) : '-'}
                              </Text>
                            );
                          });
                        } else {
                          totalRendered++;
                          const isLast = totalRendered === totalSubCols;
                          const val = data[col.key];
                          return (
                            <Text
                              key={col.key}
                              style={[styles.td, { width: cellWidth, fontSize, borderRightWidth: isLast ? 0 : 1 }]}
                            >
                              {val !== undefined && val !== '' ? String(val) : '-'}
                            </Text>
                          );
                        }
                      })}
                    </View>
                  );
                })}

                {/* Totals Row */}
                <View style={styles.totalsRow}>
                  <Text style={[styles.tdLeft, { width: regionColWidth, fontSize, color: '#0369a1' }]}>
                    {'ጠቅላላ ድምር'}
                  </Text>
                  {colTotals.map((tot, idx) => {
                    const isLast = idx === totalSubCols - 1;
                    const displayVal = colHasValue[idx] ? String(tot) : '-';
                    return (
                      <Text
                        key={idx}
                        style={[styles.tdTotals, { width: cellWidth, fontSize, borderRightWidth: isLast ? 0 : 1 }]}
                      >
                        {displayVal}
                      </Text>
                    );
                  })}
                </View>
              </View>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

interface RegionReportPDFProps {
  regionName: string;
  year: number;
  period: string;
  formsData: any;
  schemas: FormSchema[];
}

export function RegionReportPDF({ regionName, year, period, formsData, schemas }: RegionReportPDFProps) {
  const PRINTABLE_WIDTH = 801.89;

  return (
    <Document title={`${regionName} Region Report`} author="Federal Inspection">
      {schemas.map((schema) => {
        const data = formsData?.[schema.id] || {};
        const totalSubCols = schema.columns.reduce(
          (acc, col) => acc + (col.subKeys.length > 0 ? col.subKeys.length : 1),
          0
        );

        const categoryColWidth = 110;
        const remainingWidth = PRINTABLE_WIDTH - categoryColWidth;
        const cellWidth = Math.max(remainingWidth / Math.max(totalSubCols, 1), 25);
        const fontSize = totalSubCols > 14 ? 6 : totalSubCols > 10 ? 6.5 : 7.5;

        return (
          <Page key={schema.id} size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>{`የ ${regionName} ክልል አሃዛዊ ሪፖርት`}</Text>
              <Text style={styles.subtitle}>{`በጀት ዓመት: ${year} | የሪፖርት ጊዜ: ${period}`}</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>{`ቅፅ: ${schema.table_title}`}</Text>

              <View style={styles.table}>
                {/* Header Row 1 */}
                <View style={styles.headerRow1}>
                  <Text style={[styles.th, { width: categoryColWidth, fontSize, textAlign: 'left', paddingLeft: 4 }]}>
                    {'ዝርዝር (Category)'}
                  </Text>
                  {schema.columns.map((col, idx) => {
                    const numSubs = col.subKeys.length > 0 ? col.subKeys.length : 1;
                    const w = numSubs * cellWidth;
                    const isLast = idx === schema.columns.length - 1;
                    return (
                      <Text
                        key={idx}
                        style={[styles.th, { width: w, fontSize, borderRightWidth: isLast ? 0 : 1 }]}
                      >
                        {col.key}
                      </Text>
                    );
                  })}
                </View>

                {/* Header Row 2 */}
                <View style={styles.headerRow2}>
                  <Text style={[styles.th, { width: categoryColWidth, fontSize }]}>{''}</Text>
                  {(() => {
                    let totalRendered = 0;
                    return schema.columns.map((col) => {
                      if (col.subKeys.length > 0) {
                        return col.subKeys.map((sub, sIdx) => {
                          totalRendered++;
                          const isLast = totalRendered === totalSubCols;
                          return (
                            <Text
                              key={`${col.key}-${sIdx}`}
                              style={[styles.th, { width: cellWidth, fontSize, borderRightWidth: isLast ? 0 : 1 }]}
                            >
                              {sub}
                            </Text>
                          );
                        });
                      } else {
                        totalRendered++;
                        const isLast = totalRendered === totalSubCols;
                        return (
                          <Text
                            key={col.key}
                            style={[styles.th, { width: cellWidth, fontSize, borderRightWidth: isLast ? 0 : 1 }]}
                          >
                            {'መረጃ'}
                          </Text>
                        );
                      }
                    });
                  })()}
                </View>

                {/* Data Row */}
                <View style={styles.dataRow}>
                  <Text style={[styles.tdLeft, { width: categoryColWidth, fontSize }]}>{'-'}</Text>
                  {(() => {
                    let totalRendered = 0;
                    return schema.columns.map((col) => {
                      if (col.subKeys.length > 0) {
                        return col.subKeys.map((sub, sIdx) => {
                          totalRendered++;
                          const isLast = totalRendered === totalSubCols;
                          const val = data[col.key]?.[sub];
                          return (
                            <Text
                              key={`${col.key}-${sIdx}`}
                              style={[styles.td, { width: cellWidth, fontSize, borderRightWidth: isLast ? 0 : 1 }]}
                            >
                              {val !== undefined && val !== '' ? String(val) : '-'}
                            </Text>
                          );
                        });
                      } else {
                        totalRendered++;
                        const isLast = totalRendered === totalSubCols;
                        const val = data[col.key];
                        return (
                          <Text
                            key={col.key}
                            style={[styles.td, { width: cellWidth, fontSize, borderRightWidth: isLast ? 0 : 1 }]}
                          >
                            {val !== undefined && val !== '' ? String(val) : '-'}
                          </Text>
                        );
                      }
                    });
                  })()}
                </View>
              </View>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

interface NarrationReportPDFProps {
  regionName: string;
  year: number;
  period: string;
  narrationData: any;
}

export function NarrationReportPDF({ regionName, year, period, narrationData }: NarrationReportPDFProps) {
  const textContent =
    narrationData?.text ||
    (typeof narrationData === 'string' ? narrationData : 'ምንም የጽሁፍ ሪፖርት አልቀረበም (No narration report provided)');

  return (
    <Document title={`${regionName} Narration Report`} author="Federal Inspection">
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{`የ ${regionName} ክልል የጽሁፍ ሪፖርት`}</Text>
          <Text style={styles.subtitle}>{`በጀት ዓመት: ${year} | የሪፖርት ጊዜ: ${period}`}</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{'የጽሁፍ ሪፖርት (Narration Report)'}</Text>
          <View style={{ padding: 10, backgroundColor: '#f8fafc', borderRadius: 4, marginTop: 8 }}>
            <Text style={{ fontSize: 9, lineHeight: 1.5, color: '#0f172a' }}>{textContent}</Text>
          </View>

          {narrationData?.attachment_name && (
            <View style={{ marginTop: 20, padding: 8, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#f1f5f9' }}>
              <Text style={{ fontSize: 8.5, fontWeight: 700 }}>
                {`ተጨማሪ ፋይል (Attachment): ${narrationData.attachment_name}`}
              </Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
