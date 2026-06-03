import { SECTIONS, getSectionCompletion } from '@/lib/vsmeDefaults';
import { motion } from 'framer-motion';

export default function ReportSidebar({ data, activeSection, onNavigate, completion }) {
  let lastGroup = '';

  return (
    <aside className="w-72 bg-sidebar min-h-screen flex flex-col border-r border-sidebar-border shrink-0">
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="font-heading text-base font-extrabold text-white flex items-center gap-2">
          <span className="text-xl">🌿</span> VSME Builder
        </h1>
        <p className="text-[11px] text-sidebar-foreground/40 mt-1">Standard EFRAG · Sostenibilità PMI</p>
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[10px] text-sidebar-foreground/40 mt-1.5 text-right">{completion}% completato</p>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {SECTIONS.map((sec) => {
          const showGroup = sec.group !== lastGroup;
          if (showGroup) lastGroup = sec.group;
          const comp = getSectionCompletion(data, sec.id);
          const isActive = activeSection === sec.id;
          const isDash = sec.id === 'dash';

          return (
            <div key={sec.id}>
              {showGroup && (
                <div className="px-5 pt-4 pb-1.5 text-[9px] font-extrabold tracking-[0.14em] uppercase text-green-400/40 flex items-center gap-2">
                  {sec.group}
                  <div className="flex-1 h-px bg-green-400/10" />
                </div>
              )}
              <button
                onClick={() => onNavigate(sec.id)}
                className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-[13px] transition-all relative ${
                  isActive
                    ? 'bg-green-400/15 text-green-400 font-semibold'
                    : 'text-sidebar-foreground/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-green-400 to-green-500 rounded-r"
                  />
                )}
                <span className="text-sm w-5 text-center">{sec.icon}</span>
                <span className="flex-1 text-left">{sec.label}</span>
                {!isDash && comp.total > 0 && (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    comp.pct === 100
                      ? 'bg-green-400/20 text-green-400'
                      : comp.pct > 0
                      ? 'bg-yellow-400/15 text-yellow-400'
                      : 'bg-white/5 text-white/20'
                  }`}>
                    {comp.pct === 100 ? '✓' : `${comp.pct}%`}
                  </span>
                )}
                {isDash && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-400/15 text-blue-400">KPI</span>}
              </button>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}