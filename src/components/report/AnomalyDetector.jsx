import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, TrendingUp, TrendingDown, CheckCircle2, FlaskConical, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { detectAnomalies } from '@/lib/anomalyDetection';

const SEV_CONFIG = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700 border border-red-200',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
    label: 'Alta priorità',
    dot: 'bg-red-500',
  },
  medium: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    icon: <Info className="w-3.5 h-3.5 text-amber-500" />,
    label: 'Da verificare',
    dot: 'bg-amber-400',
  },
};

const METHOD_LABEL = {
  zscore: (n) => `Media su ${n} versioni storiche`,
  delta: () => 'Versione precedente',
  yoy: () => 'Anno precedente (YoY)',
};

function fmtNum(v, unit) {
  if (v === undefined || v === null || isNaN(v)) return '—';
  const s = v > 9999 ? v.toLocaleString('it-IT', { maximumFractionDigits: 0 }) : parseFloat(v.toFixed(1)).toLocaleString('it-IT');
  return unit ? `${s} ${unit}` : s;
}

function AnomalyCard({ anomaly, index, onNavigate, onDismiss }) {
  const sev = SEV_CONFIG[anomaly.severity];
  const isUp = anomaly.pctChange > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, opacity: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-xl border p-4 ${sev.bg} ${sev.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xl mt-0.5 shrink-0">{anomaly.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="font-heading font-bold text-sm">{anomaly.label}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${sev.badge}`}>
                {sev.label}
              </span>
            </div>

            {/* Values comparison */}
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="bg-white/70 rounded-lg px-3 py-1.5 text-center border border-white/80">
                <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Valore attuale</p>
                <p className={`font-heading font-extrabold text-base ${isUp ? 'text-red-600' : 'text-blue-700'}`}>
                  {fmtNum(anomaly.currentVal, anomaly.unit)}
                </p>
              </div>
              <div className="flex flex-col items-center">
                {isUp
                  ? <TrendingUp className="w-5 h-5 text-red-400" />
                  : <TrendingDown className="w-5 h-5 text-blue-400" />
                }
                <span className={`text-xs font-extrabold ${isUp ? 'text-red-600' : 'text-blue-600'}`}>
                  {isUp ? '+' : ''}{anomaly.pctChange.toFixed(1)}%
                </span>
              </div>
              <div className="bg-white/70 rounded-lg px-3 py-1.5 text-center border border-white/80">
                <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                  {METHOD_LABEL[anomaly.method](anomaly.historicalCount)}
                </p>
                <p className="font-heading font-bold text-base text-foreground">
                  {fmtNum(anomaly.referenceVal, anomaly.unit)}
                </p>
              </div>
            </div>

            {/* Z-score detail */}
            {anomaly.zScore && (
              <p className="text-[10px] text-muted-foreground mb-2">
                Z-score: <strong>{anomaly.zScore.toFixed(2)}</strong> — deviazione statistica {anomaly.zScore > 3.5 ? 'estrema' : 'significativa'} dalla distribuzione storica
              </p>
            )}

            {/* Suggested action */}
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {isUp
                ? `Il valore è aumentato del ${Math.abs(anomaly.pctChange).toFixed(0)}% rispetto al riferimento. Verifica se è un dato reale o un errore di inserimento.`
                : `Il valore è diminuito del ${Math.abs(anomaly.pctChange).toFixed(0)}% rispetto al riferimento. Potrebbe essere un calo reale o un'omissione di dati.`
              }
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <button onClick={() => onDismiss(anomaly.path)} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate(anomaly.navId)}
            className="text-xs h-7 bg-white/80"
          >
            Vai alla sezione →
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AnomalyDetector({ reportId, currentData, onClose, onNavigate }) {
  const [dismissed, setDismissed] = useState(new Set());
  const [filterSev, setFilterSev] = useState('all');

  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ['esg_snapshots', reportId],
    queryFn: () => base44.entities.EsgSnapshot.filter({ report_id: reportId }, '-created_date', 50),
  });

  const allAnomalies = detectAnomalies(currentData, snapshots);
  const visible = allAnomalies
    .filter(a => !dismissed.has(a.path))
    .filter(a => filterSev === 'all' || a.severity === filterSev);

  const highCount = allAnomalies.filter(a => a.severity === 'high' && !dismissed.has(a.path)).length;
  const medCount = allAnomalies.filter(a => a.severity === 'medium' && !dismissed.has(a.path)).length;

  const handleDismiss = (path) => setDismissed(prev => new Set([...prev, path]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-lg flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-500" />
                Controllo anomalie
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Valori che si discostano significativamente dalla media storica · {snapshots.length} versioni analizzate
              </p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Summary pills */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setFilterSev('all')}
              className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${filterSev === 'all' ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-muted'}`}
            >
              Tutti ({allAnomalies.length - dismissed.size})
            </button>
            {highCount > 0 && (
              <button
                onClick={() => setFilterSev(filterSev === 'high' ? 'all' : 'high')}
                className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${filterSev === 'high' ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
              >
                ⚠ Alta priorità ({highCount})
              </button>
            )}
            {medCount > 0 && (
              <button
                onClick={() => setFilterSev(filterSev === 'medium' ? 'all' : 'medium')}
                className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${filterSev === 'medium' ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}`}
              >
                Da verificare ({medCount})
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm animate-pulse">
              Analisi in corso...
            </div>
          ) : snapshots.length < 2 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-3">📊</p>
              <p className="font-heading font-bold text-sm mb-1">Dati storici insufficienti</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Il rilevamento delle anomalie si attiva dopo almeno 2 versioni salvate dello stesso report. Continua a modificare il report per accumulare storico.
              </p>
            </div>
          ) : visible.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <p className="font-heading font-bold text-sm text-green-700 mb-1">Nessuna anomalia rilevata</p>
              <p className="text-xs text-muted-foreground">
                Tutti i valori monitorati rientrano nel range storico. Il report sembra coerente.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {visible.map((a, i) => (
                <AnomalyCard
                  key={a.path}
                  anomaly={a}
                  index={i}
                  onNavigate={(id) => { onNavigate(id); onClose(); }}
                  onDismiss={handleDismiss}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            Soglie: variazione {'>'} 25–50% o Z-score {'>'} 2.5 rispetto allo storico
          </p>
          <Button onClick={onClose} variant="outline" size="sm">Chiudi</Button>
        </div>
      </motion.div>
    </div>
  );
}