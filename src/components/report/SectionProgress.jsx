import { motion } from 'framer-motion';
import { SECTIONS, getSectionCompletion, getMissingMandatory } from '@/lib/vsmeDefaults';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const DATA_SECTIONS = ['ana', 'en', 'ac', 'ri', 'pe', 'gov'];

export default function SectionProgress({ data, activeSection, onNavigate }) {
  const sections = SECTIONS.filter(s => DATA_SECTIONS.includes(s.id));

  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
      {sections.map((sec, i) => {
        const comp = getSectionCompletion(data, sec.id);
        const missing = getMissingMandatory(data, sec.id);
        const isActive = activeSection === sec.id;
        const isDone = comp.total > 0 && comp.pct === 100;
        const hasWarning = missing.length > 0;

        return (
          <div key={sec.id} className="flex items-center">
            <button
              onClick={() => onNavigate(sec.id)}
              title={`${sec.label} — ${comp.pct}%`}
              className={`relative flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : isDone
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : hasWarning
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3 h-3 shrink-0" />
              ) : hasWarning ? (
                <AlertTriangle className="w-3 h-3 shrink-0" />
              ) : (
                <span className="text-xs">{sec.icon}</span>
              )}
              <span className="hidden sm:inline">{sec.label.split(' —')[0].split('(')[0].trim()}</span>
              {!isDone && comp.total > 0 && comp.pct > 0 && (
                <span className={`text-[9px] ${isActive ? 'text-white/70' : 'text-muted-foreground'}`}>{comp.pct}%</span>
              )}
            </button>
            {i < sections.length - 1 && (
              <motion.div
                className={`w-3 h-0.5 mx-0.5 rounded-full ${isDone ? 'bg-green-300' : 'bg-border'}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.05 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}