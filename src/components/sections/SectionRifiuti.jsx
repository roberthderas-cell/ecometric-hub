import SectionHeader from '@/components/report/SectionHeader';
import { TextInput } from '@/components/report/FormField';
import NotesField from '@/components/report/NotesField';
import CongruenceAlerts from '@/components/report/CongruenceAlerts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import KPICard from '@/components/report/KPICard';
import EsgAlerts from '@/components/report/EsgAlerts';
import { calcWaste, getMissingMandatory } from '@/lib/vsmeDefaults';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const DESTINAZIONI = ['Recupero (R)', 'Riciclo (R3)', 'Recupero energetico (R1)', 'Smaltimento (D)', 'Discarica (D1)', 'Incenerimento (D10)'];
const PERICOLO = ['Non pericoloso', 'Pericoloso (*)'];

const EMPTY_CER = { codice: '', descrizione: '', pericolosita: 'Non pericoloso', kgN: '', kgN1: '', destinazione: 'Recupero (R)' };

export default function SectionRifiuti({ data, onUpdate, onNavigate }) {
  const ri = data?.ri || {};
  const u = (field, value) => onUpdate('ri', field, value);
  const w = calcWaste(data);
  const missing = getMissingMandatory(data, 'ri');
  const cerRows = ri.cerRows || [];

  const updateCer = (rows) => u('cerRows', rows);
  const addRow = () => updateCer([...cerRows, { ...EMPTY_CER }]);
  const removeRow = (i) => updateCer(cerRows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, value) => {
    const newRows = cerRows.map((r, idx) => idx === i ? { ...r, [field]: value } : r);
    updateCer(newRows);
  };

  // Calcola totali da tabella CER se compilata
  const cerTotN = cerRows.reduce((s, r) => s + (parseFloat(r.kgN) || 0), 0);
  const cerPeriN = cerRows.filter(r => r.pericolosita === 'Pericoloso (*)').reduce((s, r) => s + (parseFloat(r.kgN) || 0), 0);
  const cerRecN = cerRows.filter(r => r.destinazione && r.destinazione.startsWith('Recupero') || r.destinazione?.startsWith('Riciclo') || r.destinazione?.startsWith('Recupero energetico')).reduce((s, r) => s + (parseFloat(r.kgN) || 0), 0);

  const destData = [
    { name: 'Recupero', value: parseFloat(w.rec) || 0 },
    { name: 'Smaltimento', value: parseFloat(w.smal) || 0 },
  ].filter(d => d.value > 0);

  return (
    <div>
      <SectionHeader icon="https://cdn.lordicon.com/bpwdqzlq.gif" title="B7 — Rifiuti" description="Dati dal Registro di Carico/Scarico (D.Lgs. 152/2006) e portale RENTRI. Dettaglio per codice CER." reference="VSME B7 | D.Lgs. 152/2006 | RENTRI" />

      {missing.length > 0 && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800">Dati obbligatori mancanti</p>
            <ul className="mt-1 space-y-0.5">
              {missing.map(m => <li key={m} className="text-xs text-amber-700">• {m}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Totali riassuntivi */}
      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Dati Riassuntivi</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-4">
          ℹ️ Inserisci i totali in kg — la conversione in tonnellate avviene automaticamente. Se compili la tabella CER sotto, i totali vengono calcolati automaticamente.
        </div>
        {cerRows.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
            <div><p className="text-[10px] font-bold text-muted-foreground uppercase">Totale da CER</p><p className="text-lg font-bold text-green-700">{cerTotN.toLocaleString()} kg</p></div>
            <div><p className="text-[10px] font-bold text-muted-foreground uppercase">Pericolosi da CER</p><p className="text-lg font-bold text-amber-600">{cerPeriN.toLocaleString()} kg</p></div>
            <div><p className="text-[10px] font-bold text-muted-foreground uppercase">A recupero da CER</p><p className="text-lg font-bold text-primary">{cerRecN.toLocaleString()} kg</p></div>
            <p className="col-span-full text-[10px] text-muted-foreground">I campi manuali sotto possono essere usati per inserire dati aggregati diversi o per l'anno N-1.</p>
          </div>
        ) : null}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <TextInput label="Rifiuti Totali N (kg)" type="number" value={ri.totN} onChange={(v) => u('totN', v)} />
          <TextInput label="Anno N-1 (kg)" type="number" value={ri.totN1} onChange={(v) => u('totN1', v)} />
          <TextInput label="di cui Pericolosi N (kg)" type="number" value={ri.periN} onChange={(v) => u('periN', v)} hint="CER con asterisco *" />
          <TextInput label="A recupero N (kg)" type="number" value={ri.recN} onChange={(v) => u('recN', v)} hint="Codici R1–R13" />
        </div>
      </Card>

      {/* Tabella CER dettagliata */}
      <Card className="p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-primary text-sm">Dettaglio per Codice CER</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Facoltativo — utile per rendicontazione dettagliata e tracciabilità RENTRI</p>
          </div>
          <Button size="sm" variant="outline" onClick={addRow} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Aggiungi voce CER
          </Button>
        </div>

        {cerRows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
            <p className="text-sm">Nessuna voce CER inserita</p>
            <p className="text-xs mt-1">Clicca "Aggiungi voce CER" per iniziare il dettaglio analitico</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header */}
            <div className="hidden md:grid grid-cols-[80px_1fr_120px_90px_90px_140px_36px] gap-2 text-[10px] font-bold text-muted-foreground uppercase px-2">
              <span>Codice CER</span><span>Descrizione</span><span>Pericolosità</span><span>kg Anno N</span><span>kg Anno N-1</span><span>Destinazione</span><span></span>
            </div>
            {cerRows.map((row, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[80px_1fr_120px_90px_90px_140px_36px] gap-2 items-end p-3 bg-muted/30 rounded-lg">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase md:hidden">Codice CER</label>
                  <input
                    type="text"
                    placeholder="es. 15 01 01"
                    value={row.codice}
                    onChange={e => updateRow(i, 'codice', e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase md:hidden">Descrizione</label>
                  <input
                    type="text"
                    placeholder="es. Imballaggi in carta"
                    value={row.descrizione}
                    onChange={e => updateRow(i, 'descrizione', e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase md:hidden">Pericolosità</label>
                  <select
                    value={row.pericolosita}
                    onChange={e => updateRow(i, 'pericolosita', e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {PERICOLO.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase md:hidden">kg Anno N</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={row.kgN}
                    onChange={e => updateRow(i, 'kgN', e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase md:hidden">kg Anno N-1</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={row.kgN1}
                    onChange={e => updateRow(i, 'kgN1', e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase md:hidden">Destinazione</label>
                  <select
                    value={row.destinazione}
                    onChange={e => updateRow(i, 'destinazione', e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {DESTINAZIONI.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeRow(i)} className="text-destructive hover:bg-destructive/10 h-9 w-9">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            {/* Totale riga */}
            <div className="flex items-center justify-end gap-4 px-3 pt-2 border-t text-xs text-muted-foreground font-semibold">
              <span>Totale: <strong className="text-foreground">{cerTotN.toLocaleString()} kg</strong></span>
              <span>Pericolosi: <strong className="text-amber-600">{cerPeriN.toLocaleString()} kg</strong></span>
              <span>A recupero: <strong className="text-green-600">{cerRecN.toLocaleString()} kg</strong></span>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard label="Totale" value={w.tot.toFixed(2)} unit="tonnellate" color="default" />
        <KPICard label="Pericolosi" value={w.per.toFixed(2)} unit="t" color={parseFloat(w.per) > 0 ? 'amber' : 'default'} />
        <KPICard label="% Recupero" value={w.pRec.toFixed(1) + '%'} color="green" />
        <KPICard label="Smaltimento" value={w.smal.toFixed(2)} unit="t" />
      </div>

      {destData.length > 0 && (
        <Card className="p-5 mb-5">
          <h4 className="font-heading text-sm font-bold text-primary mb-3">Destino Rifiuti</h4>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart><Pie data={destData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`} fontSize={11}>
              <Cell fill="#16A34A" /><Cell fill="#9CA3AF" />
            </Pie><Tooltip formatter={(v) => [`${Number(v).toFixed(2)} t`]} /></PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="mb-5">
        <EsgAlerts data={data} sections={['rifiuti']} />
      </div>
      <div className="mb-5">
        <CongruenceAlerts data={data} section="ri" />
      </div>
      <div className="mb-5">
        <NotesField value={ri.noteRi} onChange={(v) => u('noteRi', v)} section="ri" />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('ac')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('inq')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}