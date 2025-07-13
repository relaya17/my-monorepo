import { PDFDocument } from 'pdf-lib';

// פונקציה להפקת קבלה כ-PDF
export const generateReceipt = async (payer: string, amount: number, chairmanName: string) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  const { width, height } = page.getSize();
  const fontSize = 18;

  page.drawText(`קבלה לתשלום`, { x: 50, y: height - 50, size: fontSize });
  page.drawText(`שם הלקוח: ${payer}`, { x: 50, y: height - 80, size: fontSize });
  page.drawText(`סכום לתשלום: ${amount} ₪`, { x: 50, y: height - 110, size: fontSize });
  page.drawText(`יושב ראש אגודת מצפה נוף: ${chairmanName}`, { x: 50, y: height - 140, size: fontSize });
  page.drawText(`תאריך: ${new Date().toLocaleDateString()}`, { x: 50, y: height - 170, size: fontSize });

  // שמירה של ה-PDF והחזרתו כ-binary (Uint8Array)
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
