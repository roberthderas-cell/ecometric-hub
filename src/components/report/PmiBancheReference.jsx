import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, ChevronDown, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PMI_BANCHE_BY_SECTION, PMI_BANCHE_DOC_TITLE, PMI_BANCHE_URL } from '@/lib/pmiBancheReferences';

/**
 * Mostra i datapoint del "Dialogo di Sostenibilità PMI-Banche" per la sezione corrente.
 * sectionKey: 'en' | 'ac' | 'ri' | 'pe' | 'gov' | 'ana' | 'biod' | 'inq'
 */
export default function PmiBancheReference({ sectionKey }) {
  const [open, setOpen] = useState(false);
  const datapoints = PMI_BANCHE_BY_SECTION[sectionKey];
  if (!datapoints || datapoints.length === 0) return null;

  const p1 = datapoints.filter((d) => d.priority === 1);
  const p2 = datapoints.filter((d) => d.priority === 2);

  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/50 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-100/40 transition-colors"
      >
        <span className="shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <Landmark className="w-4 h-4 text-blue-600" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500">
            Requisiti Banche · Tavolo MEF per la Finanza Sostenibile
          </p>
          <p className="text-sm font-bold text-blue-900 truncate">
            {PMI_BANCHE_DOC_TITLE}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-600 text-white">
            {p1.length} Priorità 1
          </span>
          {p2.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              {p2.length} Priorità 2
            </span>
          )}
        </div>

        <ChevronDown className={`w-4 h-4 text-blue-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
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
            <div className="px-4 pb-5 pt-1 border-t border-blue-200/70 space-y-4">
              {/* Priorità 1 */}
              {p1.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" /> Priorità 1 — Imprescindibile (anche per microimprese)
                  </p>
                  <div className="space-y-1.5">
                    {p1.map((dp) => (
                      <div key={dp.n} className="flex items-start gap-2.5 bg-blue-50 rounded-lg p-2.5">
                        <span className="shrink-0 text-[10px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded mt-0.5">
                          DP.{dp.n}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-blue-500 uppercase">{dp.tipologia} · </span>
                          <span className="text-[11px] text-blue-900 leading-snug">{dp.label}</span>
                          <p className="text-[10px] text-blue-400 mt-0.5">{dp.norma}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Priorità 2 */}
              {p2.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> Priorità 2 — Utile per banche, opzionale per microimprese
                  </p>
                  <div className="space-y-1.5">
                    {p2.map((dp) => (
                      <div key={dp.n} className="flex items-start gap-2.5 bg-white/60 rounded-lg p-2.5 border border-blue-100">
                        <span className="shrink-0 text-[10px] font-extrabold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded mt-0.5">
                          DP.{dp.n}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-blue-400 uppercase">{dp.tipologia} · </span>
                          <span className="text-[11px] text-blue-800 leading-snug">{dp.label}</span>
                          <p className="text-[10px] text-blue-300 mt-0.5">{dp.norma}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <a
                href={PMI_BANCHE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline pt-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Tavolo MEF per la Finanza Sostenibile
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}