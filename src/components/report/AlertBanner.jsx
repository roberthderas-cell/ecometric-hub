import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, AlertTriangle, X, ChevronRight } from 'lucide-react';

/**
 * Banner sticky sotto il topbar quando ci sono alert critici attivi.
 * Mostra solo i critici (severity=critical), può essere chiuso temporaneamente.
 */
export default function AlertBanner({ alerts, onNavigate }) {
  const [dismissed, setDismissed] = useState(false);

  const criticals = alerts.filter(a => a.severity === 'critical');
  if (criticals.length === 0 || dismissed) return null;

  const first = criticals[0];
  const rest = criticals.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-3"
      >
        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-red-700">
            {criticals.length === 1
              ? `Alert critico: ${first.label}`
              : `${criticals.length} alert critici attivi`}
          </span>
          <span className="text-xs text-red-600 truncate">
            {first.description}
          </span>
          {rest > 0 && (
            <span className="text-xs text-red-500 font-medium">+{rest} altri</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {first.section && onNavigate && (
            <button
              onClick={() => onNavigate(first.section)}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-0.5"
            >
              Vai alla sezione <ChevronRight className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="text-red-400 hover:text-red-600 transition-colors"
            title="Chiudi banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}