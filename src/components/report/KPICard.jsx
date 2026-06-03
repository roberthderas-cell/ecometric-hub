import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

const colorMap = {
  green: 'from-green-500 to-green-600 shadow-green-500/30',
  amber: 'from-amber-500 to-amber-600 shadow-amber-500/30',
  blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
  red: 'from-red-500 to-red-600 shadow-red-500/30',
  default: 'from-slate-600 to-slate-700 shadow-slate-600/20',
};

export default function KPICard({ label, value, unit, color = 'default', delay = 0, description }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const gradient = colorMap[color] || colorMap.default;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className={`rounded-xl bg-gradient-to-br ${gradient} p-4 text-white shadow-lg hover:scale-[1.03] transition-transform`}
        onClick={() => description && setOpen(o => !o)}
        style={{ cursor: description ? 'pointer' : 'default' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide opacity-85 pr-6">{label}</p>
        <p className="font-heading text-2xl font-extrabold mt-1 leading-none">{value}</p>
        {unit && <p className="text-[10px] opacity-70 mt-1">{unit}</p>}
        {description && (
          <span className="absolute top-2.5 right-2.5 opacity-60 hover:opacity-100">
            <Info className="w-3.5 h-3.5" />
          </span>
        )}
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-72 rounded-xl bg-white border border-slate-200 shadow-2xl p-4 text-slate-800"
          >
            {/* Arrow */}
            <div className="absolute -bottom-2 left-5 w-4 h-4 bg-white border-b border-r border-slate-200 rotate-45" />
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 shrink-0 -mt-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-700">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}