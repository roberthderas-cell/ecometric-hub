import SectionHeader from '@/components/report/SectionHeader';
import { TextInput, SelectField, ComputedValue, TextArea } from '@/components/report/FormField';
import PmiBancheReference from '@/components/report/PmiBancheReference';
import NotesField from '@/components/report/NotesField';
import CongruenceAlerts from '@/components/report/CongruenceAlerts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import KPICard from '@/components/report/KPICard';
import EsgAlerts from '@/components/report/EsgAlerts';
import { calcEnergy, getMissingMandatory } from '@/lib/vsmeDefaults';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function SectionEnergia({ data, onUpdate, onBulkUpdate, onNavigate }) {
  const en = data?.en || {};
  const u = (field, value) => onUpdate('en', field, value);
  const g = calcEnergy(data);
  const missing = getMissingMandatory(data, 'en');
  const metodo = en.scopeMetodo || 'location';

  const ghgData = [
    { name: 'Scope 1', value: parseFloat(g.s1.toFixed(2)), fill: '#D97706' },
    { name: metodo === 'market' ? 'Scope 2 MB' : 'Scope 2 LB', value: parseFloat(g.s2.toFixed(2)), fill: '#2563EB' },
  ];
  const mixData = [
    { name: 'Rete', value: parseFloat(en.elReteN) || 0 },
    { name: 'FV ☀️', value: parseFloat(en.elFVN) || 0 },
    { name: 'Combustibili', value: g.fuelKwh },
  ].filter(d => d.value > 0);
  const COLORS = ['#2563EB', '#16A34A', '#D97706', '#7C3AED', '#DC2626'];

  return (
    <div>
      <SectionHeader
        sectionId="en"
        title="B3 — Energia e Emissioni GHG"
        description="Consumi energetici, combustibili Scope 1, elettricità Scope 2 (location-based o market-based)."
        reference="VSME B3 | GHG Protocol | Fattori ISPRA"
      />

      <PmiBancheReference sectionKey="en" />

      {missing.length > 0 && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800">Dati obbligatori mancanti</p>
            <ul className="mt-1 space-y-0.5">
              {missing.map(m => <li key={m} className="text-xs text-amber-700">• {m}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Metodo Scope 2 */}
      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-2">Metodo Scope 2</h3>
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-800">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <div>
            <p className="font-semibold mb-1">Location-based vs Market-based (GHG Protocol)</p>
            <p><strong>Location-based:</strong> usa il fattore emissivo medio della rete elettrica nazionale (ISPRA). È il metodo più semplice e conservativo.</p>
            <p className="mt-1"><strong>Market-based:</strong> usa il fattore del contratto di fornitura (GO — Garanzie d'Origine, PPA, ecc.). Permette di valorizzare l'acquisto di energia rinnovabile certificata. Se non si hanno contratti GO, il fattore residuale coincide con quello ISPRA.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label="Metodo dichiarato"
            value={metodo}
            onChange={(v) => u('scopeMetodo', v)}
            options={[
              { value: 'location', label: 'Location-based (ISPRA)' },
              { value: 'market', label: 'Market-based (GO/contratto)' },
            ]}
          />
          {metodo === 'market' && (
            <>
              <TextInput
                label="kWh coperti da GO / contratto rinnovabile"
                type="number"
                value={en.goKWhN}
                onChange={(v) => u('goKWhN', v)}
                hint="Max = elettricità da rete"
              />
              <TextInput
                label="Fattore emissione contrattuale (kgCO₂/kWh)"
                type="number"
                value={en.goEFN}
                onChange={(v) => u('goEFN', v)}
                hint="0 se GO 100% rinnovabile"
              />
            </>
          )}
        </div>
        {metodo === 'market' && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ComputedValue label="Scope 2 Location-based (tCO₂eq)" value={g.s2LB.toFixed(3)} />
            <ComputedValue label="Scope 2 Market-based (tCO₂eq)" value={g.s2MB.toFixed(3)} color={g.s2MB < g.s2LB ? 'green' : 'default'} />
          </div>
        )}
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Elettricità da Rete e Fotovoltaico</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Elettricità da rete Anno N (kWh)" type="number" value={en.elReteN} onChange={(v) => u('elReteN', v)} />
          <TextInput label="Anno N-1 (kWh)" type="number" value={en.elReteN1} onChange={(v) => u('elReteN1', v)} />
          <TextInput label="Fattore ISPRA (kgCO₂eq/kWh)" type="number" value={en.ispra} onChange={(v) => u('ispra', v)} hint="Valore 2023 = 0.211" />
          <TextInput label="Potenza FV installata (kWp)" type="number" value={en.kWpFV} onChange={(v) => u('kWpFV', v)} />
          <TextInput label="FV autoconsumata Anno N (kWh)" type="number" value={en.elFVN} onChange={(v) => u('elFVN', v)} />
          <TextInput label="FV Anno N-1 (kWh)" type="number" value={en.elFVN1} onChange={(v) => u('elFVN1', v)} />
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-2">Combustibili Scope 1</h3>
        <p className="text-xs text-muted-foreground mb-4">Modifica quantità per ciascun combustibile</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-4">
          ⚠️ Solo combustibili in fonti di proprietà/controllo. I fattori CO₂ sono precompilati (ISPRA 2022).
        </div>
        <div className="space-y-3">
          {(data?.enfuels?.rows || []).map((row, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 items-end p-3 bg-muted/30 rounded-lg">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">{row.combustibile}</label>
                <p className="text-[10px] text-muted-foreground">{row.fattoreCO2} kgCO₂/{row.unita}</p>
              </div>
              <TextInput label={`Quantità (${row.unita})`} type="number" value={row.quantita} onChange={(v) => {
                const newRows = [...(data?.enfuels?.rows || [])];
                newRows[i] = { ...newRows[i], quantita: v };
                onUpdate('enfuels', 'rows', newRows);
              }} />
              <ComputedValue label="tCO₂eq" value={((parseFloat(row.quantita) || 0) * (parseFloat(row.fattoreCO2) || 0) / 1000).toFixed(3)} />
              <ComputedValue label="kWh eq." value={Math.round((parseFloat(row.quantita) || 0) * (parseFloat(row.fattoreKwh) || 0)).toLocaleString()} />
            </div>
          ))}
        </div>
      </Card>

      {/* Energia totale MWh — VSME B3 */}
      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-1">Energia Totale (MWh) — richiesto da VSME B3</h3>
        <p className="text-xs text-muted-foreground mb-4">Consumo energetico totale suddiviso tra fonti rinnovabili e non rinnovabili, come richiesto dallo standard EFRAG.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ComputedValue label="Energia totale" value={(g.totKwh / 1000).toFixed(1)} unit="MWh" variant="blue" />
          <ComputedValue label="di cui Rinnovabile" value={(g.renKwh / 1000).toFixed(1)} unit={`MWh · ${g.pRenTot.toFixed(1)}%`} />
          <ComputedValue label="di cui Non rinnovabile" value={(g.nonRenKwh / 1000).toFixed(1)} unit="MWh" />
        </div>
      </Card>

      {/* Rischio Climatico & Tassonomia UE — DP 4, 8, 9, 10 Banche */}
      <Card className="p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-heading font-bold text-primary text-sm">Rischio Climatico e Tassonomia UE</h3>
          <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">Dialogo PMI-Banche — DP 4, 8, 9, 10</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Classe energetica immobili (DP.4)" value={en.classeEnergetica} onChange={(v) => u('classeEnergetica', v)} hint="Certificazione APE per immobili in garanzia" options={[['','Non noto / Non applicabile'],['A4','A4 (massima effic.)'],['A3','A3'],['A2','A2'],['A1','A1'],['B','B'],['C','C'],['D','D'],['E','E'],['F','F'],['G','G (minima effic.)']]} />
          <SelectField label="Target riduzione emissioni GHG fissati? (DP.8)" value={en.targetGHG} onChange={(v) => u('targetGHG', v)} options={[['no','No'],['si','Sì']]} hint="Es. −30% Scope 1+2 entro 2030" />
        </div>
        {en.targetGHG === 'si' && (
          <div className="mt-3">
            <TextArea label="Descrizione target GHG (DP.8)" value={en.targetGHGDesc} onChange={(v) => u('targetGHGDesc', v)} rows={2} placeholder="Es. Riduzione Scope 1+2 del 30% entro 2030 rispetto alla baseline 2022, tramite efficienza e rinnovabili." />
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <TextArea label="Investimenti per riduzione rischio fisico e di transizione (DP.9)" value={en.invRischioCC} onChange={(v) => u('invRischioCC', v)} rows={2} placeholder="Es. Investimento €150.000 in pompe di calore (2024), piano efficienza energetica 2025-2027." />
          <TextArea label="Copertura assicurativa contro rischi fisici/calamità (DP.10)" value={en.assicRischioCC} onChange={(v) => u('assicRischioCC', v)} rows={2} placeholder="Es. Polizza multirischio copertura alluvione e grandine, valore coperto €1,2M, validità 2024–2025." />
        </div>
      </Card>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard label="Scope 1" value={g.s1.toFixed(2)} unit="tCO₂eq" color="amber" delay={0} />
        <KPICard label={metodo === 'market' ? 'Scope 2 MB' : 'Scope 2 LB'} value={g.s2.toFixed(2)} unit="tCO₂eq" color="blue" delay={0.05} />
        <KPICard label="% Rinnovabile" value={g.pRen.toFixed(1) + '%'} unit="FV sul totale" color="green" delay={0.1} />
        <KPICard label="Intensità GHG" value={g.intensity > 0 ? g.intensity.toFixed(2) : '—'} unit="tCO₂eq/M€" delay={0.15} />
      </div>

      {/* Mini charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <Card className="p-5">
          <h4 className="font-heading text-sm font-bold text-primary mb-3">GHG per Scope (tCO₂eq)</h4>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ghgData}><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={10} tickFormatter={v => v.toFixed(2)} /><Tooltip formatter={(v) => [`${Number(v).toFixed(1)} tCO₂eq`]} /><Bar dataKey="value" radius={[6,6,0,0]}>{ghgData.map((d,i) => <Cell key={i} fill={d.fill} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h4 className="font-heading text-sm font-bold text-primary mb-3">Mix Energetico (kWh)</h4>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart><Pie data={mixData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`} fontSize={10}>
              {mixData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mb-5">
        <EsgAlerts data={data} sections={['energia']} />
      </div>
      <div className="mb-5">
        <CongruenceAlerts data={data} section="en" />
      </div>
      <div className="mb-5">
        <NotesField value={en.noteEn} onChange={(v) => u('noteEn', v)} section="en" />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('ana')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('ac')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}