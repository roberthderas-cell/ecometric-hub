import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, XCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

/**
 * Compute alerts from current data.
 * Returns array of { level: 'warning'|'critical', area, message, actions[] }
 */
export function computeAlerts(data) {
  const alerts = [];
  const en = data?.en || {};
  const ri = data?.ri || {};
  const fatt = parseFloat(data?.ana?.fatturato) || 0;
  const hc = parseInt(data?.ana?.hc) || parseInt(data?.pe?.hc) || 0;

  // --- ENERGIA ---
  const elRete = parseFloat(en.elReteN) || 0;
  const elFV = parseFloat(en.elFVN) || 0;
  const totKwh = elRete + elFV;
  const pRen = totKwh > 0 ? (elFV / totKwh) * 100 : 0;
  const ispra = parseFloat(en.ispra) || 0.211;
  const s2 = (elRete * ispra) / 1000;

  // Scope 2 emissioni
  if (s2 > 500) {
    alerts.push({
      level: 'critical', area: '⚡ Energia',
      message: `Scope 2 molto elevato: ${s2.toFixed(1)} tCO₂eq (soglia critica: 500 t).`,
      actions: [
        'Installa impianto fotovoltaico per ridurre il prelievo da rete',
        'Acquista certificati GOs (Garanzie di Origine) da rinnovabili',
        'Attiva contratto EE 100% rinnovabile con il fornitore',
      ],
    });
  } else if (s2 > 200) {
    alerts.push({
      level: 'warning', area: '⚡ Energia',
      message: `Scope 2 in zona attenzione: ${s2.toFixed(1)} tCO₂eq (soglia warning: 200 t).`,
      actions: [
        'Valuta l\'installazione di pannelli FV per almeno il 20% del fabbisogno',
        'Monitora i consumi per fascia oraria e ottimizza i picchi',
      ],
    });
  }

  // Quota rinnovabile bassa
  if (totKwh > 0 && pRen < 10) {
    alerts.push({
      level: 'warning', area: '⚡ Rinnovabili',
      message: `Solo ${pRen.toFixed(1)}% di energia rinnovabile (FV). Target ESG minimo: 15%.`,
      actions: [
        'Aumenta la produzione FV autoconsumata',
        'Acquista Garanzie di Origine (GO) per certificare l\'origine rinnovabile',
        'Partecipa a Comunità Energetiche Rinnovabili (CER) locali',
      ],
    });
  }

  // Scope 2 per dipendente
  if (hc > 0 && s2 > 0) {
    const s2pp = s2 / hc;
    if (s2pp > 5) {
      alerts.push({
        level: 'warning', area: '⚡ Intensità',
        message: `Emissioni Scope 2 per dipendente elevate: ${s2pp.toFixed(2)} tCO₂eq/dip (soglia: 5).`,
        actions: [
          'Avvia programma di efficienza energetica (LED, Building Management System)',
          'Valuta audit energetico ISO 50001',
        ],
      });
    }
  }

  // Intensità GHG su fatturato
  if (fatt > 0 && s2 > 0) {
    const intensity = ((s2) / fatt) * 1_000_000;
    if (intensity > 300) {
      alerts.push({
        level: 'critical', area: '⚡ Intensità GHG',
        message: `Intensità GHG/fatturato critica: ${intensity.toFixed(1)} tCO₂eq/M€ (soglia: 300).`,
        actions: [
          'Definisci un piano di decarbonizzazione con target annui',
          'Considera certificazione ISO 14064 per migliorare la credibilità ESG',
          'Valorizza le riduzioni ottenute per accedere a green finance (es. ESG-linked bond)',
        ],
      });
    }
  }

  // Scope 1 combustibili
  let s1 = 0;
  (data?.enfuels?.rows || []).forEach(r => {
    s1 += ((parseFloat(r.quantita) || 0) * (parseFloat(r.fattoreCO2) || 0)) / 1000;
  });
  if (s1 > 300) {
    alerts.push({
      level: 'critical', area: '🔥 Combustibili (Scope 1)',
      message: `Scope 1 molto elevato: ${s1.toFixed(1)} tCO₂eq (soglia critica: 300 t).`,
      actions: [
        'Elettrifica processi produttivi attualmente a gas/gasolio',
        'Sostituisci il parco auto con veicoli elettrici o ibridi plug-in',
        'Valuta biogas/biometano certificato per impianti termici',
      ],
    });
  } else if (s1 > 100) {
    alerts.push({
      level: 'warning', area: '🔥 Combustibili (Scope 1)',
      message: `Scope 1 in zona attenzione: ${s1.toFixed(1)} tCO₂eq (soglia: 100 t).`,
      actions: [
        'Mappa i principali processi con consumo di gas/gasolio',
        'Valuta l\'isolamento termico degli edifici (cappotto, sostituzione serramenti)',
      ],
    });
  }

  // --- RIFIUTI ---
  const totKg = parseFloat(ri.totN) || 0;
  const periKg = parseFloat(ri.periN) || 0;
  const recKg = parseFloat(ri.recN) || 0;
  const pRec = totKg > 0 ? (recKg / totKg) * 100 : 0;
  const percPeri = totKg > 0 ? (periKg / totKg) * 100 : 0;

  // Recupero insufficiente
  if (totKg > 0 && pRec < 40) {
    alerts.push({
      level: 'critical', area: '♻️ Rifiuti — Recupero',
      message: `% Recupero molto bassa: ${pRec.toFixed(1)}% (soglia critica: 40%). Impatto diretto sul punteggio E.`,
      actions: [
        'Avvia raccolta differenziata interna per carta, plastica, metalli',
        'Stipula contratti con recuperatori R3–R5 per frazioni valorizzabili',
        'Revisiona il registro CER per massimizzare i codici R (recupero) vs D (smaltimento)',
      ],
    });
  } else if (totKg > 0 && pRec < 65) {
    alerts.push({
      level: 'warning', area: '♻️ Rifiuti — Recupero',
      message: `% Recupero inferiore al target ESG (${pRec.toFixed(1)}%). Target minimo: 65%.`,
      actions: [
        'Identifica le frazioni maggiori per smaltimento e valuta alternative di recupero',
        'Collabora con il RENTRI per ottimizzare le attribuzioni CER',
      ],
    });
  }

  // Pericolosi elevati
  if (periKg > 0 && percPeri > 20) {
    alerts.push({
      level: 'critical', area: '☣️ Rifiuti Pericolosi',
      message: `Rifiuti pericolosi: ${percPeri.toFixed(1)}% del totale (soglia critica: 20%).`,
      actions: [
        'Analizza le fasi di processo che generano rifiuti pericolosi (CER asterisco)',
        'Valuta sostituzione di reagenti/solventi con equivalenti non pericolosi',
        'Considera la certificazione ISO 14001 per sistematizzare la gestione',
      ],
    });
  } else if (periKg > 0 && percPeri > 10) {
    alerts.push({
      level: 'warning', area: '☣️ Rifiuti Pericolosi',
      message: `Rifiuti pericolosi al ${percPeri.toFixed(1)}% del totale (soglia: 10%). Monitora e riduci.`,
      actions: [
        'Mappa i CER pericolosi prevalenti e individua alternative di processo',
        'Verifica che tutti i formulari di trasporto siano corretti (responsabilità legale)',
      ],
    });
  }

  return alerts;
}

// ---- UI Component ----

const levelConfig = {
  critical: {
    bg: 'bg-red-50 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-500',
    badge: 'bg-red-100 text-red-700',
    badgeLabel: '🔴 Critico',
    actionBg: 'bg-red-50',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    badgeLabel: '🟡 Attenzione',
    actionBg: 'bg-amber-50',
  },
};

function AlertCard({ alert, index }) {
  const [open, setOpen] = useState(false);
  const cfg = levelConfig[alert.level];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border p-4 ${cfg.bg}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.badgeLabel}</span>
            <span className="text-xs font-bold text-foreground">{alert.area}</span>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">{alert.message}</p>
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-1 mt-2 text-[11px] font-bold text-primary hover:underline"
          >
            <Lightbulb className="w-3 h-3" />
            {open ? 'Nascondi azioni' : `${alert.actions.length} azioni correttive`}
            {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <AnimatePresence>
            {open && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {alert.actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 mt-1.5 text-xs text-foreground/70">
                    <span className="text-primary font-bold shrink-0 mt-0.5">→</span>
                    {a}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function EsgAlerts({ data, sections = ['energia', 'rifiuti'] }) {
  const all = computeAlerts(data);

  // Filter by relevant area keywords
  const sectionKeywords = {
    energia: ['⚡', '🔥'],
    rifiuti: ['♻️', '☣️'],
  };
  const keywords = sections.flatMap(s => sectionKeywords[s] || []);
  const alerts = all.filter(a => keywords.some(k => a.area.startsWith(k)));

  if (!alerts.length) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <span className="text-base">✅</span>
        <span className="font-semibold">Nessuna criticità rilevata per i dati inseriti. Ottimo lavoro!</span>
      </div>
    );
  }

  const criticals = alerts.filter(a => a.level === 'critical').length;
  const warnings = alerts.filter(a => a.level === 'warning').length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Validazione ESG</span>
        {criticals > 0 && <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{criticals} critico{criticals > 1 ? 'i' : ''}</span>}
        {warnings > 0 && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{warnings} warning</span>}
      </div>
      {alerts.map((a, i) => <AlertCard key={i} alert={a} index={i} />)}
    </div>
  );
}