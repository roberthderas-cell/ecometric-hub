import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TextInput, SelectField, TextArea, ComputedValue } from '@/components/report/FormField';
import { Card } from '@/components/ui/card';
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, Leaf, Users, Shield,
  Zap, Droplets, Recycle, FlameKindling, Wind
} from 'lucide-react';
import { calcEnergy, calcPersonnel } from '@/lib/vsmeDefaults';

// ─── Step definitions ──────────────────────────────────────────────────────
const STEPS = [
  // AMBIENTE
  { id: 'en-elec',  area: 'E', areaLabel: 'Ambiente', icon: Zap,          title: 'Elettricità e Fotovoltaico',   desc: 'Consumi elettrici da rete e produzione FV autoprodotta.' },
  { id: 'en-fuel',  area: 'E', areaLabel: 'Ambiente', icon: FlameKindling, title: 'Combustibili Scope 1',         desc: 'Gas naturale, gasolio e altri combustibili usati in azienda.' },
  { id: 'ac',       area: 'E', areaLabel: 'Ambiente', icon: Droplets,       title: 'Acqua',                        desc: 'Prelievi idrici, scarichi e stress idrico.' },
  { id: 'ri',       area: 'E', areaLabel: 'Ambiente', icon: Recycle,        title: 'Rifiuti',                      desc: 'Produzione, classificazione e avvio a recupero.' },
  // SOCIALE
  { id: 'pe-org',   area: 'S', areaLabel: 'Sociale',  icon: Users,          title: 'Organico e Diversity',         desc: 'Headcount, genere, tipologie contrattuali.' },
  { id: 'pe-hs',    area: 'S', areaLabel: 'Sociale',  icon: Wind,           title: 'Salute & Sicurezza',           desc: 'Infortuni, ore lavorate, assenteismo.' },
  { id: 'pe-ret',   area: 'S', areaLabel: 'Sociale',  icon: Users,          title: 'Retribuzione e Formazione',    desc: 'CCNL, pay gap di genere, ore di training.' },
  // GOVERNANCE
  { id: 'gov-cda',  area: 'G', areaLabel: 'Governance', icon: Shield,       title: 'Organo di Governo',            desc: 'Composizione CDA e diversità di genere.' },
  { id: 'gov-comp', area: 'G', areaLabel: 'Governance', icon: Shield,       title: 'Compliance & Certificazioni',  desc: 'MOG 231, codice etico, ISO, whistleblowing.' },
  { id: 'gov-corr', area: 'G', areaLabel: 'Governance', icon: Shield,       title: 'Corruzione e Pagamenti',       desc: 'Condanne, sanzioni, tempi medi di pagamento.' },
];

const AREA_COLORS = {
  E: { bg: 'bg-green-600', light: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500' },
  S: { bg: 'bg-blue-600',  light: 'bg-blue-50',  border: 'border-blue-200',  text: 'text-blue-700',  dot: 'bg-blue-500' },
  G: { bg: 'bg-purple-600',light: 'bg-purple-50',border: 'border-purple-200',text: 'text-purple-700',dot: 'bg-purple-500' },
};

// ─── Step content components ───────────────────────────────────────────────
function StepEnElec({ data, onUpdate }) {
  const en = data?.en || {};
  const u = (f, v) => onUpdate('en', f, v);
  const g = calcEnergy(data);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput label="Elettricità da rete Anno N (kWh)" type="number" value={en.elReteN} onChange={(v) => u('elReteN', v)} hint="Vedi bolletta elettrica" />
        <TextInput label="Elettricità da rete Anno N-1 (kWh)" type="number" value={en.elReteN1} onChange={(v) => u('elReteN1', v)} />
        <TextInput label="Fattore ISPRA (kgCO₂eq/kWh)" type="number" value={en.ispra} onChange={(v) => u('ispra', v)} hint="Default 2023 = 0.211" />
        <TextInput label="Potenza FV installata (kWp)" type="number" value={en.kWpFV} onChange={(v) => u('kWpFV', v)} hint="0 se non presente" />
        <TextInput label="FV autoconsumata Anno N (kWh)" type="number" value={en.elFVN} onChange={(v) => u('elFVN', v)} />
        <TextInput label="FV Anno N-1 (kWh)" type="number" value={en.elFVN1} onChange={(v) => u('elFVN1', v)} />
      </div>
      {(parseFloat(en.elReteN) > 0 || parseFloat(en.elFVN) > 0) && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <ComputedValue label="Scope 2 (location-based)" value={g.s2LB.toFixed(2)} unit="tCO₂eq" />
          <ComputedValue label="% Rinnovabile" value={g.pRen.toFixed(1) + '%'} variant="blue" />
        </div>
      )}
    </div>
  );
}

function StepEnFuel({ data, onUpdate }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Inserisci i quantitativi consumati. Lascia 0 se il combustibile non è usato.</p>
      {(data?.enfuels?.rows || []).map((row, i) => (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end p-3 bg-muted/30 rounded-lg">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs font-bold text-foreground">{row.combustibile}</p>
            <p className="text-[10px] text-muted-foreground">{row.fattoreCO2} kgCO₂/{row.unita}</p>
          </div>
          <TextInput label={`Quantità (${row.unita})`} type="number" value={row.quantita} onChange={(v) => {
            const rows = [...(data?.enfuels?.rows || [])];
            rows[i] = { ...rows[i], quantita: v };
            onUpdate('enfuels', 'rows', rows);
          }} />
          <ComputedValue label="tCO₂eq" value={((parseFloat(row.quantita) || 0) * (parseFloat(row.fattoreCO2) || 0) / 1000).toFixed(3)} />
          <ComputedValue label="kWh eq." value={Math.round((parseFloat(row.quantita) || 0) * (parseFloat(row.fattoreKwh) || 0)).toLocaleString()} />
        </div>
      ))}
    </div>
  );
}

function StepAcqua({ data, onUpdate }) {
  const ac = data?.ac || {};
  const u = (f, v) => onUpdate('ac', f, v);
  const fonti = data?.acfonti?.fonti || [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput label="Prelievo totale (m³)" type="number" value={ac.totAc} onChange={(v) => u('totAc', v)} hint="Somma di tutte le fonti" />
        <TextInput label="di cui in zone stress idrico (m³)" type="number" value={ac.highStress} onChange={(v) => u('highStress', v)} hint="0 se non applicabile" />
        <TextInput label="Scarichi totali (m³)" type="number" value={ac.scarichi} onChange={(v) => u('scarichi', v)} />
        <TextInput label="Dipendenti (per calcolo intensità)" type="number" value={data?.pe?.hc} onChange={(v) => onUpdate('pe', 'hc', v)} hint="Se già compilato si aggiorna" />
      </div>
      {fonti.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Fonti dettagliate</p>
          {fonti.map((f, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 mb-2 p-2 bg-muted/20 rounded-lg text-xs">
              <span className="font-medium">{f.fonte}</span>
              <TextInput label="Prelievo (m³)" type="number" value={f.prelievo} onChange={(v) => {
                const arr = [...fonti]; arr[i] = { ...arr[i], prelievo: v };
                onUpdate('acfonti', 'fonti', arr);
              }} />
              <span className={f.stress === 'si' ? 'text-amber-600 font-bold self-end pb-2' : 'text-muted-foreground self-end pb-2'}>
                {f.stress === 'si' ? '⚠️ Stress idrico' : '✓ OK'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepRifiuti({ data, onUpdate }) {
  const ri = data?.ri || {};
  const u = (f, v) => onUpdate('ri', f, v);
  const tot = parseFloat(ri.totN) || 0;
  const rec = parseFloat(ri.recN) || 0;
  const pRec = tot > 0 ? (rec / tot * 100).toFixed(1) : '—';
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput label="Rifiuti totali Anno N (t)" type="number" value={ri.totN} onChange={(v) => u('totN', v)} />
        <TextInput label="Anno N-1 (t)" type="number" value={ri.totN1} onChange={(v) => u('totN1', v)} />
        <TextInput label="di cui Pericolosi (t)" type="number" value={ri.periN} onChange={(v) => u('periN', v)} />
        <TextInput label="Avviati a Recupero/Riciclo (t)" type="number" value={ri.recN} onChange={(v) => u('recN', v)} hint="Include riciclo + compostaggio + recupero energetico" />
        <TextInput label="Avviati a Smaltimento (t)" type="number" value={ri.smalN} onChange={(v) => u('smalN', v)} hint="Discarica + incenerimento senza recupero" />
        <TextInput label="Anno N-1 recupero (t)" type="number" value={ri.recN1} onChange={(v) => u('recN1', v)} />
      </div>
      {tot > 0 && (
        <ComputedValue label="Tasso di recupero" value={pRec + '%'} variant={parseFloat(pRec) >= 85 ? 'blue' : ''} unit="(obiettivo ≥ 85%)" />
      )}
    </div>
  );
}

function StepPeOrg({ data, onUpdate }) {
  const pe = data?.pe || {};
  const u = (f, v) => onUpdate('pe', f, v);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <TextInput label="Headcount (HC)" type="number" value={pe.hc} onChange={(v) => u('hc', v)} hint="Dipendenti al 31/12" />
      <TextInput label="FTE" type="number" value={pe.fte} onChange={(v) => u('fte', v)} />
      <TextInput label="di cui Donne" type="number" value={pe.donne} onChange={(v) => u('donne', v)} />
      <TextInput label="di cui Uomini" type="number" value={pe.uomini} onChange={(v) => u('uomini', v)} />
      <TextInput label="Contratto Indeterminato" type="number" value={pe.indet} onChange={(v) => u('indet', v)} />
      <TextInput label="Contratto Determinato" type="number" value={pe.det} onChange={(v) => u('det', v)} />
      <TextInput label="Part-Time" type="number" value={pe.pt} onChange={(v) => u('pt', v)} />
      <TextInput label="Dipendenti con Disabilità" type="number" value={pe.disab} onChange={(v) => u('disab', v)} />
    </div>
  );
}

function StepPeHs({ data, onUpdate }) {
  const pe = data?.pe || {};
  const u = (f, v) => onUpdate('pe', f, v);
  const p = calcPersonnel(data);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <TextInput label="Infortuni (≥ 1 gg assenza)" type="number" value={pe.infort} onChange={(v) => u('infort', v)} />
        <TextInput label="Giorni persi" type="number" value={pe.ggPersi} onChange={(v) => u('ggPersi', v)} />
        <TextInput label="Ore lavorate totali" type="number" value={pe.oreLav} onChange={(v) => u('oreLav', v)} hint="Da LUL annuale" />
        <TextInput label="Giorni assenteismo" type="number" value={pe.assentGg} onChange={(v) => u('assentGg', v)} />
      </div>
      {(parseFloat(pe.oreLav) > 0) && (
        <div className="grid grid-cols-2 gap-3">
          <ComputedValue label="Indice di Frequenza (IF)" value={p.IF} unit="infortuni/Mh · benchmark < 8" />
          <ComputedValue label="Tasso Assenteismo" value={p.tassoAss + '%'} variant="blue" />
        </div>
      )}
    </div>
  );
}

function StepPeRet({ data, onUpdate }) {
  const pe = data?.pe || {};
  const u = (f, v) => onUpdate('pe', f, v);
  const p = calcPersonnel(data);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <TextInput label="CCNL Applicato" value={pe.ccnl} onChange={(v) => u('ccnl', v)} placeholder="Es. Metalmeccanici CCNL" />
      <TextInput label="Retribuzione media Uomini (€/anno)" type="number" value={pe.retUom} onChange={(v) => u('retUom', v)} />
      <TextInput label="Retribuzione media Donne (€/anno)" type="number" value={pe.retDon} onChange={(v) => u('retDon', v)} />
      <TextInput label="Ore formazione/dipendente/anno" type="number" value={pe.oreForm} onChange={(v) => u('oreForm', v)} hint="Obiettivo VSME ≥ 18 h" />
      {(parseFloat(pe.retUom) > 0 && parseFloat(pe.retDon) > 0) && (
        <ComputedValue label="Gender Pay Gap" value={p.gpg + '%'} unit="obiettivo < 15%" variant={parseFloat(p.gpg) <= 15 ? 'blue' : ''} />
      )}
    </div>
  );
}

function StepGovCda({ data, onUpdate }) {
  const gov = data?.gov || {};
  const u = (f, v) => onUpdate('gov', f, v);
  const comp = parseFloat(gov.compCDA) || 0;
  const donne = parseFloat(gov.donneCDA) || 0;
  const pct = comp > 0 ? (donne / comp * 100).toFixed(1) : '—';
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput label="Componenti totali CDA" type="number" value={gov.compCDA} onChange={(v) => u('compCDA', v)} />
        <TextInput label="di cui Donne" type="number" value={gov.donneCDA} onChange={(v) => u('donneCDA', v)} />
      </div>
      {comp > 0 && (
        <ComputedValue label="% Donne nel CDA" value={pct + '%'} variant="blue" unit="obiettivo ≥ 33%" />
      )}
    </div>
  );
}

function StepGovComp({ data, onUpdate }) {
  const gov = data?.gov || {};
  const u = (f, v) => onUpdate('gov', f, v);
  const yn = [['no', 'No'], ['si', 'Sì']];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SelectField label="Codice Etico adottato" value={gov.codEtico} onChange={(v) => u('codEtico', v)} options={yn} />
      <SelectField label="MOG 231/2001" value={gov.mog231} onChange={(v) => u('mog231', v)} options={[['no','No'],['si','Sì — con ODV attivo']]} hint="D.Lgs. 231/2001" />
      <SelectField label="ISO 14001" value={gov.iso14001} onChange={(v) => u('iso14001', v)} options={yn} />
      <SelectField label="ISO 45001 (H&S)" value={gov.iso45001} onChange={(v) => u('iso45001', v)} options={yn} />
      <SelectField label="Policy Parità Genere" value={gov.pariGen} onChange={(v) => u('pariGen', v)} options={yn} hint="L.162/2021 / UNI PdR 125" />
      <SelectField label="Whistleblowing" value={gov.wb} onChange={(v) => u('wb', v)} options={[['no','No'],['si','Sì — D.Lgs. 24/2023']]} hint="Obbligatorio > 50 dip." />
      <SelectField label="Policy Anti-Corruzione" value={gov.policy} onChange={(v) => u('policy', v)} options={yn} />
      <SelectField label="Rating ESG esterno" value={gov.rESG} onChange={(v) => u('rESG', v)} options={yn} />
      <TextInput label="Altre certificazioni" value={gov.altreCert} onChange={(v) => u('altreCert', v)} placeholder="ISO 9001, EMAS..." />
    </div>
  );
}

function StepGovCorr({ data, onUpdate }) {
  const gov = data?.gov || {};
  const u = (f, v) => onUpdate('gov', f, v);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextInput label="Condanne corruzione (ultimi 3 anni)" type="number" value={gov.cond} onChange={(v) => u('cond', v)} hint="0 se nessuna" />
        <TextInput label="Sanzioni (€)" type="number" value={gov.san} onChange={(v) => u('san', v)} hint="0 se nessuna" />
        <TextInput label="Tempi medi pagamento fornitori (gg)" type="number" value={gov.tempiPag} onChange={(v) => u('tempiPag', v)} hint="Es. 60" />
      </div>
      <TextArea label="Note governance (opzionale)" value={gov.noteGov} onChange={(v) => u('noteGov', v)} rows={2} placeholder="Eventuali policy adottate, piani di miglioramento..." />
    </div>
  );
}

const STEP_COMPONENTS = {
  'en-elec': StepEnElec,
  'en-fuel': StepEnFuel,
  'ac':      StepAcqua,
  'ri':      StepRifiuti,
  'pe-org':  StepPeOrg,
  'pe-hs':   StepPeHs,
  'pe-ret':  StepPeRet,
  'gov-cda': StepGovCda,
  'gov-comp':StepGovComp,
  'gov-corr':StepGovCorr,
};

// ─── Main Wizard ──────────────────────────────────────────────────────────
export default function EsgWizard({ data, onUpdate, onClose }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const step = STEPS[stepIdx];
  const StepContent = STEP_COMPONENTS[step.id];
  const Icon = step.icon;
  const colors = AREA_COLORS[step.area];
  const isLast = stepIdx === STEPS.length - 1;

  const go = useCallback((delta) => {
    setDirection(delta);
    setStepIdx(i => Math.max(0, Math.min(STEPS.length - 1, i + delta)));
  }, []);

  // Group steps by area for the progress sidebar
  const areas = ['E', 'S', 'G'];
  const areaLabels = { E: 'Ambiente', S: 'Sociale', G: 'Governance' };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className={`${colors.bg} px-6 py-4 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest">{step.areaLabel} · Passo {stepIdx + 1} di {STEPS.length}</p>
              <p className="text-white font-heading font-bold text-lg leading-tight">{step.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted shrink-0">
          <motion.div
            className={`h-full ${colors.bg}`}
            animate={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar steps list */}
          <div className="w-52 shrink-0 border-r border-border bg-muted/30 py-4 px-3 overflow-y-auto hidden sm:block">
            {areas.map((area) => {
              const ac = AREA_COLORS[area];
              const areaSteps = STEPS.filter(s => s.area === area);
              return (
                <div key={area} className="mb-4">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${ac.text} mb-1.5 px-1`}>{areaLabels[area]}</p>
                  {areaSteps.map((s) => {
                    const idx = STEPS.findIndex(x => x.id === s.id);
                    const done = idx < stepIdx;
                    const active = idx === stepIdx;
                    return (
                      <button
                        key={s.id}
                        onClick={() => { setDirection(idx > stepIdx ? 1 : -1); setStepIdx(idx); }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs mb-0.5 flex items-center gap-2 transition-all
                          ${active ? `${ac.light} ${ac.border} border font-bold ${ac.text}` : 'hover:bg-muted text-muted-foreground'}`}
                      >
                        {done
                          ? <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${ac.text}`} />
                          : <span className={`w-3.5 h-3.5 shrink-0 rounded-full border-2 ${active ? ac.border.replace('border-', 'border-') : 'border-muted-foreground/30'}`} />
                        }
                        {s.title}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Step content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-sm text-muted-foreground mb-5">{step.desc}</p>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -24 }}
                  transition={{ duration: 0.2 }}
                >
                  {StepContent && <StepContent data={data} onUpdate={onUpdate} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer nav */}
            <div className="border-t border-border px-6 py-4 flex items-center justify-between shrink-0 bg-background">
              <Button variant="outline" onClick={() => go(-1)} disabled={stepIdx === 0} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Indietro
              </Button>
              <span className="text-xs text-muted-foreground">{stepIdx + 1} / {STEPS.length}</span>
              {isLast ? (
                <Button onClick={onClose} className="gap-2 bg-primary">
                  <CheckCircle2 className="w-4 h-4" /> Completa
                </Button>
              ) : (
                <Button onClick={() => go(1)} className={`gap-2 ${colors.bg} hover:opacity-90 text-white border-0`}>
                  Avanti <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}