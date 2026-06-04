import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { calcEnergy, calcWaste, calcWater, calcPersonnel } from '@/lib/vsmeDefaults';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const COLORS = ['#059669', '#2563EB', '#D97706', '#7C3AED', '#DC2626'];

const ratingConfig = {
  Leader:        { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  Avanzato:      { color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  Buono:         { color: 'text-cyan-700',     bg: 'bg-cyan-50 border-cyan-200' },
  'In crescita': { color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  Base:          { color: 'text-slate-600',   bg: 'bg-slate-50 border-slate-200' },
};

function Delta({ value, positive = true, unit = '' }) {
  if (value == null || value === 0) return <span className="text-muted-foreground text-xs flex items-center gap-0.5"><Minus className="w-3 h-3" /> —</span>;
  const good = positive ? value > 0 : value < 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-bold ${good ? 'text-green-600' : 'text-red-500'}`}>
      {good ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {value > 0 ? '+' : ''}{value}{unit}
    </span>
  );
}

function KpiRow({ label, years, positive = true, unit = '', decimals = 1 }) {
  const vals = years.map(y => y.value);
  const first = vals[0];
  return (
    <div className="flex items-center border-b border-border/60 py-2 last:border-0 gap-3">
      <p className="text-xs text-muted-foreground w-32 shrink-0">{label}</p>
      {years.map((y, i) => {
        const diff = i > 0 && first != null && y.value != null ? +(y.value - first).toFixed(decimals) : null;
        return (
          <div key={y.year} className="flex-1 text-center">
            <p className="font-heading font-bold text-sm">{y.value != null ? `${y.value}` : '—'}<span className="text-[10px] text-muted-foreground font-normal ml-0.5">{unit}</span></p>
            {i > 0 && <Delta value={diff} positive={positive} unit={unit} />}
          </div>
        );
      })}
    </div>
  );
}

export default function YearProgressReport({ reports }) {
  const validReports = useMemo(() =>
    [...reports]
      .filter(r => r.data && r.esg_score?.tot)
      .sort((a, b) => (a.year || 0) - (b.year || 0))
      .slice(-5),
    [reports]
  );

  const enriched = useMemo(() => validReports.map(r => {
    const d = r.data || {};
    const g = calcEnergy(d);
    const w = calcWaste(d);
    const wa = calcWater(d);
    const p = calcPersonnel(d);
    return {
      year: r.year,
      name: r.name,
      esg: r.esg_score,
      g, w, wa, p,
      rating: r.esg_score?.rating,
    };
  }), [validReports]);

  const lineData = useMemo(() =>
    enriched.map(e => ({
      anno: String(e.year),
      'ESG Tot': e.esg.tot,
      'Ambiente (E)': e.esg.E,
      'Sociale (S)': e.esg.S,
      'Governance (G)': e.esg.G,
    })),
    [enriched]
  );

  const emissionsData = useMemo(() =>
    enriched.map(e => ({
      anno: String(e.year),
      'Emissioni tCO₂': Math.round(e.g.tot * 10) / 10,
      '% Rinnovabile': Math.round(e.g.pRen * 10) / 10,
    })),
    [enriched]
  );

  if (validReports.length < 2) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p className="text-sm font-medium">Servono almeno 2 report con score ESG per il confronto pluriennale.</p>
        <p className="text-xs mt-1">Crea report per anni diversi e compilali per abilitare questa vista.</p>
      </Card>
    );
  }

  const kpiYears = enriched.map(e => ({ year: e.year }));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* ── INTRO BANNER ── */}
      <div className="bg-gradient-to-r from-forest-900 to-forest-700 rounded-2xl px-6 py-5 text-white">
        <p className="text-[10px] uppercase tracking-widest text-green-400/80 font-bold mb-1">Vista Pluriennale</p>
        <h2 className="font-heading text-xl font-extrabold mb-1">Progressione ESG {enriched[0].year} → {enriched[enriched.length - 1].year}</h2>
        <p className="text-white/50 text-xs max-w-xl">Analisi comparativa delle performance di sostenibilità su {enriched.length} anni. Documento idoneo per la valutazione del merito creditizio ESG da parte degli istituti bancari (EBA/GL/2020/06).</p>
      </div>

      {/* ── COLUMN COMPARISON ── */}
      <Card className="p-5 overflow-x-auto">
        <h3 className="font-heading font-bold text-sm mb-4">📋 Scheda Comparativa Anno per Anno</h3>
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr>
              <th className="text-left text-xs text-muted-foreground font-bold uppercase tracking-wide w-36 pb-3">Indicatore</th>
              {enriched.map((e, i) => (
                <th key={e.year} className="text-center pb-3">
                  <div className={`inline-flex flex-col items-center px-3 py-1.5 rounded-xl border ${i === enriched.length - 1 ? 'bg-primary/8 border-primary/20' : 'bg-muted border-transparent'}`}>
                    <span className="font-heading font-extrabold text-base text-foreground">{e.year}</span>
                    {i === enriched.length - 1 && <span className="text-[9px] text-primary font-bold uppercase tracking-widest">Ultimo</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* ESG Score section */}
            <tr><td colSpan={enriched.length + 1} className="pt-2 pb-1"><p className="text-[10px] font-bold uppercase tracking-widest text-primary">Score ESG</p></td></tr>
            {[
              { label: 'ESG Totale', key: 'tot',  src: 'esg', positive: true, unit: 'pt' },
              { label: 'Ambiente (E)', key: 'E',  src: 'esg', positive: true, unit: 'pt' },
              { label: 'Sociale (S)',  key: 'S',  src: 'esg', positive: true, unit: 'pt' },
              { label: 'Governance (G)', key: 'G', src: 'esg', positive: true, unit: 'pt' },
            ].map(row => (
              <KpiRow
                key={row.label}
                label={row.label}
                unit={row.unit}
                positive={row.positive}
                years={enriched.map(e => ({ year: e.year, value: e[row.src]?.[row.key] ?? null }))}
              />
            ))}

            {/* Rating */}
            <tr className="border-b border-border/60">
              <td className="text-xs text-muted-foreground py-2 w-32">Rating</td>
              {enriched.map(e => {
                const cfg = ratingConfig[e.rating] || ratingConfig.Base;
                return (
                  <td key={e.year} className="text-center py-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{e.rating || '—'}</span>
                  </td>
                );
              })}
            </tr>

            {/* Ambiente section */}
            <tr><td colSpan={enriched.length + 1} className="pt-4 pb-1"><p className="text-[10px] font-bold uppercase tracking-widest text-green-700">Ambiente</p></td></tr>
            {[
              { label: 'Emissioni GHG', getter: e => Math.round(e.g.tot * 10) / 10, positive: false, unit: 'tCO₂' },
              { label: '% Rinnovabile', getter: e => Math.round(e.g.pRen * 10) / 10, positive: true,  unit: '%' },
              { label: 'Rifiuti tot.',  getter: e => Math.round(e.w.tot * 10) / 10,  positive: false, unit: 't' },
              { label: '% Riciclo',     getter: e => Math.round(e.w.pRec * 10) / 10, positive: true,  unit: '%' },
              { label: 'Acqua tot.',    getter: e => Math.round(e.wa.tot),            positive: false, unit: 'm³' },
            ].map(row => (
              <KpiRow
                key={row.label}
                label={row.label}
                unit={row.unit}
                positive={row.positive}
                years={enriched.map(e => ({ year: e.year, value: row.getter(e) }))}
              />
            ))}

            {/* Persone section */}
            <tr><td colSpan={enriched.length + 1} className="pt-4 pb-1"><p className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Persone</p></td></tr>
            {[
              { label: 'Dipendenti tot.', getter: e => e.p.tot,          positive: true,  unit: '' },
              { label: '% Donne',         getter: e => Math.round(e.p.pWomen * 10) / 10,  positive: true, unit: '%' },
              { label: 'Infortuni',        getter: e => e.p.injuries,    positive: false, unit: '' },
              { label: 'Turnover %',       getter: e => Math.round(e.p.turnover * 10) / 10, positive: false, unit: '%' },
            ].map(row => (
              <KpiRow
                key={row.label}
                label={row.label}
                unit={row.unit}
                positive={row.positive}
                years={enriched.map(e => ({ year: e.year, value: row.getter(e) }))}
              />
            ))}
          </tbody>
        </table>
      </Card>

      {/* ── ESG TREND CHART ── */}
      <Card className="p-5">
        <h3 className="font-heading font-bold text-sm mb-4">📈 Trend Score ESG</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={lineData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="anno" fontSize={11} tick={{ fill: '#94a3b8' }} />
            <YAxis domain={[0, 100]} fontSize={10} tick={{ fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 11 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {['ESG Tot', 'Ambiente (E)', 'Sociale (S)', 'Governance (G)'].map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i]} strokeWidth={2.5} dot={{ r: 5, fill: COLORS[i] }} activeDot={{ r: 7 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── EMISSIONS CHART ── */}
      <Card className="p-5">
        <h3 className="font-heading font-bold text-sm mb-4">🌿 Emissioni GHG & Energia Rinnovabile</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={emissionsData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="anno" fontSize={11} tick={{ fill: '#94a3b8' }} />
            <YAxis fontSize={10} tick={{ fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 11 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Emissioni tCO₂" fill="#DC2626" radius={[4, 4, 0, 0]} />
            <Bar dataKey="% Rinnovabile"  fill="#059669" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── DISCLAIMER ── */}
      <p className="text-[10px] text-muted-foreground text-center pb-2">
        Dati elaborati secondo lo standard VSME — EFRAG 2024. I valori delta (▲▼) indicano la variazione rispetto all'anno più vecchio disponibile.
      </p>
    </motion.div>
  );
}