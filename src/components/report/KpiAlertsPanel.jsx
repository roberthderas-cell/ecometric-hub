import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, X, AlertTriangle, XCircle, ChevronRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function AlertRow({ alert, onNavigate, onClose }) {
  const isCritical = alert.severity === 'critical';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${isCritical ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className={`mt-0.5 shrink-0 ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>
        {isCritical ? <XCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold ${isCritical ? 'text-red-700' : 'text-amber-700'}`}>{alert.label}</span>
          {alert.type === 'target' ? (
            <Badge variant="outline" className={`text-xs ${isCritical ? 'border-red-300 text-red-600' : 'border-amber-300 text-amber-600'}`}>
              Obiettivo
            </Badge>
          ) : (
            <Badge variant="outline" className={`text-xs ${isCritical ? 'border-red-300 text-red-600' : 'border-amber-300 text-amber-600'}`}>
              Soglia
            </Badge>
          )}
        </div>
        <p className={`text-xs mt-0.5 ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
          {alert.description}
        </p>
        {alert.type === 'target' ? (
          <p className="text-xs text-muted-foreground mt-1">
            Attuale: <strong>{alert.current?.toFixed(0)}</strong> → Obiettivo: <strong>{alert.target?.toFixed(0)}</strong>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">
            Valore: <strong>{typeof alert.value === 'number' ? alert.value.toFixed(1) : alert.value} {alert.unit}</strong> · Soglia: {alert.threshold} {alert.unit}
          </p>
        )}
      </div>
      {alert.section && onNavigate && (
        <button
          onClick={() => { onNavigate(alert.section); onClose(); }}
          className={`shrink-0 text-xs flex items-center gap-0.5 font-medium hover:underline mt-0.5 ${isCritical ? 'text-red-600' : 'text-amber-600'}`}
        >
          Vai <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default function KpiAlertsPanel({ alerts, onNavigate }) {
  const [open, setOpen] = useState(false);

  const critical = alerts.filter(a => a.severity === 'critical').length;
  const warnings = alerts.filter(a => a.severity === 'warning').length;
  const total = alerts.length;

  if (total === 0) return null;

  return (
    <div className="relative">
      {/* Bell trigger */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(o => !o)}
        className={`gap-1.5 relative ${critical > 0 ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-amber-300 text-amber-600 hover:bg-amber-50'}`}
      >
        {critical > 0 ? <BellRing className="w-4 h-4 animate-pulse" /> : <Bell className="w-4 h-4" />}
        <span className="font-bold text-xs">{total}</span>
        {critical > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
            {critical}
          </span>
        )}
      </Button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-96 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-primary" />
                  <span className="font-heading font-bold text-sm">Alert KPI</span>
                  {critical > 0 && (
                    <Badge className="bg-red-500 text-white text-xs px-1.5 py-0">{critical} critici</Badge>
                  )}
                  {warnings > 0 && (
                    <Badge className="bg-amber-500 text-white text-xs px-1.5 py-0">{warnings} avvisi</Badge>
                  )}
                </div>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Alert list */}
              <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                {/* Critical first */}
                {alerts.filter(a => a.severity === 'critical').map(alert => (
                  <AlertRow key={alert.id} alert={alert} onNavigate={onNavigate} onClose={() => setOpen(false)} />
                ))}
                {/* Then warnings */}
                {alerts.filter(a => a.severity === 'warning').map(alert => (
                  <AlertRow key={alert.id} alert={alert} onNavigate={onNavigate} onClose={() => setOpen(false)} />
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-border bg-muted/20 space-y-1">
                <p className="text-xs text-muted-foreground">
                  {total} alert attivi · Gli avvisi si ricalcolano in tempo reale ad ogni modifica.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Soglia</strong> = valore fuori norma · <strong>Obiettivo</strong> = distanza dal target dell'anno in corso impostato in "Obiettivi"
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}