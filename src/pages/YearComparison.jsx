import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Award, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calcESGScore } from '@/lib/vsmeDefaults';

function YearComparisonChart({ reports }) {
  const chartData = reports
    .map(r => ({
      year: r.year,
      E: r.esg_score?.E || 0,
      S: r.esg_score?.S || 0,
      G: r.esg_score?.G || 0,
      tot: r.esg_score?.tot || 0,
    }))
    .sort((a, b) => a.year - b.year);

  const maxYear = chartData.length > 0 ? chartData[chartData.length - 1].year : null;
  const prevYear = chartData.length > 1 ? chartData[chartData.length - 2].tot : null;
  const currYear = maxYear !== null ? chartData[chartData.length - 1].tot : null;
  const delta = prevYear !== null && currYear !== null ? currYear - prevYear : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-bold text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Evoluzione Score ESG
        </h3>
        {delta !== 0 && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${delta > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {delta > 0 ? '+' : ''}{delta} pti vs {maxYear - 1}
          </div>
        )}
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fontWeight: 600 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend />
            <Bar dataKey="E" fill="#16A34A" radius={[4, 4, 0, 0]} name="Ambiente (E)" />
            <Bar dataKey="S" fill="#2563EB" radius={[4, 4, 0, 0]} name="Sociale (S)" />
            <Bar dataKey="G" fill="#A855F7" radius={[4, 4, 0, 0]} name="Governance (G)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function TotalScoreTrend({ reports }) {
  const chartData = reports
    .map(r => ({
      year: r.year,
      tot: r.esg_score?.tot || 0,
    }))
    .sort((a, b) => a.year - b.year);

  return (
    <Card className="p-6">
      <h3 className="font-heading font-bold text-lg flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-amber-500" />
        Trend Score Totale
      </h3>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fontWeight: 600 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="tot" 
              stroke="#059669" 
              strokeWidth={3}
              dot={{ fill: '#059669', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function YearCard({ report, isLatest }) {
  const esg = report.esg_score || { E: 0, S: 0, G: 0, tot: 0 };
  
  const ratingColor = {
    Leader: '#34D399', Avanzato: '#60A5FA', Buono: '#22D3EE',
    'In crescita': '#FCD34D', Base: '#94A3B8',
  }[esg.rating] || '#94A3B8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border-2 ${isLatest ? 'border-green-500 bg-green-50' : 'border-border bg-card'}`}
    >
      {isLatest && (
        <div className="absolute top-2 right-2">
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500 text-white">
            Attuale
          </span>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-heading font-bold text-2xl text-foreground">{report.year}</h4>
          <div 
            className="px-3 py-1 rounded-full text-xs font-bold border"
            style={{ color: ratingColor, borderColor: ratingColor + '40', backgroundColor: ratingColor + '15' }}
          >
            {esg.rating}
          </div>
        </div>

        <div className="flex items-end gap-2 mb-4">
          <span className="font-heading font-extrabold text-4xl" style={{ color: ratingColor }}>
            {esg.tot}
          </span>
          <span className="text-sm text-muted-foreground mb-2">/100</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Ambiente (E)</span>
            <span className="text-sm font-bold" style={{ color: '#16A34A' }}>{esg.E}/100</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: '#16A34A' }}
              initial={{ width: 0 }}
              animate={{ width: `${esg.E}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Sociale (S)</span>
            <span className="text-sm font-bold" style={{ color: '#2563EB' }}>{esg.S}/100</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: '#2563EB' }}
              initial={{ width: 0 }}
              animate={{ width: `${esg.S}%` }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Governance (G)</span>
            <span className="text-sm font-bold" style={{ color: '#A855F7' }}>{esg.G}/100</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: '#A855F7' }}
              initial={{ width: 0 }}
              animate={{ width: `${esg.G}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </div>

        <Link to={`/report/${report.id}/dash`}>
          <Button className="w-full mt-4" variant={isLatest ? 'default' : 'outline'} size="sm">
            {isLatest ? 'Apri Report' : 'Visualizza Dettagli'}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function YearComparison() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: () => base44.entities.Report.filter({}),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  const sortedReports = (reports || []).sort((a, b) => b.year - a.year);
  const latestReport = sortedReports[0];

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Confronto Annuale ESG</h1>
            <p className="text-sm text-muted-foreground">Analizza l'evoluzione delle performance di sostenibilità nel tempo</p>
          </div>
        </div>

        {sortedReports.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl mb-2">Nessun report disponibile</h3>
            <p className="text-muted-foreground mb-4">Crea il tuo primo report per iniziare a monitorare i progressi ESG</p>
            <Link to="/">
              <Button>Crea Report</Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Year Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedReports.map((report, idx) => (
                <YearCard key={report.id} report={report} isLatest={idx === 0} />
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <YearComparisonChart reports={sortedReports} />
              <TotalScoreTrend reports={sortedReports} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}