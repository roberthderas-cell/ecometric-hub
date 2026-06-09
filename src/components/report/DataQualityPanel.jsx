/**
 * DataQualityPanel — pannello real-time di controllo qualità dati.
 * Combina CongruenceChecks (regole cross-campo) + YoY anomaly detection.
 * Si aggiorna ad ogni modifica del report senza polling né apertura di modal.
 */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX, ChevronDown, ChevronUp, X, TrendingUp, TrendingDown, AlertTriangle, XCircle } from 'lucide-react';
import { runCongruenceChecks } from '@/lib/congruenceChecks';
import { detectAnomalies } from '@/lib/anomalyDetection';

const SEV = {
  error:  { icon: XCircle,        color: 'text-red-500',    bg: 'bg-red-50 border-red-200',    badge: 'bg-red-100 text-red-700',    dot: 'bg-red-500' },
  warning:{ icon: AlertTriangle,  color: 'text-amber-500',  bg: 'bg-amber-50 border-amber-200',badge: 'bg-amber-100 text-amber-700',dot: 'bg-amber-400' },
  high:   { icon: XCircle,        color: 'text-red-500',    bg: 'bg-red-50 border-red-200',    badge: 'bg-red-100 text-red-700',    dot: 'bg-red-500' },
  medium: { icon: AlertTriangle,  color: 'text-amber-500',  bg: 'bg-amber-50 border-amber-200',badge: 'bg-amber-100 text-amber-700',dot: 'bg-amber-400' },
};

function IssueRow({ item, onNavigate, onDismiss }) {
  const [open, setOpen] = useState(false);
  const s = SEV[item.severity] || SEV.warning;
  const Icon = s.icon;
  const isAnomaly = !!item.currentVal;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`rounded-lg border text-xs overflow-hidden ${s.bg}`}
    >
      <div
        className="flex items-start gap-2 p-2.5 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${s.color}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground leading-snug truncate">
            {isAnomaly ? item.label : item.area}
          </p>
          {isAnomaly && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {item.pctChange > 0 ? '+' : ''}{item.pctChange.toFixed(0)}% rispetto al riferimento
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onDismiss && (
            <button
              onClick={e => { e.stopPropagation(); onDismiss(item.id || item.path); }}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          {open ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-2.5 pb-2.5 space-y-1.5"
          >
            {isAnomaly ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-white/80 rounded px-2 py-1 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase">Attuale</p>
                    <p className={`font-bold text-sm ${item.pctChange > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      {item.currentVal?.toLocaleString('it-IT', { maximumFractionDigits: 1 })} {item.unit}
                    </p>
                  </div>
                  {item.pctChange > 0
                    ? <TrendingUp className="w-4 h-4 text-red-400" />
                    : <TrendingDown className="w-4 h-4 text-blue-400" />
                  }
                  <div className="bg-white/80 rounded px-2 py-1 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase">Riferimento</p>
                    <p className="font-bold text-sm text-foreground">
                      {item.referenceVal?.toLocaleString('it-IT', { maximumFractionDigits: 1 })} {item.unit}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {item.pctChange > 0
                    ? `Aumento del ${Math.abs(item.pctChange).toFixed(0)}%. Verifica se è un dato reale o un errore.`
                    : `Calo del ${Math.abs(item.pctChange).toFixed(0)}%. Potrebbe essere un calo reale o un'omissione.`}
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] text-foreground/80 leading-relaxed">{item.message}</p>
                <p className="text-[11px] text-primary/80 leading-relaxed">💡 {item.suggestion}</p>
              </>
            )}
            {item.navId && (
              <button
                onClick={() => onNavigate(item.navId || item.section)}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                → Vai alla sezione
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DataQualityPanel({ data, snapshots = [], onNavigate }) {
  const [dismissed, setDismissed] = useState(new Set());
  const [collapsed, setCollapsed] = useState(false);

  const { congruence, anomalies, totalIssues, errorCount } = useMemo(() => {
    const congruence = runCongruenceChecks(data).filter(a => !dismissed.has(a.id));
    const anomalies = detectAnomalies(data, snapshots).filter(a => !dismissed.has(a.path));
    const totalIssues = congruence.length + anomalies.length;
    const errorCount = congruence.filter(c => c.severity === 'error').length + anomalies.filter(a => a.severity === 'high').length;
    return { congruence, anomalies, totalIssues, errorCount };
  }, [data, snapshots, dismissed]);

  const handleDismiss = (key) => setDismissed(prev => new Set([...prev, key]));

  const statusIcon = errorCount > 0 ? ShieldX : totalIssues > 0 ? ShieldAlert : ShieldCheck;
  const StatusIcon = statusIcon;
  const statusColor = errorCount > 0 ? 'text-red-500' : totalIssues > 0 ? 'text-amber-500' : 'text-green-500';
  const statusBg = errorCount > 0 ? 'bg-red-50 border-red-200' : totalIssues > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200';

  return (
    <div className={`rounded-xl border ${statusBg} overflow-hidden transition-colors duration-300`}>
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${statusColor}`} />
          <span className="text-xs font-bold text-foreground">
            Qualità dati
          </span>
          {totalIssues > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${errorCount > 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
              {totalIssues}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {totalIssues === 0 && (
            <span className="text-[10px] text-green-700 font-medium">OK</span>
          )}
          {collapsed ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>

      {/* Body */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5 max-h-72 overflow-y-auto">
              {totalIssues === 0 ? (
                <p className="text-[11px] text-green-700 py-1">
                  ✓ Nessuna incongruenza o anomalia rilevata nei dati inseriti.
                </p>
              ) : (
                <>
                  {congruence.length > 0 && (
                    <>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground pt-0.5">Incongruenze</p>
                      <AnimatePresence>
                        {congruence.map(item => (
                          <IssueRow
                            key={item.id}
                            item={item}
                            onNavigate={onNavigate}
                            onDismiss={handleDismiss}
                          />
                        ))}
                      </AnimatePresence>
                    </>
                  )}
                  {anomalies.length > 0 && (
                    <>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground pt-1">Variazioni anomale</p>
                      <AnimatePresence>
                        {anomalies.map(item => (
                          <IssueRow
                            key={item.path}
                            item={item}
                            onNavigate={onNavigate}
                            onDismiss={handleDismiss}
                          />
                        ))}
                      </AnimatePresence>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}