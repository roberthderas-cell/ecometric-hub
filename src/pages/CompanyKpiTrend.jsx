import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';
import KpiHeatmap from '@/components/report/KpiHeatmap';

const ESG_METRICS = [
  { key: 'tot', label: 'Score Totale ESG', color: '#059669', group: 'ESG' },
  { key: 'E', label: 'Ambiente (E)', color: '#16A34A', group: 'ESG' },
  { key: 'S', label: 'Sociale (S)', color: '#2563EB', group: 'ESG' },
  { key: 'G', label: 'Governance (G)', color: '#A855F7', group: 'ESG' },
];

const KPI_METRICS = [
  { key: 'energia_kwh', label: 'Energia (kWh)', color: '#F59E0B', path: r => r.data?.B3?.energia_totale_kwh, unit: 'kWh', group: 'Ambiente' },
  { key: 'co2_scope1', label: 'CO₂ Scope 1 (tCO₂)', color: '#EF4444', path: r => r.data?.B3?.co2_scope1, unit: 'tCO₂', group: 'Ambiente' },
  { key: 'co2_scope2', label: 'CO₂ Scope 2 (tCO₂)', color: '#F97316', path: r => r.data?.B3?.co2_scope2, unit: 'tCO₂', group: 'Ambiente' },
  { key: 'rinnovabile_pct', label: '% Rinnovabile', color: '#10B981', path: r => r.data?.B3?.rinnovabile_pct, unit: '%', group: 'Ambiente' },
  { key: 'rifiuti_kg', label: 'Rifiuti (kg)', color: '#78716C', path: r => r.data?.B7?.rifiuti_totali_kg, unit: 'kg', group: 'Ambiente' },
  { key: 'acqua_mc', label: 'Acqua (m³)', color: '#0EA5E9', path: r => r.data?.B6?.consumo_idrico_mc, unit: 'm³', group: 'Ambiente' },
  { key: 'dipendenti', label: 'Dipendenti', color: '#6366F1', path: r => r.data?.B8?.dipendenti_totali, unit: '', group: 'Sociale' },
  { key: 'donne_pct', label: '% Donne', color: '#EC4899', path: r => r.data?.B8?.dipendenti_donne_pct, unit: '%', group: 'Sociale' },
  { key: 'formazione_h', label: 'Formazione (h/dip)', color: '#8B5CF6', path: r => r.data?.B10?.ore_formazione_media, unit: 'h', group: 'Sociale' },
  { key: 'infortuni', label: 'Infortuni', color: '#DC2626', path: r => r.data?.B9?.infortuni_numero, unit: '', group: 'Sociale' },
];

const ALL_METRICS = [...ESG_METRICS.map(m => ({ ...m, isEsg: true })), ...KPI_METRICS.map(m => ({ ...m, isEsg: false }))];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-3 text-sm">
      <p className="font-heading font-bold mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold">{typeof p.value === 'number' ? p.value.toLocaleString('it-IT', { maximumFractionDigits: 1 }) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

function TrendBadge({ values }) {
  if (values.length < 2) return null;
  const first = values[0];
  const last = values[values.length - 1];
  if (first === 0) return null;
  const pct = ((last - first) / first) * 100;
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
  const style = pct > 0
    ? 'bg-green-100 text-green-700'
    : pct < 0
    ? 'bg-red-100 text-red-700'
    : 'bg-muted text-muted-foreground';
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${style}`}>
      <Icon className="w-3 h-3" />
      {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
    </div>
  );
}

export default function CompanyKpiTrend() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: () => base44.entities.Report.filter({}),
    enabled: !!user,
  });

  const companies = useMemo(() => {
    if (!reports) return [];
    return [...new Set(reports.map(r => r.data?.ana?.ragione).filter(Boolean))];
  }, [reports]);

  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState(['tot', 'E', 'S', 'G']);

  // Imposta la prima azienda di default
  const company = selectedCompany || companies[0] || '';

  const companyReports = useMemo(() => {
    if (!reports || !company) return [];
    return reports
      .filter(r => r.data?.ana?.ragione === company)
      .sort((a, b) => a.year - b.year);
  }, [reports, company]);

  // Codice ATECO dell'azienda selezionata
  const companyAteco = companyReports[0]?.data?.ana?.ateco || null;

  // Report dello stesso settore (esclusa l'azienda stessa) per benchmark
  const sectorReports = useMemo(() => {
    if (!reports || !companyAteco) return [];
    return reports.filter(r =>
      r.data?.ana?.ateco === companyAteco &&
      r.data?.ana?.ragione !== company
    );
  }, [reports, companyAteco, company]);

  // Calcola media benchmark per anno e metrica
  const benchmarkByYear = useMemo(() => {
    const byYear = {};
    sectorReports.forEach(r => {
      const y = `${r.year}`;
      if (!byYear[y]) byYear[y] = { count: 0 };
      byYear[y].count++;
      ESG_METRICS.forEach(m => {
        const v = r.esg_score?.[m.key];
        if (v != null) byYear[y][`bm_${m.key}`] = ((byYear[y][`bm_${m.key}`] || 0) + v);
      });
      KPI_METRICS.forEach(m => {
        const v = m.path(r);
        if (v != null) byYear[y][`bm_${m.key}`] = ((byYear[y][`bm_${m.key}`] || 0) + v);
      });
    });
    // Calcola medie
    Object.keys(byYear).forEach(y => {
      const count = byYear[y].count;
      Object.keys(byYear[y]).forEach(k => {
        if (k !== 'count') byYear[y][k] = Math.round((byYear[y][k] / count) * 10) / 10;
      });
    });
    return byYear;
  }, [sectorReports]);

  const hasBenchmark = sectorReports.length > 0;

  // Costruisci i dati per il grafico
  const chartData = useMemo(() => {
    return companyReports.map(r => {
      const row = { year: `${r.year}` };
      ESG_METRICS.forEach(m => { row[m.key] = r.esg_score?.[m.key] || 0; });
      KPI_METRICS.forEach(m => { const val = m.path(r); row[m.key] = val != null ? val : null; });
      // targets
      const targets = r.data?.obiettivi?.[r.year + 1] || {};
      row._targets = targets;
      // benchmark
      const bm = benchmarkByYear[`${r.year}`] || {};
      Object.keys(bm).forEach(k => { if (k !== 'count') row[k] = bm[k]; });
      return row;
    });
  }, [companyReports, benchmarkByYear]);

  // Raggruppa metriche selezionate per group
  const activeMetrics = ALL_METRICS.filter(m => selectedMetrics.includes(m.key));

  // Dividi in gruppi per chart separati
  const groups = [...new Set(activeMetrics.map(m => m.group))];

  const toggleMetric = (key) => {
    setSelectedMetrics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/confronto-anni">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Analisi KPI Pluriennale</h1>
            <p className="text-sm text-muted-foreground">Evoluzione dei KPI di sostenibilità nel tempo per singola azienda</p>
          </div>
        </div>

        {/* Selezione azienda */}
        <Card className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-bold">Azienda:</span>
          </div>
          <Select value={company} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleziona azienda" />
            </SelectTrigger>
            <SelectContent>
              {companies.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {companyReports.length > 0 && (
            <span className="text-xs text-muted-foreground ml-2">
              {companyReports.length} report disponibili ({companyReports.map(r => r.year).join(', ')})
            </span>
          )}
          {companyAteco && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ml-auto ${
              hasBenchmark ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'
            }`}>
              <span>ATECO {companyAteco}</span>
              {hasBenchmark
                ? <span>· benchmark su {sectorReports.length} aziend{sectorReports.length === 1 ? 'a' : 'e'} del settore</span>
                : <span>· nessuna altra azienda nel settore per il benchmark</span>
              }
            </div>
          )}
        </Card>

        {/* Selezione metriche */}
        <Card className="p-4">
          <p className="text-sm font-bold mb-3">Seleziona KPI da visualizzare:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Score ESG', metrics: ESG_METRICS },
              { label: 'Ambiente', metrics: KPI_METRICS.filter(m => m.group === 'Ambiente') },
              { label: 'Sociale', metrics: KPI_METRICS.filter(m => m.group === 'Sociale') },
            ].map(section => (
              <div key={section.label} className="flex flex-wrap items-center gap-2 border-r border-border pr-3 mr-1 last:border-0">
                <span className="text-xs text-muted-foreground font-bold">{section.label}:</span>
                {section.metrics.map(m => (
                  <button
                    key={m.key}
                    onClick={() => toggleMetric(m.key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      selectedMetrics.includes(m.key)
                        ? 'border-transparent text-white shadow-sm'
                        : 'border-border text-muted-foreground bg-card hover:bg-muted'
                    }`}
                    style={selectedMetrics.includes(m.key) ? { backgroundColor: m.color, borderColor: m.color } : {}}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </Card>

        {/* Stato vuoto */}
        {!company ? (
          <Card className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl mb-2">Seleziona un'azienda</h3>
            <p className="text-muted-foreground">Scegli un'azienda per visualizzarne l'andamento pluriennale</p>
          </Card>
        ) : companyReports.length < 2 ? (
          <Card className="p-12 text-center">
            <TrendingUp className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl mb-2">Dati insufficienti</h3>
            <p className="text-muted-foreground">Sono necessari almeno 2 report per visualizzare l'andamento nel tempo</p>
          </Card>
        ) : activeMetrics.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Seleziona almeno una metrica da visualizzare</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Heatmap variazioni anno su anno */}
            {chartData.length >= 2 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6">
                  <h3 className="font-heading font-bold text-lg mb-1">Heatmap Variazioni Anno su Anno</h3>
                  <p className="text-xs text-muted-foreground mb-5">Δ% rispetto all'anno precedente per ogni KPI selezionato</p>
                  <KpiHeatmap chartData={chartData} activeMetrics={activeMetrics} />
                </Card>
              </motion.div>
            )}

            {/* KPI summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ESG_METRICS.map(m => {
                const values = chartData.map(d => d[m.key]).filter(v => v != null && v > 0);
                const latest = values[values.length - 1];
                return (
                  <motion.div
                    key={m.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ESG_METRICS.indexOf(m) * 0.08 }}
                  >
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                      <div className="flex items-end justify-between gap-2">
                        <span className="font-heading font-extrabold text-2xl" style={{ color: m.color }}>
                          {latest?.toFixed(1) ?? '—'}
                        </span>
                        <TrendBadge values={values} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Ultimo anno disponibile</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Chart per gruppo */}
            {groups.map((group, gi) => {
              const groupMetrics = activeMetrics.filter(m => m.group === group);
              if (groupMetrics.length === 0) return null;
              return (
                <motion.div
                  key={group}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.12 }}
                >
                  <Card className="p-6">
                    <h3 className="font-heading font-bold text-lg mb-1">{group}</h3>
                    <p className="text-xs text-muted-foreground mb-5">Evoluzione nel tempo — {companyReports.map(r => r.year).join(', ')}</p>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis
                            dataKey="year"
                            tick={{ fontSize: 13, fontWeight: 600 }}
                          />
                          <YAxis tick={{ fontSize: 11 }} width={50} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          {groupMetrics.map(m => (
                            <Line
                              key={m.key}
                              type="monotone"
                              dataKey={m.key}
                              stroke={m.color}
                              strokeWidth={2.5}
                              name={m.label}
                              dot={{ fill: m.color, strokeWidth: 2, r: 5 }}
                              activeDot={{ r: 7 }}
                              connectNulls
                            />
                          ))}
                          {hasBenchmark && groupMetrics.map(m => (
                            <Line
                              key={`bm_${m.key}`}
                              type="monotone"
                              dataKey={`bm_${m.key}`}
                              stroke={m.color}
                              strokeWidth={1.5}
                              strokeDasharray="5 4"
                              name={`${m.label} (settore)`}
                              dot={false}
                              connectNulls
                              opacity={0.6}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}