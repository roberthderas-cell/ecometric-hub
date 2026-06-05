/**
 * KPI Alert System
 * Calcola alert per soglie di tolleranza e distanza dagli obiettivi annuali.
 */
import { calcEnergy, calcWaste, calcWater, calcPersonnel, calcESGScore } from './vsmeDefaults';

// Soglie di tolleranza KPI (valori critici)
const THRESHOLDS = [
  {
    id: 'ghg_intensity',
    label: 'Intensità GHG',
    unit: 'tCO₂/M€',
    getValue: (data) => calcEnergy(data).intensity,
    warning: 250,
    critical: 500,
    description: 'Intensità emissiva elevata rispetto al fatturato',
    section: 'en',
  },
  {
    id: 'renewable_pct',
    label: '% Energia Rinnovabile',
    unit: '%',
    getValue: (data) => calcEnergy(data).pRen,
    warningBelow: 15,
    criticalBelow: 5,
    description: 'Quota di energia rinnovabile troppo bassa',
    section: 'en',
  },
  {
    id: 'waste_recovery',
    label: '% Rifiuti Recuperati',
    unit: '%',
    getValue: (data) => calcWaste(data).pRec,
    warningBelow: 50,
    criticalBelow: 25,
    description: 'Tasso di recupero rifiuti insufficiente',
    section: 'ri',
  },
  {
    id: 'injury_rate',
    label: 'Indice Infortuni (IF)',
    unit: '/Mh',
    getValue: (data) => parseFloat(calcPersonnel(data).IF) || 0,
    warning: 20,
    critical: 40,
    description: 'Frequenza infortuni superiore alla soglia di sicurezza',
    section: 'pe',
  },
  {
    id: 'gender_pay_gap',
    label: 'Gender Pay Gap',
    unit: '%',
    getValue: (data) => {
      const pe = data?.pe || {};
      const rU = parseFloat(pe.retUom) || 0;
      const rD = parseFloat(pe.retDon) || 0;
      return rU > 0 ? ((rU - rD) / rU) * 100 : 0;
    },
    warning: 15,
    critical: 25,
    description: 'Divario retributivo di genere elevato',
    section: 'pe',
  },
];

/** Calcola alert soglie KPI */
export function getThresholdAlerts(data) {
  const alerts = [];
  THRESHOLDS.forEach((t) => {
    const val = t.getValue(data);
    if (val === 0 || isNaN(val)) return;

    // Soglie "sopra" (warning/critical se il valore supera la soglia)
    if (t.warning !== undefined && t.critical !== undefined) {
      if (val >= t.critical) {
        alerts.push({ id: t.id, severity: 'critical', label: t.label, value: val, unit: t.unit, description: t.description, section: t.section, threshold: t.critical });
      } else if (val >= t.warning) {
        alerts.push({ id: t.id, severity: 'warning', label: t.label, value: val, unit: t.unit, description: t.description, section: t.section, threshold: t.warning });
      }
    }

    // Soglie "sotto" (warning/critical se il valore scende sotto la soglia)
    if (t.warningBelow !== undefined && t.criticalBelow !== undefined) {
      if (val <= t.criticalBelow) {
        alerts.push({ id: t.id, severity: 'critical', label: t.label, value: val, unit: t.unit, description: t.description, section: t.section, threshold: t.criticalBelow });
      } else if (val <= t.warningBelow) {
        alerts.push({ id: t.id, severity: 'warning', label: t.label, value: val, unit: t.unit, description: t.description, section: t.section, threshold: t.warningBelow });
      }
    }
  });
  return alerts;
}

/** Calcola alert distanza dagli obiettivi annuali */
export function getTargetAlerts(data, esgScore) {
  const alerts = [];
  const targets = data?.targets;
  if (!targets) return alerts;

  const pillars = [
    { key: 'E', label: 'Score Ambiente (E)', current: esgScore?.E },
    { key: 'S', label: 'Score Sociale (S)', current: esgScore?.S },
    { key: 'G', label: 'Score Governance (G)', current: esgScore?.G },
    { key: 'tot', label: 'Score ESG Totale', current: esgScore?.tot },
  ];

  pillars.forEach(({ key, label, current }) => {
    const target = targets[key];
    if (target == null || current == null) return;
    const gap = target - current;
    if (gap <= 0) return; // obiettivo raggiunto o superato

    if (gap >= 25) {
      alerts.push({ id: `target_${key}`, severity: 'critical', label, current, target, gap, type: 'target', description: `Distanza dall'obiettivo molto elevata (+${gap.toFixed(0)} punti necessari)` });
    } else if (gap >= 12) {
      alerts.push({ id: `target_${key}`, severity: 'warning', label, current, target, gap, type: 'target', description: `Distanza dall'obiettivo rilevante (+${gap.toFixed(0)} punti necessari)` });
    }
  });

  return alerts;
}

/** Combina tutti gli alert */
export function getAllAlerts(data, esgScore) {
  const threshold = getThresholdAlerts(data);
  const target = getTargetAlerts(data, esgScore);
  return [...threshold, ...target].sort((a, b) => {
    const order = { critical: 0, warning: 1 };
    return order[a.severity] - order[b.severity];
  });
}