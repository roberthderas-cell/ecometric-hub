import SectionHeader from '@/components/report/SectionHeader';
import { TextInput, SelectField, TextArea } from '@/components/report/FormField';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

export default function SectionBiodiversita({ data, onUpdate, onNavigate }) {
  const biod = data?.biod || {};
  const siti = data?.b5siti?.siti || [];
  const u = (field, value) => onUpdate('biod', field, value);

  const updateSito = (i, key, val) => {
    const rows = [...siti];
    rows[i] = { ...rows[i], [key]: val };
    onUpdate('b5siti', 'siti', rows);
  };

  const addSito = () => {
    onUpdate('b5siti', 'siti', [...siti, { sito: '', paese: 'Italia', superficie: '', titolo: 'Posseduto/locato', sensibile: 'Da verificare', regione: '', fonte: 'Natura 2000 / WDPA' }]);
  };

  const removeSito = (i) => {
    onUpdate('b5siti', 'siti', siti.filter((_, idx) => idx !== i));
  };

  const tot = parseFloat(biod.supTot) || 0;
  const imp = parseFloat(biod.supImp) || 0;
  const nat = parseFloat(biod.natM2) || 0;

  return (
    <div>
      <SectionHeader icon="🌿" title="B5 — Biodiversità" description="Tabella siti aziendali con verifica prossimità ad aree Natura 2000 / KBA / WDPA. Metriche uso del suolo." reference="VSME B5 | ESRS E4 | Dir. Habitat 92/43/CEE" />

      <Card className="p-6 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-bold text-primary text-sm">Siti Aziendali — Prossimità Aree Sensibili</h3>
          <Button size="sm" variant="outline" onClick={addSito}><Plus className="w-3.5 h-3.5 mr-1" /> Aggiungi</Button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-4">
          ℹ️ Verifica su <strong>isprambiente.gov.it</strong> o Protected Planet (WDPA). Indica "Sì" se il sito è in/adiacente a area protetta (Natura 2000, IBA, KBA).
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-green-50">
              {['Sito / Sede', 'Paese', 'Sup. (m²)', 'Posseduto/Locato', 'Area sensibile?', 'Regione', 'Fonte verifica', ''].map(h => (
                <th key={h} className="text-left p-2 font-bold text-primary border-b border-green-200">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {siti.map((row, i) => (
                <tr key={i} className="border-b border-green-100">
                  <td className="p-1.5"><input className="w-full px-2 py-1.5 border border-green-200 rounded text-xs" value={row.sito || ''} onChange={e => updateSito(i, 'sito', e.target.value)} /></td>
                  <td className="p-1.5"><input className="w-20 px-2 py-1.5 border border-green-200 rounded text-xs" value={row.paese || 'Italia'} onChange={e => updateSito(i, 'paese', e.target.value)} /></td>
                  <td className="p-1.5"><input type="number" className="w-24 px-2 py-1.5 border border-green-200 rounded text-xs" value={row.superficie || ''} onChange={e => updateSito(i, 'superficie', e.target.value)} /></td>
                  <td className="p-1.5"><select className="w-full px-2 py-1.5 border border-green-200 rounded text-xs" value={row.titolo || 'Posseduto/locato'} onChange={e => updateSito(i, 'titolo', e.target.value)}>
                    {['Posseduto/locato', 'Posseduto', 'Locato', 'Gestito'].map(o => <option key={o}>{o}</option>)}
                  </select></td>
                  <td className="p-1.5"><select className="w-full px-2 py-1.5 border border-green-200 rounded text-xs" value={row.sensibile || 'Da verificare'} onChange={e => updateSito(i, 'sensibile', e.target.value)}>
                    {['Da verificare', 'No', 'Si'].map(o => <option key={o}>{o}</option>)}
                  </select></td>
                  <td className="p-1.5"><input className="w-32 px-2 py-1.5 border border-green-200 rounded text-xs" value={row.regione || ''} onChange={e => updateSito(i, 'regione', e.target.value)} /></td>
                  <td className="p-1.5"><input className="w-36 px-2 py-1.5 border border-green-200 rounded text-xs" value={row.fonte || ''} onChange={e => updateSito(i, 'fonte', e.target.value)} /></td>
                  <td className="p-1.5 w-8"><button onClick={() => removeSito(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></td>
                </tr>
              ))}
              {!siti.length && <tr><td colSpan="8" className="text-center p-4 text-muted-foreground italic text-xs">Nessun sito inserito. Usa il pulsante Aggiungi.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Uso del Suolo — Metriche Quantitative</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TextInput label="Superficie totale siti (m²)" type="number" value={biod.supTot} onChange={(v) => u('supTot', v)} />
          <TextInput label="di cui impermeabilizzata" type="number" value={biod.supImp} onChange={(v) => u('supImp', v)} />
          <TextInput label="Area nature-oriented on-site" type="number" value={biod.natM2} onChange={(v) => u('natM2', v)} />
          <TextInput label="Area nature-oriented off-site" type="number" value={biod.sigillM2} onChange={(v) => u('sigillM2', v)} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm font-bold text-green-700">
            % Impermeabilizzata: {tot > 0 ? ((imp / tot) * 100).toFixed(1) + '%' : '—'}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm font-bold text-blue-700">
            % Nature-oriented: {tot > 0 ? ((nat / tot) * 100).toFixed(1) + '%' : '—'}
          </div>
        </div>
      </Card>

      <div className="p-4 bg-muted/40 rounded-lg text-xs text-muted-foreground mb-5">
        <strong>🔗 Link utili per verifica:</strong>{' '}
        <a href="https://idrogeo.isprambiente.it/app/" target="_blank" className="text-blue-600 hover:underline">IdroGEO (frane/alluvioni)</a>{' · '}
        <a href="https://natura2000.eea.europa.eu/" target="_blank" className="text-blue-600 hover:underline">Natura 2000 (EEA)</a>{' · '}
        <a href="https://www.isprambiente.gov.it/it/banche-dati" target="_blank" className="text-blue-600 hover:underline">Banche dati ISPRA</a>
      </div>

      <Card className="p-6 mb-5">
        <TextArea label="Nota narrativa B5" value={biod.noteBiod} onChange={(v) => u('noteBiod', v)} rows={4}
          hint="Se non applicabile: 'Nessun sito operativo è ubicato in prossimità di aree Natura 2000 o IBA.'" />
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('inq')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('pe')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}