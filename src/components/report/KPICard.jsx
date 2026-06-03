import { useState } from 'react';
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
  const gradient = colorMap[color] || colorMap.default;

  return (
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 rounded-xl bg-black/80 backdrop-blur-sm flex flex-col justify-center items-start p-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 opacity-70 hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-60 mb-1">{label}</p>
            <p className="text-sm leading-snug opacity-90">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}