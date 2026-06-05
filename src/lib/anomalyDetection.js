/**
 * Anomaly Detection Engine
 * Confronta i valori attuali con la media storica degli snapshot.
 * Segnala deviazioni significative (Z-score > 2 oppure variazione YoY > soglia).
 */

// Campi numerici da monitorare con label, sezione e soglie
export const MONITORED_FIELDS = [
  // Energia
  { path: 'en.elReteN',  label: 'Elettricità da rete',       unit: 'kWh',   section: 'en',  navId: 'en',  icon: '⚡', threshold: 0.40 },
  { path: 'en.elFVN',    label: 'Energia fotovoltaica',       unit: 'kWh',   section: 'en',  navId: 'en',  icon: '☀️', threshold: 0.50 },
  // Acqua
  { path: 'ac.scaricoN', label: 'Scarico idrico',             unit: 'm³',    section: 'ac',  navId: 'ac',  icon: '💧', threshold: 0.40 },
  // Rifiuti
  { path: 'ri.totN',     label: 'Rifiuti totali',             unit: 'kg',    section: 'ri',  navId: 'ri',  icon: '♻️', threshold: 0.35 },
  { path: 'ri.recN',     label: 'Rifiuti a recupero',         unit: 'kg',    section: 'ri',  navId: 'ri',  icon: '♻️', threshold: 0.40 },
  { path: 'ri.periN',    label: 'Rifiuti pericolosi',         unit: 'kg',    section: 'ri',  navId: 'ri',  icon: '⚠️', threshold: 0.50 },
  // Personale
  { path: 'pe.hc',       label: 'Headcount',                  unit: 'dip.',  section: 'pe',  navId: 'pe',  icon: '👥', threshold: 0.25 },
  { path: 'pe.donne',    label: 'Dipendenti donne',           unit: 'dip.',  section: 'pe',  navId: 'pe',  icon: '👩', threshold: 0.30 },
  { path: 'pe.oreLav',   label: 'Ore lavorate',               unit: 'h',     section: 'pe',  navId: 'pe',  icon: '🕐', threshold: 0.30 },
  { path: 'pe.retMedia', label: 'Retribuzione media',         unit: '€',     section: 'pe',  navId: 'pe',  icon: '💶', threshold: 0.20 },
  { path: 'pe.oreForm',  label: 'Ore formazione/dip.',        unit: 'h',     section: 'pe',  navId: 'pe',  icon: '📚', threshold: 0.50 },
  { path: 'pe.infort',   label: 'Numero infortuni',           unit: '',      section: 'pe',  navId: 'pe',  icon: '🏥', threshold: 1.00 },
  // Anagrafica
  { path: 'ana.fatturato', label: 'Fatturato',                unit: '€',     section: 'ana', navId: 'ana', icon: '💼', threshold: 0.30 },
  { path: 'ana.hc',        label: 'Dipendenti (anagrafica)',  unit: 'dip.',  section: 'ana', navId: 'ana', icon: '🏢', threshold: 0.25 },
  // Governance
  { path: 'gov.compCDA',   label: 'Componenti CdA',           unit: '',      section: 'gov', navId: 'gov', icon: '⚖️', threshold: 0.30 },
];

function getVal(obj, path) {
  const v = path.split('.').reduce((o, k) => o?.[k], obj);
  return parseFloat(v);
}

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function stddev(arr, m) {
  if (arr.length < 2) return 0;
  const variance = arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

/**
 * @param {object} currentData  — dati attuali del report
 * @param {Array}  snapshots    — array EsgSnapshot con data_snapshot popolato
 * @returns {Array} anomalie ordinate per severità
 */
export function detectAnomalies(currentData, snapshots) {
  // Usa solo gli snapshot con data_snapshot reale (esclude il primo = versione corrente)
  const historical = snapshots
    .filter(s => s.data_snapshot && Object.keys(s.data_snapshot).length > 0)
    .slice(1); // lo snapshot [0] è la versione più recente (= corrente)

  const anomalies = [];

  for (const field of MONITORED_FIELDS) {
    const currentVal = getVal(currentData, field.path);
    if (isNaN(currentVal) || currentVal === 0) continue;

    // Raccoglie valori storici
    const historicalVals = historical
      .map(s => getVal(s.data_snapshot, field.path))
      .filter(v => !isNaN(v) && v > 0);

    let anomaly = null;

    if (historicalVals.length >= 2) {
      // Metodo statistico: Z-score
      const m = mean(historicalVals);
      const sd = stddev(historicalVals, m);
      if (sd > 0) {
        const z = Math.abs((currentVal - m) / sd);
        if (z > 2.5) {
          const pctChange = ((currentVal - m) / m) * 100;
          anomaly = {
            ...field,
            currentVal,
            referenceVal: m,
            pctChange,
            zScore: z,
            severity: z > 3.5 ? 'high' : 'medium',
            method: 'zscore',
            historicalCount: historicalVals.length,
          };
        }
      }
    } else if (historicalVals.length === 1) {
      // Metodo semplice: variazione % rispetto all'unico valore precedente
      const prev = historicalVals[0];
      const pctChange = ((currentVal - prev) / prev) * 100;
      if (Math.abs(pctChange) / 100 > field.threshold) {
        anomaly = {
          ...field,
          currentVal,
          referenceVal: prev,
          pctChange,
          zScore: null,
          severity: Math.abs(pctChange) / 100 > field.threshold * 2 ? 'high' : 'medium',
          method: 'delta',
          historicalCount: 1,
        };
      }
    }
    // Se nessuno storico: confronta YoY se il campo ha N1 corrispondente
    else if (historicalVals.length === 0) {
      const n1Path = field.path.replace(/N$/, 'N1');
      const yoyVal = getVal(currentData, n1Path);
      if (!isNaN(yoyVal) && yoyVal > 0) {
        const pctChange = ((currentVal - yoyVal) / yoyVal) * 100;
        if (Math.abs(pctChange) / 100 > field.threshold) {
          anomaly = {
            ...field,
            currentVal,
            referenceVal: yoyVal,
            pctChange,
            zScore: null,
            severity: Math.abs(pctChange) / 100 > field.threshold * 2 ? 'high' : 'medium',
            method: 'yoy',
            historicalCount: 0,
          };
        }
      }
    }

    if (anomaly) anomalies.push(anomaly);
  }

  // Ordina: high prima, poi per |pctChange| decrescente
  return anomalies.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'high' ? -1 : 1;
    return Math.abs(b.pctChange) - Math.abs(a.pctChange);
  });
}