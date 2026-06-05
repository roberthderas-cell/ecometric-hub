import { useState } from 'react';
import SectionHeader from '@/components/report/SectionHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import KPICard from '@/components/report/KPICard';
import EsgTrendChart from '@/components/report/EsgTrendChart';
import AiCoach from '@/components/report/AiCoach';
import { calcEnergy, calcWaste, calcWater, calcPersonnel, calcESGScore } from '@/lib/vsmeDefaults';
import { FileDown, Loader2, FlaskConical, LayoutTemplate, Building2, ClipboardList } from 'lucide-react';
import { exportReportPDF } from '@/lib/exportPdf';
import { Link } from 'react-router-dom';
import { RadarEsg, GhgBarChart, WasteDonut, GenderDonut, EnergyMixBar } from '@/components/report/EsgCharts';
import SimulatorPanel from '@/components/report/SimulatorPanel';
import { TemplateManagerModal } from '@/components/report/TemplateManager';
import SectorBenchmark from '@/components/report/SectorBenchmark';
import EsgPriorityOverview from '@/components/report/EsgPriorityOverview';
import EsgWizard from '@/components/report/EsgWizard';
import { AnimatePresence } from 'framer-motion';

export default function SectionDashboard({ data, reportId, report, onNavigate, onUpdate, onBulkUpdate }) {
  const [exporting, setExporting] = useState(false);
  const [simOpen, setSimOpen] = useState(false);
  const [tmplOpen, setTmplOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const g   = calcEnergy(data);
  const w   = calcWaste(data);
  const wa  = calcWater(data);
  const p   = calcPersonnel(data);
  const esg = calcESGScore(data);
  const pe  = data?.pe  || {};
  const gov = data?.gov || {};

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReportPDF({ report: report || { name: 'Report ESG', year: new Date().getFullYear() }, data, esg, g, w, wa, p });
    } finally {
      setExporting(false);
    }
  };
  const hc = parseInt(pe.hc) || 0;
  const donne = parseFloat(pe.donne) || 0;

  const ratingBg = {
    'Leader': 'from-green-600 to-green-500',
    'Avanzato': 'from-blue-600 to-blue-500',
    'Buono': 'from-cyan-600 to-cyan-500',
    'In crescita': 'from-amber-600 to-amber-500',
    'Base': 'from-slate-500 to-slate-400',
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4">
        <SectionHeader icon="📊" title="Dashboard KPI ESG" description="Panoramica completa delle performance Environmental, Social e Governance." reference="VSME Standard · 45 indicatori" />
        <div className="flex gap-2 shrink-0 mt-1">
          <Button
            onClick={() => setWizardOpen(true)}
            variant="outline"
            className="gap-2 shadow border-primary text-primary hover:bg-primary/5"
          >
            <ClipboardList className="w-4 h-4" /> Compilazione Guidata
          </Button>
          <Button
            onClick={() => setTmplOpen(true)}
            variant="outline"
            className="gap-2 shadow"
          >
            <LayoutTemplate className="w-4 h-4" /> Modelli
          </Button>
          <Button
            onClick={() => setSimOpen(o => !o)}
            variant={simOpen ? 'default' : 'outline'}
            className={`gap-2 shadow ${simOpen ? 'bg-primary text-white' : ''}`}
          >
            <FlaskConical className="w-4 h-4" /> Simulatore
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-forest-800 hover:bg-forest-700 text-white gap-2 shadow-lg"
          >
            {exporting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando PDF...</>
              : <><FileDown className="w-4 h-4" /> Esporta PDF</>}
          </Button>
          <Link to={`/relazione-banca?report=${reportId}`}>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white gap-2 shadow-lg font-bold">
              <Building2 className="w-4 h-4" /> Relazione Banca PDF
            </Button>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {simOpen && <SimulatorPanel data={data} realEsg={esg} onClose={() => setSimOpen(false)} />}
      </AnimatePresence>

      <TemplateManagerModal
        open={tmplOpen}
        onClose={() => setTmplOpen(false)}
        currentData={data}
      />

      {wizardOpen && (
        <EsgWizard
          data={data}
          onUpdate={onUpdate}
          onClose={() => setWizardOpen(false)}
        />
      )}

      {/* Priority Overview — aree da migliorare */}
      <EsgPriorityOverview esg={esg} onNavigate={onNavigate} />

      {/* Benchmark di Settore */}
      <SectorBenchmark esg={esg} ateco={data?.ana?.ateco} />

      {/* AI Coach ESG */}
      <AiCoach data={data} esg={esg} />

      {/* Trend ESG nel tempo */}
      {reportId && <div className="mb-6"><EsgTrendChart reportId={reportId} /></div>}

      {/* ESG Score Hero */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`md:col-span-1 rounded-2xl bg-gradient-to-br ${ratingBg[esg.rating] || ratingBg.Base} p-6 text-white text-center shadow-xl`}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">ESG Score</p>
          <p className="font-heading text-6xl font-extrabold leading-none">{esg.tot}</p>
          <p className="text-sm opacity-70 mt-1">/ 100</p>
          <div className="mt-3 bg-white/20 rounded-lg py-2 px-4 text-sm font-bold">{esg.rIcon} {esg.rating}</div>
        </motion.div>

        <div className="md:col-span-3 grid grid-cols-3 gap-4">
          {[
            { label: 'Ambiente (E)', value: esg.E, color: '#059669', gradient: 'from-green-50 to-green-100 border-green-200' },
            { label: 'Sociale (S)', value: esg.S, color: '#2563EB', gradient: 'from-blue-50 to-blue-100 border-blue-200' },
            { label: 'Governance (G)', value: esg.G, color: '#7C3AED', gradient: 'from-purple-50 to-purple-100 border-purple-200' },
          ].map((area, i) => (
            <motion.div
              key={area.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className={`bg-gradient-to-br ${area.gradient} border rounded-xl p-5`}
            >
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{area.label}</p>
              <p className="font-heading text-3xl font-extrabold mt-2" style={{ color: area.color }}>
                {area.value}<span className="text-base text-muted-foreground">/100</span>
              </p>
              <div className="h-1.5 bg-white rounded-full mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${area.value}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: area.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts grid — wrapped for PDF capture */}
      <div id="esg-pdf-charts" className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <RadarEsg esg={esg} />
        <GhgBarChart g={g} />
        <EnergyMixBar g={g} />
        <WasteDonut w={w} />
      </div>

      {/* KPI Cards grid */}
      <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3 mt-8">🌡️ Clima & Energia</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Scope 1+2" value={g.tot.toFixed(2)} unit="tCO₂eq" color="amber"
          description="Somma delle emissioni dirette (Scope 1, da combustibili interni) e indirette (Scope 2, da acquisto di elettricità). Misurate in tonnellate di CO₂ equivalente." />
        <KPICard label="% Rinnovabile" value={g.pRen.toFixed(1) + '%'} unit="FV" color="green" delay={0.05}
          description="Quota percentuale dell'energia elettrica proveniente da fonti rinnovabili (es. fotovoltaico) sul totale dei consumi elettrici aziendali." />
        <KPICard label="Energia Totale" value={(g.totKwh / 1000).toFixed(1)} unit="MWh" color="blue" delay={0.1}
          description="Consumo energetico complessivo dell'azienda, comprensivo di elettricità da rete, fonti rinnovabili autoprodotte e combustibili fossili. Espresso in MegaWattora." />
        <KPICard label="Intensità GHG" value={g.intensity > 0 ? g.intensity.toFixed(2) : '—'} unit="tCO₂eq/M€" delay={0.15}
          description="Rapporto tra le emissioni totali di gas serra (Scope 1+2) e il fatturato aziendale in milioni di euro. Misura l'efficienza climatica per unità di ricavo." />
      </div>

      <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">💧 Acqua</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Prelievi" value={wa.tot.toFixed(0)} unit="m³" color="blue"
          description="Volume totale di acqua prelevata da tutte le fonti (rete idrica, acque superficiali, acque sotterranee) nel corso dell'anno di riferimento." />
        <KPICard label="Stress idrico" value={wa.high.toFixed(0)} unit="m³" color={wa.high > 0 ? 'amber' : 'default'}
          description="Volume di acqua prelevata da aree classificate ad alto o molto alto rischio di stress idrico secondo le mappe WRI Aqueduct. Valore 0 indica assenza di siti in zone critiche." />
        <KPICard label="Consumo netto" value={wa.consumo.toFixed(0)} unit="m³"
          description="Acqua effettivamente consumata: prelievi totali meno i volumi restituiti all'ambiente (scarichi). Rappresenta l'impatto netto sull'approvvigionamento idrico locale." />
        <KPICard label="Consumo/dip." value={wa.consumoDip.toFixed(1)} unit="m³/dip."
          description="Consumo idrico netto normalizzato per numero di dipendenti. Utile per confrontare l'efficienza idrica nel tempo o con aziende dello stesso settore." />
      </div>

      <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">♻️ Rifiuti</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Rifiuti totali" value={w.tot.toFixed(2)} unit="t"
          description="Massa complessiva di rifiuti prodotti dall'azienda nell'anno, inclusi pericolosi e non pericolosi, destinati a qualsiasi percorso di smaltimento o recupero." />
        <KPICard label="Pericolosi" value={w.per.toFixed(2)} unit="t" color={parseFloat(w.per) > 0 ? 'amber' : 'default'}
          description="Quantità di rifiuti classificati come pericolosi ai sensi della normativa europea (Reg. CE 1357/2014). Richiedono gestione specializzata e tracciabilità documentale." />
        <KPICard label="% Recupero" value={w.pRec.toFixed(1) + '%'} color="green"
          description="Percentuale dei rifiuti totali avviata a operazioni di recupero (riciclaggio, compostaggio, recupero energetico) anziché a discarica o incenerimento senza recupero." />
        <KPICard label="Smaltimento" value={w.smal.toFixed(2)} unit="t"
          description="Quota di rifiuti avviata a smaltimento definitivo (discarica, incenerimento senza recupero energetico). Un valore basso indica una buona gestione circolare." />
      </div>

      <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">👥 Personale</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Dipendenti" value={hc || '—'} unit="headcount" color="blue"
          description="Numero totale di dipendenti (headcount) al 31/12 dell'anno di riferimento, inclusi contratti a tempo indeterminato, determinato e part-time." />
        <KPICard label="% Donne" value={hc > 0 ? (donne / hc * 100).toFixed(1) + '%' : '—'}
          description="Percentuale di lavoratrici donne sul totale dei dipendenti. Indicatore chiave di diversità e inclusione di genere a livello aziendale." />
        <KPICard label="Gender Pay Gap" value={p.gpg + '%'} color={parseFloat(p.gpg) > 15 ? 'red' : 'default'}
          description="Divario retributivo di genere: differenza percentuale tra la retribuzione media maschile e femminile. Valori superiori al 15% sono considerati critici secondo le linee guida EU." />
        <KPICard label="Indice Frequenza" value={p.IF} unit="×1M ore"
          description="Numero di infortuni sul lavoro per milione di ore lavorate (INAIL). Formula: (N. infortuni / ore lavorate totali) × 1.000.000. Benchmark settore manifatturiero: <20." />
      </div>

      <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">⚖️ Governance</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Codice Etico', value: gov.codEtico === 'si' },
          { label: 'MOG 231', value: gov.mog231 === 'si' },
          { label: 'ISO 45001', value: gov.iso45001 === 'si' },
          { label: 'Whistleblowing', value: gov.wb === 'si' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`rounded-xl p-4 text-center border ${item.value ? 'bg-green-50 border-green-200' : 'bg-muted border-border'}`}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className={`text-lg font-bold mt-1 ${item.value ? 'text-green-600' : 'text-muted-foreground'}`}>{item.value ? '✅ Sì' : '— No'}</p>
          </motion.div>
        ))}
      </div>

      <GenderDonut pe={pe} />
    </div>
  );
}