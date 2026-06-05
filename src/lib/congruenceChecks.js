/**
 * Controlli di congruenza cross-modulo per il report VSME.
 * Rileva valori sproporzionati o incoerenti tra le sezioni durante la compilazione.
 */
import { calcEnergy, calcWaste, calcWater } from './vsmeDefaults';

/**
 * Ogni check restituisce null se ok, oppure:
 * { id, severity: 'warning'|'error', area, message, suggestion, section }
 */
const CHECKS = [

  // ─── ENERGIA vs DIPENDENTI ───────────────────────────────────────────
  {
    id: 'energy_per_employee_high',
    section: 'en',
    run(data) {
      const hc = parseInt(data?.pe?.hc) || parseInt(data?.ana?.hc) || 0;
      const en = data?.en || {};
      const totKwh = (parseFloat(en.elReteN) || 0) + (parseFloat(en.elFVN) || 0);
      if (hc < 1 || totKwh < 1) return null;
      const kwhPP = totKwh / hc;
      if (kwhPP > 100000) return {
        id: this.id, severity: 'error', section: this.section,
        area: 'Energia vs Dipendenti',
        message: `Consumo elettrico per dipendente molto elevato: ${kwhPP.toFixed(0)} kWh/dip (soglia: 100.000).`,
        suggestion: 'Verifica che il dato di elettricità sia in kWh e non in MWh o GWh. Controlla anche il numero di dipendenti inserito.',
      };
      if (kwhPP > 40000) return {
        id: this.id, severity: 'warning', section: this.section,
        area: 'Energia vs Dipendenti',
        message: `Consumo elettrico per dipendente elevato: ${kwhPP.toFixed(0)} kWh/dip (media PMI industria: 10.000–40.000).`,
        suggestion: 'Normale per settori energy-intensive (fonderie, chimico, alimentare). Verifica il codice ATECO o aggiungi una nota esplicativa.',
      };
      return null;
    },
  },

  {
    id: 'energy_per_employee_low',
    section: 'en',
    run(data) {
      const hc = parseInt(data?.pe?.hc) || parseInt(data?.ana?.hc) || 0;
      const en = data?.en || {};
      const totKwh = (parseFloat(en.elReteN) || 0) + (parseFloat(en.elFVN) || 0);
      if (hc < 1 || totKwh < 1) return null;
      const kwhPP = totKwh / hc;
      if (kwhPP < 100) return {
        id: this.id, severity: 'error', section: this.section,
        area: 'Energia vs Dipendenti',
        message: `Consumo elettrico per dipendente anomalmente basso: ${kwhPP.toFixed(0)} kWh/dip (minimo atteso: 100).`,
        suggestion: 'Il valore sembra troppo basso. Verifica se il consumo è espresso nell\'unità corretta (kWh) o se mancano consumi rilevanti.',
      };
      return null;
    },
  },

  // ─── SCOPE 1 vs DIPENDENTI ───────────────────────────────────────────
  {
    id: 'scope1_per_employee',
    section: 'en',
    run(data) {
      const hc = parseInt(data?.pe?.hc) || parseInt(data?.ana?.hc) || 0;
      const s1 = calcEnergy(data).s1;
      if (hc < 1 || s1 < 0.1) return null;
      const s1pp = s1 / hc;
      if (s1pp > 50) return {
        id: this.id, severity: 'error', section: this.section,
        area: 'Scope 1 vs Dipendenti',
        message: `Emissioni Scope 1 per dipendente molto elevate: ${s1pp.toFixed(1)} tCO₂eq/dip (soglia: 50).`,
        suggestion: 'Controlla le quantità di combustibili inserite (unità: m³ per gas, litri per gasolio/benzina). Il valore sembra sproporzionato.',
      };
      return null;
    },
  },

  // ─── RIFIUTI vs DIPENDENTI ───────────────────────────────────────────
  {
    id: 'waste_per_employee',
    section: 'ri',
    run(data) {
      const hc = parseInt(data?.pe?.hc) || parseInt(data?.ana?.hc) || 0;
      const totKg = parseFloat(data?.ri?.totN) || 0;
      if (hc < 1 || totKg < 1) return null;
      const kgPP = totKg / hc;
      if (kgPP > 50000) return {
        id: this.id, severity: 'error', section: this.section,
        area: 'Rifiuti vs Dipendenti',
        message: `Rifiuti per dipendente anomali: ${(kgPP / 1000).toFixed(1)} t/dip (soglia: 50 t).`,
        suggestion: 'Il dato sembra sproporzionato. Verifica che il totale rifiuti sia espresso in kg (non in tonnellate). 1 t = 1.000 kg.',
      };
      if (kgPP > 20000) return {
        id: this.id, severity: 'warning', section: this.section,
        area: 'Rifiuti vs Dipendenti',
        message: `Rifiuti per dipendente elevati: ${(kgPP / 1000).toFixed(1)} t/dip (media PMI: < 20 t/dip).`,
        suggestion: 'Normale per manifattura pesante. Assicurati di includere solo rifiuti di propria produzione, non quelli in transito.',
      };
      return null;
    },
  },

  // ─── RIFIUTI A RECUPERO > TOTALE ─────────────────────────────────────
  {
    id: 'waste_recovery_exceeds_total',
    section: 'ri',
    run(data) {
      const totKg = parseFloat(data?.ri?.totN) || 0;
      const recKg = parseFloat(data?.ri?.recN) || 0;
      if (totKg < 1 || recKg < 1) return null;
      if (recKg > totKg) return {
        id: this.id, severity: 'error', section: this.section,
        area: 'Rifiuti — Coerenza',
        message: `I rifiuti a recupero (${recKg.toLocaleString()} kg) superano il totale prodotto (${totKg.toLocaleString()} kg).`,
        suggestion: 'I rifiuti a recupero non possono superare il totale. Verifica i dati del Registro CER o del RENTRI.',
      };
      return null;
    },
  },

  // ─── PERICOLOSI > TOTALE ──────────────────────────────────────────────
  {
    id: 'hazardous_exceeds_total',
    section: 'ri',
    run(data) {
      const totKg = parseFloat(data?.ri?.totN) || 0;
      const periKg = parseFloat(data?.ri?.periN) || 0;
      if (totKg < 1 || periKg < 1) return null;
      if (periKg > totKg) return {
        id: this.id, severity: 'error', section: this.section,
        area: 'Rifiuti — Coerenza',
        message: `I rifiuti pericolosi (${periKg.toLocaleString()} kg) superano il totale (${totKg.toLocaleString()} kg).`,
        suggestion: 'I rifiuti pericolosi sono un sottoinsieme del totale. Controlla che il valore di "Totale" includa anche i pericolosi.',
      };
      return null;
    },
  },

  // ─── ACQUA vs DIPENDENTI ──────────────────────────────────────────────
  {
    id: 'water_per_employee',
    section: 'ac',
    run(data) {
      const hc = parseInt(data?.pe?.hc) || parseInt(data?.ana?.hc) || 0;
      const wa = calcWater(data);
      if (hc < 1 || wa.tot < 1) return null;
      const m3pp = wa.tot / hc;
      if (m3pp > 5000) return {
        id: this.id, severity: 'error', section: this.section,
        area: 'Acqua vs Dipendenti',
        message: `Prelievo idrico per dipendente molto elevato: ${m3pp.toFixed(0)} m³/dip (soglia: 5.000).`,
        suggestion: 'Il dato sembra anomalo. Verifica che i prelievi siano in m³ e non in litri (1 m³ = 1.000 L). Normale solo per settori ad alta intensità idrica (bevande, carta, chimico).',
      };
      if (m3pp > 1000) return {
        id: this.id, severity: 'warning', section: this.section,
        area: 'Acqua vs Dipendenti',
        message: `Prelievo idrico per dipendente elevato: ${m3pp.toFixed(0)} m³/dip (media PMI: < 1.000).`,
        suggestion: 'Valuta se il settore giustifica questo livello (es. alimentare, manifattura). Aggiungi una nota esplicativa.',
      };
      return null;
    },
  },

  // ─── SCARICO > PRELIEVO ───────────────────────────────────────────────
  {
    id: 'discharge_exceeds_withdrawal',
    section: 'ac',
    run(data) {
      const wa = calcWater(data);
      const scarico = parseFloat(data?.ac?.scaricoN) || 0;
      if (wa.tot < 1 || scarico < 1) return null;
      if (scarico > wa.tot) return {
        id: this.id, severity: 'error', section: this.section,
        area: 'Acqua — Coerenza',
        message: `Lo scarico (${scarico.toLocaleString()} m³) supera il prelievo totale (${wa.tot.toLocaleString()} m³).`,
        suggestion: 'Il volume scaricato non può superare quello prelevato. Controlla le unità di misura e i valori delle singole fonti.',
      };
      return null;
    },
  },

  // ─── HEADCOUNT INCOERENTE tra Anagrafica e Personale ─────────────────
  {
    id: 'headcount_mismatch',
    section: 'pe',
    run(data) {
      const hcAna = parseInt(data?.ana?.hc) || 0;
      const hcPe = parseInt(data?.pe?.hc) || 0;
      if (hcAna < 1 || hcPe < 1) return null;
      const diff = Math.abs(hcAna - hcPe);
      const pct = (diff / Math.max(hcAna, hcPe)) * 100;
      if (pct > 20) return {
        id: this.id, severity: 'warning', section: this.section,
        area: 'Personale — Coerenza',
        message: `Dipendenti in Anagrafica (${hcAna}) e in Personale (${hcPe}) differiscono del ${pct.toFixed(0)}%.`,
        suggestion: 'Verifica che entrambi i campi si riferiscano allo stesso perimetro e periodo. Usa la media annua, non la fotografia di fine anno.',
      };
      return null;
    },
  },

  // ─── DONNE + UOMINI ≠ TOTALE ─────────────────────────────────────────
  {
    id: 'gender_sum_mismatch',
    section: 'pe',
    run(data) {
      const pe = data?.pe || {};
      const hc = parseInt(pe.hc) || 0;
      const donne = parseInt(pe.donne) || 0;
      const uomini = parseInt(pe.uomini) || 0;
      if (hc < 1 || (donne < 1 && uomini < 1)) return null;
      const somma = donne + uomini;
      if (somma !== hc) return {
        id: this.id, severity: 'warning', section: this.section,
        area: 'Personale — Coerenza',
        message: `Donne (${donne}) + Uomini (${uomini}) = ${somma}, diverso dal totale dipendenti (${hc}).`,
        suggestion: 'La somma di donne e uomini dovrebbe corrispondere al totale Headcount. Controlla se ci sono dipendenti con genere non dichiarato.',
      };
      return null;
    },
  },

  // ─── INFORTUNI vs ORE LAVORATE ────────────────────────────────────────
  {
    id: 'injuries_without_hours',
    section: 'pe',
    run(data) {
      const pe = data?.pe || {};
      const infort = parseInt(pe.infort) || 0;
      const oreLav = parseFloat(pe.oreLav) || 0;
      if (infort < 1) return null;
      if (oreLav < 1) return {
        id: this.id, severity: 'warning', section: this.section,
        area: 'H&S — Coerenza',
        message: `Sono stati inseriti ${infort} infortuni ma le ore lavorate totali sono 0.`,
        suggestion: 'Inserisci le ore lavorate totali (da LUL) per calcolare correttamente l\'Indice di Frequenza (IF), obbligatorio per il VSME.',
      };
      const orePP = oreLav / (parseInt(pe.hc) || 1);
      if (orePP > 3000) return {
        id: this.id, severity: 'warning', section: this.section,
        area: 'H&S — Coerenza',
        message: `Ore lavorate per dipendente elevate: ${orePP.toFixed(0)} h/dip (massimo legale: ~2.000–2.200 h).`,
        suggestion: 'Le ore lavorate sembrano eccessive. Verifica che il valore sia il totale annuo dell\'intera forza lavoro (es. 50 dip × 1.800 h = 90.000 h).',
      };
      return null;
    },
  },

  // ─── GENDER PAY GAP NEGATIVO (donne guadagnano di più) ───────────────
  {
    id: 'negative_gender_pay_gap',
    section: 'pe',
    run(data) {
      const pe = data?.pe || {};
      const rU = parseFloat(pe.retUom) || 0;
      const rD = parseFloat(pe.retDon) || 0;
      if (rU < 1 || rD < 1) return null;
      if (rD > rU * 1.5) return {
        id: this.id, severity: 'warning', section: this.section,
        area: 'Retribuzione — Coerenza',
        message: `La retribuzione media femminile (€${rD.toLocaleString()}) supera di oltre il 50% quella maschile (€${rU.toLocaleString()}).`,
        suggestion: 'Il dato sembra insolito. Verifica che entrambi i valori siano la retribuzione media annua lorda nella stessa area/livello. Potrebbe indicare un perimetro di confronto non omogeneo.',
      };
      return null;
    },
  },

  // ─── CDA: DONNE > TOTALE ─────────────────────────────────────────────
  {
    id: 'cda_women_exceeds_total',
    section: 'gov',
    run(data) {
      const gov = data?.gov || {};
      const tot = parseInt(gov.compCDA) || 0;
      const donne = parseInt(gov.donneCDA) || 0;
      if (tot < 1 || donne < 1) return null;
      if (donne > tot) return {
        id: this.id, severity: 'error', section: this.section,
        area: 'Governance — Coerenza',
        message: `Donne nel CdA (${donne}) supera il totale dei componenti (${tot}).`,
        suggestion: 'Il numero di donne nel CdA non può essere superiore al totale. Correggi uno dei due valori.',
      };
      return null;
    },
  },

  // ─── SANZIONI SENZA CONDANNE ──────────────────────────────────────────
  {
    id: 'sanctions_without_convictions',
    section: 'gov',
    run(data) {
      const gov = data?.gov || {};
      const san = parseFloat(gov.san) || 0;
      const cond = parseInt(gov.cond) || 0;
      if (san > 10000 && cond === 0) return {
        id: this.id, severity: 'warning', section: this.section,
        area: 'Governance — Coerenza',
        message: `Sanzioni significative (€${san.toLocaleString()}) con zero condanne per corruzione.`,
        suggestion: 'Se le sanzioni non sono legate a episodi corruttivi, specificalo nelle note (es. sanzioni amministrative, violazioni fiscali, ecc.).',
      };
      return null;
    },
  },
];

/**
 * Esegue tutti i check di congruenza sui dati forniti.
 * @param {object} data - Dati del report
 * @param {string|null} section - Se specificato, restituisce solo i check per quella sezione
 * @returns {Array} Lista di alert di congruenza
 */
export function runCongruenceChecks(data, section = null) {
  const results = [];
  for (const check of CHECKS) {
    if (section && check.section !== section) continue;
    try {
      const result = check.run(data);
      if (result) results.push(result);
    } catch {
      // ignora errori di calcolo su dati incompleti
    }
  }
  return results;
}