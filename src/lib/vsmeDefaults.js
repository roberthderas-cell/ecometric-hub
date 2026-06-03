// Default VSME data structure
export const DEFAULT_DATA = {
  ana: { ragione: '', ateco: '', forma: 'SRL', anno: 2025, perimetro: 'individuale', paesi: 'Italia', attivo: '', fatturato: '', fte: '', hc: '', modulo: 'basic', cert: '', sede: '', dimManuale: '' },
  en: { elReteN: '', elReteN1: '', elFVN: '', elFVN1: '', kWpFV: '', ispra: '0.211', annoIspra: '2023', scopeMetodo: 'location', goKWhN: '', goEFN: '0', noteEn: '' },
  ac: { scaricoN: '', scaricoN1: '', dipAcquaN: '', dipAcquaN1: '', ricN: '', ricN1: '', noteAc: '' },
  ri: { totN: '', totN1: '', periN: '', periN1: '', recN: '', recN1: '', noteRi: '' },
  pe: { hc: '', hcN1: '', fte: '', fteN1: '', donne: '', donneN1: '', uomini: '', uominiN1: '', indet: '', det: '', pt: '', nd: '', infort: '0', ggPersi: '0', malProf: '0', oreLav: '', assentGg: '', retMedia: '', retUom: '', retDon: '', oreForm: '', percVal: '', disab: '', ccnl: '', percCCNL: '', notePe: '' },
  gov: { compCDA: '', donneCDA: '', codEtico: 'no', mog231: 'no', iso14001: 'no', sa8000: 'no', iso45001: 'no', pariGen: 'no', policy: 'no', wb: 'no', rESG: 'no', cond: '0', san: '0', tempiPag: '', altreCert: '', noteGov: '' },
  b1: { omissioni: '', noteB1: '' },
  b2: { descPrat: '', politiche: '', inizFuture: '', target: '', noteB2: '' },
  enfuels: { rows: [
    { combustibile: 'Gas naturale', unita: 'm³', quantita: '', fattoreCO2: '1.90', fattoreKwh: '9.57', rinnovabile: 'No', fonte: 'Bollette gas' },
    { combustibile: 'Gasolio', unita: 'L', quantita: '', fattoreCO2: '2.68', fattoreKwh: '10.00', rinnovabile: 'No', fonte: 'Fatture carburante' },
    { combustibile: 'Benzina', unita: 'L', quantita: '', fattoreCO2: '2.31', fattoreKwh: '8.90', rinnovabile: 'No', fonte: 'Fatture carburante' },
  ]},
  acfonti: { fonti: [
    { fonte: 'Acquedotto/rete', prelievo: '', prelievoN1: '', unita: 'm3', stress: 'No', riciclata: 'No', evidenza: 'Bollette' },
    { fonte: 'Pozzo/falda', prelievo: '', prelievoN1: '', unita: 'm3', stress: 'No', riciclata: 'No', evidenza: 'Contatore' },
  ]},
};

// VSME sections navigation config
export const SECTIONS = [
  { id: 'ana', label: 'Anagrafica', icon: '🏢', group: 'CONFIGURAZIONE' },
  { id: 'en', label: 'Energia & GHG', icon: '⚡', group: 'RACCOLTA DATI' },
  { id: 'ac', label: 'Acqua', icon: '💧', group: 'RACCOLTA DATI' },
  { id: 'ri', label: 'Rifiuti', icon: '♻️', group: 'RACCOLTA DATI' },
  { id: 'pe', label: 'Personale & H&S', icon: '👥', group: 'RACCOLTA DATI' },
  { id: 'gov', label: 'Governance', icon: '⚖️', group: 'RACCOLTA DATI' },
  { id: 'dash', label: 'Dashboard KPI', icon: '📊', group: 'OUTPUT' },
];

// Required fields per section for completion tracking
export const REQUIRED_FIELDS = {
  ana: ['ragione', 'ateco', 'hc', 'fatturato'],
  en: ['elReteN'],
  ac: [],
  ri: ['totN'],
  pe: ['hc', 'donne', 'uomini'],
  gov: ['compCDA'],
};

export function getSectionCompletion(data, sectionId) {
  const fields = REQUIRED_FIELDS[sectionId];
  if (!fields || !fields.length) return { pct: 0, filled: 0, total: 0 };
  const secData = data?.[sectionId] || {};
  let filled = 0;
  fields.forEach(f => {
    const v = secData[f];
    if (v && v !== '' && v !== '0' && v !== 'no') filled++;
  });
  return { pct: Math.round((filled / fields.length) * 100), filled, total: fields.length };
}

export function calcEnergy(data) {
  const en = data?.en || {};
  const rows = data?.enfuels?.rows || [];
  let s1 = 0, fuelKwh = 0;
  rows.forEach(r => {
    const q = parseFloat(r.quantita) || 0;
    const ef = parseFloat(r.fattoreCO2) || 0;
    const kwh = parseFloat(r.fattoreKwh) || 0;
    s1 += (q * ef) / 1000;
    fuelKwh += q * kwh;
  });
  const elRete = parseFloat(en.elReteN) || 0;
  const ispra = parseFloat(en.ispra) || 0.211;
  const elFV = parseFloat(en.elFVN) || 0;
  const s2LB = (elRete * ispra) / 1000;
  const avoided = (elFV * ispra) / 1000;
  const totKwh = elRete + elFV + fuelKwh;
  const pRen = totKwh > 0 ? (elFV / totKwh) * 100 : 0;
  const fatt = parseFloat(data?.ana?.fatturato) || 0;
  const intensity = fatt > 0 ? ((s1 + s2LB) / fatt) * 1000000 : 0;
  return { s1, s2LB, tot: s1 + s2LB, avoided, fuelKwh, totKwh, pRen, intensity };
}

export function calcWaste(data) {
  const ri = data?.ri || {};
  const tot = (parseFloat(ri.totN) || 0) / 1000;
  const per = (parseFloat(ri.periN) || 0) / 1000;
  const rec = (parseFloat(ri.recN) || 0) / 1000;
  const nPer = Math.max(0, tot - per);
  const smal = Math.max(0, tot - rec);
  const pRec = tot > 0 ? (rec / tot) * 100 : 0;
  return { tot, per, nPer, rec, smal, pRec };
}

export function calcWater(data) {
  const fonti = data?.acfonti?.fonti || [];
  let tot = 0, high = 0;
  fonti.forEach(r => {
    const q = parseFloat(r.prelievo) || 0;
    tot += q;
    if (String(r.stress).toLowerCase() === 'si') high += q;
  });
  const scarico = parseFloat(data?.ac?.scaricoN) || 0;
  const consumo = Math.max(0, tot - scarico);
  const hc = parseFloat(data?.pe?.hc) || parseFloat(data?.ana?.hc) || 0;
  return { tot, high, scarico, consumo, prelievoDip: hc > 0 ? tot / hc : 0, consumoDip: hc > 0 ? consumo / hc : 0 };
}

export function calcPersonnel(data) {
  const pe = data?.pe || {};
  const n = parseInt(pe.infort) || 0;
  const ore = parseFloat(pe.oreLav) || 0;
  const IF = ore > 0 ? (n * 1000000) / ore : 0;
  const rU = parseFloat(pe.retUom) || 0;
  const rD = parseFloat(pe.retDon) || 0;
  const gpg = rU > 0 ? ((rU - rD) / rU) * 100 : 0;
  const hc = parseInt(pe.hc) || 0;
  const assg = parseFloat(pe.assentGg) || 0;
  const tassoAss = hc > 0 ? (assg / (hc * 220)) * 100 : 0;
  return { IF: IF.toFixed(2), gpg: gpg.toFixed(1), tassoAss: tassoAss.toFixed(1) };
}

export function calcESGScore(data) {
  const g = calcEnergy(data);
  const w = calcWaste(data);
  const pe = data?.pe || {};
  const gov = data?.gov || {};
  const hc = parseInt(pe.hc) || 0;
  const donne = parseFloat(pe.donne) || 0;
  const percD = hc > 0 ? (donne / hc) * 100 : 0;
  const pRen = g.pRen || 0;
  const pRec = w.pRec || 0;
  const inten = g.intensity || 0;

  // Environment
  const eRen = Math.min(100, pRen >= 35 ? 100 : pRen >= 15 ? 60 + ((pRen - 15) / 20) * 40 : (pRen / 15) * 60);
  const eGhg = inten === 0 ? 20 : inten <= 100 ? 100 : inten <= 250 ? 60 : Math.max(5, 25 - (inten - 250) / 50);
  const eWaste = pRec >= 85 ? 100 : pRec >= 65 ? 65 + ((pRec - 65) / 20) * 35 : (pRec / 65) * 65;
  const E = Math.round(eRen * 0.35 + eGhg * 0.35 + eWaste * 0.30);

  // Social
  const IF = parseFloat(calcPersonnel(data).IF) || 0;
  const sHs = hc > 0 ? (IF <= 8 ? 100 : IF <= 20 ? 70 : Math.max(10, 25 - IF)) : 40;
  const sGen = Math.min(100, percD >= 40 ? 100 : percD >= 30 ? 70 + (percD - 30) * 3 : percD * 2.3);
  const oreForm = parseFloat(pe.oreForm) || 0;
  const sForm = oreForm >= 18 ? 100 : oreForm >= 8 ? 65 + ((oreForm - 8) / 10) * 35 : (oreForm / 8) * 65;
  const S = Math.round(sHs * 0.35 + sGen * 0.30 + sForm * 0.35);

  // Governance
  let gPts = 0;
  if (gov.mog231 === 'si') gPts += 1.5;
  if (gov.codEtico === 'si') gPts += 1.0;
  if (gov.iso45001 === 'si') gPts += 1.5;
  if (gov.pariGen === 'si') gPts += 1.0;
  if (gov.wb === 'si') gPts += 0.5;
  if ((parseInt(gov.cond) || 0) === 0) gPts += 0.5;
  const G = Math.round(Math.min(100, (gPts / 6.0) * 100));

  const tot = Math.round(E * 0.40 + S * 0.35 + G * 0.25);

  let rating, rColor, rIcon;
  if (tot >= 85) { rating = 'Leader'; rColor = '#059669'; rIcon = '🏆'; }
  else if (tot >= 70) { rating = 'Avanzato'; rColor = '#2563EB'; rIcon = '⭐'; }
  else if (tot >= 55) { rating = 'Buono'; rColor = '#0891B2'; rIcon = '✅'; }
  else if (tot >= 35) { rating = 'In crescita'; rColor = '#D97706'; rIcon = '📈'; }
  else { rating = 'Base'; rColor = '#9CA3AF'; rIcon = '🌱'; }

  return { E, S, G, tot, rating, rColor, rIcon, gPts };
}