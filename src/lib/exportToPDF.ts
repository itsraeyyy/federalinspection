'use client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { pdf } from '@react-pdf/renderer';

/**
 * Generates a real text-based PDF from a @react-pdf/renderer <Document> element
 * and directly downloads it to the user's device without opening the print dialog.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const downloadPDFDocument = async (
  // We accept `any` here to avoid TypeScript inference issues with JSX elements
  // whose prop types don't precisely match ReactElement<DocumentProps>.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documentElement: any,
  filename: string = 'report.pdf'
): Promise<void> => {
  if (typeof window === 'undefined') return;

  const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  try {
    const blob = await pdf(documentElement).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = pdfFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};
