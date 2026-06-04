import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { calcEnergy, calcWaste, calcWater, calcPersonnel, calcESGScore } from '@/lib/vsmeDefaults';
import { BarChart3, Radar as RadarIcon, BarChart2 } from 'lucide-react';

const COLORS = ['#059669', '#2563EB', '#D97706', '#7C3AED', '#DC2626'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 text-xs min-w-[150px]">
      <p className="font-bold text-muted-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function YearComparisonChart({ reports }) {
  const [mode, setMode] = useState('bar'); // 'bar' | 'radar'

  // Only use reports with actual ESG scores and data, sorted by year
  const validReports = useMemo(() =>
    [...reports]
      .filter(r => r.data && r.esg_score?.tot)
      .sort((a, b) => (a.year || 0) - (b.year || 0))
      .slice(-5), // max 5 anni
    [reports]
  );

  const barData = useMemo(() => {
    if (!validReports.length) return [];
    return validReports.map((r, i) => {
      const g  = calcEnergy(r.data);
      const w  = calcWaste(r.data);
      const wa = calcWater(r.data);
      const p  = calcPersonnel(r.data);
      const esg = r.esg_score;
      return {
        anno: String(r.year || `Report ${i + 1}`),
        'ESG Tot': esg.tot ?? 0,
        'Ambiente (E)': esg.E ?? 0,
        'Sociale (S)': esg.S ?? 0,
        'Governance (G)': esg.G ?? 0,
        'Emissioni tCO₂': Math.round(g.tot * 10) / 10,
        'Rifiuti (t)': Math.round(w.tot * 10) / 10,
        'Acqua (m³)': Math.round(wa.tot),
        '% Rinnovabile': Math.round(g.pRen * 10) / 10,
      };
    });
  }, [validReports]);

  const radarData = useMemo(() => {
    if (!validReports.length) return [];
    return [
      { metric: 'ESG Tot',  ...Object.fromEntries(validReports.map(r => [r.year, r.esg_score?.tot ?? 0])) },
      { metric: 'Ambiente', ...Object.fromEntries(validReports.map(r => [r.year, r.esg_score?.E ?? 0])) },
      { metric: 'Sociale',  ...Object.fromEntries(validReports.map(r => [r.year, r.esg_score?.S ?? 0])) },
      { metric: 'Governance',...Object.fromEntries(validReports.map(r => [r.year, r.esg_score?.G ?? 0])) },
      { metric: '% Rinnovabile', ...Object.fromEntries(validReports.map(r => {
        const g = calcEnergy(r.data); return [r.year, Math.round(g.pRen)];
      })) },
    ];
  }, [validReports]);

  // Delta table: compare first vs last year
  const delta = useMemo(() => {
    if (validReports.length < 2) return null;
    const first = validReports[0];
    const last  = validReports[validReports.length - 1];
    return [
      { label: 'ESG Score',      first: first.esg_score?.tot,  last: last.esg_score?.tot,  unit: 'pt', positive: true },
      { label: 'Ambiente (E)',   first: first.esg_score?.E,    last: last.esg_score?.E,    unit: 'pt', positive: true },
      { label: 'Sociale (S)',    first: first.esg_score?.S,    last: last.esg_score?.S,    unit: 'pt', positive: true },
      { label: 'Governance (G)', first: first.esg_score?.G,    last: last.esg_score?.G,    unit: 'pt', positive: true },
      { label: 'Emissioni GHG',  first: Math.round(calcEnergy(first.data).tot * 10) / 10,
                                  last:  Math.round(calcEnergy(last.data).tot  * 10) / 10, unit: 'tCO₂', positive: false },
      { label: '% Rinnovabile',  first: Math.round(calcEnergy(first.data).pRen * 10) / 10,
                                  last:  Math.round(calcEnergy(last.data).pRen  * 10) / 10, unit: '%', positive: true },
    ].map(row => ({
      ...row,
      diff: row.last != null && row.first != null ? +(row.last - row.first).toFixed(1) : null,
    }));
  }, [validReports]);

  if (validReports.length < 2) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-5 mb-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h4 className="font-heading text-sm font-bold text-primary">📊 Confronto Anni</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Evoluzione ESG su {validReports.length} anni ({validReports[0].year} → {validReports[validReports.length - 1].year})</p>
          </div>
          {/* Mode toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {[['bar', BarChart3, 'Barre'], ['radar', RadarIcon, 'Radar']].map(([v, Icon, label]) => (
              <button
                key={v}
                onClick={() => setMode(v)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all ${mode === v ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <AnimatePresence mode="wait">
          {mode === 'bar' ? (
            <motion.div key="bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="anno" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <YAxis domain={[0, 100]} fontSize={10} tick={{ fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="ESG Tot"      name="ESG Tot"       fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Ambiente (E)" name="Ambiente (E)"  fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Sociale (S)"  name="Sociale (S)"   fill={COLORS[2]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Governance (G)" name="Governance (G)" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <motion.div key="radar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={9} tick={{ fill: '#94a3b8' }} />
                  {validReports.map((r, i) => (
                    <Radar key={r.year} name={String(r.year)} dataKey={r.year} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delta summary table */}
        {delta && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-3">
              Variazione {validReports[0].year} → {validReports[validReports.length - 1].year}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {delta.map(row => {
                const improved = row.diff != null && (row.positive ? row.diff > 0 : row.diff < 0);
                const worsened = row.diff != null && (row.positive ? row.diff < 0 : row.diff > 0);
                return (
                  <div key={row.label} className={`rounded-xl p-3 border ${improved ? 'bg-green-50 border-green-200' : worsened ? 'bg-red-50 border-red-200' : 'bg-muted border-border'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{row.label}</p>
                    <div className="flex items-end gap-1.5 mt-1">
                      <span className="font-heading text-lg font-extrabold">
                        {row.last ?? '—'}
                      </span>
                      <span className="text-[10px] text-muted-foreground mb-0.5">{row.unit}</span>
                      {row.diff != null && (
                        <span className={`ml-auto text-xs font-bold ${improved ? 'text-green-600' : worsened ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {row.diff > 0 ? '+' : ''}{row.diff}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">da {row.first ?? '—'} {row.unit}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}