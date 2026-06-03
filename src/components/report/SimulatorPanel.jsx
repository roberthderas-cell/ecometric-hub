import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FlaskConical, TrendingUp, TrendingDown, Minus, RotateCcw } from 'lucide-react';
import { calcEnergy, calcWaste, calcWater, calcPersonnel, calcESGScore } from '@/lib/vsmeDefaults';

// ─── Slider input row ────────────────────────────────────────────────────────
function SimRow({ label, field, value, min, max, step = 1, unit, simVal, onChange }) {
  const diff = simVal - value;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{value}{unit}</span>
          <span className="text-xs font-bold text-slate-800">{simVal}{unit}</span>
          {diff !== 0 && (
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${diff > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
              {diff > 0 ? '+' : ''}{diff.toFixed(step < 1 ? 1 : 0)}
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={simVal}
        onChange={e => onChange(field, parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full accent-primary cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ─── Score delta badge ────────────────────────────────────────────────────────
function ScoreDelta({ label, real, sim, color }) {
  const diff = sim - real;
  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  return (
    <div className={`rounded-xl p-3 text-center border ${color}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">{label}</p>
      <p className="font-heading text-2xl font-extrabold text-slate-800">{sim}</p>
      <div className={`flex items-center justify-center gap-1 mt-1 text-xs font-bold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-slate-400'}`}>
        <Icon className="w-3.5 h-3.5" />
        {diff > 0 ? '+' : ''}{diff}
      </div>
    </div>
  );
}

const ratingBg = {
  'Leader':      'from-green-600 to-green-500',
  'Avanzato':    'from-blue-600 to-blue-500',
  'Buono':       'from-cyan-600 to-cyan-500',
  'In crescita': 'from-amber-600 to-amber-500',
  'Base':        'from-slate-500 to-slate-400',
};

// ─── Main panel ───────────────────────────────────────────────────────────────
export default function SimulatorPanel({ data, realEsg, onClose }) {
  // Extract base numeric values from real data
  const en = data?.en || {};
  const ri = data?.ri || {};
  const pe = data?.pe || {};
  const fonti = data?.acfonti?.fonti || [];
  const waterTotReal = fonti.reduce((s, f) => s + (parseFloat(f.prelievo) || 0), 0);

  const [sim, setSim] = useState({
    elReteN: parseFloat(en.elReteN) || 0,
    elFVN:   parseFloat(en.elFVN)   || 0,
    totN:    parseFloat(ri.totN)    || 0,
    recN:    parseFloat(ri.recN)    || 0,
    waterTot: waterTotReal,
    donne:   parseFloat(pe.donne)   || 0,
    oreForm: parseFloat(pe.oreForm) || 0,
  });

  const reset = useCallback(() => setSim({
    elReteN: parseFloat(en.elReteN) || 0,
    elFVN:   parseFloat(en.elFVN)   || 0,
    totN:    parseFloat(ri.totN)    || 0,
    recN:    parseFloat(ri.recN)    || 0,
    waterTot: waterTotReal,
    donne:   parseFloat(pe.donne)   || 0,
    oreForm: parseFloat(pe.oreForm) || 0,
  }), [en, ri, pe, waterTotReal]);

  const onChange = (field, val) => setSim(s => ({ ...s, [field]: val }));

  // Build simulated data object
  const simData = {
    ...data,
    en: { ...en, elReteN: String(sim.elReteN), elFVN: String(sim.elFVN) },
    ri: { ...ri, totN: String(sim.totN), recN: String(sim.recN) },
    pe: { ...pe, donne: String(sim.donne), oreForm: String(sim.oreForm) },
    acfonti: {
      fonti: fonti.length > 0
        ? fonti.map((f, i) => i === 0 ? { ...f, prelievo: String(sim.waterTot) } : f)
        : [{ fonte: 'Acquedotto/rete', prelievo: String(sim.waterTot), stress: 'No', riciclata: 'No' }],
    },
  };

  const simEsg = calcESGScore(simData);

  // Base values for slider ranges (use real as anchor)
  const elBase = Math.max(sim.elReteN, 10000);
  const totNBase = Math.max(sim.totN, 1000);
  const hc = parseInt(pe.hc) || 10;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      className="fixed top-0 right-0 h-full w-[380px] max-w-[95vw] z-[9990] bg-white shadow-2xl flex flex-col border-l border-slate-200"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-forest-900 to-forest-700 px-5 py-4 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <FlaskConical className="w-5 h-5 text-green-300" />
          <div>
            <p className="font-heading font-bold text-sm">Simulatore ESG</p>
            <p className="text-[11px] text-white/60">Modifica i valori senza salvare</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="Reset">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Score comparison */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 shrink-0">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className={`rounded-xl bg-gradient-to-br ${ratingBg[realEsg.rating] || ratingBg.Base} p-3 text-white text-center`}>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-0.5">Attuale</p>
            <p className="font-heading text-3xl font-extrabold">{realEsg.tot}</p>
            <p className="text-[11px] opacity-70">{realEsg.rating}</p>
          </div>
          <div className={`rounded-xl bg-gradient-to-br ${ratingBg[simEsg.rating] || ratingBg.Base} p-3 text-white text-center ring-2 ring-white shadow-lg`}>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-0.5">Simulato</p>
            <p className="font-heading text-3xl font-extrabold">{simEsg.tot}</p>
            <p className="text-[11px] opacity-70">{simEsg.rating}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <ScoreDelta label="E" real={realEsg.E} sim={simEsg.E} color="bg-green-50 border-green-100" />
          <ScoreDelta label="S" real={realEsg.S} sim={simEsg.S} color="bg-blue-50 border-blue-100" />
          <ScoreDelta label="G" real={realEsg.G} sim={simEsg.G} color="bg-purple-50 border-purple-100" />
        </div>
      </div>

      {/* Sliders */}
      <div className="flex-1 overflow-y-auto px-5 py-5">

        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">⚡ Energia</p>
        <SimRow label="Elettricità da rete" field="elReteN"
          value={parseFloat(en.elReteN) || 0} min={0} max={Math.max(elBase * 2, 100000)} step={1000} unit=" kWh"
          simVal={sim.elReteN} onChange={onChange} />
        <SimRow label="Fotovoltaico autoprodotto" field="elFVN"
          value={parseFloat(en.elFVN) || 0} min={0} max={Math.max(elBase, 50000)} step={500} unit=" kWh"
          simVal={sim.elFVN} onChange={onChange} />

        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 mt-2">♻️ Rifiuti</p>
        <SimRow label="Rifiuti totali" field="totN"
          value={parseFloat(ri.totN) || 0} min={0} max={Math.max(totNBase * 3, 10000)} step={100} unit=" kg"
          simVal={sim.totN} onChange={onChange} />
        <SimRow label="Rifiuti a recupero" field="recN"
          value={parseFloat(ri.recN) || 0} min={0} max={sim.totN || 10000} step={100} unit=" kg"
          simVal={Math.min(sim.recN, sim.totN)} onChange={onChange} />

        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 mt-2">💧 Acqua</p>
        <SimRow label="Prelievi idrici totali" field="waterTot"
          value={waterTotReal} min={0} max={Math.max(waterTotReal * 3, 10000)} step={100} unit=" m³"
          simVal={sim.waterTot} onChange={onChange} />

        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 mt-2">👥 Personale</p>
        <SimRow label="Dipendenti donne" field="donne"
          value={parseFloat(pe.donne) || 0} min={0} max={hc} step={1} unit=""
          simVal={sim.donne} onChange={onChange} />
        <SimRow label="Ore formazione/anno" field="oreForm"
          value={parseFloat(pe.oreForm) || 0} min={0} max={50} step={1} unit=" h"
          simVal={sim.oreForm} onChange={onChange} />

        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700 leading-relaxed">
          <strong>Nota:</strong> La simulazione è solo visiva. Le modifiche non vengono salvate nel report.
        </div>
      </div>
    </motion.div>
  );
}