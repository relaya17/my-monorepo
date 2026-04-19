import { PDFDocument } from 'pdf-lib';

export const generateReceipt = async (payer: string, amount: number, chairmanName: string) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const { height } = page.getSize();
  const fontSize = 18;

  const lines = [
    `קבלה לתשלום`,
    `שם הלקוח: ${payer}`,
    `סכום לתשלום: ${amount} ₪`,
    `יושב ראש אגודת מצפה נוף: ${chairmanName}`,
    `תאריך: ${new Date().toLocaleDateString()}`
  ];

  lines.forEach((line, index) => {
    page.drawText(line, { x: 50, y: height - 50 - (index * 30), size: fontSize });
  });

  return await pdfDoc.save();
};
