import SectionHeader from '@/components/report/SectionHeader';
import { TextInput } from '@/components/report/FormField';
import NotesField from '@/components/report/NotesField';
import CongruenceAlerts from '@/components/report/CongruenceAlerts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import KPICard from '@/components/report/KPICard';
import { calcWater } from '@/lib/vsmeDefaults';

export default function SectionAcqua({ data, onUpdate, onNavigate }) {
  const ac = data?.ac || {};
  const u = (field, value) => onUpdate('ac', field, value);
  const wa = calcWater(data);

  const updateFonte = (i, key, value) => {
    const newFonti = [...(data?.acfonti?.fonti || [])];
    newFonti[i] = { ...newFonti[i], [key]: value };
    onUpdate('acfonti', 'fonti', newFonti);
  };

  return (
    <div>
      <SectionHeader icon="https://cdn.lordicon.com/srsgifbs.gif" title="B6 — Acqua" description="Prelievi idrici per fonte, scarichi, consumo netto e KPI per dipendente." reference="VSME B6 | Prelievo, stress idrico, consumo" />

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Prelievi Idrici per Fonte</h3>
        <div className="space-y-3">
          {(data?.acfonti?.fonti || []).map((fonte, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg items-end">
              <div><label className="text-[10px] font-bold text-muted-foreground uppercase">{fonte.fonte}</label></div>
              <TextInput label="Prelievo N (m³)" type="number" value={fonte.prelievo} onChange={(v) => updateFonte(i, 'prelievo', v)} />
              <TextInput label="Prelievo N-1 (m³)" type="number" value={fonte.prelievoN1} onChange={(v) => updateFonte(i, 'prelievoN1', v)} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Scarichi e Denominatore</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Scarico idrico N (m³)" type="number" value={ac.scaricoN} onChange={(v) => u('scaricoN', v)} />
          <TextInput label="Scarico idrico N-1 (m³)" type="number" value={ac.scaricoN1} onChange={(v) => u('scaricoN1', v)} />
          <TextInput label="Dipendenti medi N (per KPI acqua)" type="number" value={ac.dipAcquaN} onChange={(v) => u('dipAcquaN', v)} />
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard label="Prelievo Totale" value={wa.tot.toFixed(0)} unit="m³" color="blue" />
        <KPICard label="Stress Idrico" value={wa.high.toFixed(0)} unit="m³" color={wa.high > 0 ? 'amber' : 'default'} />
        <KPICard label="Consumo Netto" value={wa.consumo.toFixed(0)} unit="m³" color="green" />
        <KPICard label="Consumo/dip." value={wa.consumoDip.toFixed(1)} unit="m³/dip." />
      </div>

      <div className="mb-5">
        <CongruenceAlerts data={data} section="ac" />
      </div>

      <div className="mb-5">
        <NotesField value={ac.noteAc} onChange={(v) => u('noteAc', v)} section="ac" />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('en')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('ri')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}