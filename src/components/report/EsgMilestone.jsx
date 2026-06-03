import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const MILESTONES = [
  { min: 35, rating: 'In crescita', icon: '📈', msg: 'Ottimo inizio! Sei in crescita ESG.' },
  { min: 55, rating: 'Buono',       icon: '✅', msg: 'Score Buono raggiunto! Continua così.' },
  { min: 70, rating: 'Avanzato',    icon: '⭐', msg: 'Livello Avanzato! Sei tra i migliori PMI.' },
  { min: 85, rating: 'Leader',      icon: '🏆', msg: 'LEADER ESG! Traguardo eccezionale.' },
];

export default function EsgMilestone({ score }) {
  const prevScore = useRef(score);
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    const prev = prevScore.current;
    prevScore.current = score;
    if (score <= prev) return;

    const hit = MILESTONES.find(m => prev < m.min && score >= m.min);
    if (!hit) return;

    setCelebration(hit);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#059669','#34D399','#6EE7B7','#FCD34D','#60A5FA'] });
    const t = setTimeout(() => setCelebration(null), 4000);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-2xl shadow-2xl shadow-green-500/40 px-8 py-4 flex items-center gap-4 border border-green-400/30"
        >
          <span className="text-4xl">{celebration.icon}</span>
          <div>
            <p className="font-heading font-extrabold text-lg leading-none">{celebration.rating}!</p>
            <p className="text-sm text-white/80 mt-0.5">{celebration.msg}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}