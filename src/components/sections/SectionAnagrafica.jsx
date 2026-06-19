import SectionHeader from '@/components/report/SectionHeader';
import PmiBancheReference from '@/components/report/PmiBancheReference';
import { TextInput, SelectField, ComputedValue } from '@/components/report/FormField';
import NotesField from '@/components/report/NotesField';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';

export default function SectionAnagrafica({ data, onUpdate, onNavigate }) {
  const ana = data?.ana || {};
  const sedi = data?.sedi?.lista || [];
  const u = (field, value) => onUpdate('ana', field, value);

  const att = parseFloat(ana.attivo) || 0;
  const fatt = parseFloat(ana.fatturato) || 0;
  const dip = parseInt(ana.hc) || 0;
  let micro = 0, small = 0;
  if (att <= 450000) micro++; if (fatt <= 900000) micro++; if (dip <= 10) micro++;
  if (att <= 5000000) small++; if (fatt <= 10000000) small++; if (dip <= 50) small++;
  const catAuto = micro >= 2 ? 'Micro' : small >= 2 ? 'Piccola' : 'Media';
  const cat = (ana.dimManuale && ana.dimManuale !== 'auto') ? ana.dimManuale : catAuto;

  const updateSede = (i, key, val) => {
    const rows = [...sedi];
    rows[i] = { ...rows[i], [key]: val };
    onUpdate('sedi', 'lista', rows);
  };

  const addSede = () => {
    onUpdate('sedi', 'lista', [...sedi, { nome: '', indirizzo: '', tipo: 'Operativa', paese: 'Italia' }]);
  };

  const removeSede = (i) => {
    onUpdate('sedi', 'lista', sedi.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <SectionHeader
        sectionId="ana"
        title="Anagrafica Impresa"
        description="Inserisci i dati identificativi, le sedi aziendali e i dati dimensionali. Le sedi vengono usate automaticamente nella verifica Biodiversità."
        reference="VSME B1 — Basi per la preparazione"
      />

      <PmiBancheReference sectionKey="ana" />

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Dati Identificativi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Ragione Sociale" value={ana.ragione} onChange={(v) => u('ragione', v)} placeholder="Es. Alfa Metalli S.r.l." />
          <TextInput label="Codice ATECO / NACE" value={ana.ateco} onChange={(v) => u('ateco', v)} placeholder="Es. 25.62" hint="Camera di Commercio o visura camerale" />
          <SelectField label="Forma Giuridica" value={ana.forma} onChange={(v) => u('forma', v)} options={[['SRL','S.r.l.'],['SPA','S.p.A.'],['SNC','S.n.c.'],['SAS','S.a.s.'],['ALTRO','Altro']]} />
          <SelectField label="Anno di Riferimento" value={String(ana.anno || '2025')} onChange={(v) => u('anno', v)} options={[['2025','2025'],['2024','2024'],['2023','2023'],['2022','2022']]} />
          <SelectField label="Perimetro" value={ana.perimetro} onChange={(v) => u('perimetro', v)} options={[['individuale','Individuale'],['consolidato','Consolidato (Gruppo)']]} hint="Consolidato se il report copre più società" />
          <TextInput label="Paesi di Operatività" value={ana.paesi} onChange={(v) => u('paesi', v)} placeholder="Es. Italia, Germania" />
          <TextInput label="Certificazioni ESG" value={ana.cert} onChange={(v) => u('cert', v)} placeholder="Nessuna se non applicabile" />
          <SelectField label="Info sostenibilità rese pubbliche? (DP.3)" value={ana.sostPubblica || 'no'} onChange={(v) => u('sostPubblica', v)} options={[['no','No'],['si','Sì — report/sito web'],['pianif','In pianificazione']]} hint="Sito web, report ESG, banche dati pubbliche" />
          <TextInput label="% Fatturato allineato Tassonomia UE (DP.11)" type="number" value={ana.pctFattTassonomia} onChange={(v) => u('pctFattTassonomia', v)} hint="Stima. 0 se nessuna attività eleggibile" placeholder="0–100" />
          <TextInput label="% CapEx allineata Tassonomia UE (DP.12)" type="number" value={ana.pctCapexTassonomia} onChange={(v) => u('pctCapexTassonomia', v)} hint="Stima spesa in conto capitale allineata" placeholder="0–100" />
        </div>
      </Card>

      {/* SEDI AZIENDALI */}
      <Card className="p-6 mb-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-heading font-bold text-primary text-sm">Sedi Aziendali</h3>
          <Button size="sm" variant="outline" onClick={addSede}><Plus className="w-3.5 h-3.5 mr-1" /> Aggiungi sede</Button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Inserisci la sede legale e tutte le sedi operative. Gli indirizzi saranno geolocalizzati automaticamente nella mappa Biodiversità per la verifica delle aree protette.
        </p>

        {/* Sede legale (campo rapido) */}
        <div className="mb-4">
          <TextInput
            label="Sede Legale (indirizzo completo)"
            value={ana.sede}
            onChange={(v) => u('sede', v)}
            placeholder="Es. Via Roma 1, 20121 Milano MI"
            hint="Indirizzo completo per geocoding preciso"
          />
        </div>

        {/* Sedi operative */}
        {sedi.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Sedi Operative</p>
            {sedi.map((row, i) => (
              <div key={i} className="flex gap-2 items-center p-3 rounded-lg border border-green-100 bg-green-50/30">
                <input
                  className="flex-1 px-2.5 py-1.5 border border-green-200 rounded text-xs focus:border-primary focus:outline-none"
                  placeholder="Nome sede (es. Stabilimento Nord)"
                  value={row.nome || ''}
                  onChange={e => updateSede(i, 'nome', e.target.value)}
                />
                <input
                  className="flex-[2] px-2.5 py-1.5 border border-green-200 rounded text-xs focus:border-primary focus:outline-none"
                  placeholder="Indirizzo completo (es. Via Verdi 5, 10121 Torino TO)"
                  value={row.indirizzo || ''}
                  onChange={e => updateSede(i, 'indirizzo', e.target.value)}
                />
                <select
                  className="px-2.5 py-1.5 border border-green-200 rounded text-xs focus:border-primary focus:outline-none"
                  value={row.tipo || 'Operativa'}
                  onChange={e => updateSede(i, 'tipo', e.target.value)}
                >
                  {['Operativa', 'Magazzino', 'Ufficio', 'Produzione', 'Logistica'].map(o => <option key={o}>{o}</option>)}
                </select>
                <button onClick={() => removeSede(i)} className="text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!sedi.length && (
          <div className="text-xs text-muted-foreground italic text-center py-3 border border-dashed border-border rounded-lg">
            Nessuna sede operativa aggiunta. Usa "Aggiungi sede" per sedi diverse dalla sede legale.
          </div>
        )}
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

      <div className="mb-5">
        <NotesField value={data?.ana?.noteAna} onChange={(v) => u('noteAna', v)} section="ana" rows={3} />
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={() => onNavigate('en')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}