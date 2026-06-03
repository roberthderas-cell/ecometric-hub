import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, TrendingUp } from 'lucide-react';

const colorMap = {
  green: 'from-green-500 to-green-600 shadow-green-500/30',
  amber: 'from-amber-500 to-amber-600 shadow-amber-500/30',
  blue:  'from-blue-500 to-blue-600 shadow-blue-500/30',
  red:   'from-red-500 to-red-600 shadow-red-500/30',
  default: 'from-slate-600 to-slate-700 shadow-slate-600/20',
};

const colorAccent = {
  green: '#16a34a',
  amber: '#d97706',
  blue:  '#2563eb',
  red:   '#dc2626',
  default: '#475569',
};

function KPIDrawer({ label, value, unit, description, color, onClose }) {
  const accent = colorAccent[color] || colorAccent.default;

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <motion.div
        key="drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="fixed top-0 right-0 h-full w-[340px] max-w-[92vw] z-[9999] bg-white shadow-2xl flex flex-col"
      >
        {/* Header colorato */}
        <div
          className="px-6 py-5 text-white flex items-start justify-between gap-3"
          style={{ background: `linear-gradient(135deg, ${accent}ee, ${accent}bb)` }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1">Indicatore KPI</p>
            <p className="font-heading text-base font-extrabold leading-snug">{label}</p>
            <p className="font-heading text-3xl font-extrabold mt-2 leading-none">
              {value}
              {unit && <span className="text-sm font-normal opacity-70 ml-1.5">{unit}</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" style={{ color: accent }} />
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cosa misura questo indicatore</p>
          </div>
          <p className="text-[14px] leading-relaxed text-slate-700">{description}</p>

          <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Standard di riferimento</p>
            <p className="text-xs text-slate-600">VSME — European Sustainability Reporting Standards (ESRS)</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            Chiudi
          </button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default function KPICard({ label, value, unit, color = 'default', delay = 0, description }) {
  const [open, setOpen] = useState(false);
  const gradient = colorMap[color] || colorMap.default;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className={`relative rounded-xl bg-gradient-to-br ${gradient} p-4 text-white shadow-lg hover:scale-[1.03] transition-transform`}
        onClick={() => description && setOpen(true)}
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

      {open && (
        <KPIDrawer
          label={label}
          value={value}
          unit={unit}
          description={description}
          color={color}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}