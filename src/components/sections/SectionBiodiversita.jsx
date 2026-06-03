import SectionHeader from '@/components/report/SectionHeader';
import { TextInput, TextArea } from '@/components/report/FormField';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import BiodiversitaMap from '@/components/report/BiodiversitaMap';

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

  // Callback from map: pre-popola un nuovo sito dalla ricerca
  const handleSitoFound = (sitoData) => {
    onUpdate('b5siti', 'siti', [...siti, { superficie: '', titolo: 'Posseduto/locato', sensibile: 'Da verificare', ...sitoData }]);
  };

  const tot = parseFloat(biod.supTot) || 0;
  const imp = parseFloat(biod.supImp) || 0;
  const nat = parseFloat(biod.natM2) || 0;

  return (
    <div>
      <SectionHeader icon="🌿" title="B5 — Biodiversità" description="Verifica prossimità ad aree Natura 2000 / WDPA direttamente sulla mappa. Metriche uso del suolo." reference="VSME B5 | ESRS E4 | Dir. Habitat 92/43/CEE" />

      {/* MAPPA INTEGRATA */}
      <Card className="p-5 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-1">🗺️ Mappa Aree Protette — Verifica Siti</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Cerca l'indirizzo di ogni sede aziendale per visualizzare la prossimità ad aree Natura 2000 e WDPA. Il sito cercato viene aggiunto automaticamente alla tabella sottostante.
        </p>
        <BiodiversitaMap onSitoFound={handleSitoFound} />
      </Card>

      {/* TABELLA SITI */}
      <Card className="p-6 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-bold text-primary text-sm">Siti Aziendali — Prossimità Aree Sensibili</h3>
          <Button size="sm" variant="outline" onClick={addSito}><Plus className="w-3.5 h-3.5 mr-1" /> Aggiungi manualmente</Button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-4">
          ℹ️ I siti cercati sulla mappa vengono aggiunti automaticamente. Completa i campi mancanti (superficie, titolo, sensibile) e imposta "Area sensibile?" dopo aver verificato i layer sulla mappa.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-green-50">
              {['Sito / Sede', 'Paese', 'Sup. (m²)', 'Titolo', 'Area sensibile?', 'Regione', 'Fonte verifica', ''].map(h => (
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
              {!siti.length && <tr><td colSpan="8" className="text-center p-4 text-muted-foreground italic text-xs">Cerca un sito sulla mappa o usa "Aggiungi manualmente".</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {/* METRICHE USO SUOLO */}
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

      <Card className="p-6 mb-5">
        <TextArea label="Nota narrativa B5" value={biod.noteBiod} onChange={(v) => u('noteBiod', v)} rows={4}
          hint="Descrivi l'esito della verifica: 'Nessun sito è ubicato in prossimità di aree Natura 2000 o IBA (verifica effettuata su mappa EEA).'" />
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('inq')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('pe')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}