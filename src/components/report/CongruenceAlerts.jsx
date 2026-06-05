import { AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { runCongruenceChecks } from '@/lib/congruenceChecks';

const config = {
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-500',
    badge: 'bg-red-100 text-red-700',
    label: 'Valore incongruente',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Verifica consigliata',
  },
};

/**
 * Mostra gli alert di congruenza per una specifica sezione del report.
 * Da inserire in ogni modulo di compilazione.
 *
 * Props:
 *  - data: oggetto dati del report
 *  - section: id della sezione ('en', 'ac', 'ri', 'pe', 'gov', ecc.)
 */
export default function CongruenceAlerts({ data, section }) {
  const alerts = runCongruenceChecks(data, section);

  if (!alerts.length) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span className="font-semibold">Nessuna incongruenza rilevata nei dati inseriti.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
        🔍 Controllo congruenza dati
      </p>
      {alerts.map((alert, i) => {
        const cfg = config[alert.severity];
        const Icon = cfg.icon;
        return (
          <div key={i} className={`rounded-xl border p-3.5 ${cfg.bg}`}>
            <div className="flex items-start gap-2.5">
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.iconColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  <span className="text-[11px] font-semibold text-foreground">{alert.area}</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{alert.message}</p>
                <p className="text-[11px] text-primary/80 mt-1.5 leading-relaxed">
                  💡 <span className="font-medium">{alert.suggestion}</span>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}