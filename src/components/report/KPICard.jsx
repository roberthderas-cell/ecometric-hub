import { motion } from 'framer-motion';

const colorMap = {
  green: 'from-green-500 to-green-600 shadow-green-500/30',
  amber: 'from-amber-500 to-amber-600 shadow-amber-500/30',
  blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
  red: 'from-red-500 to-red-600 shadow-red-500/30',
  default: 'from-slate-600 to-slate-700 shadow-slate-600/20',
};

export default function KPICard({ label, value, unit, color = 'default', delay = 0 }) {
  const gradient = colorMap[color] || colorMap.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-xl bg-gradient-to-br ${gradient} p-4 text-white shadow-lg cursor-default hover:scale-[1.03] transition-transform`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-85">{label}</p>
      <p className="font-heading text-2xl font-extrabold mt-1 leading-none">{value}</p>
      {unit && <p className="text-[10px] opacity-70 mt-1">{unit}</p>}
    </motion.div>
  );
}