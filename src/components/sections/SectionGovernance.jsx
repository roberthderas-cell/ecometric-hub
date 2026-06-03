import SectionHeader from '@/components/report/SectionHeader';
import { TextInput, SelectField, TextArea } from '@/components/report/FormField';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SectionGovernance({ data, onUpdate, onNavigate }) {
  const gov = data?.gov || {};
  const u = (field, value) => onUpdate('gov', field, value);
  const yn = [['no', 'No'], ['si', 'Sì']];

  return (
    <div>
      <SectionHeader icon="⚖️" title="B11 — Governance e Integrità" description="Struttura di governo, strumenti di compliance, corruzione e pagamenti." reference="VSME B11 | D.Lgs. 231/2001 | Whistleblowing" />

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Organo di Governo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Componenti totali CDA" type="number" value={gov.compCDA} onChange={(v) => u('compCDA', v)} />
          <TextInput label="di cui Donne" type="number" value={gov.donneCDA} onChange={(v) => u('donneCDA', v)} />
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Strumenti di Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Codice Etico" value={gov.codEtico} onChange={(v) => u('codEtico', v)} options={yn} />
          <SelectField label="MOG 231/2001" value={gov.mog231} onChange={(v) => u('mog231', v)} options={[['no','No'],['si','Sì — con ODV attivo']]} hint="D.Lgs. 231/2001" />
          <SelectField label="ISO 14001" value={gov.iso14001} onChange={(v) => u('iso14001', v)} options={yn} />
          <SelectField label="ISO 45001 (H&S)" value={gov.iso45001} onChange={(v) => u('iso45001', v)} options={yn} />
          <SelectField label="Policy Parità Genere" value={gov.pariGen} onChange={(v) => u('pariGen', v)} options={yn} hint="L.162/2021 / UNI PdR 125" />
          <SelectField label="Whistleblowing" value={gov.wb} onChange={(v) => u('wb', v)} options={[['no','No'],['si','Sì — D.Lgs. 24/2023']]} hint="Obbligatorio > 50 dip." />
          <SelectField label="Policy Anti-Corruzione" value={gov.policy} onChange={(v) => u('policy', v)} options={yn} />
          <SelectField label="Rating ESG esterno" value={gov.rESG} onChange={(v) => u('rESG', v)} options={yn} />
          <TextInput label="Altre certificazioni" value={gov.altreCert} onChange={(v) => u('altreCert', v)} placeholder="ISO 9001, EMAS..." />
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Corruzione e Pagamenti</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput label="Condanne corruzione (3 anni)" type="number" value={gov.cond} onChange={(v) => u('cond', v)} />
          <TextInput label="Sanzioni (€)" type="number" value={gov.san} onChange={(v) => u('san', v)} />
          <TextInput label="Tempi medi pagamento (gg)" type="number" value={gov.tempiPag} onChange={(v) => u('tempiPag', v)} />
        </div>
      </Card>

      <Card className="p-6 mb-5"><TextArea label="Note B11" value={gov.noteGov} onChange={(v) => u('noteGov', v)} rows={3} /></Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('pe')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('dash')} className="bg-primary gap-2">Dashboard KPI <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}