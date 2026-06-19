import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ExternalLink, CheckCircle2, Circle } from 'lucide-react';
import { EFRAG_REFERENCES, EFRAG_STANDARD_URL, EFRAG_HUB_URL, extractEfragCodes } from '@/lib/efragReferences';

/**
 * Mostra il riferimento ufficiale EFRAG VSME per la sezione corrente,
 * con checklist dei parametri di conformità coperti per ciascun disclosure.
 */
export default function EfragReference({ reference }) {
  const [open, setOpen] = useState(false);
  const codes = extractEfragCodes(reference);
  if (!codes.length) return null;

  const totalPoints = codes.reduce((sum, c) => sum + (EFRAG_REFERENCES[c]?.datapoints?.length || 0), 0);
  const moduleLabel = EFRAG_REFERENCES[codes[0]]?.module;
  const isComprehensive = moduleLabel === 'Modulo Completo';

  return (
    <div className="mb-6 rounded-xl border border-green-200 bg-green-50/60 overflow-hidden">
      {/* Header bar */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-green-100/40 transition-colors"
      >
        <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isComprehensive ? 'bg-purple-100' : 'bg-primary/10'}`}>
          <BookOpen className={`w-4 h-4 ${isComprehensive ? 'text-purple-600' : 'text-primary'}`} />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary/60">
            Riferimento EFRAG VSME Standard — Conformità disclosure
          </p>
          <p className="text-sm font-bold text-forest-800 truncate">
            {codes.map((c) => `${c} — ${EFRAG_REFERENCES[c].title}`).join('  ·  ')}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isComprehensive ? 'bg-purple-100 text-purple-700' : 'bg-primary/10 text-primary'}`}>
            {moduleLabel}
          </span>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-200/60 text-green-800">
            {totalPoints} parametri coperti
          </span>
        </div>

        <ChevronDown className={`w-4 h-4 text-primary/60 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-1 border-t border-green-200/70 space-y-5">
              {codes.map((c) => {
                const ref = EFRAG_REFERENCES[c];
                const dps = ref?.datapoints || [];
                return (
                  <div key={c}>
                    {/* Disclosure header */}
                    <div className="flex items-start gap-2.5 mb-2.5">
                      <span className="shrink-0 mt-0.5 text-[11px] font-extrabold px-2 py-0.5 rounded bg-primary text-primary-foreground">
                        {c}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-forest-800">{ref.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                          <span className="font-semibold text-forest-700">Cosa richiede EFRAG: </span>
                          {ref.requires}
                        </p>
                      </div>
                    </div>

                    {/* Parametri di conformità */}
                    {dps.length > 0 && (
                      <div className="ml-8">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-green-700 mb-1.5">
                          ✅ Parametri di conformità coperti in questa sezione
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {dps.map((dp) => (
                            <div key={dp.id} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-[11px] text-forest-700 leading-snug">{dp.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Footer links */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-green-200/50">
                <a
                  href={EFRAG_STANDARD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Standard VSME ufficiale (PDF)
                </a>
                <a
                  href={EFRAG_HUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary/70 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> EFRAG Knowledge Hub
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}