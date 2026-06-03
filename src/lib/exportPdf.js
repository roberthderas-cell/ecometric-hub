import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// ─── PALETTE ────────────────────────────────────────────────────────────────
const C = {
  forest:  [13,  32,  24],
  green:   [5,   150, 105],
  greenL:  [209, 250, 229],
  blue:    [37,  99,  235],
  blueL:   [219, 234, 254],
  purple:  [124, 58,  237],
  purpleL: [237, 233, 254],
  amber:   [217, 119, 6],
  amberL:  [254, 243, 199],
  slate:   [100, 116, 139],
  slateL:  [241, 245, 249],
  white:   [255, 255, 255],
  text:    [30,  41,  59],
  textMid: [100, 116, 139],
};

const ratingConfig = {
  Leader:        { color: C.green,  label: '🏆 Leader' },
  Avanzato:      { color: C.blue,   label: '⭐ Avanzato' },
  Buono:         { color: [8, 145, 178], label: '✅ Buono' },
  'In crescita': { color: C.amber,  label: '📈 In crescita' },
  Base:          { color: C.slate,  label: '🌱 Base' },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function setFill(doc, rgb)   { doc.setFillColor(...rgb); }
function setDraw(doc, rgb)   { doc.setDrawColor(...rgb); }
function setTextC(doc, rgb)  { doc.setTextColor(...rgb); }
function setFont(doc, style, size) {
  doc.setFont('helvetica', style);
  doc.setFontSize(size);
}

function rect(doc, x, y, w, h, rgb, radius = 0) {
  setFill(doc, rgb);
  if (radius > 0) doc.roundedRect(x, y, w, h, radius, radius, 'F');
  else            doc.rect(x, y, w, h, 'F');
}

function bar(doc, x, y, w, h, pct, fgRgb, bgRgb = C.slateL) {
  rect(doc, x, y, w, h, bgRgb, h / 2);
  if (pct > 0) rect(doc, x, y, Math.max(h, w * pct / 100), h, fgRgb, h / 2);
}

function kpiBox(doc, x, y, w, h, label, value, unit, bgRgb, valRgb) {
  rect(doc, x, y, w, h, bgRgb, 3);
  setFont(doc, 'bold', 6.5);
  setTextC(doc, C.textMid);
  doc.text(label.toUpperCase(), x + 4, y + 8);
  setFont(doc, 'bold', 13);
  setTextC(doc, valRgb || C.text);
  doc.text(String(value), x + 4, y + 18);
  if (unit) {
    setFont(doc, 'normal', 6);
    setTextC(doc, C.textMid);
    doc.text(unit, x + 4, y + 24);
  }
}

function govBadge(doc, x, y, w, h, label, active) {
  rect(doc, x, y, w, h, active ? [236, 253, 245] : C.slateL, 3);
  setFont(doc, 'bold', 6.5);
  setTextC(doc, active ? C.green : C.slate);
  doc.text(label, x + w / 2, y + 7, { align: 'center' });
  setFont(doc, 'bold', 9);
  doc.text(active ? '✓ Sì' : '— No', x + w / 2, y + 14, { align: 'center' });
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export async function exportReportPDF({ report, data, esg, g, w, wa, p }) {
  const doc   = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const PW    = 210; // page width
  const PH    = 297; // page height
  const ML    = 14;  // margin left
  const MR    = 14;  // margin right
  const CW    = PW - ML - MR; // content width
  const pe    = data?.pe  || {};
  const gov   = data?.gov || {};
  const ana   = data?.ana || {};
  const rc    = ratingConfig[esg.rating] || ratingConfig.Base;
  const today = new Date().toLocaleDateString('it-IT', { day:'2-digit', month:'long', year:'numeric' });

  // ══ PAGE 1: COVER ══════════════════════════════════════════════════════════
  // Dark header band
  rect(doc, 0, 0, PW, 68, C.forest);

  // Brand
  setFont(doc, 'bold', 9);
  setTextC(doc, [134, 239, 172]);
  doc.text('🌿 VSME BUILDER', ML, 14);
  setFont(doc, 'normal', 7);
  setTextC(doc, [134, 239, 172, 0.6]);
  doc.text('Standard EFRAG · Sostenibilità PMI', ML, 20);

  // Report title
  setFont(doc, 'bold', 22);
  setTextC(doc, C.white);
  const titleLines = doc.splitTextToSize(report.name || 'Report ESG', CW - 40);
  doc.text(titleLines, ML, 36);

  // Year + module badge
  setFont(doc, 'normal', 8);
  setTextC(doc, [255, 255, 255, 0.6]);
  doc.text(`Anno ${report.year || new Date().getFullYear()} · ${report.module === 'comprehensive' ? 'Modulo Completo' : 'Modulo Base'} · Generato il ${today}`, ML, 58);

  // ESG Score hero card
  const scoreX = PW - ML - 44;
  rect(doc, scoreX, 10, 44, 50, rc.color, 5);
  setFont(doc, 'bold', 7);
  setTextC(doc, [255, 255, 255, 180]);
  doc.text('ESG SCORE', scoreX + 22, 19, { align: 'center' });
  setFont(doc, 'bold', 32);
  setTextC(doc, C.white);
  doc.text(String(esg.tot), scoreX + 22, 37, { align: 'center' });
  setFont(doc, 'normal', 6.5);
  doc.text('/ 100', scoreX + 22, 43, { align: 'center' });
  rect(doc, scoreX + 4, 46, 36, 10, [255,255,255,40], 3);
  setFont(doc, 'bold', 7.5);
  doc.text(esg.rating, scoreX + 22, 53, { align: 'center' });

  // ── E / S / G pillars ──────────────────────────────────────────────────────
  let cy = 78;
  const pillars = [
    { label: 'AMBIENTE (E)',   value: esg.E, bg: C.greenL,  fg: C.green,  vFg: C.green },
    { label: 'SOCIALE (S)',    value: esg.S, bg: C.blueL,   fg: C.blue,   vFg: C.blue  },
    { label: 'GOVERNANCE (G)',  value: esg.G, bg: C.purpleL, fg: C.purple, vFg: C.purple},
  ];
  const pillarW = (CW - 8) / 3;

  setFont(doc, 'bold', 7.5);
  setTextC(doc, C.textMid);
  doc.text('PUNTEGGI PER PILASTRO', ML, cy - 3);

  pillars.forEach((pl, i) => {
    const px = ML + i * (pillarW + 4);
    rect(doc, px, cy, pillarW, 28, pl.bg, 4);
    setFont(doc, 'bold', 6);
    setTextC(doc, pl.vFg);
    doc.text(pl.label, px + 4, cy + 7);
    setFont(doc, 'bold', 18);
    doc.text(String(pl.value), px + 4, cy + 20);
    setFont(doc, 'normal', 6);
    setTextC(doc, C.textMid);
    doc.text('/100', px + 4 + doc.getTextWidth(String(pl.value)) + 1, cy + 20);
    bar(doc, px + 4, cy + 22, pillarW - 8, 3, pl.value, pl.fg, [220,220,220]);
  });

  cy += 36;

  // ── Completamento ──────────────────────────────────────────────────────────
  setFont(doc, 'bold', 7.5);
  setTextC(doc, C.textMid);
  doc.text('COMPLETAMENTO REPORT', ML, cy);
  cy += 4;
  bar(doc, ML, cy, CW, 5, report.completion || 0, C.green);
  setFont(doc, 'bold', 7);
  setTextC(doc, C.green);
  doc.text(`${report.completion || 0}%`, ML + CW + 2, cy + 4);
  cy += 12;

  // ── Separator ─────────────────────────────────────────────────────────────
  setDraw(doc, [226, 232, 240]);
  doc.setLineWidth(0.3);
  doc.line(ML, cy, ML + CW, cy);
  cy += 8;

  // ── SEZIONE DATI AZIENDALI ─────────────────────────────────────────────────
  setFont(doc, 'bold', 9);
  setTextC(doc, C.forest);
  doc.text('DATI AZIENDALI', ML, cy);
  cy += 5;

  const rows = [
    ['Ragione Sociale', ana.ragione || '—'],
    ['Codice ATECO',    ana.ateco || '—'],
    ['Forma Giuridica', ana.forma || '—'],
    ['Dipendenti (HC)', pe.hc || '—'],
    ['Fatturato (M€)',  ana.fatturato ? `${ana.fatturato} M€` : '—'],
    ['Sede',           ana.sede || '—'],
  ];
  rows.forEach(([label, val], i) => {
    const rowY = cy + i * 7;
    if (i % 2 === 0) rect(doc, ML, rowY - 3, CW, 7, C.slateL);
    setFont(doc, 'bold', 6.5);
    setTextC(doc, C.textMid);
    doc.text(label, ML + 2, rowY + 1.5);
    setFont(doc, 'normal', 6.5);
    setTextC(doc, C.text);
    doc.text(String(val), ML + 50, rowY + 1.5);
  });
  cy += rows.length * 7 + 6;

  // ── Separator ─────────────────────────────────────────────────────────────
  doc.line(ML, cy, ML + CW, cy);
  cy += 8;

  // ── KPI ENERGIA ───────────────────────────────────────────────────────────
  setFont(doc, 'bold', 9);
  setTextC(doc, C.forest);
  doc.text('🌡️  CLIMA & ENERGIA', ML, cy);
  cy += 6;

  const kpiW = (CW - 9) / 4;
  const kpiH = 28;
  const energyKPIs = [
    { label: 'Scope 1+2', value: g.tot.toFixed(2), unit: 'tCO₂eq',   bg: C.amberL, fg: C.amber },
    { label: '% Rinnovabile', value: g.pRen.toFixed(1)+'%', unit: 'da FV', bg: C.greenL, fg: C.green },
    { label: 'Energia Totale', value: (g.totKwh/1000).toFixed(1), unit: 'MWh', bg: C.blueL,  fg: C.blue  },
    { label: 'Intensità GHG', value: g.intensity > 0 ? g.intensity.toFixed(1) : '—', unit: 'tCO₂eq/M€', bg: C.slateL, fg: C.slate },
  ];
  energyKPIs.forEach((k, i) => {
    kpiBox(doc, ML + i*(kpiW+3), cy, kpiW, kpiH, k.label, k.value, k.unit, k.bg, k.fg);
  });
  cy += kpiH + 6;

  // ── KPI ACQUA ──────────────────────────────────────────────────────────────
  setFont(doc, 'bold', 9);
  setTextC(doc, C.forest);
  doc.text('💧  ACQUA', ML, cy);
  cy += 6;
  const waterKPIs = [
    { label: 'Prelievi', value: wa.tot.toFixed(0), unit: 'm³', bg: C.blueL, fg: C.blue },
    { label: 'Stress Idrico', value: wa.high.toFixed(0), unit: 'm³', bg: wa.high > 0 ? C.amberL : C.slateL, fg: wa.high > 0 ? C.amber : C.slate },
    { label: 'Consumo Netto', value: wa.consumo.toFixed(0), unit: 'm³', bg: C.slateL, fg: C.slate },
    { label: 'Cons./Dip.', value: wa.consumoDip.toFixed(1), unit: 'm³/dip.', bg: C.slateL, fg: C.slate },
  ];
  waterKPIs.forEach((k, i) => {
    kpiBox(doc, ML + i*(kpiW+3), cy, kpiW, kpiH, k.label, k.value, k.unit, k.bg, k.fg);
  });
  cy += kpiH + 6;

  // ── KPI RIFIUTI ────────────────────────────────────────────────────────────
  setFont(doc, 'bold', 9);
  setTextC(doc, C.forest);
  doc.text('♻️  RIFIUTI', ML, cy);
  cy += 6;
  const wasteKPIs = [
    { label: 'Rifiuti Totali', value: w.tot.toFixed(2), unit: 't', bg: C.slateL, fg: C.slate },
    { label: 'Pericolosi', value: w.per.toFixed(2), unit: 't', bg: w.per > 0 ? C.amberL : C.slateL, fg: w.per > 0 ? C.amber : C.slate },
    { label: '% Recupero', value: w.pRec.toFixed(1)+'%', unit: '', bg: C.greenL, fg: C.green },
    { label: 'Smaltimento', value: w.smal.toFixed(2), unit: 't', bg: C.slateL, fg: C.slate },
  ];
  wasteKPIs.forEach((k, i) => {
    kpiBox(doc, ML + i*(kpiW+3), cy, kpiW, kpiH, k.label, k.value, k.unit, k.bg, k.fg);
  });
  cy += kpiH + 6;

  // ── KPI PERSONALE ─────────────────────────────────────────────────────────
  if (cy + 50 > PH - 20) { doc.addPage(); cy = 20; }

  setFont(doc, 'bold', 9);
  setTextC(doc, C.forest);
  doc.text('👥  PERSONALE', ML, cy);
  cy += 6;
  const hc = parseInt(pe.hc) || 0;
  const donne = parseFloat(pe.donne) || 0;
  const percD = hc > 0 ? (donne / hc * 100).toFixed(1) : '—';
  const gpg = parseFloat(p.gpg);
  const personnelKPIs = [
    { label: 'Dipendenti', value: hc || '—', unit: 'headcount', bg: C.blueL, fg: C.blue },
    { label: '% Donne', value: percD !== '—' ? percD+'%' : '—', unit: '', bg: C.slateL, fg: C.slate },
    { label: 'Gender Pay Gap', value: p.gpg+'%', unit: '', bg: gpg > 15 ? C.amberL : C.greenL, fg: gpg > 15 ? C.amber : C.green },
    { label: 'Indice Freq.', value: p.IF, unit: '×1M ore', bg: C.slateL, fg: C.slate },
  ];
  personnelKPIs.forEach((k, i) => {
    kpiBox(doc, ML + i*(kpiW+3), cy, kpiW, kpiH, k.label, k.value, k.unit, k.bg, k.fg);
  });
  cy += kpiH + 8;

  // ── GOVERNANCE BADGES ─────────────────────────────────────────────────────
  setFont(doc, 'bold', 9);
  setTextC(doc, C.forest);
  doc.text('⚖️  GOVERNANCE', ML, cy);
  cy += 6;
  const govItems = [
    { label: 'Codice Etico',   active: gov.codEtico === 'si' },
    { label: 'MOG 231',        active: gov.mog231   === 'si' },
    { label: 'ISO 45001',      active: gov.iso45001 === 'si' },
    { label: 'Whistleblowing', active: gov.wb       === 'si' },
    { label: 'Parità Genere',  active: gov.pariGen  === 'si' },
    { label: 'Policy ESG',     active: gov.rESG     === 'si' },
  ];
  const gW = (CW - 10) / 6;
  govItems.forEach((g2, i) => govBadge(doc, ML + i*(gW+2), cy, gW, 20, g2.label, g2.active));
  cy += 28;

  // ── Capture and embed charts from DOM ─────────────────────────────────────
  const chartEl = document.getElementById('esg-pdf-charts');
  if (chartEl) {
    if (cy + 80 > PH - 20) { doc.addPage(); cy = 20; }
    try {
      setFont(doc, 'bold', 9);
      setTextC(doc, C.forest);
      doc.text('📊  GRAFICI ESG', ML, cy);
      cy += 4;
      const canvas = await html2canvas(chartEl, {
        scale: 1.8,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const imgH    = (canvas.height / canvas.width) * CW;
      if (cy + imgH > PH - 20) { doc.addPage(); cy = 20; }
      doc.addImage(imgData, 'PNG', ML, cy, CW, imgH);
      cy += imgH + 8;
    } catch (_) { /* skip chart if capture fails */ }
  }

  // ── PAGE N: FOOTER ─────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    rect(doc, 0, PH - 10, PW, 10, C.forest);
    setFont(doc, 'normal', 6);
    setTextC(doc, [134, 239, 172]);
    doc.text('🌿 VSME Builder — Standard EFRAG 2024', ML, PH - 4);
    doc.text(`Pagina ${i} / ${totalPages}  ·  ${today}`, PW - ML, PH - 4, { align: 'right' });
  }

  const safeName = (report.name || 'ESG').replace(/[^a-zA-Z0-9_\-]/g, '_');
  doc.save(`Report_ESG_${safeName}_${report.year || new Date().getFullYear()}.pdf`);
}