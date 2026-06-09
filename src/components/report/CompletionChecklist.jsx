import { motion } from 'framer-motion';
import { X, CheckCircle2, Circle, AlertCircle, ChevronRight, MinusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Definisce i campi obbligatori per ogni sezione, con label leggibili.
 */
const SECTION_CHECKS = [
  {
    id: 'ana',
    label: 'Anagrafica',
    icon: '🏢',
    fields: [
      { key: 'ragione', label: 'Ragione sociale' },
      { key: 'ateco', label: 'Codice ATECO' },
      { key: 'hc', label: 'Numero dipendenti (headcount)' },
      { key: 'fatturato', label: 'Fatturato (€)' },
      { key: 'anno', label: 'Anno di riferimento' },
    ],
    dataPath: 'ana',
  },
  {
    id: 'en',
    label: 'Energia & Combustibili',
    icon: '⚡',
    fields: [
      { key: 'elReteN', label: 'Elettricità da rete Anno N (kWh)' },
      { key: 'ispra', label: 'Fattore emissione ISPRA' },
    ],
    dataPath: 'en',
  },
  {
    id: 'ac',
    label: 'Acqua',
    icon: '💧',
    fields: [
      { key: '__fonti', label: 'Almeno una fonte idrica con prelievo' },
    ],
    dataPath: 'ac',
    customCheck: (data) => {
      const fonti = data?.acfonti?.fonti || [];
      const ok = fonti.some(f => parseFloat(f.prelievo) > 0);
      return [{ key: '__fonti', ok }];
    },
  },
  {
    id: 'ri',
    label: 'Rifiuti',
    icon: '♻️',
    fields: [
      { key: 'totN', label: 'Rifiuti totali Anno N (kg)' },
      { key: 'recN', label: 'Rifiuti a recupero Anno N (kg)' },
    ],
    dataPath: 'ri',
  },
  {
    id: 'inq',
    label: 'Inquinamento',
    icon: '💨',
    fields: [
      { key: 'regol', label: 'Assoggettabilità normativa dichiarata' },
    ],
    dataPath: 'inq',
    customCheck: (data) => {
      const v = data?.inq?.regol;
      return [{ key: 'regol', ok: v && v !== '' }];
    },
  },
  {
    id: 'biod',
    label: 'Biodiversità',
    icon: '🌿',
    fields: [
      { key: '__siti', label: 'Verifica prossimità aree protette completata' },
    ],
    dataPath: 'biod',
    customCheck: (data) => {
      const siti = data?.sedi?.lista || [];
      // È ok se ci sono siti oppure se c'è una nota sulla biodiversità
      const hasSiti = siti.length > 0;
      const hasNote = (data?.biod?.noteBiod || '').length > 10;
      return [{ key: '__siti', ok: hasSiti || hasNote }];
    },
  },
  {
    id: 'pe',
    label: 'Personale & H&S',
    icon: '👥',
    fields: [
      { key: 'hc', label: 'Headcount totale' },
      { key: 'donne', label: 'N. dipendenti donne' },
      { key: 'uomini', label: 'N. dipendenti uomini' },
      { key: 'infort', label: 'N. infortuni sul lavoro' },
      { key: 'oreLav', label: 'Ore lavorate totali (LUL)' },
      { key: 'oreForm', label: 'Ore medie formazione/dip.' },
    ],
    dataPath: 'pe',
  },
  {
    id: 'gov',
    label: 'Governance',
    icon: '⚖️',
    fields: [
      { key: 'compCDA', label: 'N. componenti CdA' },
      { key: 'donneCDA', label: 'N. donne nel CdA' },
      { key: 'codEtico', label: 'Codice etico (sì/no)' },
      { key: 'mog231', label: 'MOG 231 (sì/no)' },
    ],
    dataPath: 'gov',
    customCheck: (data) => {
      const gov = data?.gov || {};
      return [
        { key: 'compCDA', ok: !!gov.compCDA && gov.compCDA !== '' },
        { key: 'donneCDA', ok: gov.donneCDA !== undefined && gov.donneCDA !== '' },
        { key: 'codEtico', ok: gov.codEtico === 'si' || gov.codEtico === 'no' },
        { key: 'mog231', ok: gov.mog231 === 'si' || gov.mog231 === 'no' },
      ];
    },
  },
];

function getFieldStatus(data, section) {
  const secData = data?.[section.dataPath] || {};

  if (section.customCheck) {
    return section.customCheck(data);
  }

  return section.fields.map(f => ({
    key: f.key,
    ok: secData[f.key] !== undefined &&
        secData[f.key] !== '' &&
        secData[f.key] !== null,
  }));
}

const COMP_SECTIONS = [
  { id: 'c1', label: 'C1 — Strategia', icon: '🎯' },
  { id: 'c2', label: 'C2 — Pratiche (det.)', icon: '📝' },
  { id: 'c3', label: 'C3 — Target GHG', icon: '🌍' },
  { id: 'c4', label: 'C4 — Rischi Climatici', icon: '🌊' },
  { id: 'c5', label: 'C5 — Workforce+', icon: '📊' },
  { id: 'c6', label: 'C6 — Diritti Umani', icon: '🤝' },
  { id: 'c7', label: 'C7 — Incidenti DU', icon: '⚠️' },
  { id: 'c8', label: 'C8 — Ricavi Settori', icon: '💼' },
  { id: 'c9', label: 'C9 — Diversità CDA', icon: '🏛️' },
];

function CompSectionRow({ section, sectionStatus, onNavigate, onClose }) {
  const status = sectionStatus?.[section.id];
  const isComplete = status === 'completato';
  const isNA = status === 'non_applica';
  const isDone = isComplete || isNA;

  return (
    <div className={`rounded-xl border p-4 ${isDone ? 'border-green-200 bg-green-50/50' : 'border-border bg-card'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{section.icon}</span>
          <span className="font-heading font-bold text-sm">{section.label}</span>
          {isComplete && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Completato</span>}
          {isNA && <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1"><MinusCircle className="w-2.5 h-2.5" /> Non applica</span>}
          {!isDone && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Da definire</span>}
        </div>
        {!isDone && (
          <button
            onClick={() => { onNavigate(section.id); onClose(); }}
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
          >
            Vai alla sezione <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      {!isDone && (
        <p className="text-[11px] text-muted-foreground mt-2">
          Imposta lo stato nella sidebar: <strong>Completato</strong> oppure <strong>Non applica</strong>.
        </p>
      )}
    </div>
  );
}

function SectionRow({ section, data, onNavigate, onClose }) {
  const statuses = getFieldStatus(data, section);
  const total = statuses.length;
  const done = statuses.filter(s => s.ok).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isComplete = done === total;

  const fieldMap = Object.fromEntries(section.fields.map(f => [f.key, f.label]));

  return (
    <div className={`rounded-xl border p-4 ${isComplete ? 'border-green-200 bg-green-50/50' : 'border-border bg-card'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{section.icon}</span>
          <span className="font-heading font-bold text-sm">{section.label}</span>
          {isComplete
            ? <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Completo</span>
            : <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{done}/{total} campi</span>
          }
        </div>
        {!isComplete && (
          <button
            onClick={() => { onNavigate(section.id); onClose(); }}
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
          >
            Vai alla sezione <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-amber-400'}`}
        />
      </div>

      {/* Field list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {statuses.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {s.ok
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              : <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
            }
            <span className={`text-[11px] leading-tight ${s.ok ? 'text-muted-foreground line-through' : 'text-foreground/80'}`}>
              {fieldMap[s.key] || s.key}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompletionChecklist({ data, onNavigate, onClose }) {
  const isComprehensive = data?.ana?.modulo === 'comprehensive';
  const sectionStatus = data?.sectionStatus || {};

  // Calcola totale globale (sezioni base)
  const allStatuses = SECTION_CHECKS.flatMap(sec => getFieldStatus(data, sec));
  const totalFields = allStatuses.length;
  const doneFields = allStatuses.filter(s => s.ok).length;

  // Aggiunge sezioni C1-C9 se modulo comprehensive
  const compTotal = isComprehensive ? COMP_SECTIONS.length : 0;
  const compDone = isComprehensive ? COMP_SECTIONS.filter(s => sectionStatus[s.id] === 'completato' || sectionStatus[s.id] === 'non_applica').length : 0;

  const grandTotal = totalFields + compTotal;
  const grandDone = doneFields + compDone;
  const globalPct = grandTotal > 0 ? Math.round((grandDone / grandTotal) * 100) : 0;
  const missing = grandTotal - grandDone;

  const sectionsComplete = SECTION_CHECKS.filter(sec => {
    const statuses = getFieldStatus(data, sec);
    return statuses.every(s => s.ok);
  }).length + compDone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-heading font-extrabold text-lg">📋 Checklist completamento</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {missing === 0
                ? '✅ Report completo! Tutti i campi obbligatori sono stati compilati.'
                : `${missing} campo${missing > 1 ? 'i' : ''} mancante${missing > 1 ? 'i' : ''} su ${totalFields} richiesti`}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global progress */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Completamento globale</span>
            <span className="font-heading font-extrabold text-2xl text-primary">{globalPct}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${globalPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${globalPct === 100 ? 'bg-green-500' : globalPct >= 60 ? 'bg-primary' : 'bg-amber-400'}`}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[11px] text-muted-foreground">{sectionsComplete}/{SECTION_CHECKS.length + compTotal} sezioni complete</span>
            <span className="text-[11px] text-muted-foreground">{grandDone}/{grandTotal} campi compilati</span>
          </div>
        </div>

        {/* Avviso se mancano pochi campi */}
        {missing > 0 && missing <= 5 && (
          <div className="mx-6 mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <strong>Quasi finito!</strong> Mancano solo {missing} campo{missing > 1 ? 'i' : ''} per completare il report al 100%.
            </p>
          </div>
        )}

        {/* Sections list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {SECTION_CHECKS.map(sec => (
            <SectionRow
              key={sec.id}
              section={sec}
              data={data}
              onNavigate={onNavigate}
              onClose={onClose}
            />
          ))}

          {isComprehensive && (
            <>
              <div className="pt-2 pb-1">
                <p className="text-[10px] font-extrabold tracking-widest uppercase text-muted-foreground/50">Modulo Completo (C1–C9)</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Ogni sezione deve essere marcata come <strong>Completato</strong> o <strong>Non applica</strong> nella sidebar.
                </p>
              </div>
              {COMP_SECTIONS.map(sec => (
                <CompSectionRow
                  key={sec.id}
                  section={sec}
                  sectionStatus={sectionStatus}
                  onNavigate={onNavigate}
                  onClose={onClose}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button onClick={onClose} variant="outline" size="sm">Chiudi</Button>
        </div>
      </motion.div>
    </div>
  );
}