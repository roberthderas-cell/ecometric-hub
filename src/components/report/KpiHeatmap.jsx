/**
 * KpiHeatmap — griglia Anno × KPI con colori graduati verde/rosso
 * Verde = miglioramento rispetto all'anno precedente
 * Rosso = peggioramento
 * Grigio = nessun dato
 */

const INVERT = new Set(['co2_scope1', 'co2_scope2', 'rifiuti_kg', 'acqua_mc', 'infortuni']);
// Per questi KPI "meno è meglio" → inversione colori

function cellColor(pct, inverted) {
  if (pct === null) return { bg: '#F1F5F9', text: '#94A3B8' };
  const positive = inverted ? pct < 0 : pct > 0;
  const neutral = Math.abs(pct) < 1;
  if (neutral) return { bg: '#F8FAFC', text: '#64748B' };
  const intensity = Math.min(Math.abs(pct) / 30, 1); // satura a 30%
  if (positive) {
    const g = Math.round(134 + (1 - intensity) * 80);
    return { bg: `rgba(22,163,74,${0.12 + intensity * 0.35})`, text: '#15803D' };
  } else {
    return { bg: `rgba(220,38,38,${0.12 + intensity * 0.35})`, text: '#B91C1C' };
  }
}

export default function KpiHeatmap({ chartData, activeMetrics }) {
  if (!chartData || chartData.length < 2 || activeMetrics.length === 0) return null;

  const years = chartData.map(d => d.year);

  // Calcola variazione % rispetto all'anno precedente per ogni metrica/anno
  const delta = {};
  chartData.forEach((row, i) => {
    delta[row.year] = {};
    if (i === 0) return;
    const prev = chartData[i - 1];
    activeMetrics.forEach(m => {
      const cur = row[m.key];
      const old = prev[m.key];
      if (cur == null || old == null || old === 0) {
        delta[row.year][m.key] = null;
      } else {
        delta[row.year][m.key] = ((cur - old) / Math.abs(old)) * 100;
      }
    });
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left font-heading font-bold text-sm p-3 bg-muted/50 sticky left-0 z-10 min-w-[160px] border-b border-r border-border">
              KPI
            </th>
            {years.slice(1).map(y => (
              <th key={y} className="text-center font-heading font-bold p-3 bg-muted/50 border-b border-border min-w-[90px]">
                {y}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeMetrics.map((m, mi) => (
            <tr key={m.key} className={mi % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
              <td className="sticky left-0 z-10 p-3 font-medium border-r border-border bg-inherit">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="truncate max-w-[130px]" title={m.label}>{m.label}</span>
                </div>
              </td>
              {years.slice(1).map(y => {
                const pct = delta[y]?.[m.key] ?? null;
                const inv = INVERT.has(m.key);
                const { bg, text } = cellColor(pct, inv);
                const latestVal = chartData.find(d => d.year === y)?.[m.key];
                return (
                  <td
                    key={y}
                    className="text-center p-2 border-border"
                    style={{ backgroundColor: bg }}
                    title={pct !== null ? `Δ ${pct > 0 ? '+' : ''}${pct.toFixed(1)}%` : 'Nessun dato'}
                  >
                    {pct !== null ? (
                      <div>
                        <div className="font-bold" style={{ color: text }}>
                          {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
                        </div>
                        {latestVal != null && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {latestVal.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
                            {m.unit ? ` ${m.unit}` : ''}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-4 mt-3 px-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded" style={{ backgroundColor: 'rgba(22,163,74,0.35)' }} />
          <span>Miglioramento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded" style={{ backgroundColor: 'rgba(220,38,38,0.35)' }} />
          <span>Peggioramento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded" style={{ backgroundColor: '#F1F5F9' }} />
          <span>Nessun dato</span>
        </div>
        <span className="ml-2 italic">Per CO₂, rifiuti, acqua, infortuni: meno è meglio (verde)</span>
      </div>
    </div>
  );
}