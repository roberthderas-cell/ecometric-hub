import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
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

function AnimatedNumber({ value }) {
  // Parse numeric portion for animation
  const raw = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  const suffix = String(value).replace(/^[0-9.\-]+/, '');
  const [displayed, setDisplayed] = useState(0);
  const started = useRef(false);

  // Trigger count-up on mount
  useState(() => {
    if (isNaN(raw)) return;
    let start = null;
    const duration = 900;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(eased * raw);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  if (isNaN(raw)) return <>{value}</>;

  const formatted = displayed.toLocaleString('it-IT', {
    maximumFractionDigits: String(value).includes('.') ? 2 : 0,
  });

  return <>{formatted}{suffix}</>;
}

export default function KPICard({ label, value, unit, color = 'default', delay = 0, description }) {
  const [open, setOpen] = useState(false);
  const gradient = colorMap[color] || colorMap.default;

  // 3-D tilt on hover
  const cardRef = useRef(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springX = useSpring(rotX, { stiffness: 260, damping: 20 });
  const springY = useSpring(rotY, { stiffness: 260, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotX.set(-y * 10);
    rotY.set(x * 10);
  };
  const handleMouseLeave = () => { rotX.set(0); rotY.set(0); };

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ rotateX: springX, rotateY: springY, transformPerspective: 800 }}
        whileTap={{ scale: 0.97 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative rounded-xl bg-gradient-to-br ${gradient} p-4 text-white shadow-lg cursor-pointer overflow-hidden`}
        onClick={() => description && setOpen(true)}
      >
        {/* Shine overlay */}
        <motion.div
          className="absolute inset-0 bg-white/10 opacity-0 rounded-xl pointer-events-none"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
        {/* Pulse ring on mount */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-white/30 pointer-events-none"
          initial={{ scale: 1.1, opacity: 0.6 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ delay: delay + 0.2, duration: 0.7, ease: 'easeOut' }}
        />

        <p className="text-[10px] font-bold uppercase tracking-wide opacity-85 pr-6">{label}</p>
        <motion.p
          className="font-heading text-2xl font-extrabold mt-1 leading-none"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.15, duration: 0.35 }}
        >
          <AnimatedNumber value={value} />
        </motion.p>
        {unit && (
          <motion.p
            className="text-[10px] opacity-70 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: delay + 0.3 }}
          >
            {unit}
          </motion.p>
        )}
        {description && (
          <motion.span
            className="absolute top-2.5 right-2.5"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1 }}
            whileHover={{ opacity: 1, scale: 1.2 }}
            transition={{ delay: delay + 0.35, type: 'spring', stiffness: 400 }}
          >
            <Info className="w-3.5 h-3.5" />
          </motion.span>
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