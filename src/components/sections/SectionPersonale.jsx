import SectionHeader from '@/components/report/SectionHeader';
import { TextInput, ComputedValue } from '@/components/report/FormField';
import NotesField from '@/components/report/NotesField';
import CongruenceAlerts from '@/components/report/CongruenceAlerts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import KPICard from '@/components/report/KPICard';
import { calcPersonnel } from '@/lib/vsmeDefaults';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function SectionPersonale({ data, onUpdate, onNavigate }) {
  const pe = data?.pe || {};
  const u = (field, value) => onUpdate('pe', field, value);
  const p = calcPersonnel(data);

  const genData = [
    { name: 'Donne', value: parseFloat(pe.donne) || 0 },
    { name: 'Uomini', value: parseFloat(pe.uomini) || 0 },
  ].filter(d => d.value > 0);

  return (
    <div>
      <SectionHeader icon="👥" title="B8-B10 — Personale & H&S" description="Composizione forza lavoro, salute e sicurezza, retribuzioni e formazione." reference="VSME B8/B9/B10 | D.Lgs. 81/2008 | ESRS S1" />

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Composizione Forza Lavoro</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TextInput label="Dipendenti (Headcount)" type="number" value={pe.hc} onChange={(v) => u('hc', v)} />
          <TextInput label="Dipendenti FTE" type="number" value={pe.fte} onChange={(v) => u('fte', v)} />
          <TextInput label="di cui Donne" type="number" value={pe.donne} onChange={(v) => u('donne', v)} />
          <TextInput label="di cui Uomini" type="number" value={pe.uomini} onChange={(v) => u('uomini', v)} />
          <TextInput label="Contratto Indeterminato" type="number" value={pe.indet} onChange={(v) => u('indet', v)} />
          <TextInput label="Contratto Determinato" type="number" value={pe.det} onChange={(v) => u('det', v)} />
          <TextInput label="Part-Time" type="number" value={pe.pt} onChange={(v) => u('pt', v)} />
          <TextInput label="Con Disabilità" type="number" value={pe.disab} onChange={(v) => u('disab', v)} />
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Salute & Sicurezza</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TextInput label="Infortuni (≥1 gg assenza)" type="number" value={pe.infort} onChange={(v) => u('infort', v)} />
          <TextInput label="Giorni persi" type="number" value={pe.ggPersi} onChange={(v) => u('ggPersi', v)} />
          <TextInput label="Ore lavorate totali" type="number" value={pe.oreLav} onChange={(v) => u('oreLav', v)} hint="Da LUL" />
          <TextInput label="Giorni assenteismo" type="number" value={pe.assentGg} onChange={(v) => u('assentGg', v)} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <ComputedValue label="Tasso Frequenza IF" value={p.IF} unit="(n.inf × 1M) / ore" />
          <ComputedValue label="Tasso Assenteismo" value={p.tassoAss + '%'} unit="gg/HC×220" />
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Retribuzione e Formazione</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <TextInput label="CCNL Applicato" value={pe.ccnl} onChange={(v) => u('ccnl', v)} placeholder="Es. Metalmeccanici" />
          <TextInput label="Retrib. Media Uomini (€)" type="number" value={pe.retUom} onChange={(v) => u('retUom', v)} />
          <TextInput label="Retrib. Media Donne (€)" type="number" value={pe.retDon} onChange={(v) => u('retDon', v)} />
          <TextInput label="Ore formazione/dip./anno" type="number" value={pe.oreForm} onChange={(v) => u('oreForm', v)} />
          <ComputedValue label="Gender Pay Gap" value={p.gpg + '%'} unit="(uom−don)/uom" variant={parseFloat(p.gpg) > 15 ? '' : 'blue'} />
        </div>
      </Card>

      {genData.length > 0 && (
        <Card className="p-5 mb-5">
          <h4 className="font-heading text-sm font-bold text-primary mb-3">Composizione per Genere</h4>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart><Pie data={genData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(2)}%`}>
              <Cell fill="#EC4899" /><Cell fill="#2563EB" />
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="mb-5">
        <CongruenceAlerts data={data} section="pe" />
      </div>

      <div className="mb-5">
        <NotesField value={pe.notePe} onChange={(v) => u('notePe', v)} section="pe" />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('biod')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('gov')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}