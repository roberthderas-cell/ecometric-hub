import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ratingConfig = {
  Leader:     { bg: 'from-emerald-500 to-green-400',  text: 'text-white', ring: 'ring-emerald-400/40' },
  Avanzato:   { bg: 'from-blue-600 to-blue-400',      text: 'text-white', ring: 'ring-blue-400/40' },
  Buono:      { bg: 'from-cyan-600 to-cyan-400',      text: 'text-white', ring: 'ring-cyan-400/40' },
  'In crescita': { bg: 'from-amber-500 to-yellow-400', text: 'text-white', ring: 'ring-amber-400/40' },
  Base:       { bg: 'from-slate-500 to-slate-400',    text: 'text-white', ring: 'ring-slate-400/40' },
};

export default function LiveEsgBadge({ esg, compact = false }) {
  const [prev, setPrev] = useState(esg?.tot ?? null);
  const [delta, setDelta] = useState(null);

  useEffect(() => {
    if (prev !== null && esg?.tot !== undefined && esg.tot !== prev) {
      setDelta(esg.tot - prev);
      const t = setTimeout(() => setDelta(null), 2500);
      setPrev(esg.tot);
      return () => clearTimeout(t);
    }
    if (prev === null && esg?.tot !== undefined) setPrev(esg.tot);
  }, [esg?.tot]);

  if (!esg) return null;
  const cfg = ratingConfig[esg.rating] || ratingConfig.Base;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 bg-gradient-to-r ${cfg.bg} ${cfg.ring} ring-2 rounded-xl px-3 py-1.5 shadow-lg`}>
        <span className="text-white font-heading font-extrabold text-lg leading-none">{esg.tot}</span>
        <div>
          <p className="text-[9px] text-white/70 leading-none uppercase tracking-widest">ESG</p>
          <p className="text-[10px] text-white font-bold leading-none">{esg.rating}</p>
        </div>
        <AnimatePresence>
          {delta !== null && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={`text-xs font-bold ${delta > 0 ? 'text-green-100' : 'text-red-200'}`}
            >
              {delta > 0 ? <TrendingUp className="w-3.5 h-3.5 inline" /> : <TrendingDown className="w-3.5 h-3.5 inline" />}
              {delta > 0 ? '+' : ''}{delta}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className={`bg-gradient-to-br ${cfg.bg} ${cfg.ring} ring-2 rounded-2xl p-4 text-white shadow-xl min-w-[130px]`}
    >
      <p className="text-[9px] uppercase tracking-widest font-bold opacity-70 mb-1">Score ESG live</p>
      <div className="flex items-end gap-2">
        <motion.span
          key={esg.tot}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-heading text-4xl font-extrabold leading-none"
        >
          {esg.tot}
        </motion.span>
        <span className="text-sm opacity-60 pb-0.5">/100</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] font-bold bg-white/20 rounded-full px-2 py-0.5">{esg.rIcon} {esg.rating}</span>
        <AnimatePresence>
          {delta !== null && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`text-xs font-bold flex items-center gap-0.5 ${delta > 0 ? 'text-green-200' : 'text-red-300'}`}
            >
              {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {delta > 0 ? '+' : ''}{delta}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-1 text-center">
        {[['E', esg.E, '#86EFAC'], ['S', esg.S, '#93C5FD'], ['G', esg.G, '#C4B5FD']].map(([l, v, c]) => (
          <div key={l}>
            <p className="text-[8px] opacity-60 uppercase">{l}</p>
            <p className="text-xs font-bold" style={{ color: c }}>{v}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}