import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Award, Target, Filter, Building2, Briefcase, Target as TargetIcon, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calcESGScore } from '@/lib/vsmeDefaults';
import TargetSetter from '@/components/report/TargetSetter';
import { toast } from 'sonner';

function YearComparisonChart({ reports }) {
  const chartData = reports
    .map(r => ({
      year: `${r.year}`,
      tot: r.esg_score?.tot || 0,
      E: r.esg_score?.E || 0,
      S: r.esg_score?.S || 0,
      G: r.esg_score?.G || 0,
    }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  const maxYear = chartData.length > 0 ? chartData[chartData.length - 1].year : null;
  const prevTot = chartData.length > 1 ? chartData[chartData.length - 2].tot : null;
  const currTot = maxYear !== null ? chartData[chartData.length - 1].tot : null;
  const delta = prevTot !== null && currTot !== null ? currTot - prevTot : 0;
  
  // Estrai target dall'ultimo report per le linee di riferimento
  const latestReport = reports[reports.length - 1];
  const targets = latestReport?.data?.targets || {};
  const hasTargets = targets.E || targets.S || targets.G || targets.tot;

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
                <ReferenceLine y={targets.tot} stroke="#059669" strokeDasharray="5 5" strokeWidth={2} label={{ value: `Target Tot: ${targets.tot}`, position: 'insideTopRight', offset: -10, fill: '#059669', fontSize: 11, fontWeight: 'bold' }} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}

function YearCard({ report, isLatest, index }) {
  const esg = report.esg_score || { E: 0, S: 0, G: 0, tot: 0 };
  
  const ratingColor = {
    Leader: '#34D399', Avanzato: '#60A5FA', Buono: '#22D3EE',
    'In crescita': '#FCD34D', Base: '#94A3B8',
  }[esg.rating] || '#94A3B8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl border-2 transition-colors ${isLatest ? 'border-green-500 bg-green-50' : 'border-border bg-card'}`}
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
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: () => base44.entities.Report.filter({}),
    enabled: !!user,
  });

  const [showTargetSetter, setShowTargetSetter] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedYears, setSelectedYears] = useState([]);

  // Estrai aziende uniche e settori unici dai report
  const companies = reports 
    ? [...new Set(reports.map(r => r.data?.ana?.ragione).filter(Boolean))]
    : [];
  
  const sectors = reports
    ? [...new Set(reports.map(r => r.data?.ana?.ateco).filter(Boolean))]
    : [];

  const availableYears = reports
    ? [...new Set(reports.map(r => r.year).filter(Boolean))].sort((a, b) => b - a)
    : [];

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Report.update(id, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Obiettivi salvati con successo!');
      setShowTargetSetter(false);
    },
    onError: () => {
      toast.error('Errore nel salvataggio degli obiettivi');
    },
  });

  // Filtra i report in base ai filtri selezionati
  let filteredReports = reports || [];
  
  if (selectedCompany !== 'all') {
    filteredReports = filteredReports.filter(r => r.data?.ana?.ragione === selectedCompany);
  }
  
  if (selectedSector !== 'all') {
    filteredReports = filteredReports.filter(r => r.data?.ana?.ateco === selectedSector);
  }
  
  if (selectedYears.length > 0) {
    filteredReports = filteredReports.filter(r => selectedYears.includes(r.year));
  }

  const sortedReports = filteredReports.sort((a, b) => b.year - a.year);
  const latestReport = sortedReports[0];

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
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
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
          {latestReport && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowTargetSetter(true)}
                className="gap-2 bg-primary"
              >
                <TargetIcon className="w-4 h-4" />
                Imposta Obiettivi {latestReport.year + 1}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Filtri */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-xl border border-border"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-bold">Filtri:</span>
          </div>
          
          {companies.length > 0 && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tutte le aziende" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le aziende</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {sectors.length > 0 && (
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Tutti i settori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i settori</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>
                      ATECO {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {availableYears.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground">Anni:</span>
              <div className="flex gap-2 flex-wrap">
                {availableYears.map(year => (
                  <label key={year} className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      checked={selectedYears.includes(year)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedYears([...selectedYears, year].sort((a, b) => b - a));
                        } else {
                          setSelectedYears(selectedYears.filter(y => y !== year));
                        }
                      }}
                      className="border-muted-foreground"
                    />
                    <span className="text-xs font-medium">{year}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {(selectedCompany !== 'all' || selectedSector !== 'all' || selectedYears.length < availableYears.length) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { 
                setSelectedCompany('all'); 
                setSelectedSector('all'); 
                setSelectedYears(availableYears.slice(0, Math.min(3, availableYears.length)));
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
          
          <div className="ml-auto text-xs text-muted-foreground font-bold">
            {sortedReports.length} report{sortedReports.length !== 1 ? ' visualizzati' : ''}
          </div>
        </motion.div>

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
                <YearCard key={report.id} report={report} isLatest={idx === 0} index={idx} />
              ))}
            </div>

            {/* Charts - only show when there are 2+ years of data */}
            {sortedReports.length >= 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <YearComparisonChart reports={sortedReports} />
                <TotalScoreTrend reports={sortedReports} />
              </div>
            )}
            
            {sortedReports.length === 1 && (
              <Card className="p-8 text-center bg-amber-50 border-amber-200">
                <TrendingUp className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h3 className="font-heading font-bold text-lg text-amber-900 mb-2">Crea un secondo report per il confronto</h3>
                <p className="text-amber-800 mb-6">I chart di confronto appariranno quando avrai report di almeno 2 anni diversi</p>
                <Link to="/">
                  <Button className="gap-2">Crea nuovo report</Button>
                </Link>
              </Card>
            )}
          </>
        )}
      </div>

      {showTargetSetter && latestReport && (
        <TargetSetter
          report={latestReport}
          onSave={(newData) => updateMutation.mutate({ id: latestReport.id, data: newData })}
          onClose={() => setShowTargetSetter(false)}
        />
      )}
    </div>
  );
}