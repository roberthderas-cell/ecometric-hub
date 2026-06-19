import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { HelpCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Tooltip EFRAG ──────────────────────────────────────────────────────────
function FieldTooltip({ tooltip }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="text-primary/40 hover:text-primary transition-colors ml-1 shrink-0"
        aria-label="Guida campo"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-50 w-72 bg-white border border-primary/20 rounded-xl shadow-xl p-4"
            style={{ minWidth: '280px' }}
          >
            {/* Header */}
            <div className="flex items-start gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <HelpCircle className="w-3 h-3 text-primary" />
              </div>
              <p className="text-[11px] font-bold text-primary uppercase tracking-wide leading-tight">{tooltip.label || 'Guida EFRAG'}</p>
            </div>

            {/* Description */}
            <p className="text-xs text-foreground leading-relaxed mb-3">{tooltip.desc}</p>

            {/* Source */}
            {tooltip.source && (
              <div className="bg-muted/60 rounded-lg px-3 py-2 mb-3">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Fonte / Dove trovarlo</p>
                <p className="text-xs text-foreground">{tooltip.source}</p>
              </div>
            )}

            {/* Tip */}
            {tooltip.tip && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                <p className="text-[10px] text-green-700 font-bold mb-0.5">💡 Suggerimento</p>
                <p className="text-xs text-green-800">{tooltip.tip}</p>
              </div>
            )}

            {/* Warning */}
            {tooltip.warning && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                <p className="text-[10px] text-amber-700 font-bold mb-0.5">⚠️ Attenzione</p>
                <p className="text-xs text-amber-800">{tooltip.warning}</p>
              </div>
            )}

            {/* EFRAG reference */}
            {tooltip.efrag && (
              <div className="flex items-center justify-between mt-1 pt-2 border-t border-border">
                <span className="text-[10px] font-bold text-primary/60 bg-primary/8 rounded px-2 py-0.5">{tooltip.efrag}</span>
                {tooltip.link && (
                  <a href={tooltip.link} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] text-primary flex items-center gap-1 hover:underline">
                    Approfondisci <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── FieldGroup ─────────────────────────────────────────────────────────────
export function FieldGroup({ label, hint, tooltip, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        <Label className="text-[11.5px] font-bold text-forest-700 tracking-wide uppercase">{label}</Label>
        {tooltip && <FieldTooltip tooltip={tooltip} />}
      </div>
      {hint && <p className="text-[10.5px] text-blue-600 -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

export function TextInput({ label, hint, tooltip, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <FieldGroup label={label} hint={hint} tooltip={tooltip}>
      <Input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-green-200 focus:border-primary focus:ring-primary/10"
      />
    </FieldGroup>
  );
}

export function TextArea({ label, hint, tooltip, value, onChange, rows = 4, placeholder = '' }) {
  return (
    <FieldGroup label={label} hint={hint} tooltip={tooltip} className="col-span-full">
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="border-green-200 focus:border-primary focus:ring-primary/10 resize-y"
      />
    </FieldGroup>
  );
}

export function SelectField({ label, hint, tooltip, value, onChange, options, placeholder = 'Seleziona...' }) {
  const normalizedOptions = (options || []).map((opt) => ({
    val: Array.isArray(opt) ? opt[0] : opt.value,
    txt: Array.isArray(opt) ? opt[1] : opt.label,
  }));

  const emptyOpt = normalizedOptions.find((o) => o.val === '');
  const validOptions = normalizedOptions.filter((o) => o.val !== '');

  return (
    <FieldGroup label={label} hint={hint} tooltip={tooltip}>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger className="border-green-200 focus:border-primary focus:ring-primary/10">
          <SelectValue placeholder={emptyOpt ? emptyOpt.txt : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {validOptions.map(({ val, txt }) => (
            <SelectItem key={val} value={val}>{txt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldGroup>
  );
}

export function ComputedValue({ label, value, unit, variant = '' }) {
  const colorClass = variant === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-green-50 border-green-200 text-green-700';
  return (
    <FieldGroup label={label}>
      <div className={`px-3 py-2.5 rounded-lg border font-bold text-sm ${colorClass}`}>
        {value} {unit && <span className="font-normal text-xs ml-1">{unit}</span>}
      </div>
    </FieldGroup>
  );
}