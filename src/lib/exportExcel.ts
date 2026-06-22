import { Complaint } from '@/types';

const STATUS_AM: Record<string, string> = {
  New: 'አዲስ',
  Processing: 'በሂደት ላይ',
  Resolved: 'የተፈታ',
  Rejected: 'ውድቅ የሆነ',
};

const TYPE_AM: Record<string, string> = {
  Suggestion: 'ጥቆማ',
  Complaint: 'አቤቱታ',
};

function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getResolutionTime(complaint: Complaint): string {
  if (!complaint.resolvedAt || !complaint.createdAt) return '-';
  const created = new Date(complaint.createdAt).getTime();
  const resolved = new Date(complaint.resolvedAt).getTime();
  const diffMs = resolved - created;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days > 0) return `${days} ቀን ${remainingHours} ሰዓት`;
  if (hours > 0) return `${hours} ሰዓት`;
  const minutes = Math.floor(diffMs / (1000 * 60));
  return `${minutes} ደቂቃ`;
}

export function exportComplaintsToExcel(complaints: Complaint[], filename?: string) {
  const headers = [
    'መለያ ቁጥር',
    'የክትትል ኮድ',
    'ዓይነት',
    'ሁኔታ',
    'ሙሉ ስም',
    'ስልክ',
    'ኢሜይል',
    'ዕድሜ',
    'ፆታ',
    'አድራሻ',
    'ተቋም',
    'ጭብጥ',
    'ዝርዝር መልዕክት',
    'የተጠየቀ መፍትሄ',
    'የቀረበበት ቀን',
    'ወደ ሂደት የገባበት',
    'የተፈታበት ቀን',
    'ያስፈታው',
    'የመፍትሄ ጊዜ',
    'የመፍትሄ መልዕክት',
    'ያያዥ ማስረጃዎች ብዛት',
  ];

  // Build XML spreadsheet (works in Excel without external deps)
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
  xml += '<Styles>\n';
  xml += '  <Style ss:ID="header"><Font ss:Bold="1" ss:Size="11"/><Interior ss:Color="#014BAA" ss:Pattern="Solid"/><Font ss:Color="#FFFFFF" ss:Bold="1"/></Style>\n';
  xml += '  <Style ss:ID="date"><NumberFormat ss:Format="yyyy-mm-dd hh:mm"/></Style>\n';
  xml += '  <Style ss:ID="wrap"><Alignment ss:WrapText="1" ss:Vertical="Top"/></Style>\n';
  xml += '</Styles>\n';
  xml += '<Worksheet ss:Name="ጥቆማ እና አቤቱታ">\n';
  xml += '<Table>\n';

  // Column widths
  const widths = [100, 130, 80, 90, 120, 110, 150, 50, 50, 120, 150, 200, 300, 200, 120, 120, 120, 100, 100, 300, 60];
  widths.forEach(w => {
    xml += `<Column ss:Width="${w}"/>\n`;
  });

  // Header row
  xml += '<Row ss:StyleID="header">\n';
  headers.forEach(h => {
    xml += `  <Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
  });
  xml += '</Row>\n';

  // Data rows
  complaints.forEach(c => {
    const formatDate = (d?: string) => d ? new Date(d).toLocaleString('am-ET') : '-';
    const row = [
      c.id.split('-')[0],
      c.trackingCode || '-',
      TYPE_AM[c.type] || c.type,
      STATUS_AM[c.status] || c.status,
      c.name,
      c.phone,
      c.email || '-',
      c.age?.toString() || '-',
      c.gender || '-',
      c.address || '-',
      c.institution || '-',
      c.subject,
      c.message,
      c.requestedResolution || '-',
      formatDate(c.createdAt),
      formatDate(c.processedAt),
      formatDate(c.resolvedAt),
      c.resolvedBy || '-',
      getResolutionTime(c),
      c.resolution?.message || '-',
      (c.attachments?.length || 0).toString(),
    ];

    xml += '<Row>\n';
    row.forEach(val => {
      xml += `  <Cell ss:StyleID="wrap"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>\n`;
    });
    xml += '</Row>\n';
  });

  xml += '</Table>\n</Worksheet>\n</Workbook>';

  // Download
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `complaints_export_${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { getResolutionTime };
