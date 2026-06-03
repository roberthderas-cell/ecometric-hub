import SectionHeader from '@/components/report/SectionHeader';
import { TextInput, SelectField, TextArea } from '@/components/report/FormField';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

// ─────── C1 ───────
export function SectionC1({ data, onUpdate, onNavigate }) {
  const c1 = data?.c1 || {};
  const u = (f, v) => onUpdate('c1', f, v);
  return (
    <div>
      <SectionHeader icon="🎯" title="C1 — Strategia e Modello di Business" description="Racconta chi siete: cosa fate, come create valore, e dove entra la sostenibilità nella strategia." reference="VSME C1 | ESRS 2 — SBM reference" />
      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Modello di Business</h3>
        <TextArea label="Descrizione del modello di business" value={c1.bm} onChange={(v) => u('bm', v)} rows={5} hint="Prodotti/servizi, mercati, canali, struttura organizzativa, posizionamento." />
        <div className="mt-4"><TextArea label="Catena del valore" value={c1.cv} onChange={(v) => u('cv', v)} rows={5} hint="Upstream (fornitori) e downstream (distribuzione). Dove sono i maggiori impatti ESG?" /></div>
      </Card>
      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Strategia di Sostenibilità</h3>
        <TextArea label="Come la sostenibilità entra nella strategia" value={c1.strat} onChange={(v) => u('strat', v)} rows={5} />
        <div className="mt-4"><TextArea label="Orizzonte temporale" value={c1.orizz} onChange={(v) => u('orizz', v)} rows={4} hint="Breve (<1 anno), medio (1–5 anni), lungo (>5 anni)." /></div>
      </Card>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('b2')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('c2')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

// ─────── C2 ───────
export function SectionC2({ data, onUpdate, onNavigate }) {
  const c2 = data?.c2 || {};
  const u = (f, v) => onUpdate('c2', f, v);
  return (
    <div>
      <SectionHeader icon="📝" title="C2 — Pratiche e Politiche (Dettaglio)" description="Espansione di B2: per ciascun tema ESG materiale, pratiche specifiche, politiche e target." reference="VSME C2 | EFRAG Supporting Guide C2 (dic. 2024)" />
      <Card className="p-6 mb-5">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-4">
          ℹ️ 10 temi Appendice B: Climate change · Pollution · Water &amp; marine · Biodiversity · Resource use &amp; CE · Own workforce · Workers in value chain · Affected communities · Consumers/end-users · Business conduct
        </div>
        <TextArea label="Pratiche specifiche per tema" value={c2.pratDet} onChange={(v) => u('pratDet', v)} rows={8} hint="Per ciascun tema materiale, azioni concrete implementate nell'anno, con dati quantitativi." />
        <div className="mt-4"><TextArea label="Politiche formalizzate per tema" value={c2.polDet} onChange={(v) => u('polDet', v)} rows={6} /></div>
        <div className="mt-4"><TextArea label="Target e KPI di monitoraggio" value={c2.targetKPI} onChange={(v) => u('targetKPI', v)} rows={5} /></div>
      </Card>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('c1')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('c3')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

// ─────── C3 ───────
export function SectionC3({ data, onUpdate, onNavigate }) {
  const c3 = data?.c3 || {};
  const u = (f, v) => onUpdate('c3', f, v);
  const targets = data?.c34?.targets || [{ scope: 'Scope 1+2', annoBase: '', valoreBase: '', annoTarget: '', valoreTarget: '', riduzione: '', azioni: '' }];
  const updateTarget = (i, key, val) => {
    const rows = [...targets]; rows[i] = { ...rows[i], [key]: val };
    onUpdate('c34', 'targets', rows);
  };
  return (
    <div>
      <SectionHeader icon="🌍" title="C3 — Target GHG e Piano di Transizione" description="Obiettivi di riduzione GHG e piano di transizione climatica." reference="VSME C3 | EFRAG Supporting Guide C3 (2025) | SBTi" />
      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Target di Riduzione GHG per Scope</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-green-50">
              {['Scope', 'Anno base', 'Valore base (tCO₂eq)', 'Anno target', 'Valore target', 'Riduzione %', 'Azioni chiave'].map(h => (
                <th key={h} className="text-left p-2 font-bold text-primary border-b border-green-200">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {targets.map((row, i) => (
                <tr key={i} className="border-b border-green-100">
                  {['scope', 'annoBase', 'valoreBase', 'annoTarget', 'valoreTarget', 'riduzione'].map(key => (
                    <td key={key} className="p-1.5"><input className="w-full px-2 py-1.5 border border-green-200 rounded text-xs" value={row[key] || ''} onChange={e => updateTarget(i, key, e.target.value)} /></td>
                  ))}
                  <td className="p-1.5"><textarea rows={2} className="w-full px-2 py-1.5 border border-green-200 rounded text-xs resize-y min-w-[140px]" value={row.azioni || ''} onChange={e => updateTarget(i, 'azioni', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => onUpdate('c34', 'targets', [...targets, { scope: '', annoBase: '', valoreBase: '', annoTarget: '', valoreTarget: '', riduzione: '', azioni: '' }])}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Aggiungi target
        </Button>
      </Card>
      <Card className="p-6 mb-5">
        <TextArea label="Piano di Transizione Climatica" value={c3.piano} onChange={(v) => u('piano', v)} rows={6} hint="Azioni concrete: efficienza, rinnovabili, elettrificazione fleet. Scadenze e responsabilità." />
        <div className="mt-4"><TextArea label="Note metodologiche" value={c3.noteC3} onChange={(v) => u('noteC3', v)} rows={3} hint="Metodologia (SBTi, GHG Protocol), allineamento Paris Agreement." /></div>
      </Card>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('c2')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('c4')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

// ─────── C4 ───────
export function SectionC4({ data, onUpdate, onNavigate }) {
  const c4 = data?.c4 || {};
  const u = (f, v) => onUpdate('c4', f, v);
  const rischi = data?.c34?.rischi || [];
  const updateRischio = (i, key, val) => {
    const rows = [...rischi]; rows[i] = { ...rows[i], [key]: val };
    onUpdate('c34', 'rischi', rows);
  };
  return (
    <div>
      <SectionHeader icon="🌊" title="C4 — Rischi Climatici" description="Identifica i rischi fisici acuti/cronici e di transizione. Valutazione ragionata e documentata." reference="VSME C4 | ESRS E1-9 | TCFD framework" />
      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-3">Matrice Rischi Climatici</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-green-50">
              {['Rischio/evento', 'Categoria', 'Orizzonte', 'Livello', 'Azioni adattamento', 'Impatto finanziario', ''].map(h => (
                <th key={h} className="text-left p-2 font-bold text-primary border-b border-green-200">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rischi.map((row, i) => (
                <tr key={i} className="border-b border-green-100">
                  <td className="p-1.5"><input className="w-36 px-2 py-1.5 border border-green-200 rounded text-xs" value={row.rischio || ''} onChange={e => updateRischio(i, 'rischio', e.target.value)} /></td>
                  <td className="p-1.5"><select className="w-full px-2 py-1.5 border border-green-200 rounded text-xs" value={row.categoria || 'Fisico acuto'} onChange={e => updateRischio(i, 'categoria', e.target.value)}>
                    {['Fisico acuto', 'Fisico cronico', 'Transizione'].map(o => <option key={o}>{o}</option>)}
                  </select></td>
                  <td className="p-1.5"><select className="w-full px-2 py-1.5 border border-green-200 rounded text-xs" value={row.orizzonte || 'Breve/medio'} onChange={e => updateRischio(i, 'orizzonte', e.target.value)}>
                    {['Breve/medio', 'Medio/lungo', 'Lungo (>10a)'].map(o => <option key={o}>{o}</option>)}
                  </select></td>
                  <td className="p-1.5"><select className="w-full px-2 py-1.5 border border-green-200 rounded text-xs" value={row.livello || ''} onChange={e => updateRischio(i, 'livello', e.target.value)}>
                    {['', 'Basso', 'Medio', 'Alto'].map(o => <option key={o} value={o}>{o || '—'}</option>)}
                  </select></td>
                  <td className="p-1.5"><textarea rows={2} className="w-36 px-2 py-1.5 border border-green-200 rounded text-xs resize-y" value={row.adattamento || ''} onChange={e => updateRischio(i, 'adattamento', e.target.value)} /></td>
                  <td className="p-1.5"><input className="w-28 px-2 py-1.5 border border-green-200 rounded text-xs" value={row.impattoFin || ''} onChange={e => updateRischio(i, 'impattoFin', e.target.value)} /></td>
                  <td className="p-1.5"><button onClick={() => onUpdate('c34', 'rischi', rischi.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => onUpdate('c34', 'rischi', [...rischi, { rischio: '', categoria: 'Fisico acuto', orizzonte: 'Breve/medio', livello: '', adattamento: '', impattoFin: '' }])}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Aggiungi rischio
          </Button>
        </div>
      </Card>
      <Card className="p-6 mb-5">
        <TextArea label="Stima impatto finanziario" value={c4.finImp} onChange={(v) => u('finImp', v)} rows={4} />
      </Card>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('c3')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('c5')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

// ─────── C5 ───────
export function SectionC5({ data, onUpdate, onNavigate }) {
  const c5 = data?.c5 || {};
  const u = (f, v) => onUpdate('c5', f, v);
  return (
    <div>
      <SectionHeader icon="📊" title="C5 — Caratteristiche Aggiuntive Forza Lavoro" description="Indicatori aggiuntivi sulla stabilità contrattuale e turnover." reference="VSME C5 | ESRS S1-15" />
      <Card className="p-6 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <TextInput label="Tasso Turnover annuo (%)" type="number" value={c5.turn} onChange={(v) => u('turn', v)} />
          <TextInput label="% Donne con contratto indeterminato" type="number" value={c5.perIndDon} onChange={(v) => u('perIndDon', v)} />
          <TextInput label="% Uomini con contratto indeterminato" type="number" value={c5.percIndUom} onChange={(v) => u('percIndUom', v)} />
        </div>
        <div className="mt-4"><TextArea label="Nota narrativa" value={c5.noteC5} onChange={(v) => u('noteC5', v)} rows={5} /></div>
      </Card>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('c4')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('c6')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

// ─────── C6 ───────
export function SectionC6({ data, onUpdate, onNavigate }) {
  const c6 = data?.c6 || {};
  const u = (f, v) => onUpdate('c6', f, v);
  return (
    <div>
      <SectionHeader icon="🤝" title="C6 — Diritti Umani nella Forza Lavoro" description="Politiche sui diritti umani, meccanismi di reclamo e due diligence." reference="VSME C6 | CSDDD (Dir. 2024/1760) | Principi Guida ONU" />
      <Card className="p-6 mb-5">
        <TextArea label="Politiche sui diritti umani" value={c6.polDU} onChange={(v) => u('polDU', v)} rows={5} hint="Libertà di associazione, divieto lavoro forzato/minorile, non discriminazione, retribuzione equa." />
        <div className="mt-4"><TextArea label="Meccanismi di reclamo" value={c6.mecc} onChange={(v) => u('mecc', v)} rows={4} hint="Whistleblowing (D.Lgs. 24/2023), linea etica, rappresentanza sindacale." /></div>
        <div className="mt-4"><TextArea label="Due Diligence sui diritti umani" value={c6.dd} onChange={(v) => u('dd', v)} rows={4} /></div>
      </Card>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('c5')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('c7')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

// ─────── C7 ───────
export function SectionC7({ data, onUpdate, onNavigate }) {
  const c7 = data?.c7 || {};
  const u = (f, v) => onUpdate('c7', f, v);
  const n = parseInt(c7.ncasi) || 0;
  const lvl = n === 0 ? { col: 'text-green-700', bg: 'bg-green-50 border-green-200', ico: '✅', lbl: 'Nessun caso — conforme' }
    : n <= 2 ? { col: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', ico: '⚠️', lbl: 'Limitato (1–2 casi) — monitorare' }
    : { col: 'text-red-700', bg: 'bg-red-50 border-red-200', ico: '🔴', lbl: 'Significativo (3+ casi) — azione richiesta' };
  return (
    <div>
      <SectionHeader icon="⚠️" title="C7 — Incidenti Gravi Diritti Umani" description="Numero di casi gravi di violazione nella catena del valore con descrizione e risposta dell'impresa." reference="VSME C7 | EFRAG Supporting Guide C7 (2025) | CSDDD" />
      <Card className="p-6 mb-5">
        <div className="flex items-start gap-6">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">N. casi gravi</label>
            <input type="number" min="0" value={c7.ncasi || '0'} onChange={e => u('ncasi', e.target.value)}
              className="block mt-1.5 w-32 text-center text-2xl font-extrabold border-2 border-green-200 rounded-lg p-3 focus:border-primary focus:outline-none" />
          </div>
          <div className={`flex-1 border rounded-lg p-4 ${lvl.bg}`}>
            <p className={`text-base font-bold ${lvl.col}`}>{lvl.ico} {lvl.lbl}</p>
            <p className="text-xs text-muted-foreground mt-2">0 = Nessun caso · 1–2 = Limitato — descrivere · 3+ = Significativo — piano d'azione</p>
          </div>
        </div>
        <div className="mt-5">
          <TextArea label="Tipo di incidente e contesto" value={c7.tipo} onChange={(v) => u('tipo', v)} rows={5}
            hint={n === 0 ? "Se N=0: 'Nel periodo non sono stati identificati casi gravi di violazione dei diritti umani nella catena del valore.'" : "Tipo, contesto, fase catena del valore"} />
        </div>
        <div className="mt-4"><TextArea label="Risposta dell'impresa" value={c7.risp} onChange={(v) => u('risp', v)} rows={4} /></div>
      </Card>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('c6')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('c8')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

// ─────── C8 ───────
export function SectionC8({ data, onUpdate, onNavigate }) {
  const c8 = data?.c8 || {};
  const u = (f, v) => onUpdate('c8', f, v);
  return (
    <div>
      <SectionHeader icon="💼" title="C8 — Ricavi da Settori Specifici" description="Ricavi da settori esclusi dai benchmark Paris-aligned (carbone, armi controverse, ecc.)." reference="VSME C8 | Reg. UE 2016/1011 | SFDR" />
      <Card className="p-6 mb-5">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-4">
          ℹ️ Settori esclusi: carbone, armi controverse (cluster munitions, mine antipersona, armi CBRN), attività ad alta intensità di carbonio escluse dai benchmark Paris-aligned EU.
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <TextInput label="Ricavi da settori esclusi (€)" type="number" value={c8.ricEscl} onChange={(v) => u('ricEscl', v)} />
          <TextInput label="% su fatturato" type="number" value={c8.percRic} onChange={(v) => u('percRic', v)} />
          <TextInput label="Settori interessati" value={c8.settEscl} onChange={(v) => u('settEscl', v)} placeholder="N/A" />
        </div>
        <div className="mt-4"><TextArea label="Testo narrativo" value={c8.noteC8} onChange={(v) => u('noteC8', v)} rows={4}
          hint="Se non applicabile: 'La società non genera ricavi da settori esclusi ai sensi del Reg. UE 2016/1011.'" /></div>
      </Card>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('c7')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('c9')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

// ─────── C9 ───────
export function SectionC9({ data, onUpdate, onNavigate }) {
  const c9 = data?.c9 || {};
  const u = (f, v) => onUpdate('c9', f, v);
  const d = parseInt(c9.donneCDA) || 0;
  const m = parseInt(c9.uomCDA) || 0;
  const tot = d + m;
  return (
    <div>
      <SectionHeader icon="🏛️" title="C9 — Diversità di Genere nell'Organo di Governo" description="Composizione per genere del CDA o organo di governo equivalente." reference="VSME C9 | Legge 120/2011 (quote rosa CDA)" />
      <Card className="p-6 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TextInput label="N. Donne nell'organo di governo" type="number" value={c9.donneCDA} onChange={(v) => u('donneCDA', v)} />
          <TextInput label="N. Uomini nell'organo di governo" type="number" value={c9.uomCDA} onChange={(v) => u('uomCDA', v)} />
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Componenti Totali</p>
            <p className="text-xl font-extrabold text-green-700 mt-1">{tot || '—'}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">% Donne</p>
            <p className="text-xl font-extrabold text-blue-700 mt-1">{tot > 0 ? ((d / tot) * 100).toFixed(1) + '%' : '—'}</p>
          </div>
        </div>
        <div className="mt-4"><TextArea label="Nota narrativa" value={c9.noteC9} onChange={(v) => u('noteC9', v)} rows={4} /></div>
      </Card>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('c8')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('dash')} className="bg-primary gap-2">Dashboard KPI <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}