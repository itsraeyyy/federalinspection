import * as XLSX from 'xlsx';
import { FormSchema } from '@/components/dashboard/forms/FormTableRenderer';

// ----------------------------------------------------------------------
// EXCEL EXPORTS
// ----------------------------------------------------------------------

export function exportRegionToExcel(
  regionName: string,
  year: number,
  period: string,
  formsData: any,
  schemas: FormSchema[]
) {
  const wb = XLSX.utils.book_new();

  schemas.forEach((schema) => {
    const data = formsData?.[schema.id] || {};
    
    // Create rows for this form
    const rows: any[] = [];
    
    // Title Rows
    const titleRow = [`የ ${regionName} ክልል ${year} ${period} ሪፖርት`];
    const subtitleRow = [`ቅፅ: ${schema.table_title}`];
    
    rows.push(titleRow);
    rows.push(subtitleRow);
    rows.push([]); // empty row
    
    // Header Row 1
    const header1 = ["ዝርዝር (Category)"];
    schema.columns.forEach(col => {
      if (col.subKeys.length > 0) {
        col.subKeys.forEach(() => header1.push(col.key));
      } else {
        header1.push(col.key);
      }
    });
    rows.push(header1);

    // Header Row 2
    const header2 = [""];
    schema.columns.forEach(col => {
      if (col.subKeys.length > 0) {
        col.subKeys.forEach(sub => header2.push(sub));
      } else {
        header2.push("መረጃ (Data)");
      }
    });
    rows.push(header2);

    // Data Row
    const dataRow = ["-"];
    schema.columns.forEach(col => {
      if (col.subKeys.length > 0) {
        col.subKeys.forEach(sub => {
          dataRow.push(data[col.key]?.[sub] || "-");
        });
      } else {
        dataRow.push(data[col.key] || "-");
      }
    });
    rows.push(dataRow);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    
    // Add merges for titles
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(header1.length - 1, 1) } });
    ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: Math.max(header1.length - 1, 1) } });

    // Set column widths
    const cols = [{ wch: 30 }];
    for (let i = 1; i < header1.length; i++) {
      cols.push({ wch: 15 });
    }
    ws['!cols'] = cols;

    let sheetName = schema.id.replace('form_', 'Form ');
    if (sheetName.length > 31) sheetName = sheetName.substring(0, 31); // Excel limit
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const fileName = `የ_${regionName}_${year}_${period}_ሪፖርት.xlsx`.replace(/[\/\\]/g, '_');
  XLSX.writeFile(wb, fileName);
}

export function exportAggregatedToExcel(
  year: number,
  period: string,
  reports: any[],
  schemas: FormSchema[]
) {
  const wb = XLSX.utils.book_new();
  
  // All 14 known regions for aggregation, or dynamically extract
  const regions = [
    "ኦሮሚያ", "አማራ", "ሶማሌ", "አፋር", "ቤንሻንጉል ጉሙዝ", "ጋምቤላ", 
    "ሀረሪ", "ሲዳማ", "ደቡብ ምዕራብ ኢትዮጵያ", "ደቡብ ኢትዮጵያ", "ማዕከላዊ ኢትዮጵያ", 
    "አዲስ አበባ", "ድሬዳዋ", "ፌዴራል"
  ];

  schemas.forEach((schema) => {
    const rows: any[] = [];
    
    // Title Rows
    const titleRow = [`የ ${year} ${period} የተጠቃለለ አሃዛዊ አፈጻጸም ሪፖርት`];
    const subtitleRow = [`ቅፅ: ${schema.table_title}`];
    
    rows.push(titleRow);
    rows.push(subtitleRow);
    rows.push([]); // empty row

    // Header Row 1
    const header1 = ["ክልል (Region)"];
    schema.columns.forEach(col => {
      if (col.subKeys.length > 0) {
        col.subKeys.forEach(() => header1.push(col.key));
      } else {
        header1.push(col.key);
      }
    });
    rows.push(header1);

    // Header Row 2
    const header2 = [""];
    schema.columns.forEach(col => {
      if (col.subKeys.length > 0) {
        col.subKeys.forEach(sub => header2.push(sub));
      } else {
        header2.push("መረጃ (Data)");
      }
    });
    rows.push(header2);

    // Initialize Totals array
    const totals: (number | string)[] = new Array(header1.length).fill(0);
    totals[0] = "ጠቅላላ ድምር";

    // Add each region's data
    regions.forEach(region => {
      const regionRow = [region];
      const regionReport = reports.find(r => r.region === region);
      const data = regionReport?.forms_data?.[schema.id] || {};

      let colIndex = 1;
      schema.columns.forEach(col => {
        if (col.subKeys.length > 0) {
          col.subKeys.forEach(sub => {
            const val = data[col.key]?.[sub];
            regionRow.push(val || "-");
            if (!isNaN(Number(val)) && val !== undefined && val !== "") {
              totals[colIndex] = (totals[colIndex] as number) + Number(val);
            }
            colIndex++;
          });
        } else {
          const val = data[col.key];
          regionRow.push(val || "-");
          if (!isNaN(Number(val)) && val !== undefined && val !== "") {
            totals[colIndex] = (totals[colIndex] as number) + Number(val);
          }
          colIndex++;
        }
      });
      rows.push(regionRow);
    });

    // Clean up totals (if a column had no numbers, keep it as empty or "-")
    for (let i = 1; i < totals.length; i++) {
      if (totals[i] === 0) {
        let hasValue = false;
        // check if any row had a value (offset by 5 rows due to titles and headers)
        for(let r=5; r<rows.length; r++) {
          if (rows[r][i] !== "-") hasValue = true;
        }
        if (!hasValue) totals[i] = "-";
      }
    }
    rows.push(totals);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    
    // Add merges for titles
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(header1.length - 1, 1) } });
    ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: Math.max(header1.length - 1, 1) } });

    // Set column widths
    const cols = [{ wch: 25 }];
    for (let i = 1; i < header1.length; i++) {
      cols.push({ wch: 15 });
    }
    ws['!cols'] = cols;

    let sheetName = schema.id.replace('form_', 'Form ');
    if (sheetName.length > 31) sheetName = sheetName.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const fileName = `የ_${year}_${period}_የተጠቃለለ_አሃዛዊ_አፈጻጸም_ሪፖርት.xlsx`.replace(/ /g, '_');
  XLSX.writeFile(wb, fileName);
}

// ----------------------------------------------------------------------
// WORD EXPORTS (HTML BLOB)
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// WORD & PDF HTML HELPERS
// ----------------------------------------------------------------------

function generateHTMLDocument(title: string, contentHTML: string, isLandscape: boolean = true) {
  return `<!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @page {
          size: A4 ${isLandscape ? 'landscape' : 'portrait'};
          margin: 8mm;
        }
        @media print {
          @page {
            size: A4 ${isLandscape ? 'landscape' : 'portrait'};
            margin: 8mm;
          }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        body {
          font-family: "Nyala", "Abyssinica SIL", "Noto Sans Ethiopic", "Segoe UI", Arial, sans-serif;
          font-size: 8.5pt;
          line-height: 1.3;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 10px;
        }
        .report-header { text-align: center; margin-bottom: 16px; }
        .report-title { font-size: 14pt; font-weight: bold; margin-bottom: 4px; color: #0f172a; }
        .report-subtitle { font-size: 10.5pt; margin-bottom: 12px; color: #475569; }
        .form-title {
          font-size: 10pt;
          font-weight: bold;
          margin-top: 16px;
          margin-bottom: 8px;
          text-align: left;
          background-color: #f1f5f9;
          padding: 6px 10px;
          border-left: 4px solid #0284c7;
          color: #0f172a;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 20px;
          page-break-inside: auto;
          table-layout: auto;
        }
        tr { page-break-inside: avoid; page-break-after: auto; }
        thead { display: table-header-group; }
        th, td {
          border: 1px solid #475569;
          padding: 4px 5px;
          text-align: center;
          vertical-align: middle;
          font-size: 8pt;
          word-break: normal;
        }
        th { background-color: #f8fafc; font-weight: bold; color: #0f172a; }
        .region-name, .category-name {
          text-align: left;
          font-weight: 600;
          white-space: nowrap !important;
          padding-left: 8px;
          padding-right: 8px;
        }
        .num-cell {
          white-space: nowrap !important;
          word-break: keep-all !important;
        }
        .totals-row {
          font-weight: bold;
          background-color: #e0f2fe;
          color: #0369a1;
        }
        .totals-row td {
          border-top: 2px solid #0284c7;
          border-bottom: 2px solid #0284c7;
        }
        .text-left { text-align: left; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      ${contentHTML}
    </body>
    </html>
  `;
}

function downloadWordDoc(htmlContent: string, fileName: string) {
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function openPrintPDFWindow(htmlContent: string) {
  if (typeof window === 'undefined') return;
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }
}

async function downloadHTMLAsPDF(htmlContent: string, fileName: string) {
  if (typeof window === 'undefined') return;

  const pdfFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  // Create temporary top overlay so html2canvas renders the table fully
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '999999';
  overlay.style.backgroundColor = '#ffffff';
  overlay.style.overflow = 'auto';
  overlay.style.padding = '20px';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';

  const statusMsg = document.createElement('div');
  statusMsg.style.marginBottom = '12px';
  statusMsg.style.fontFamily = 'sans-serif';
  statusMsg.style.fontSize = '14px';
  statusMsg.style.fontWeight = '600';
  statusMsg.style.color = '#0284c7';
  statusMsg.innerText = 'PDF በመዘጋጀት ላይ ነው... እባክዎ ትንሽ ይጠብቁ (Generating PDF, please wait...)';
  overlay.appendChild(statusMsg);

  const container = document.createElement('div');
  container.style.width = '1120px';
  container.style.backgroundColor = '#ffffff';
  container.innerHTML = htmlContent;
  overlay.appendChild(container);

  document.body.appendChild(overlay);

  // Allow DOM & styles to settle
  await new Promise((resolve) => setTimeout(resolve, 350));

  try {
    const html2pdf = (await import('html2pdf.js')).default;
    const opt = {
      margin: 8 as number | [number, number, number, number],
      filename: pdfFileName,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1120
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'landscape' as const },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    await html2pdf().set(opt).from(container).save();
  } catch (error) {
    console.error('html2pdf export error, using fallback print window:', error);
    openPrintPDFWindow(htmlContent);
  } finally {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  }
}

// HTML Generators for Region & Aggregated Reports
export function generateRegionHTMLContent(
  regionName: string,
  year: number,
  period: string,
  formsData: any,
  schemas: FormSchema[]
): string {
  let content = `
    <div class="report-header">
      <div class="report-title">የ ${regionName} ክልል አሃዛዊ ሪፖርት</div>
      <div class="report-subtitle">በጀት ዓመት: ${year} | የሪፖርት ጊዜ: ${period}</div>
    </div>
  `;

  schemas.forEach((schema, index) => {
    const data = formsData?.[schema.id] || {};
    const totalSubCols = schema.columns.reduce((acc, col) => acc + (col.subKeys.length > 0 ? col.subKeys.length : 1), 0);
    const denseStyle = totalSubCols > 12 ? 'style="font-size: 7.5pt;"' : '';
    
    content += `<div class="form-title">ቅፅ: ${schema.table_title}</div>`;
    content += `<table ${denseStyle}>`;
    
    // Header Row 1
    content += `<tr><th class="region-name">ዝርዝር (Category)</th>`;
    schema.columns.forEach(col => {
      const colspan = col.subKeys.length > 0 ? col.subKeys.length : 1;
      content += `<th colspan="${colspan}">${col.key}</th>`;
    });
    content += `</tr>`;

    // Header Row 2
    content += `<tr><th></th>`;
    schema.columns.forEach(col => {
      if (col.subKeys.length > 0) {
        col.subKeys.forEach(sub => content += `<th>${sub}</th>`);
      } else {
        content += `<th>መረጃ (Data)</th>`;
      }
    });
    content += `</tr>`;

    // Data Row
    content += `<tr><td class="region-name">-</td>`;
    schema.columns.forEach(col => {
      if (col.subKeys.length > 0) {
        col.subKeys.forEach(sub => {
          content += `<td class="num-cell">${data[col.key]?.[sub] || "-"}</td>`;
        });
      } else {
        content += `<td class="num-cell">${data[col.key] || "-"}</td>`;
      }
    });
    content += `</tr>`;

    content += `</table>`;
    if (index < schemas.length - 1) {
      content += `<div class="page-break"></div>`;
    }
  });

  return content;
}

export function generateAggregatedHTMLContent(
  year: number,
  period: string,
  reports: any[],
  schemas: FormSchema[]
): string {
  let content = `
    <div class="report-header">
      <div class="report-title">የ ${year} ${period} የተጠቃለለ አሃዛዊ አፈጻጸም ሪፖርት</div>
    </div>
  `;
  
  const regions = [
    "ኦሮሚያ", "አማራ", "ሶማሌ", "አፋር", "ቤንሻንጉል ጉሙዝ", "ጋምቤላ", 
    "ሀረሪ", "ሲዳማ", "ደቡብ ምዕራብ ኢትዮጵያ", "ደቡብ ኢትዮጵያ", "ማዕከላዊ ኢትዮጵያ", 
    "አዲስ አበባ", "ድሬዳዋ", "ፌዴራል"
  ];

  schemas.forEach((schema, index) => {
    const totalSubCols = schema.columns.reduce((acc, col) => acc + (col.subKeys.length > 0 ? col.subKeys.length : 1), 0);
    const denseStyle = totalSubCols > 12 ? 'style="font-size: 7.5pt;"' : '';

    content += `<div class="form-title">ቅፅ: ${schema.table_title}</div>`;
    content += `<table ${denseStyle}>`;
    
    // Header Row 1
    content += `<tr><th class="region-name">ክልል (Region)</th>`;
    schema.columns.forEach(col => {
      const colspan = col.subKeys.length > 0 ? col.subKeys.length : 1;
      content += `<th colspan="${colspan}">${col.key}</th>`;
    });
    content += `</tr>`;

    // Header Row 2
    content += `<tr><th></th>`;
    let colCount = 1;
    schema.columns.forEach(col => {
      if (col.subKeys.length > 0) {
        col.subKeys.forEach(sub => {
          content += `<th>${sub}</th>`;
          colCount++;
        });
      } else {
        content += `<th>መረጃ (Data)</th>`;
        colCount++;
      }
    });
    content += `</tr>`;

    const totals: (number | string)[] = new Array(colCount).fill(0);
    const hasValueInCol: boolean[] = new Array(colCount).fill(false);
    totals[0] = "ጠቅላላ ድምር";

    regions.forEach(region => {
      const regionReport = reports.find(r => r.region === region);
      const data = regionReport?.forms_data?.[schema.id] || {};

      content += `<tr><td class="region-name">${region}</td>`;
      let colIndex = 1;
      schema.columns.forEach(col => {
        if (col.subKeys.length > 0) {
          col.subKeys.forEach(sub => {
            const val = data[col.key]?.[sub];
            content += `<td class="num-cell">${val !== undefined && val !== "" ? val : "-"}</td>`;
            if (!isNaN(Number(val)) && val !== undefined && val !== "") {
              totals[colIndex] = (totals[colIndex] as number) + Number(val);
              hasValueInCol[colIndex] = true;
            }
            colIndex++;
          });
        } else {
          const val = data[col.key];
          content += `<td class="num-cell">${val !== undefined && val !== "" ? val : "-"}</td>`;
          if (!isNaN(Number(val)) && val !== undefined && val !== "") {
            totals[colIndex] = (totals[colIndex] as number) + Number(val);
            hasValueInCol[colIndex] = true;
          }
          colIndex++;
        }
      });
      content += `</tr>`;
    });

    // Totals Row
    content += `<tr class="totals-row">`;
    for (let i = 0; i < totals.length; i++) {
      if (i === 0) {
        content += `<td class="region-name">${totals[0]}</td>`;
      } else {
        const displayVal = hasValueInCol[i] ? totals[i] : '-';
        content += `<td class="num-cell">${displayVal}</td>`;
      }
    }
    content += `</tr>`;

    content += `</table>`;
    if (index < schemas.length - 1) {
      content += `<div class="page-break"></div>`;
    }
  });

  return content;
}

export function generateNarrationHTMLContent(
  regionName: string,
  year: number,
  period: string,
  narrationData: any
): string {
  let content = `
    <div class="report-header">
      <div class="report-title">የ ${regionName} ክልል የጽሁፍ ሪፖርት</div>
      <div class="report-subtitle">በጀት ዓመት: ${year} | የሪፖርት ጊዜ: ${period}</div>
    </div>
    <div class="form-title">የጽሁፍ ሪፖርት (Narration Report)</div>
    <div style="margin-top: 15px; line-height: 1.6;">
  `;

  if (narrationData?.html) {
    content += narrationData.html;
  } else if (narrationData?.text && typeof narrationData.text === 'string' && narrationData.text.trim() !== '') {
    const formattedText = narrationData.text.replace(/\n/g, '<br/>');
    content += `<p>${formattedText}</p>`;
  } else if (typeof narrationData === 'string' && narrationData.trim() !== '') {
    content += `<p>${narrationData}</p>`;
  } else {
    content += `<p><em>ምንም የጽሁፍ ሪፖርት አልቀረበም (No narration report provided)</em></p>`;
  }

  if (narrationData?.attachment_url) {
    content += `
      <div style="margin-top: 30px; padding: 12px; border: 1px solid #cbd5e1; background-color: #f8fafc; rounded: 8px;">
        <strong>ተጨማሪ ፋይል (Attachment):</strong> 
        <a href="${narrationData.attachment_url}">${narrationData.attachment_name || 'ፋይል አውርድ (Download File)'}</a>
      </div>
    `;
  }

  content += `</div>`;
  return content;
}

// Export Word Functions
export function exportRegionToWord(
  regionName: string,
  year: number,
  period: string,
  formsData: any,
  schemas: FormSchema[]
) {
  const htmlContent = generateRegionHTMLContent(regionName, year, period, formsData, schemas);
  const docHTML = generateHTMLDocument(`የ ${regionName} ሪፖርት`, htmlContent, true);
  downloadWordDoc(docHTML, `የ_${regionName}_${year}_${period}_ሪፖርት.doc`.replace(/[\/\\]/g, '_'));
}

export function exportNarrationToWord(
  regionName: string,
  year: number,
  period: string,
  narrationData: any
) {
  const htmlContent = generateNarrationHTMLContent(regionName, year, period, narrationData);
  const docHTML = generateHTMLDocument(`የ ${regionName} የጽሁፍ ሪፖርት`, htmlContent, false);
  downloadWordDoc(docHTML, `የ_${regionName}_${year}_${period}_የጽሁፍ_ሪፖርት.doc`.replace(/[\/\\]/g, '_'));
}

export function exportAggregatedToWord(
  year: number,
  period: string,
  reports: any[],
  schemas: FormSchema[]
) {
  const htmlContent = generateAggregatedHTMLContent(year, period, reports, schemas);
  const docHTML = generateHTMLDocument(`የ ${year} ${period} የተጠቃለለ አሃዛዊ አፈጻጸም ሪፖርት`, htmlContent, true);
  downloadWordDoc(docHTML, `የ_${year}_${period}_የተጠቃለለ_አሃዛዊ_አፈጻጸም_ሪፖርት.doc`.replace(/ /g, '_'));
}

// Export PDF Functions
export async function exportRegionToPDF(
  regionName: string,
  year: number,
  period: string,
  formsData: any,
  schemas: FormSchema[]
) {
  const htmlContent = generateRegionHTMLContent(regionName, year, period, formsData, schemas);
  const docHTML = generateHTMLDocument(`የ ${regionName} ሪፖርት`, htmlContent, true);
  await downloadHTMLAsPDF(docHTML, `የ_${regionName}_${year}_${period}_ሪፖርት.pdf`.replace(/[\/\\]/g, '_'));
}

export async function exportNarrationToPDF(
  regionName: string,
  year: number,
  period: string,
  narrationData: any
) {
  const htmlContent = generateNarrationHTMLContent(regionName, year, period, narrationData);
  const docHTML = generateHTMLDocument(`የ ${regionName} የጽሁፍ ሪፖርት`, htmlContent, false);
  await downloadHTMLAsPDF(docHTML, `የ_${regionName}_${year}_${period}_የጽሁፍ_ሪፖርት.pdf`.replace(/[\/\\]/g, '_'));
}

export async function exportAggregatedToPDF(
  year: number,
  period: string,
  reports: any[],
  schemas: FormSchema[]
) {
  const htmlContent = generateAggregatedHTMLContent(year, period, reports, schemas);
  const docHTML = generateHTMLDocument(`የ ${year} ${period} የተጠቃለለ አሃዛዊ አፈጻጸም ሪፖርት`, htmlContent, true);
  await downloadHTMLAsPDF(docHTML, `የ_${year}_${period}_የተጠቃለለ_አሃዛዊ_አፈጻጸም_ሪፖርት.pdf`.replace(/ /g, '_'));
}

// Print / Save as PDF Window Functions (Vector PDF Output)
export function printRegionPDF(
  regionName: string,
  year: number,
  period: string,
  formsData: any,
  schemas: FormSchema[]
) {
  const htmlContent = generateRegionHTMLContent(regionName, year, period, formsData, schemas);
  const docHTML = generateHTMLDocument(`የ ${regionName} ሪፖርት`, htmlContent, true);
  openPrintPDFWindow(docHTML);
}

export function printAggregatedPDF(
  year: number,
  period: string,
  reports: any[],
  schemas: FormSchema[]
) {
  const htmlContent = generateAggregatedHTMLContent(year, period, reports, schemas);
  const docHTML = generateHTMLDocument(`የ ${year} ${period} የተጠቃለለ አሃዛዊ አፈጻጸም ሪፖርት`, htmlContent, true);
  openPrintPDFWindow(docHTML);
}

export function printNarrationPDF(
  regionName: string,
  year: number,
  period: string,
  narrationData: any
) {
  const htmlContent = generateNarrationHTMLContent(regionName, year, period, narrationData);
  const docHTML = generateHTMLDocument(`የ ${regionName} የጽሁፍ ሪፖርት`, htmlContent, false);
  openPrintPDFWindow(docHTML);
}

