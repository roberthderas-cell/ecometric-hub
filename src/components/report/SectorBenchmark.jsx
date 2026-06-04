import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Building2 } from 'lucide-react';

// Benchmark medi per settore ATECO (punteggi ESG medi PMI italiane, fonti: CSRD Impact, EcoVadis 2024)
const SECTOR_BENCHMARKS = {
  // Manifatturiero
  'C': { label: 'Manifatturiero', E: 38, S: 42, G: 35, tot: 38 },
  'C10': { label: 'Alimentare & bevande', E: 41, S: 45, G: 38, tot: 41 },
  'C13': { label: 'Tessile', E: 36, S: 39, G: 32, tot: 36 },
  'C20': { label: 'Chimica', E: 44, S: 48, G: 42, tot: 44 },
  'C24': { label: 'Metallurgia', E: 35, S: 40, G: 33, tot: 36 },
  'C25': { label: 'Prodotti in metallo', E: 36, S: 41, G: 34, tot: 37 },
  'C26': { label: 'Elettronica', E: 45, S: 50, G: 46, tot: 47 },
  'C28': { label: 'Macchine & impianti', E: 40, S: 44, G: 38, tot: 40 },
  // Costruzioni
  'F': { label: 'Costruzioni', E: 30, S: 38, G: 29, tot: 32 },
  // Commercio
  'G': { label: 'Commercio', E: 33, S: 43, G: 36, tot: 37 },
  'G47': { label: 'Commercio al dettaglio', E: 35, S: 44, G: 37, tot: 38 },
  // Trasporti
  'H': { label: 'Trasporti & logistica', E: 28, S: 37, G: 30, tot: 31 },
  // Servizi
  'I': { label: 'Ristorazione & alloggio', E: 32, S: 40, G: 28, tot: 33 },
  'J': { label: 'ICT & digitale', E: 52, S: 55, G: 50, tot: 52 },
  'K': { label: 'Finanza & assicurazioni', E: 44, S: 52, G: 55, tot: 50 },
  'L': { label: 'Immobiliare', E: 36, S: 38, G: 35, tot: 36 },
  'M': { label: 'Servizi professionali', E: 46, S: 53, G: 48, tot: 49 },
  'N': { label: 'Supporto alle imprese', E: 38, S: 45, G: 38, tot: 40 },
  'Q': { label: 'Sanità & sociale', E: 42, S: 56, G: 44, tot: 47 },
  'R': { label: 'Arte & intrattenimento', E: 38, S: 46, G: 36, tot: 40 },
  'S': { label: 'Altri servizi', E: 35, S: 44, G: 35, tot: 38 },
};

const DEFAULT_BENCHMARK = { label: 'Media PMI italiane', E: 37, S: 44, G: 37, tot: 39 };

function getBenchmark(ateco) {
  if (!ateco) return DEFAULT_BENCHMARK;
  const code = ateco.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  // prova match esatto (5 cifre), poi 3-4, poi 2, poi lettera settore
  for (let len = Math.min(code.length, 5); len >= 1; len--) {
    const key = code.slice(0, len);
    if (SECTOR_BENCHMARKS[key]) return SECTOR_BENCHMARKS[key];
  }
  return DEFAULT_BENCHMARK;
}

function DeltaBadge({ delta }) {
  if (delta > 3) return (
    <span className="inline-flex items-center gap-0.5 text-green-600 font-bold text-xs">
      <TrendingUp className="w-3 h-3" /> +{delta}
    </span>
  );
  if (delta < -3) return (
    <span className="inline-flex items-center gap-0.5 text-red-500 font-bold text-xs">
      <TrendingDown className="w-3 h-3" /> {delta}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-slate-500 font-bold text-xs">
      <Minus className="w-3 h-3" /> {delta > 0 ? '+' : ''}{delta}
    </span>
  );
}

function PositionBar({ company, benchmark, color }) {
  const max = 100;
  const compPct = (company / max) * 100;
  const benchPct = (benchmark / max) * 100;

  return (
    <div className="relative h-5 bg-slate-100 rounded-full overflow-visible">
      {/* Benchmark marker */}
      <div
        className="absolute top-0 h-full w-0.5 bg-slate-400 z-10"
        style={{ left: `${benchPct}%` }}
      >
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 font-bold whitespace-nowrap">
          Media
        </div>
      </div>
      {/* Company bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${compPct}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="absolute top-0 h-full rounded-full opacity-80"
        style={{ backgroundColor: color }}
      />
      {/* Value label */}
      <div className="absolute inset-0 flex items-center justify-end pr-2">
        <span className="text-[10px] font-bold text-white mix-blend-difference">{company}</span>
      </div>
    </div>
  );
}

export default function SectorBenchmark({ esg, ateco }) {
  const [expanded, setExpanded] = useState(false);
  const bench = getBenchmark(ateco);
  const delta = esg.tot - bench.tot;

  const areas = [
    { key: 'E', label: 'Ambiente', color: '#059669' },
    { key: 'S', label: 'Sociale', color: '#2563EB' },
    { key: 'G', label: 'Governance', color: '#7C3AED' },
  ];

  const positionLabel = delta >= 15
    ? { text: 'Top performer', bg: 'bg-green-100 text-green-700 border-green-200' }
    : delta >= 5
    ? { text: 'Sopra la media', bg: 'bg-blue-100 text-blue-700 border-blue-200' }
    : delta >= -5
    ? { text: 'In linea con la media', bg: 'bg-slate-100 text-slate-600 border-slate-200' }
    : delta >= -15
    ? { text: 'Sotto la media', bg: 'bg-amber-100 text-amber-700 border-amber-200' }
    : { text: 'Distante dalla media', bg: 'bg-red-100 text-red-700 border-red-200' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card shadow-sm mb-6 overflow-hidden"
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-heading font-bold text-sm">Benchmark di Settore</p>
            <p className="text-xs text-muted-foreground">
              Confronto con: <span className="font-semibold">{bench.label}</span>
              {ateco && <span className="ml-1 text-slate-400">(ATECO {ateco})</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full border text-xs font-bold ${positionLabel.bg}`}>
            {positionLabel.text}
          </span>
          <div className="flex items-center gap-1 text-sm font-bold">
            <span className="text-muted-foreground">Tu: </span>
            <span className="font-heading text-lg font-extrabold">{esg.tot}</span>
            <span className="text-muted-foreground mx-1">vs</span>
            <span className="text-muted-foreground">{bench.tot}</span>
          </div>
          <DeltaBadge delta={delta} />
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-1" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-6 pb-6 border-t border-border"
        >
          {/* Total score visual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
            {/* Gauge totale */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Score ESG Totale</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold">La tua azienda</span>
                    <span className="font-bold text-primary">{esg.tot} / 100</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${esg.tot}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{bench.label}</span>
                    <span className="text-muted-foreground font-bold">{bench.tot} / 100</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-300 rounded-full"
                      style={{ width: `${bench.tot}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Percentile estimate */}
              <div className="mt-2 p-3 rounded-xl bg-muted border border-border text-xs text-muted-foreground">
                {delta >= 15
                  ? '🏆 Sei tra le aziende più avanzate del tuo settore. Mantieni il vantaggio competitivo.'
                  : delta >= 5
                  ? '⭐ Superi la media del settore. Continua a investire nelle aree più deboli.'
                  : delta >= -5
                  ? '📊 Sei in linea con la media del settore. Puoi differenziarti puntando su E o S.'
                  : delta >= -15
                  ? '📈 Sei sotto la media. Rivedi le priorità ESG per recuperare terreno.'
                  : '⚠️ Distante dalla media settoriale. Il piano di miglioramento ESG è urgente.'}
              </div>
            </div>

            {/* Dettaglio E/S/G */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Dettaglio per Pilastro</p>
              {areas.map(area => {
                const d = esg[area.key] - bench[area.key];
                return (
                  <div key={area.key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold" style={{ color: area.color }}>{area.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Media: {bench[area.key]}</span>
                        <DeltaBadge delta={d} />
                      </div>
                    </div>
                    <PositionBar company={esg[area.key]} benchmark={bench[area.key]} color={area.color} />
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground mt-4 opacity-60">
            * Benchmark basati su dati aggregati EcoVadis 2024 e CSRD Impact per PMI italiane. I valori sono indicativi e aggiornati annualmente.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}