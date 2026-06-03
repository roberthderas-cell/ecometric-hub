import SectionHeader from '@/components/report/SectionHeader';
import { TextInput, SelectField, TextArea } from '@/components/report/FormField';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

export default function SectionInquinamento({ data, onUpdate, onNavigate }) {
  const inq = data?.inq || {};
  const aspetti = data?.b4asp?.aspetti || [];
  const inquinanti = data?.b4asp?.inquinanti || [];
  const u = (field, value) => onUpdate('inq', field, value);

  const updateAspetti = (i, key, val) => {
    const rows = [...aspetti];
    rows[i] = { ...rows[i], [key]: val };
    onUpdate('b4asp', 'aspetti', rows);
  };

  const addAspetto = () => {
    onUpdate('b4asp', 'aspetti', [...aspetti, { processo: '', aspetto: '', impatto: '', presidio: '', evidenza: '' }]);
  };

  const removeAspetto = (i) => {
    onUpdate('b4asp', 'aspetti', aspetti.filter((_, idx) => idx !== i));
  };

  const updateInquinanti = (i, key, val) => {
    const rows = [...inquinanti];
    rows[i] = { ...rows[i], [key]: val };
    onUpdate('b4asp', 'inquinanti', rows);
  };

  const addInquinante = () => {
    onUpdate('b4asp', 'inquinanti', [...inquinanti, { inquinante: '', mezzo: 'Aria', fonte: '', metodo: 'Fattore emissivo', quantita: '', unita: 'kg', limite: '', evidenza: '' }]);
  };

  const removeInquinante = (i) => {
    onUpdate('b4asp', 'inquinanti', inquinanti.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <SectionHeader icon="💨" title="B4 — Inquinamento" description="Matrice aspetti-impatti, inventario inquinanti monitorati, metodi di misura e limiti autorizzativi (AIA/AUA)." reference="VSME B4 | D.Lgs. 152/2006 Parte V | D.P.R. 59/2013 (AUA)" />

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-2">Applicabilità B4</h3>
        <SelectField label="Monitoraggio obbligatorio o EMS attivo?" value={inq.regol || 'no'} onChange={(v) => u('regol', v)}
          options={[['no', 'No — non applicabile'], ['si', 'Sì — dati disponibili']]} hint="Obbligatorio se soggetti ad AIA, AUA o sistema EMS" />
      </Card>

      <Card className="p-6 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-bold text-primary text-sm">Matrice Processi — Aspetti — Impatti</h3>
          <Button size="sm" variant="outline" onClick={addAspetto}><Plus className="w-3.5 h-3.5 mr-1" /> Aggiungi</Button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-4">
          ℹ️ Identifica: attività/processo → aspetto ambientale → matrice impattata → presidio/controllo → evidenza documentale.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-green-50">
              {['Processo/fonte', 'Aspetto ambientale', 'Matrice impattata', 'Presidio/controllo', 'Evidenza', ''].map(h => (
                <th key={h} className="text-left p-2 font-bold text-primary border-b border-green-200">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {aspetti.map((row, i) => (
                <tr key={i} className="border-b border-green-100">
                  {['processo', 'aspetto', 'impatto', 'presidio', 'evidenza'].map(key => (
                    <td key={key} className="p-1.5">
                      <input className="w-full px-2 py-1.5 border border-green-200 rounded text-xs focus:border-green-500 focus:outline-none"
                        value={row[key] || ''} onChange={e => updateAspetti(i, key, e.target.value)} />
                    </td>
                  ))}
                  <td className="p-1.5 w-8">
                    <button onClick={() => removeAspetto(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-bold text-primary text-sm">Inventario Inquinanti</h3>
          <Button size="sm" variant="outline" onClick={addInquinante}><Plus className="w-3.5 h-3.5 mr-1" /> Aggiungi</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-green-50">
              {['Inquinante', 'Mezzo', 'Fonte', 'Metodo', 'Quantità', 'Unità', 'Limite', 'Documento', ''].map(h => (
                <th key={h} className="text-left p-2 font-bold text-primary border-b border-green-200">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {inquinanti.map((row, i) => (
                <tr key={i} className="border-b border-green-100">
                  <td className="p-1.5"><input className="w-full px-2 py-1.5 border border-green-200 rounded text-xs focus:border-green-500 focus:outline-none" value={row.inquinante || ''} onChange={e => updateInquinanti(i, 'inquinante', e.target.value)} /></td>
                  <td className="p-1.5"><select className="w-full px-2 py-1.5 border border-green-200 rounded text-xs focus:border-green-500 focus:outline-none" value={row.mezzo || 'Aria'} onChange={e => updateInquinanti(i, 'mezzo', e.target.value)}>
                    {['Aria', 'Acqua', 'Suolo'].map(o => <option key={o}>{o}</option>)}
                  </select></td>
                  <td className="p-1.5"><input className="w-full px-2 py-1.5 border border-green-200 rounded text-xs" value={row.fonte || ''} onChange={e => updateInquinanti(i, 'fonte', e.target.value)} /></td>
                  <td className="p-1.5"><select className="w-full px-2 py-1.5 border border-green-200 rounded text-xs" value={row.metodo || 'Fattore emissivo'} onChange={e => updateInquinanti(i, 'metodo', e.target.value)}>
                    {['Misura diretta', 'Fattore emissivo', 'Bilancio massa', 'Calcolo ingegneristico'].map(o => <option key={o}>{o}</option>)}
                  </select></td>
                  <td className="p-1.5"><input type="number" className="w-20 px-2 py-1.5 border border-green-200 rounded text-xs" value={row.quantita || ''} onChange={e => updateInquinanti(i, 'quantita', e.target.value)} /></td>
                  <td className="p-1.5"><select className="w-full px-2 py-1.5 border border-green-200 rounded text-xs" value={row.unita || 'kg'} onChange={e => updateInquinanti(i, 'unita', e.target.value)}>
                    {['kg', 't', 'mg/Nm3', 'ug/m3'].map(o => <option key={o}>{o}</option>)}
                  </select></td>
                  <td className="p-1.5"><input className="w-24 px-2 py-1.5 border border-green-200 rounded text-xs" value={row.limite || ''} onChange={e => updateInquinanti(i, 'limite', e.target.value)} /></td>
                  <td className="p-1.5"><input className="w-24 px-2 py-1.5 border border-green-200 rounded text-xs" value={row.evidenza || ''} onChange={e => updateInquinanti(i, 'evidenza', e.target.value)} /></td>
                  <td className="p-1.5 w-8"><button onClick={() => removeInquinante(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <TextArea label="Nota narrativa B4" value={inq.noteInq} onChange={(v) => u('noteInq', v)} rows={4}
          hint="Se non applicabile: 'L'impresa non è soggetta ad AIA/AUA e non adotta EMS con monitoraggio emissioni.'" />
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('ri')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('biod')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}