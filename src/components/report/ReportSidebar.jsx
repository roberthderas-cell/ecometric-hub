import { SECTIONS, getSectionCompletion, getMissingMandatory, calcESGScore } from '@/lib/vsmeDefaults';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

function EsgMiniBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-bold w-3 text-white/40">{label}</span>
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[9px] font-bold w-5 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

export default function ReportSidebar({ data, activeSection, onNavigate, completion }) {
  const esg = calcESGScore(data);
  const modulo = data?.ana?.modulo || 'basic';
  
  let lastGroup = '';

  const visibleSections = SECTIONS.filter(sec => {
    if (sec.group === 'MODULO COMPLETO') return modulo === 'comprehensive';
    return true;
  });

  const ratingColor = {
    Leader: '#34D399', Avanzato: '#60A5FA', Buono: '#22D3EE',
    'In crescita': '#FCD34D', Base: '#94A3B8',
  }[esg.rating] || '#94A3B8';

  return (
    <aside className="w-64 bg-sidebar min-h-screen flex flex-col border-r border-sidebar-border shrink-0">

      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="font-heading text-sm font-extrabold text-white flex items-center gap-2 mb-3">
          <span className="text-lg">🌿</span> VSME Builder
        </h1>

        {/* ESG Live Score mini card */}
        <div className="bg-white/5 rounded-xl px-3 py-2.5 mb-3 border border-white/8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Score ESG</p>
              <div className="flex items-baseline gap-1">
                <motion.span
                  key={esg.tot}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-heading text-2xl font-extrabold text-white leading-none"
                >
                  {esg.tot}
                </motion.span>
                <span className="text-[10px] text-white/30">/100</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold px-2 py-0.5 rounded-full border" style={{ color: ratingColor, borderColor: ratingColor + '40', backgroundColor: ratingColor + '15' }}>
                {esg.rIcon} {esg.rating}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <EsgMiniBar label="E" value={esg.E} color="#34D399" />
            <EsgMiniBar label="S" value={esg.S} color="#60A5FA" />
            <EsgMiniBar label="G" value={esg.G} color="#C4B5FD" />
          </div>
        </div>

        {/* Completion */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-[9px] text-white/30 uppercase tracking-wide font-bold">Completamento</p>
            <p className="text-[10px] text-white/50 font-bold">{completion}%</p>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {visibleSections.map((sec) => {
          const showGroup = sec.group !== lastGroup;
          if (showGroup) lastGroup = sec.group;
          const comp = getSectionCompletion(data, sec.id);
          const isActive = activeSection === sec.id;
          const isDash = sec.id === 'dash';
          const missing = getMissingMandatory(data, sec.id);
          const isDone = comp.total > 0 && comp.pct === 100;

          return (
            <div key={sec.id}>
              {showGroup && (
                <div className="px-4 pt-4 pb-1.5 text-[8px] font-extrabold tracking-[0.14em] uppercase text-green-400/30 flex items-center gap-2">
                  {sec.group}
                  <div className="flex-1 h-px bg-green-400/10" />
                </div>
              )}
              <button
                onClick={() => onNavigate(sec.id)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-[12px] transition-all relative group ${
                  isActive
                    ? 'bg-green-400/15 text-green-400 font-semibold'
                    : 'text-sidebar-foreground/55 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-green-400 to-emerald-500 rounded-r"
                  />
                )}
                <span className="text-sm w-5 text-center shrink-0">{sec.icon}</span>
                <span className="flex-1 text-left leading-tight truncate">{sec.label}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {missing.length > 0 && (
                    <AlertTriangle className="w-3 h-3 text-amber-400" title={`Mancante: ${missing.join(', ')}`} />
                  )}
                  {!isDash && isDone && (
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  )}
                  {!isDash && !isDone && comp.total > 0 && comp.pct > 0 && (
                    <span className="text-[9px] font-bold text-yellow-400">{comp.pct}%</span>
                  )}
                  {isDash && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-400/15 text-blue-400">KPI</span>}
                </div>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[9px] text-white/20 text-center font-mono">VSME · EFRAG 2024 · v2.0</p>
      </div>
    </aside>
  );
}