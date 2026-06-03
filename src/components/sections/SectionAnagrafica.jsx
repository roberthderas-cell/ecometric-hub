import SectionHeader from '@/components/report/SectionHeader';
import { TextInput, SelectField, ComputedValue } from '@/components/report/FormField';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export default function SectionAnagrafica({ data, onUpdate, onNavigate }) {
  const ana = data?.ana || {};
  const u = (field, value) => onUpdate('ana', field, value);

  const att = parseFloat(ana.attivo) || 0;
  const fatt = parseFloat(ana.fatturato) || 0;
  const dip = parseInt(ana.hc) || 0;
  let micro = 0, small = 0;
  if (att <= 450000) micro++; if (fatt <= 900000) micro++; if (dip <= 10) micro++;
  if (att <= 5000000) small++; if (fatt <= 10000000) small++; if (dip <= 50) small++;
  const catAuto = micro >= 2 ? 'Micro' : small >= 2 ? 'Piccola' : 'Media';
  const cat = (ana.dimManuale && ana.dimManuale !== 'auto') ? ana.dimManuale : catAuto;

  return (
    <div>
      <SectionHeader
        icon="🏢"
        title="Anagrafica Impresa"
        description="Inserisci i dati identificativi e dimensionali. La categoria VSME viene calcolata automaticamente (art. 3 Dir. 2013/34/UE)."
        reference="VSME B1 — Basi per la preparazione"
      />

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Dati Identificativi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Ragione Sociale" value={ana.ragione} onChange={(v) => u('ragione', v)} placeholder="Es. Alfa Metalli S.r.l." />
          <TextInput label="Sede Legale" value={ana.sede} onChange={(v) => u('sede', v)} placeholder="Es. Via Roma 1, Milano" />
          <TextInput label="Codice ATECO / NACE" value={ana.ateco} onChange={(v) => u('ateco', v)} placeholder="Es. 25.62" hint="Camera di Commercio o visura camerale" />
          <SelectField label="Forma Giuridica" value={ana.forma} onChange={(v) => u('forma', v)} options={[['SRL','S.r.l.'],['SPA','S.p.A.'],['SNC','S.n.c.'],['SAS','S.a.s.'],['ALTRO','Altro']]} />
          <SelectField label="Anno di Riferimento" value={String(ana.anno || '2025')} onChange={(v) => u('anno', v)} options={[['2025','2025'],['2024','2024'],['2023','2023'],['2022','2022']]} />
          <SelectField label="Perimetro" value={ana.perimetro} onChange={(v) => u('perimetro', v)} options={[['individuale','Individuale'],['consolidato','Consolidato (Gruppo)']]} hint="Consolidato se il report copre più società" />
          <TextInput label="Paesi di Operatività" value={ana.paesi} onChange={(v) => u('paesi', v)} placeholder="Es. Italia, Germania" />
          <TextInput label="Certificazioni ESG" value={ana.cert} onChange={(v) => u('cert', v)} placeholder="Nessuna se non applicabile" />
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-1">Dati Dimensionali e Categoria VSME</h3>
        <p className="text-xs text-muted-foreground mb-4">Dall'ultimo bilancio approvato</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-5 leading-relaxed">
          ℹ️ La categoria si determina con almeno 2 su 3 criteri: totale attivo, fatturato netto, dipendenti medi.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Totale Attivo (€)" type="number" value={ana.attivo} onChange={(v) => u('attivo', v)} />
          <TextInput label="Fatturato Netto (€)" type="number" value={ana.fatturato} onChange={(v) => u('fatturato', v)} />
          <TextInput label="N. Dipendenti (Headcount)" type="number" value={ana.hc} onChange={(v) => u('hc', v)} hint="Media durante l'anno" />
          <TextInput label="N. Dipendenti (FTE)" type="number" value={ana.fte} onChange={(v) => u('fte', v)} />
        </div>

        <div className="border-t border-dashed border-border my-5" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ComputedValue label="Categoria calcolata" value={catAuto} />
          <SelectField
            label="Override manuale categoria"
            value={ana.dimManuale || ''}
            onChange={(v) => u('dimManuale', v)}
            options={[['auto','— Usa calcolo automatico —'],['Micro','Micro impresa'],['Piccola','Piccola impresa'],['Media','Media impresa']]}
            hint="Sovrascrive il calcolo automatico"
          />
          <SelectField
            label="Modulo VSME"
            value={ana.modulo || 'basic'}
            onChange={(v) => u('modulo', v)}
            options={[['basic','Solo Modulo Base (B1–B11)'],['comprehensive','Base + Completo (B1–B11 + C1–C9)']]}
          />
        </div>

        <div className={`mt-4 p-3 rounded-lg text-xs leading-relaxed ${cat === 'Micro' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
          {cat === 'Micro' ? '✅ Micro-impresa: il Modulo Base è sufficiente.' : cat === 'Piccola' ? '📋 Piccola impresa: il Modulo Base copre la maggior parte delle esigenze.' : '📋 Media impresa: considera il Modulo Comprehensive.'}
        </div>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={() => onNavigate('en')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}