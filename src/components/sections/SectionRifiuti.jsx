import SectionHeader from '@/components/report/SectionHeader';
import { TextInput } from '@/components/report/FormField';
import NotesField from '@/components/report/NotesField';
import CongruenceAlerts from '@/components/report/CongruenceAlerts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import KPICard from '@/components/report/KPICard';
import EsgAlerts from '@/components/report/EsgAlerts';
import { calcWaste, getMissingMandatory } from '@/lib/vsmeDefaults';
import { AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function SectionRifiuti({ data, onUpdate, onNavigate }) {
  const ri = data?.ri || {};
  const u = (field, value) => onUpdate('ri', field, value);
  const w = calcWaste(data);
  const missing = getMissingMandatory(data, 'ri');

  const destData = [
    { name: 'Recupero', value: parseFloat(w.rec) || 0 },
    { name: 'Smaltimento', value: parseFloat(w.smal) || 0 },
  ].filter(d => d.value > 0);

  return (
    <div>
      <SectionHeader icon="♻️" title="B7 — Rifiuti" description="Dati dal Registro di Carico/Scarico (D.Lgs. 152/2006) e portale RENTRI." reference="VSME B7 | D.Lgs. 152/2006 | RENTRI" />

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

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Dati Riassuntivi</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-4">
          ℹ️ Inserisci i totali in kg — la conversione in tonnellate avviene automaticamente.
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TextInput label="Rifiuti Totali N (kg)" type="number" value={ri.totN} onChange={(v) => u('totN', v)} />
          <TextInput label="Anno N-1 (kg)" type="number" value={ri.totN1} onChange={(v) => u('totN1', v)} />
          <TextInput label="di cui Pericolosi N (kg)" type="number" value={ri.periN} onChange={(v) => u('periN', v)} hint="CER con asterisco *" />
          <TextInput label="A recupero N (kg)" type="number" value={ri.recN} onChange={(v) => u('recN', v)} hint="Codici R1–R13" />
        </div>
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
            <PieChart><Pie data={destData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
              <Cell fill="#16A34A" /><Cell fill="#9CA3AF" />
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ESG Validation Alerts */}
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