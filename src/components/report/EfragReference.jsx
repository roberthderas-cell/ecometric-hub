import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ExternalLink } from 'lucide-react';
import { EFRAG_REFERENCES, EFRAG_STANDARD_URL, extractEfragCodes } from '@/lib/efragReferences';

/**
 * Mostra il riferimento ufficiale EFRAG VSME per la sezione corrente.
 * Ricava i codici disclosure (es. B3, B8/B9/B10, C1) dalla stringa `reference`.
 */
export default function EfragReference({ reference }) {
  const [open, setOpen] = useState(false);
  const codes = extractEfragCodes(reference);
  if (!codes.length) return null;

  const module = EFRAG_REFERENCES[codes[0]]?.module;

  return (
    <div className="mb-6 rounded-xl border border-green-200 bg-green-50/60 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-green-100/40 transition-colors"
      >
        <span className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary/70">
            Riferimento ufficiale EFRAG VSME
          </p>
          <p className="text-sm font-bold text-forest-800 truncate">
            {codes.map((c) => `${c} — ${EFRAG_REFERENCES[c].title}`).join('  ·  ')}
          </p>
        </div>
        {module && (
          <span className="hidden sm:inline-flex shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
            {module}
          </span>
        )}
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
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-green-200/70">
              {codes.map((c) => (
                <div key={c} className="flex gap-3">
                  <span className="shrink-0 mt-0.5 text-[11px] font-extrabold px-2 py-0.5 rounded bg-primary text-primary-foreground h-fit">
                    {c}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-forest-800">{EFRAG_REFERENCES[c].title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      <span className="font-semibold text-forest-700">Cosa richiede EFRAG: </span>
                      {EFRAG_REFERENCES[c].requires}
                    </p>
                  </div>
                </div>
              ))}
              <a
                href={EFRAG_STANDARD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Apri lo Standard VSME ufficiale (EFRAG)
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}