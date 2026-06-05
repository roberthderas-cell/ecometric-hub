import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Mappa i campi chiave del report con label leggibili per il diff.
 */
const DIFF_FIELDS = [
  // Energia
  { path: 'en.elReteN', label: 'Elettricità da rete (kWh)', unit: 'kWh' },
  { path: 'en.elFVN', label: 'Energia FV (kWh)', unit: 'kWh' },
  // Acqua
  { path: 'ac.scaricoN', label: 'Scarico idrico (m³)', unit: 'm³' },
  // Rifiuti
  { path: 'ri.totN', label: 'Rifiuti totali (kg)', unit: 'kg' },
  { path: 'ri.recN', label: 'Rifiuti a recupero (kg)', unit: 'kg' },
  { path: 'ri.periN', label: 'Rifiuti pericolosi (kg)', unit: 'kg' },
  // Personale
  { path: 'pe.hc', label: 'Headcount totale', unit: '' },
  { path: 'pe.donne', label: 'Dipendenti donne', unit: '' },
  { path: 'pe.infort', label: 'N. infortuni', unit: '' },
  { path: 'pe.oreLav', label: 'Ore lavorate totali', unit: 'h' },
  { path: 'pe.retMedia', label: 'Retribuzione media (€)', unit: '€' },
  { path: 'pe.oreForm', label: 'Ore formazione/dip.', unit: 'h' },
  // Governance
  { path: 'gov.compCDA', label: 'N. componenti CdA', unit: '' },
  { path: 'gov.donneCDA', label: 'N. donne CdA', unit: '' },
  { path: 'gov.codEtico', label: 'Codice etico', unit: '' },
  { path: 'gov.mog231', label: 'MOG 231', unit: '' },
  { path: 'gov.iso45001', label: 'ISO 45001', unit: '' },
  // Anagrafica
  { path: 'ana.fatturato', label: 'Fatturato (€)', unit: '€' },
  { path: 'ana.hc', label: 'Dipendenti (anagrafica)', unit: '' },
];

function getVal(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

function formatVal(v) {
  if (v === undefined || v === null || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Sì' : 'No';
  const n = parseFloat(v);
  if (!isNaN(n) && n > 999) return n.toLocaleString('it-IT');
  return String(v);
}

export default function SnapshotDiff({ oldSnap, currentData, onClose }) {
  const oldData = oldSnap?.data_snapshot;

  const changes = DIFF_FIELDS.map(f => {
    const oldVal = oldData ? getVal(oldData, f.path) : undefined;
    const newVal = getVal(currentData, f.path);

    const oldNum = parseFloat(oldVal);
    const newNum = parseFloat(newVal);
    const hasNumericChange = !isNaN(oldNum) && !isNaN(newNum) && oldNum !== newNum;
    const hasTextChange = typeof oldVal === 'string' && typeof newVal === 'string' && oldVal !== newVal && oldVal !== '' && newVal !== '';
    const changed = hasNumericChange || hasTextChange;

    let direction = 'same';
    if (hasNumericChange) direction = newNum > oldNum ? 'up' : 'down';

    return { ...f, oldVal, newVal, changed, direction, hasNumericChange };
  }).filter(f => f.changed);

  // ESG score diff
  const scoreFields = [
    { label: 'ESG Totale', old: oldSnap.esg_tot, curr: null, color: 'text-green-700' },
    { label: 'Ambiente (E)', old: oldSnap.esg_e, curr: null, color: 'text-green-600' },
    { label: 'Sociale (S)', old: oldSnap.esg_s, curr: null, color: 'text-blue-600' },
    { label: 'Governance (G)', old: oldSnap.esg_g, curr: null, color: 'text-purple-600' },
  ];

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-primary flex items-center gap-1.5">
          🔍 Confronto con versione del{' '}
          <span className="font-extrabold">
            {new Date(oldSnap.created_date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          {oldSnap.label && <span className="font-normal text-muted-foreground">· {oldSnap.label}</span>}
        </p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Score comparison */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {scoreFields.map(sf => (
          <div key={sf.label} className="bg-white rounded-lg border border-border px-3 py-2 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground mb-1">{sf.label}</p>
            <p className="text-[10px] text-muted-foreground">Prima: <strong>{sf.old ?? '—'}</strong></p>
          </div>
        ))}
      </div>

      {!oldData ? (
        <p className="text-xs text-muted-foreground italic py-2">
          Questa versione è stata salvata prima dell'introduzione del confronto dettagliato. Solo gli score ESG sono disponibili.
        </p>
      ) : changes.length === 0 ? (
        <p className="text-xs text-green-700 font-semibold bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          ✅ Nessuna modifica ai campi principali rilevata tra questa versione e quella attuale.
        </p>
      ) : (
        <>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
            {changes.length} campo{changes.length > 1 ? 'i' : ''} modificato{changes.length > 1 ? 'i' : ''}
          </p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {changes.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-white border border-border rounded-lg px-3 py-2 text-xs">
                <span className="text-muted-foreground font-medium">{c.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground/60 line-through">{formatVal(c.oldVal)}</span>
                  {c.direction === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {c.direction === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                  {c.direction === 'same' && <Minus className="w-3 h-3 text-muted-foreground" />}
                  <span className={`font-bold ${c.direction === 'up' ? 'text-green-700' : c.direction === 'down' ? 'text-red-600' : 'text-foreground'}`}>
                    {formatVal(c.newVal)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}