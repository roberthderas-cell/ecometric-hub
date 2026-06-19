import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import {
  Lightbulb, TrendingUp, Leaf, Shield, Users,
  CheckCircle2, AlertTriangle, Target, Award,
  RefreshCw, ChevronDown, Sparkles, Zap, ArrowRight
} from 'lucide-react';
import { calcESGScore, calcEnergy, calcWaste, calcPersonnel } from '@/lib/vsmeDefaults';

// ── Calcola consigli localmente sui dati live ────────────────────────────────
function computeRecommendations(data) {
  const esg = calcESGScore(data);
  const energy = calcEnergy(data);
  const waste = calcWaste(data);
  const pers = calcPersonnel(data);
  const pe = data?.pe || {};
  const gov = data?.gov || {};
  const ana = data?.ana || {};

  const ambiente = [];
  const sociale = [];
  const governance = [];

  // ── Ambiente ──────────────────────────────────────────────────────────────
  const pRen = energy.pRenTot || 0;
  if (pRen < 35) {
    ambiente.push({
      area: 'Energia Rinnovabile',
      azione: pRen < 5
        ? 'Avviare la transizione energetica: installare fotovoltaico o acquistare energia verde (GO)'
        : 'Aumentare la quota di energia rinnovabile sopra il 35% del totale consumato',
      impatto: `Score E attuale: ${esg.E}/100 — obiettivo +${Math.min(20, Math.round((35 - pRen) / 2))} pts`,
      target: '≥35% rinnovabile',
      current: `${pRen.toFixed(1)}%`,
      priorita: pRen < 5 ? 'alta' : pRen < 15 ? 'media' : 'bassa',
      gauge: Math.min(100, (pRen / 35) * 100),
    });
  }

  const inten = energy.intensity || 0;
  if (inten > 100) {
    ambiente.push({
      area: 'Efficienza Energetica',
      azione: 'Audit energetico e sostituzione impianti obsoleti (LED, motori IE3, HVAC efficiente)',
      impatto: `Riduzione Scope 2 e costi energetici — intensità attuale: ${Math.round(inten)} tCO₂/€M`,
      target: '<100 tCO₂/€M fatturato',
      current: `${Math.round(inten)} tCO₂/€M`,
      priorita: inten > 400 ? 'alta' : inten > 250 ? 'media' : 'bassa',
      gauge: Math.min(100, (100 / inten) * 100),
    });
  }

  const pRec = waste.pRec || 0;
  if (pRec < 65) {
    ambiente.push({
      area: 'Economia Circolare',
      azione: 'Migliorare la raccolta differenziata e stipulare accordi con impianti di recupero certificati',
      impatto: `Riduzione costi smaltimento e score E — recupero attuale: ${pRec.toFixed(1)}%`,
      target: '≥85% avviato a recupero',
      current: `${pRec.toFixed(1)}%`,
      priorita: pRec < 30 ? 'alta' : pRec < 50 ? 'media' : 'bassa',
      gauge: Math.min(100, (pRec / 65) * 100),
    });
  }

  // ── Sociale ───────────────────────────────────────────────────────────────
  const hc = parseInt(pe.hc) || 0;
  const donne = parseFloat(pe.donne) || 0;
  const percD = hc > 0 ? (donne / hc) * 100 : 0;
  if (percD < 30 && hc > 0) {
    sociale.push({
      area: 'Parità di Genere',
      azione: 'Adottare un piano di azioni positive per la parità di genere e richiedere la certificazione UNI/PdR 125',
      impatto: `Miglioramento score S — % donne attuale: ${percD.toFixed(1)}%`,
      target: '≥30% donne in organico',
      current: `${percD.toFixed(1)}%`,
      priorita: percD < 15 ? 'alta' : 'media',
      gauge: Math.min(100, (percD / 30) * 100),
    });
  }

  const oreForm = parseFloat(pe.oreForm) || 0;
  if (oreForm < 18) {
    sociale.push({
      area: 'Formazione',
      azione: 'Aumentare le ore di formazione pro-capite con piani di upskilling e fondi interprofessionali',
      impatto: `Score S — ore formazione attuali: ${oreForm}/dipendente/anno`,
      target: '≥18 ore/dipendente/anno',
      current: `${oreForm} ore`,
      priorita: oreForm < 4 ? 'alta' : oreForm < 8 ? 'media' : 'bassa',
      gauge: Math.min(100, (oreForm / 18) * 100),
    });
  }

  const IF = parseFloat(pers.IF) || 0;
  if (IF > 8 && hc > 0) {
    sociale.push({
      area: 'Salute & Sicurezza',
      azione: 'Intensificare il piano di prevenzione infortuni: DUVRI, formazione sicurezza, DPI adeguati',
      impatto: `Riduzione IF — indice attuale: ${IF} infortuni/Mhore lavorate`,
      target: 'IF <8',
      current: `IF: ${IF}`,
      priorita: IF > 25 ? 'alta' : 'media',
      gauge: Math.min(100, (8 / Math.max(IF, 1)) * 100),
    });
  }

  // ── Governance ────────────────────────────────────────────────────────────
  if (gov.mog231 !== 'si') {
    governance.push({
      area: 'Modello 231',
      azione: 'Implementare Modello Organizzativo 231 con OdV e sistema sanzionatorio',
      impatto: 'Riduzione rischi legali e penali d\'impresa — score G +1.5 pts',
      target: 'MOG 231 adottato',
      current: 'Non adottato',
      priorita: 'alta',
      gauge: 0,
    });
  }

  if (gov.codEtico !== 'si') {
    governance.push({
      area: 'Codice Etico',
      azione: 'Redigere e approvare codice etico con formazione obbligatoria per tutti i dipendenti',
      impatto: 'Compliance e reputazione — score G +1.0 pts',
      target: 'Codice etico adottato',
      current: 'Assente',
      priorita: 'media',
      gauge: 0,
    });
  }

  if (gov.iso45001 !== 'si') {
    governance.push({
      area: 'ISO 45001',
      azione: 'Certificare il sistema di gestione salute e sicurezza sul lavoro (ISO 45001)',
      impatto: 'Riduzione infortuni e score G (+1.5 pts)',
      target: 'Certificazione ISO 45001',
      current: 'Non certificato',
      priorita: 'media',
      gauge: 0,
    });
  }

  if (gov.wb !== 'si') {
    governance.push({
      area: 'Whistleblowing',
      azione: 'Attivare canale segnalazioni conforme al D.Lgs. 24/2023 (obbligo per >50 dip.)',
      impatto: 'Compliance normativa e score G (+0.5 pts)',
      target: 'Canale WB attivo',
      current: 'Non attivo',
      priorita: hc > 50 ? 'alta' : 'bassa',
      gauge: 0,
    });
  }

  // Ordine per priorità
  const ord = { alta: 0, media: 1, bassa: 2 };
  ambiente.sort((a, b) => ord[a.priorita] - ord[b.priorita]);
  sociale.sort((a, b) => ord[a.priorita] - ord[b.priorita]);
  governance.sort((a, b) => ord[a.priorita] - ord[b.priorita]);

  return { esg, ambiente, sociale, governance };
}

// ── Animazione numero ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = '' }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;
    if (from === to) return;
    let start = null;
    const dur = 600;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(from + (to - from) * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return <span>{displayed}{suffix}</span>;
}

// ── Barra progresso animata ────────────────────────────────────────────────────
function GaugeBar({ value, color, label, current }) {
  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span className="font-bold">{current}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ── Card singola raccomandazione ──────────────────────────────────────────────
const priorityCfg = {
  alta: { badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', label: 'ALTA' },
  media: { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400', label: 'MEDIA' },
  bassa: { badge: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400', label: 'BASSA' },
};

const pillarCfg = {
  ambiente: { icon: Leaf, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', barColor: 'bg-green-500' },
  sociale:  { icon: Users, color: 'text-blue-600',  bg: 'bg-blue-50',  border: 'border-blue-200',  barColor: 'bg-blue-500'  },
  governance:{ icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', barColor: 'bg-purple-500' },
};

function RecommendationCard({ rec, index, pillar, isNew }) {
  const cfg = pillarCfg[pillar];
  const pCfg = priorityCfg[rec.priorita] || priorityCfg.bassa;
  const [open, setOpen] = useState(false);
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, x: -20, scale: 0.97 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.97 }}
      transition={{ delay: index * 0.06, duration: 0.28, layout: { duration: 0.25 } }}
      className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}
    >
      <button type="button" onClick={() => setOpen(v => !v)} className="w-full text-left p-4 hover:brightness-95 transition-all">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
            <Icon className={`w-4 h-4 ${cfg.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot} shrink-0`} />
              <span className="font-semibold text-sm text-foreground leading-snug">{rec.azione}</span>
              <Badge className={`text-[9px] font-bold border ${pCfg.badge} shrink-0`}>{pCfg.label}</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3 shrink-0" />{rec.impatto}
            </p>
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className={`shrink-0 ${cfg.color}`}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className={`px-4 pb-4 border-t ${cfg.border}`}>
              <div className="pt-3 grid grid-cols-2 gap-3 text-[11px] mb-1">
                <div>
                  <p className="font-bold text-muted-foreground uppercase tracking-wide mb-1">Area</p>
                  <p className="text-foreground font-medium">{rec.area}</p>
                </div>
                <div>
                  <p className="font-bold text-muted-foreground uppercase tracking-wide mb-1">Obiettivo</p>
                  <p className="text-foreground font-medium">{rec.target}</p>
                </div>
              </div>
              {rec.gauge !== undefined && (
                <GaugeBar
                  value={rec.gauge}
                  color={cfg.barColor}
                  label="Progresso verso obiettivo"
                  current={rec.current}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Sezione per pillar ─────────────────────────────────────────────────────────
function PillarSection({ pillar, recs, prevRecs }) {
  const cfg = pillarCfg[pillar];
  const Icon = cfg.icon;
  if (!recs?.length) return null;

  const prevKeys = new Set((prevRecs || []).map(r => r.area));

  return (
    <motion.div layout initial={false}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${cfg.color}`} />
        <h3 className="font-heading font-bold text-sm text-foreground">
          {pillar === 'ambiente' ? 'Ambiente & Energia' : pillar === 'sociale' ? 'Sociale' : 'Governance'}
        </h3>
        <AnimatePresence mode="wait">
          <motion.span
            key={recs.length}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}
          >
            {recs.length} {recs.length === 1 ? 'azione' : 'azioni'}
          </motion.span>
        </AnimatePresence>
      </div>
      <motion.div layout className="space-y-2">
        <AnimatePresence>
          {recs.map((rec, i) => (
            <RecommendationCard
              key={rec.area}
              rec={rec}
              index={i}
              pillar={pillar}
              isNew={!prevKeys.has(rec.area)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── Score card con animazione ─────────────────────────────────────────────────
function ScoreCard({ label, value, icon: Icon, color, barColor, bg, border }) {
  return (
    <motion.div layout className={`p-4 rounded-xl border ${border} ${bg} flex items-center gap-3`}>
      <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">{label}</p>
        <div className="flex items-end gap-1">
          <span className={`font-heading font-bold text-2xl ${color}`}>
            <AnimatedNumber value={value} />
          </span>
          <span className="text-xs text-muted-foreground mb-0.5">/100</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ── Componente principale ─────────────────────────────────────────────────────
export default function EsgRecommendationsPanel({ reportId, data }) {
  const prevRecsRef = useRef({});
  const isFirstRef = useRef(true);

  // Calcolo live sui dati in arrivo — nessuna chiamata API, aggiornamento istantaneo
  const result = useMemo(() => {
    if (!data) return null;
    return computeRecommendations(data);
  }, [data]);

  useEffect(() => {
    if (result && !isFirstRef.current) {
      prevRecsRef.current = {
        ambiente: result.ambiente,
        sociale: result.sociale,
        governance: result.governance,
      };
    }
    if (result) isFirstRef.current = false;
  }, [result]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  const { esg, ambiente, sociale, governance } = result;
  const totalActions = ambiente.length + sociale.length + governance.length;
  const potenziale = totalActions * 3 + 5;

  return (
    <motion.div layout className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Piano di Miglioramento ESG
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Consigli personalizzati — si aggiornano in tempo reale al variare dei dati
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 shrink-0">
          <Zap className="w-3 h-3 text-green-600" />
          <span className="text-[10px] font-bold text-green-700">Live</span>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ScoreCard label="Ambiente (E)" value={esg.E} icon={Leaf} color="text-green-600" barColor="bg-green-500" bg="bg-green-50" border="border-green-200" />
        <ScoreCard label="Sociale (S)"  value={esg.S} icon={Users} color="text-blue-600" barColor="bg-blue-500"  bg="bg-blue-50"  border="border-blue-200" />
        <ScoreCard label="Governance (G)" value={esg.G} icon={Shield} color="text-purple-600" barColor="bg-purple-500" bg="bg-purple-50" border="border-purple-200" />
      </div>

      {/* Score totale */}
      <motion.div
        layout
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-forest-900 to-forest-700 px-5 py-4 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-white/60 uppercase font-bold tracking-wide">Score ESG Totale</p>
            <div className="flex items-end gap-2">
              <span className="font-heading font-bold text-4xl">
                <AnimatedNumber value={esg.tot} />
              </span>
              <span className="text-white/50 text-sm mb-1">/100</span>
              <span className="text-lg mb-0.5">{esg.rIcon}</span>
            </div>
            <span className="text-[11px] font-bold text-green-300">{esg.rating}</span>
          </div>
          <div className="w-20 h-20 relative">
            <svg viewBox="0 0 80 80" className="rotate-[-90deg]">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <motion.circle
                cx="40" cy="40" r="32" fill="none"
                stroke="rgba(134,239,172,0.9)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - esg.tot / 100) }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
          </div>
        </div>
        <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-400 rounded-full"
            animate={{ width: `${esg.tot}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Raccomandazioni */}
      {totalActions > 0 ? (
        <motion.div layout className="space-y-6">
          <PillarSection pillar="ambiente" recs={ambiente} prevRecs={prevRecsRef.current.ambiente} />
          <PillarSection pillar="sociale"  recs={sociale}  prevRecs={prevRecsRef.current.sociale}  />
          <PillarSection pillar="governance" recs={governance} prevRecs={prevRecsRef.current.governance} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-green-50 rounded-xl border border-green-200"
        >
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
          <p className="font-heading font-bold text-lg text-green-800">Ottimo lavoro!</p>
          <p className="text-sm text-green-600 mt-1">Il tuo profilo ESG è già su tutti i parametri target</p>
        </motion.div>
      )}

      {/* Footer */}
      {totalActions > 0 && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Potenziale di miglioramento</p>
              <p className="text-xs text-green-700 mt-0.5">
                Completando le <span className="font-bold">{totalActions} azioni</span> suggerite puoi raggiungere un score di{' '}
                <span className="font-bold">~{Math.min(100, esg.tot + potenziale)} punti</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}