import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import { TrendingUp, Award } from 'lucide-react';

// Utility per aggregare report per anno (tiene il migliore per anno)
const aggregateByYear = (reports) => {
  const reportsByYear = {};
  reports.forEach(r => {
    const year = r.year;
    if (!reportsByYear[year] || (r.esg_score?.tot || 0) > (reportsByYear[year].esg_score?.tot || 0)) {
      reportsByYear[year] = r;
    }
  });
  return Object.values(reportsByYear).sort((a, b) => a.year - b.year);
};

export function YearComparisonChart({ reports, selectedMetrics }) {
  const aggregated = aggregateByYear(reports);
  
  const chartData = aggregated
    .map(r => ({
      year: `${r.year}`,
      tot: r.esg_score?.tot || 0,
      E: r.esg_score?.E || 0,
      S: r.esg_score?.S || 0,
      G: r.esg_score?.G || 0,
      completion: r.completion || 0,
    }));

  const maxYear = chartData.length > 0 ? chartData[chartData.length - 1].year : null;
  const prevTot = chartData.length > 1 ? chartData[chartData.length - 2].tot : null;
  const currTot = maxYear !== null ? chartData[chartData.length - 1].tot : null;
  const delta = prevTot !== null && currTot !== null ? currTot - prevTot : 0;
  
  // Estrai target dall'ultimo report per le linee di riferimento
  const latestReport = reports[reports.length - 1];
  const targets = latestReport?.data?.targets || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-bold text-lg flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <TrendingUp className="w-5 h-5 text-green-600" />
              </motion.div>
              Evoluzione ESG per Anno
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Confronto per anno: Score Totale e Pilastri (E, S, G)</p>
          </div>
          {delta !== 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, delay: 0.3 }}
              className={`px-3 py-1 rounded-full text-xs font-bold ${delta > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {delta > 0 ? '↑' : '↓'} {Math.abs(delta)} pti da {parseInt(maxYear) - 1}
            </motion.div>
          )}
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="year" tick={{ fontSize: 13, fontWeight: 600 }} label={{ value: 'Anno', position: 'insideBottomRight', offset: -5 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => value.toFixed(1)}
              />
              <Legend />
              <Bar dataKey="tot" fill="#059669" radius={[4, 4, 0, 0]} name="Score Totale" />
              <Bar dataKey="E" fill="#16A34A" radius={[4, 4, 0, 0]} name="Ambiente (E)" />
              <Bar dataKey="S" fill="#2563EB" radius={[4, 4, 0, 0]} name="Sociale (S)" />
              <Bar dataKey="G" fill="#A855F7" radius={[4, 4, 0, 0]} name="Governance (G)" />
              {targets.tot && (
                <ReferenceLine y={targets.tot} stroke="#059669" strokeDasharray="5 5" strokeWidth={2} label={{ value: `Target: ${targets.tot}`, position: 'top', fill: '#059669', fontSize: 11, fontWeight: 'bold' }} />
              )}
              {targets.E && (
                <ReferenceLine y={targets.E} stroke="#16A34A" strokeDasharray="3 3" strokeWidth={1.5} />
              )}
              {targets.S && (
                <ReferenceLine y={targets.S} stroke="#2563EB" strokeDasharray="3 3" strokeWidth={1.5} />
              )}
              {targets.G && (
                <ReferenceLine y={targets.G} stroke="#A855F7" strokeDasharray="3 3" strokeWidth={1.5} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}

export function TotalScoreTrend({ reports }) {
  const aggregated = aggregateByYear(reports);
  
  const chartData = aggregated
    .map(r => ({
      year: r.year,
      tot: r.esg_score?.tot || 0,
    }))
    .sort((a, b) => a.year - b.year);

  // Estrai target dall'ultimo report
  const latestReport = reports[reports.length - 1];
  const targets = latestReport?.data?.targets || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="p-6">
        <h3 className="font-heading font-bold text-lg flex items-center gap-2 mb-6">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <Award className="w-5 h-5 text-amber-500" />
          </motion.div>
          Trend Score Totale
        </h3>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fontWeight: 600 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <motion.line
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
              />
              <Line 
                type="monotone" 
                dataKey="tot" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{ fill: '#059669', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
              {targets.tot && (
                <ReferenceLine y={targets.tot} stroke="#059669" strokeDasharray="5 5" strokeWidth={2} label={{ value: `Target: ${targets.tot}`, position: 'top', fill: '#059669', fontSize: 11, fontWeight: 'bold' }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}