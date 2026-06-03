import { motion } from 'framer-motion';

export default function SectionHeader({ icon, title, description, reference, badge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 p-7 text-white mb-6"
    >
      <div className="absolute -top-8 -right-8 w-44 h-44 opacity-10">
        <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
      </div>
      <div className="flex items-start gap-4 relative z-10">
        <span className="text-4xl drop-shadow-lg">{icon}</span>
        <div>
          <h2 className="font-heading text-xl font-extrabold mb-1.5">{title}</h2>
          <p className="text-[13px] text-white/65 leading-relaxed max-w-xl">{description}</p>
          {reference && (
            <span className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-green-300/80 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1">
              📋 {reference}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}