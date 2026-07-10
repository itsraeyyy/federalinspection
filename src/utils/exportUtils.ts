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

function generateHTMLDocument(title: string, contentHTML: string) {
  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: "Nyala", "Abyssinica SIL", Arial, sans-serif; font-size: 11pt; padding: 20px; }
        .report-header { text-align: center; margin-bottom: 20px; }
        .report-title { font-size: 18pt; font-weight: bold; margin-bottom: 5px; }
        .report-subtitle { font-size: 14pt; margin-bottom: 20px; }
        .form-title { font-size: 12pt; font-weight: bold; margin-top: 20px; margin-bottom: 10px; text-align: left; background-color: #f8f9fa; padding: 5px; border-left: 4px solid #000; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid black; padding: 6px; text-align: center; vertical-align: middle; }
        th { background-color: #f2f2f2; font-weight: bold; }
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

export function exportRegionToWord(
  regionName: string,
  year: number,
  period: string,
  formsData: any,
  schemas: FormSchema[]
) {
  let content = `
    <div class="report-header">
      <div class="report-title">የ ${regionName} ክልል ሪፖርት</div>
      <div class="report-subtitle">በጀት ዓመት: ${year} | የሪፖርት ጊዜ: ${period}</div>
    </div>
  `;

  schemas.forEach((schema, index) => {
    const data = formsData?.[schema.id] || {};
    
    content += `<div class="form-title">ቅፅ: ${schema.table_title}</div>`;
    content += `<table>`;
    
    // Header Row 1
    content += `<tr><th class="text-left">ዝርዝር (Category)</th>`;
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
    content += `<tr><td class="text-left">-</td>`;
    schema.columns.forEach(col => {
      if (col.subKeys.length > 0) {
        col.subKeys.forEach(sub => {
          content += `<td>${data[col.key]?.[sub] || "-"}</td>`;
        });
      } else {
        content += `<td>${data[col.key] || "-"}</td>`;
      }
    });
    content += `</tr>`;

    content += `</table>`;
    if (index < schemas.length - 1) {
      content += `<div class="page-break"></div>`;
    }
  });

  const docHTML = generateHTMLDocument(`የ ${regionName} ሪፖርት`, content);
  downloadWordDoc(docHTML, `የ_${regionName}_${year}_${period}_ሪፖርት.doc`.replace(/[\/\\]/g, '_'));
}

export function exportNarrationToWord(
  regionName: string,
  year: number,
  period: string,
  narrationData: any
) {
  let content = `
    <div class="report-header">
      <div class="report-title">የ ${regionName} ክልል የጽሁፍ ሪፖርት</div>
      <div class="report-subtitle">በጀት ዓመት: ${year} | የሪፖርት ጊዜ: ${period}</div>
    </div>
    <div class="form-title">የጽሁፍ ሪፖርት (Narration Report)</div>
    <div style="margin-top: 15px;">
  `;

  if (narrationData?.html) {
    content += narrationData.html;
  } else if (narrationData?.text && typeof narrationData.text === 'string' && narrationData.text.trim() !== '') {
    // Replace newlines with <br> for word
    const formattedText = narrationData.text.replace(/\n/g, '<br/>');
    content += `<p>${formattedText}</p>`;
  } else if (typeof narrationData === 'string' && narrationData.trim() !== '') {
    content += `<p>${narrationData}</p>`;
  } else {
    content += `<p><em>ምንም የጽሁፍ ሪፖርት አልቀረበም (No narration report provided)</em></p>`;
  }

  if (narrationData?.attachment_url) {
    content += `
      <div style="margin-top: 30px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;">
        <strong>ተጨማሪ ፋይል (Attachment):</strong> 
        <a href="${narrationData.attachment_url}">${narrationData.attachment_name || 'ፋይል አውርድ (Download File)'}</a>
      </div>
    `;
  }

  content += `</div>`;

  const docHTML = generateHTMLDocument(`የ ${regionName} የጽሁፍ ሪፖርት`, content);
  downloadWordDoc(docHTML, `የ_${regionName}_${year}_${period}_የጽሁፍ_ሪፖርት.doc`.replace(/[\/\\]/g, '_'));
}

export function exportAggregatedToWord(
  year: number,
  period: string,
  reports: any[],
  schemas: FormSchema[]
) {
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
    content += `<div class="form-title">ቅፅ: ${schema.table_title}</div>`;
    content += `<table>`;
    
    // Header Row 1
    content += `<tr><th class="text-left">ክልል (Region)</th>`;
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
    totals[0] = "ጠቅላላ ድምር";

    regions.forEach(region => {
      const regionReport = reports.find(r => r.region === region);
      const data = regionReport?.forms_data?.[schema.id] || {};

      content += `<tr><td class="text-left">${region}</td>`;
      let colIndex = 1;
      schema.columns.forEach(col => {
        if (col.subKeys.length > 0) {
          col.subKeys.forEach(sub => {
            const val = data[col.key]?.[sub];
            content += `<td>${val || "-"}</td>`;
            if (!isNaN(Number(val)) && val !== undefined && val !== "") {
              totals[colIndex] = (totals[colIndex] as number) + Number(val);
            }
            colIndex++;
          });
        } else {
          const val = data[col.key];
          content += `<td>${val || "-"}</td>`;
          if (!isNaN(Number(val)) && val !== undefined && val !== "") {
            totals[colIndex] = (totals[colIndex] as number) + Number(val);
          }
          colIndex++;
        }
      });
      content += `</tr>`;
    });

    // Totals Row
    content += `<tr style="font-weight:bold; background-color: #f9f9f9;">`;
    for(let i = 0; i < totals.length; i++) {
      if (i > 0 && totals[i] === 0) {
        let hasValue = false;
        // determine if this column had any values at all by checking report forms_data (a bit complex for Word, simply keep as 0 or format it)
        // Since we don't have the rows array, we just show 0 or - based on our check. 
        // For simplicity, we'll keep 0 if it was actually calculated as 0 from nothing.
        // Actually, let's keep 0 as "-" if it remained untouched.
        content += `<td>-</td>`; 
      } else {
        content += `<td ${i === 0 ? 'class="text-left"' : ''}>${totals[i] === 0 && i !== 0 ? '-' : totals[i]}</td>`;
      }
    }
    content += `</tr>`;

    content += `</table>`;
    if (index < schemas.length - 1) {
      content += `<div class="page-break"></div>`;
    }
  });

  const docHTML = generateHTMLDocument(`የ ${year} ${period} የተጠቃለለ አሃዛዊ አፈጻጸም ሪፖርት`, content);
  downloadWordDoc(docHTML, `የ_${year}_${period}_የተጠቃለለ_አሃዛዊ_አፈጻጸም_ሪፖርት.doc`.replace(/ /g, '_'));
}
