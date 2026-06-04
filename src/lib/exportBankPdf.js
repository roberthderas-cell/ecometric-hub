import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportBankReportPDF({ report, metrics }) {
  const element = document.getElementById('bank-report-content');
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  const imgW = canvas.width;
  const imgH = canvas.height;
  const ratio = pdfW / imgW;
  const totalPdfH = imgH * ratio;

  let position = 0;
  let remaining = totalPdfH;
  let page = 0;

  while (remaining > 0) {
    if (page > 0) pdf.addPage();
    const srcY = page * (pdfH / ratio);
    pdf.addImage(imgData, 'PNG', 0, -page * pdfH, pdfW, totalPdfH);
    remaining -= pdfH;
    page++;
  }

  const safeName = (report.name || 'ESG').replace(/[^a-zA-Z0-9_\-]/g, '_');
  pdf.save(`Relazione_ESG_${safeName}_${report.year}.pdf`);
}