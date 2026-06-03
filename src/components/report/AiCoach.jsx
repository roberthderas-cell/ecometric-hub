import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, TrendingUp, Target, ArrowRight, Lightbulb, Leaf, Users, Shield, CheckCircle2 } from 'lucide-react';
import { calcESGScore, calcEnergy, calcWaste, calcWater, calcPersonnel } from '@/lib/vsmeDefaults';

// ─── MOTORE DI SUGGERIMENTI ──────────────────────────────────────────────────
function buildInsights(data) {
  const g   = calcEnergy(data);
  const w   = calcWaste(data);
  const wa  = calcWater(data);
  const p   = calcPersonnel(data);
  const pe  = data?.pe  || {};
  const gov = data?.gov || {};
  const ana = data?.ana || {};

  const hc     = parseInt(pe.hc)       || 0;
  const donne  = parseFloat(pe.donne)  || 0;
  const percD  = hc > 0 ? (donne / hc) * 100 : 0;
  const oreForm= parseFloat(pe.oreForm)|| 0;
  const IF     = parseFloat(p.IF)      || 0;
  const gpg    = parseFloat(p.gpg)     || 0;
  const fatturato = parseFloat(ana.fatturato) || 0;

  const list = [];

  /* ── AMBIENTE ── */
  if (g.pRen < 10) list.push({
    id: 'fv1', area: 'E', priority: 'high', icon: '☀️',
    title: 'Installa impianto fotovoltaico',
    short: `Solo ${g.pRen.toFixed(0)}% da fonti rinnovabili`,
    steps: [
      'Richiedi un sopralluogo tecnico gratuito a un installatore certificato',
      'Verifica le incentivazioni Conto Energia e detrazioni fiscali 50%',
      'Dimensiona l\'impianto su almeno il 30% del consumo annuo da rete',
      'Aggiorna il campo "Produzione FV Anno N" nella sezione Energia',
    ],
    impact: Math.round(Math.min(15, (30 - g.pRen) * 0.45)),
    refs: ['VSME B4-E1', 'GHG Protocol Scope 2'],
    effort: 'Alto',
    timeline: '6-12 mesi',
  });

  if (g.pRen >= 10 && g.pRen < 30) list.push({
    id: 'fv2', area: 'E', priority: 'medium', icon: '⚡',
    title: 'Aumenta la quota di energia rinnovabile',
    short: `${g.pRen.toFixed(0)}% rinnovabile — target consigliato ≥30%`,
    steps: [
      'Valuta l\'espansione dell\'impianto FV esistente o un contratto PPA',
      'Acquista Garanzie d\'Origine (GO) per coprire il gap residuo',
      'Certifica il consumo verde con il tuo fornitore di energia',
    ],
    impact: Math.round(Math.min(10, (30 - g.pRen) * 0.3)),
    refs: ['RE100 Initiative', 'VSME B4-E2'],
    effort: 'Medio',
    timeline: '3-6 mesi',
  });

  if (g.tot > 20 && g.s2LB > g.s1 * 0.5) list.push({
    id: 'go', area: 'E', priority: 'high', icon: '🌍',
    title: 'Acquista Garanzie d\'Origine (GO)',
    short: `Scope 2 = ${g.s2LB.toFixed(1)} tCO₂eq — certificabile a zero con GO`,
    steps: [
      'Contatta il GSE o un trader accreditato per GO rinnovabili',
      'Seleziona GO italiane (idro, eolico, solare) dello stesso anno',
      'Aggiorna il metodo di calcolo Scope 2 a "market-based" nel report',
      'Inserisci il fattore emissione GO = 0 nel campo dedicato',
    ],
    impact: Math.round(Math.min(8, g.s2LB * 0.4)),
    refs: ['GHG Protocol Scope 2 MB', 'VSME B4-E3'],
    effort: 'Basso',
    timeline: '1-3 mesi',
  });

  if (g.intensity > 200 && fatturato > 0) list.push({
    id: 'intens', area: 'E', priority: 'medium', icon: '📉',
    title: 'Riduci l\'intensità di emissione',
    short: `${g.intensity.toFixed(0)} tCO₂eq/M€ — benchmark PMI ≤100`,
    steps: [
      'Effettua un audit energetico per identificare i principali sprechi',
      'Sostituisci illuminazione con LED e installa inverter su motori',
      'Pianifica un piano di efficienza con obiettivo −20% consumi in 2 anni',
    ],
    impact: 6,
    refs: ['ISO 50001', 'VSME B4-E1'],
    effort: 'Medio',
    timeline: '6-18 mesi',
  });

  if (w.pRec < 50) list.push({
    id: 'rif1', area: 'E', priority: 'high', icon: '♻️',
    title: 'Migliora il tasso di recupero rifiuti',
    short: `Recupero attuale: ${w.pRec.toFixed(0)}% — target ≥65%`,
    steps: [
      'Esegui un audit dei flussi di rifiuto per categoria CER',
      'Stipula contratti con impianti di recupero certificati',
      'Forma i dipendenti sulla corretta separazione dei rifiuti',
      'Monitora mensilmente il peso per destinazione',
    ],
    impact: Math.round(Math.min(8, (65 - w.pRec) * 0.15)),
    refs: ['VSME B7', 'RENTRI'],
    effort: 'Medio',
    timeline: '3-6 mesi',
  });

  if (w.pRec >= 50 && w.pRec < 80) list.push({
    id: 'rif2', area: 'E', priority: 'low', icon: '🔄',
    title: 'Ottimizza la filiera dei rifiuti',
    short: `Recupero ${w.pRec.toFixed(0)}% — raggiungere ≥80% porta +${Math.round((80-w.pRec)*0.1)} pt E`,
    steps: [
      'Valuta il riciclo "closed-loop" con i tuoi fornitori',
      'Implementa un sistema di tracciamento digitale dei rifiuti (FIR/RENTRI)',
      'Esplora l\'economia circolare per i tuoi scarti produttivi principali',
    ],
    impact: Math.round((80 - w.pRec) * 0.1),
    refs: ['VSME B7', 'UE 2018/851'],
    effort: 'Medio',
    timeline: '6-12 mesi',
  });

  if (wa.high > 0) list.push({
    id: 'water', area: 'E', priority: 'medium', icon: '💧',
    title: 'Riduci prelievi in zone a stress idrico',
    short: `${wa.high.toFixed(0)} m³ prelevati in aree critiche`,
    steps: [
      'Installa sistemi di recupero e riutilizzo acque reflue',
      'Valuta fonti alternative (acqua piovana, ricircolo)',
      'Certificati Water Stewardship AWS o Alliance for Water Stewardship',
    ],
    impact: 4,
    refs: ['VSME B5', 'GRI 303'],
    effort: 'Alto',
    timeline: '12-24 mesi',
  });

  /* ── SOCIALE ── */
  if (percD < 25 && hc > 0) list.push({
    id: 'gen1', area: 'S', priority: 'high', icon: '👩‍💼',
    title: 'Politica di inclusione di genere',
    short: `${percD.toFixed(0)}% donne — target ≥30% per score Sociale ottimale`,
    steps: [
      'Adotta una policy scritta di pari opportunità e inclusione',
      'Imposta target di assunzione con obiettivi misurabili per genere',
      'Monitora annualmente il gender pay gap e pubblica i risultati',
      'Considera la certificazione UNI/PdR 125:2022 Parità di Genere',
    ],
    impact: Math.round(Math.min(10, (30 - percD) * 0.3)),
    refs: ['VSME S1', 'UNI/PdR 125:2022'],
    effort: 'Medio',
    timeline: '3-12 mesi',
  });

  if (gpg > 15) list.push({
    id: 'gpg', area: 'S', priority: 'high', icon: '💰',
    title: `Riduci il gender pay gap (${gpg.toFixed(0)}%)`,
    short: `Gap retributivo di genere elevato — soglia critica >15%`,
    steps: [
      'Commissiona un\'analisi retributiva per ruolo e banda',
      'Definisci un piano pluriennale di riallineamento salariale',
      'Documenta il piano nel report VSME con target e scadenze',
    ],
    impact: 6,
    refs: ['VSME S1-S2', 'Direttiva UE 2023/970'],
    effort: 'Alto',
    timeline: '12-36 mesi',
  });

  if (oreForm < 8) list.push({
    id: 'form', area: 'S', priority: 'medium', icon: '🎓',
    title: 'Pianifica formazione annuale strutturata',
    short: `${oreForm.toFixed(0)}h/dipendente — benchmark minimo 8h/anno`,
    steps: [
      'Costruisci un piano formativo annuale con budget dedicato',
      'Includi formazione su sicurezza, ESG e competenze trasversali',
      'Registra le ore di formazione per dipendente nel sistema HR',
      'Punta a 12h+ annue per massimizzare il punteggio Sociale',
    ],
    impact: Math.round(Math.min(8, (12 - oreForm) * 0.5)),
    refs: ['VSME S3', 'D.Lgs. 81/2008'],
    effort: 'Medio',
    timeline: '3-6 mesi',
  });

  if (IF > 15 && hc > 0) list.push({
    id: 'hs', area: 'S', priority: 'high', icon: '🦺',
    title: `Riduci l'indice di frequenza infortuni (${IF})`,
    short: `IF = ${IF} — soglia critica >15 per 1M ore lavorate`,
    steps: [
      'Esegui un\'analisi root cause di tutti gli infortuni recenti',
      'Rafforza i DPI e aggiorna il DVR secondo D.Lgs. 81/2008',
      'Implementa programmi di Near Miss reporting e safety walks',
      'Valuta la certificazione ISO 45001 per la sicurezza',
    ],
    impact: 8,
    refs: ['VSME S4', 'ISO 45001', 'D.Lgs. 81/2008'],
    effort: 'Alto',
    timeline: '6-18 mesi',
  });

  /* ── GOVERNANCE ── */
  if (gov.codEtico !== 'si') list.push({
    id: 'etica', area: 'G', priority: 'high', icon: '📜',
    title: 'Adotta un Codice Etico aziendale',
    short: 'Assente — richiesto da investitori ESG e banche verdi',
    steps: [
      'Redigi un Codice Etico che copra anticorruzione, conflitti di interesse, privacy',
      'Fallo approvare dal CDA e distribuirlo a tutti i dipendenti',
      'Inserisci la firma di accettazione nei contratti di lavoro',
      'Aggiorna il campo Governance nel report',
    ],
    impact: 8,
    refs: ['VSME G1', 'D.Lgs. 231/2001'],
    effort: 'Basso',
    timeline: '1-3 mesi',
  });

  if (gov.mog231 !== 'si') list.push({
    id: 'mog', area: 'G', priority: 'medium', icon: '⚖️',
    title: 'Implementa il Modello Organizzativo 231',
    short: 'MOG assente — richiesto per appalti pubblici e finanziamenti ESG',
    steps: [
      'Incarica un consulente per la mappatura dei reati-presupposto',
      'Nomina un Organismo di Vigilanza (OdV) indipendente',
      'Redigi il Modello con protocolli specifici per la tua attività',
      'Esegui formazione obbligatoria per tutto il personale',
    ],
    impact: 10,
    refs: ['D.Lgs. 231/2001', 'VSME G2'],
    effort: 'Alto',
    timeline: '6-12 mesi',
  });

  if (gov.iso45001 !== 'si') list.push({
    id: 'iso45', area: 'G', priority: 'medium', icon: '🛡️',
    title: 'Certifica ISO 45001 (Salute e Sicurezza)',
    short: 'Certificazione assente — forte peso su score G e S',
    steps: [
      'Esegui una gap analysis rispetto ai requisiti ISO 45001',
      'Scegli un ente di certificazione accreditato (Bureau Veritas, DNV, ecc.)',
      'Integra il sistema con le procedure esistenti DVR/HACCP',
    ],
    impact: 7,
    refs: ['ISO 45001:2018', 'VSME G3'],
    effort: 'Alto',
    timeline: '12-18 mesi',
  });

  if (gov.wb !== 'si') list.push({
    id: 'wb', area: 'G', priority: 'low', icon: '📢',
    title: 'Implementa un canale Whistleblowing',
    short: 'Assente — obbligatorio per aziende >50 dip. (Direttiva UE)',
    steps: [
      'Scegli una piattaforma digitale di segnalazione anonima',
      'Nomina il responsabile della gestione delle segnalazioni',
      'Forma i dipendenti e comunica il canale internamente',
    ],
    impact: 4,
    refs: ['D.Lgs. 24/2023', 'VSME G4'],
    effort: 'Basso',
    timeline: '1-2 mesi',
  });

  if (gov.pariGen !== 'si') list.push({
    id: 'pg', area: 'G', priority: 'low', icon: '🏅',
    title: 'Consegui la certificazione Parità di Genere',
    short: 'UNI/PdR 125:2022 — bonus fiscali e vantaggi in gare pubbliche',
    steps: [
      'Esegui una self-assessment con i 6 indicatori della norma',
      'Ingaggia un ente certificatore (SGS, Bureau Veritas, ecc.)',
      'Beneficia di sgravi contributivi fino al 1% (L. 162/2021)',
    ],
    impact: 5,
    refs: ['UNI/PdR 125:2022', 'L. 162/2021'],
    effort: 'Medio',
    timeline: '3-9 mesi',
  });

  return list.sort((a, b) => {
    const pOrder = { high: 0, medium: 1, low: 2 };
    return (pOrder[a.priority] - pOrder[b.priority]) || (b.impact - a.impact);
  });
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getRatingNext(esg) {
  const thresholds = [
    { rating: 'Leader', min: 85, icon: '🏆' },
    { rating: 'Avanzato', min: 70, icon: '⭐' },
    { rating: 'Buono', min: 55, icon: '✅' },
    { rating: 'In crescita', min: 35, icon: '📈' },
  ];
  const next = thresholds.find(t => t.min > esg.tot);
  if (!next) return null;
  return { ...next, gap: next.min - esg.tot };
}

const priorityCfg = {
  high:   { ring: 'border-red-200   bg-red-50/60',   badge: 'bg-red-100   text-red-700',   label: 'Urgente',  dot: 'bg-red-400' },
  medium: { ring: 'border-amber-200 bg-amber-50/60', badge: 'bg-amber-100 text-amber-700', label: 'Consigliato', dot: 'bg-amber-400' },
  low:    { ring: 'border-blue-200  bg-blue-50/50',  badge: 'bg-blue-100  text-blue-700',  label: 'Bonus',    dot: 'bg-blue-400' },
};

const areaCfg = {
  E: { label: 'Ambiente',   color: 'text-green-700',  bg: 'bg-green-100',  icon: Leaf },
  S: { label: 'Sociale',    color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Users },
  G: { label: 'Governance', color: 'text-purple-700', bg: 'bg-purple-100', icon: Shield },
};

const effortColor = { Basso: 'text-green-600', Medio: 'text-amber-600', Alto: 'text-red-600' };

// ─── COMPONENTE CARD SINGOLA ─────────────────────────────────────────────────
function InsightCard({ ins, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg   = priorityCfg[ins.priority];
  const aArea = areaCfg[ins.area];
  const AreaIcon = aArea.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`border rounded-xl overflow-hidden transition-shadow hover:shadow-md ${cfg.ring}`}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="text-xl shrink-0">{ins.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">{ins.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{ins.short}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${aArea.bg} ${aArea.color}`}>
            {ins.area}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${cfg.badge}`}>
            <TrendingUp className="w-2.5 h-2.5" /> +{ins.impact}pt
          </span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-current/10">
              {/* Steps */}
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mt-3 mb-2 flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3" /> Azioni concrete
              </p>
              <ol className="space-y-1.5">
                {ins.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground">
                    <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center shrink-0 text-[9px] font-bold text-muted-foreground mt-0.5">{i+1}</span>
                    {step}
                  </li>
                ))}
              </ol>

              {/* Meta info */}
              <div className="mt-3 flex flex-wrap gap-3 text-[10px]">
                <span>⏱ <b className={effortColor[ins.effort]}>{ins.effort}</b> sforzo · {ins.timeline}</span>
                <span className="text-muted-foreground">📋 {ins.refs.join(' · ')}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── COMPONENTE PRINCIPALE ───────────────────────────────────────────────────
export default function AiCoach({ data, esg }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const allInsights = useMemo(() => buildInsights(data), [data]);
  const nextRating  = getRatingNext(esg);

  const filtered = filter === 'all' ? allInsights : allInsights.filter(i => i.area === filter);
  const totalGain = allInsights.reduce((s, i) => s + i.impact, 0);
  const highCount = allInsights.filter(i => i.priority === 'high').length;

  const tabs = [
    { id: 'all', label: `Tutte (${allInsights.length})` },
    { id: 'E',   label: `🌿 E (${allInsights.filter(i=>i.area==='E').length})` },
    { id: 'S',   label: `👥 S (${allInsights.filter(i=>i.area==='S').length})` },
    { id: 'G',   label: `⚖️ G (${allInsights.filter(i=>i.area==='G').length})` },
  ];

  return (
    <div className="mb-6">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-500 hover:opacity-95 text-white rounded-2xl px-5 py-4 shadow-lg shadow-purple-500/25 transition-all"
      >
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <p className="text-sm font-extrabold font-heading leading-none">AI Coach ESG</p>
            {highCount > 0 && (
              <span className="text-[9px] font-bold bg-red-400/30 text-red-100 border border-red-300/30 rounded-full px-2 py-0.5">
                {highCount} urgenti
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/60 mt-0.5">
            {allInsights.length} azioni identificate · potenziale +{Math.min(totalGain, 40)} pt ESG
          </p>
        </div>
        {nextRating && (
          <div className="text-right hidden sm:block mr-1">
            <p className="text-[9px] text-white/40 uppercase tracking-wide">Prossimo livello</p>
            <p className="text-xs font-bold text-white">{nextRating.icon} {nextRating.rating} <span className="text-white/50">−{nextRating.gap}pt</span></p>
          </div>
        )}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-white/60" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">

              {/* Barra progressione verso prossimo rating */}
              {nextRating && (
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      Obiettivo: {nextRating.icon} {nextRating.rating}
                    </p>
                    <p className="text-[11px] text-purple-500 font-semibold">mancano <b>{nextRating.gap}</b> pt</p>
                  </div>
                  <div className="h-2.5 bg-purple-100 rounded-full overflow-hidden mb-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (esg.tot / nextRating.min) * 100)}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] text-purple-400">
                    Implementando le azioni urgenti potresti guadagnare fino a +{Math.min(allInsights.filter(i=>i.priority==='high').reduce((s,i)=>s+i.impact,0), nextRating.gap+5)} pt
                  </p>
                </div>
              )}

              {/* Tabs filtro area */}
              <div className="flex gap-1.5 flex-wrap">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFilter(t.id)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                      filter === t.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Cards suggerimenti */}
              <div className="space-y-2">
                {filtered.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <CheckCircle2 className="w-4 h-4" />
                    Ottimo! Nessuna azione urgente per questo pilastro.
                  </div>
                ) : (
                  filtered.map((ins, i) => (
                    <InsightCard key={ins.id} ins={ins} index={i} />
                  ))
                )}
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-muted-foreground/60 text-center flex items-center justify-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Suggerimenti basati sui dati inseriti · aggiornati in tempo reale
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}