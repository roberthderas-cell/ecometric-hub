import SectionHeader from '@/components/report/SectionHeader';
import { TextInput, SelectField } from '@/components/report/FormField';
import NotesField from '@/components/report/NotesField';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import BiodiversitaMap from '@/components/report/BiodiversitaMap';
import { Link } from 'react-router-dom';

export default function SectionBiodiversita({ data, onUpdate, onNavigate, reportId }) {
  const biod = data?.biod || {};
  const u = (field, value) => onUpdate('biod', field, value);

  const sedeLegale = data?.ana?.sede || '';
  const sediOperative = data?.sedi?.lista || [];

  const tot = parseFloat(biod.supTot) || 0;
  const imp = parseFloat(biod.supImp) || 0;
  const nat = parseFloat(biod.natM2) || 0;

  const hasSedi = sedeLegale || sediOperative.some(s => s.indirizzo);

  return (
    <div>
      <SectionHeader sectionId="biod" title="B5 — Biodiversità" description="Verifica automatica della prossimità delle sedi aziendali ad aree Natura 2000 e WDPA. Le sedi vengono lette dall'Anagrafica." reference="VSME B5 | ESRS E4 | Dir. Habitat 92/43/CEE" />

      {/* AVVISO SE MANCANO SEDI */}
      {!hasSedi && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold mb-1">Sedi non ancora inserite</p>
            <p className="text-xs">Vai nella sezione <strong>Anagrafica</strong> e inserisci la sede legale e le sedi operative con l'indirizzo completo. La mappa le geolocalizza automaticamente.</p>
            <button onClick={() => onNavigate('ana')} className="mt-2 text-xs font-bold text-amber-700 underline underline-offset-2">
              → Vai all'Anagrafica
            </button>
          </div>
        </div>
      )}

      {/* MAPPA INTEGRATA */}
      <Card className="p-5 mb-5">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <h3 className="font-heading font-bold text-primary text-sm">🗺️ Mappa Aree Protette — Verifica Sedi Aziendali</h3>
          <div className="flex items-center gap-3">
            {data?.ana?.sede && (
              <a
                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(data.ana.sede)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                <ExternalLink className="w-3 h-3" /> Apri su OpenStreetMap
              </a>
            )}
            <a
              href="https://natura2000.eea.europa.eu/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:underline"
            >
              <ExternalLink className="w-3 h-3" /> Portale Natura 2000
            </a>
            {hasSedi && (
              <button onClick={() => onNavigate('ana')} className="text-xs text-primary hover:underline">
                ✏️ Modifica sedi →
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Le sedi inserite in Anagrafica vengono geolocalizzate automaticamente. Attiva/disattiva i layer Natura 2000 e WDPA per verificare la prossimità alle aree protette (buffer 5 km).
        </p>
        <BiodiversitaMap
          sedeLegale={sedeLegale}
          sediOperative={sediOperative}
        />
      </Card>

      {/* RIEPILOGO SEDI */}
      {hasSedi && (
        <Card className="p-5 mb-5">
          <h3 className="font-heading font-bold text-primary text-sm mb-3">Riepilogo Sedi — Esito Verifica</h3>
          <div className="space-y-2">
            {sedeLegale && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100 text-sm">
                <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
                <div>
                  <span className="font-bold text-red-800">Sede Legale</span>
                  <span className="text-xs text-muted-foreground ml-2">{sedeLegale}</span>
                </div>
                <SelectField
                  label=""
                  value={biod.sensLegale || 'Da verificare'}
                  onChange={(v) => u('sensLegale', v)}
                  options={[['Da verificare', 'Da verificare'], ['No', 'No — fuori da aree protette'], ['Si', 'Sì — in/adiacente ad area protetta']]}
                />
              </div>
            )}
            {sediOperative.filter(s => s.indirizzo).map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm">
                <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
                <div className="flex-1">
                  <span className="font-bold text-blue-800">{s.nome || s.tipo}</span>
                  <span className="text-xs text-muted-foreground ml-2">{s.indirizzo}</span>
                </div>
                <SelectField
                  label=""
                  value={(biod.sensOp || [])[i] || 'Da verificare'}
                  onChange={(v) => {
                    const arr = [...(biod.sensOp || [])];
                    arr[i] = v;
                    u('sensOp', arr);
                  }}
                  options={[['Da verificare', 'Da verificare'], ['No', 'No'], ['Si', 'Sì']]}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

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

      <div className="mb-5">
        <NotesField value={biod.noteBiod} onChange={(v) => u('noteBiod', v)} section="biod" />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('inq')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('pe')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}