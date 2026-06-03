import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function FieldGroup({ label, hint, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label className="text-[11.5px] font-bold text-forest-700 tracking-wide uppercase">{label}</Label>
      {hint && <p className="text-[10.5px] text-blue-600 -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

export function TextInput({ label, hint, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <FieldGroup label={label} hint={hint}>
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

export function TextArea({ label, hint, value, onChange, rows = 4, placeholder = '' }) {
  return (
    <FieldGroup label={label} hint={hint} className="col-span-full">
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

export function SelectField({ label, hint, value, onChange, options }) {
  return (
    <FieldGroup label={label} hint={hint}>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger className="border-green-200 focus:border-primary focus:ring-primary/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([val, txt]) => (
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