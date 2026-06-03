import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Zap, TrendingUp, Target, Award } from 'lucide-react';
import { calcESGScore, calcEnergy, calcWaste } from '@/lib/vsmeDefaults';

function getInsights(data, esg) {
  const g = calcEnergy(data);
  const w = calcWaste(data);
  const pe = data?.pe || {};
  const gov = data?.gov || {};
  const insights = [];

  // Energia
  if (g.pRen < 15) insights.push({
    priority: 'high', icon: '⚡', area: 'E',
    title: 'Installa pannelli fotovoltaici',
    desc: `Con il ${Math.round(g.pRen)}% di rinnovabile, un impianto FV al 20% porterebbe +${Math.min(12, Math.round((20 - g.pRen) * 0.4))} pt su E.`,
    impact: Math.min(12, Math.round((20 - g.pRen) * 0.4)),
  });
  if (g.tot > 50) insights.push({
    priority: 'high', icon: '🌍', area: 'E',
    title: 'Acquista Garanzie d\'Origine (GO)',
    desc: 'Certificare energia rinnovabile abbassa il Scope 2 market-based a zero e può aggiungere fino a +8 pt ambiente.',
    impact: 8,
  });

  // Rifiuti
  if (w.pRec < 65) insights.push({
    priority: 'high', icon: '♻️', area: 'E',
    title: 'Aumenta la raccolta differenziata',
    desc: `Il tuo tasso di recupero è ${w.pRec.toFixed(0)}%. Raggiungere il 65% aggiungerebbe circa +5 pt ESG.`,
    impact: 5,
  });

  // Personale
  const hc = parseInt(pe.hc) || 0;
  const donne = parseFloat(pe.donne) || 0;
  const percD = hc > 0 ? (donne / hc) * 100 : 0;
  if (percD < 30 && hc > 0) insights.push({
    priority: 'medium', icon: '👩‍💼', area: 'S',
    title: 'Politiche di inclusione di genere',
    desc: `Con il ${percD.toFixed(0)}% di donne, adottare target di genere documentati aggiunge +4 pt Sociale.`,
    impact: 4,
  });
  if (!pe.oreForm || parseFloat(pe.oreForm) < 8) insights.push({
    priority: 'medium', icon: '🎓', area: 'S',
    title: 'Piani di formazione annuali',
    desc: 'Documentare almeno 8h di formazione per dipendente porta +5 pt sul pilastro Sociale.',
    impact: 5,
  });

  // Governance
  if (gov.codEtico !== 'si') insights.push({
    priority: 'medium', icon: '📜', area: 'G',
    title: 'Adotta un Codice Etico',
    desc: 'Un Codice Etico formalizzato è il passo più rapido per migliorare la Governance (+6 pt G).',
    impact: 6,
  });
  if (gov.mog231 !== 'si') insights.push({
    priority: 'low', icon: '⚖️', area: 'G',
    title: 'Valuta il Modello 231',
    desc: 'Il MOG 231 è molto apprezzato dai finanziatori ESG e aggiunge +10 pt Governance.',
    impact: 10,
  });
  if (gov.wb !== 'si') insights.push({
    priority: 'low', icon: '📢', area: 'G',
    title: 'Implementa Whistleblowing',
    desc: 'Richiesto dalla Direttiva UE 2019/1937. Aggiunge +3 pt G e migliora la compliance.',
    impact: 3,
  });

  return insights.sort((a, b) => b.impact - a.impact).slice(0, 5);
}

function getRatingNext(esg) {
  const thresholds = [
    { rating: 'Leader', min: 85, icon: '🏆', color: '#059669' },
    { rating: 'Avanzato', min: 70, icon: '⭐', color: '#2563EB' },
    { rating: 'Buono', min: 55, icon: '✅', color: '#0891B2' },
    { rating: 'In crescita', min: 35, icon: '📈', color: '#D97706' },
  ];
  const current = thresholds.find(t => esg.tot >= t.min);
  const next = thresholds.find(t => t.min > esg.tot);
  if (!next) return null;
  return { ...next, gap: next.min - esg.tot };
}

const priorityConfig = {
  high:   { bg: 'bg-red-50 border-red-200',    badge: 'bg-red-100 text-red-700',    dot: 'bg-red-400' },
  medium: { bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  low:    { bg: 'bg-blue-50 border-blue-200',   badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400' },
};

const areaColor = { E: 'text-green-600', S: 'text-blue-600', G: 'text-purple-600' };

export default function AiCoach({ data, esg }) {
  const [open, setOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const insights = getInsights(data, esg);
  const nextRating = getRatingNext(esg);
  const potentialGain = insights.reduce((s, i) => s + i.impact, 0);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white rounded-2xl px-5 py-4 shadow-lg shadow-purple-500/20 transition-all group"
      >
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Sparkles className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold font-heading leading-none">AI Coach ESG</p>
          <p className="text-[11px] text-white/65 mt-0.5">
            {insights.length} azioni prioritarie · +{potentialGain} pt potenziali
          </p>
        </div>
        {nextRating && (
          <div className="text-right mr-2 hidden sm:block">
            <p className="text-[9px] text-white/50 uppercase tracking-wide">Prossimo target</p>
            <p className="text-sm font-bold">{nextRating.icon} {nextRating.rating} <span className="text-white/60">−{nextRating.gap}pt</span></p>
          </div>
        )}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-white/70" />
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
            <div className="mt-2 space-y-2">
              {/* Next rating progress */}
              {nextRating && (
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" /> Obiettivo {nextRating.icon} {nextRating.rating}
                    </p>
                    <p className="text-[11px] text-purple-500">mancano <b>{nextRating.gap}</b> punti</p>
                  </div>
                  <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (esg.tot / nextRating.min) * 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] text-purple-400 mt-1.5">
                    Con le azioni suggerite potresti guadagnare +{Math.min(potentialGain, 30)} pt e raggiungere il livello successivo
                  </p>
                </div>
              )}

              {/* Insights */}
              {insights.map((ins, i) => {
                const cfg = priorityConfig[ins.priority];
                const isExpanded = expandedIdx === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`border rounded-xl overflow-hidden ${cfg.bg}`}
                  >
                    <button
                      onClick={() => setExpandedIdx(isExpanded ? null : i)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    >
                      <span className="text-lg shrink-0">{ins.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{ins.title}</p>
                        <p className={`text-[10px] font-bold ${areaColor[ins.area]}`}>Pilastro {ins.area}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.badge}`}>
                          <TrendingUp className="w-2.5 h-2.5" /> +{ins.impact}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 pt-0">
                            <p className="text-xs text-muted-foreground leading-relaxed border-t border-current/10 pt-2">{ins.desc}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}