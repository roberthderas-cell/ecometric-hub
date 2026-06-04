import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Target, Filter, Building2, Briefcase, Target as TargetIcon, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import TargetSetter from '@/components/report/TargetSetter';
import CompanyExpandableRow from '@/components/report/CompanyExpandableRow';
import { YearComparisonChart, TotalScoreTrend } from '@/components/report/ComparisonCharts';
import { toast } from 'sonner';

// Metriche disponibili
const AVAILABLE_METRICS = [
  { key: 'tot', label: 'Score Totale', color: '#059669' },
  { key: 'E', label: 'Ambiente (E)', color: '#16A34A' },
  { key: 'S', label: 'Sociale (S)', color: '#2563EB' },
  { key: 'G', label: 'Governance (G)', color: '#A855F7' },
  { key: 'completion', label: 'Completamento', color: '#F59E0B' },
];

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
  const [selectedMetrics, setSelectedMetrics] = useState(['E', 'S', 'G']);

  // Estrai aziende uniche e settori unici dai report
  const companies = reports 
    ? [...new Set(reports.map(r => r.data?.ana?.ragione).filter(Boolean))]
    : [];
  
  const sectors = reports
    ? [...new Set(reports.map(r => r.data?.ana?.ateco).filter(Boolean))]
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
          
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">Metriche:</span>
            <div className="flex gap-2">
              {AVAILABLE_METRICS.map(metric => (
                <label key={metric.key} className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox
                    checked={selectedMetrics.includes(metric.key)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMetrics([...selectedMetrics, metric.key]);
                      } else {
                        setSelectedMetrics(selectedMetrics.filter(m => m !== metric.key));
                      }
                    }}
                    className="border-muted-foreground"
                  />
                  <span className="text-xs font-medium" style={{ color: metric.color }}>{metric.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {(selectedCompany !== 'all' || selectedSector !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { 
                setSelectedCompany('all'); 
                setSelectedSector('all'); 
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
            {/* Tabella espandibile per aziende */}
            <Card className="overflow-hidden">
              {/* Header tabella */}
              <div className="grid grid-cols-13 gap-4 items-center p-4 bg-muted/50 border-b border-border font-heading font-bold text-sm">
                <div className="col-span-3">Azienda</div>
                <div className="col-span-1 text-center">Score Totale</div>
                {selectedMetrics.includes('E') && <div className="col-span-1 text-center">E</div>}
                {selectedMetrics.includes('S') && <div className="col-span-1 text-center">S</div>}
                {selectedMetrics.includes('G') && <div className="col-span-1 text-center">G</div>}
                <div className="col-span-3 text-center">Gap vs Target</div>
                <div className="col-span-2 text-center">Azioni</div>
              </div>

              {/* Raggruppa report per azienda */}
              {companies.length > 0 ? (
                companies.map((company, idx) => {
                  const companyReports = sortedReports.filter(r => r.data?.ana?.ragione === company);
                  return (
                    <CompanyExpandableRow
                      key={company}
                      company={company}
                      reports={companyReports}
                      selectedMetrics={selectedMetrics}
                      index={idx}
                    />
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Nessuna azienda trovata nei report
                </div>
              )}
            </Card>

            {/* Charts - only show when there are 2+ DISTINCT years of data */}
            {new Set(sortedReports.map(r => r.year)).size >= 2 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <YearComparisonChart reports={sortedReports} selectedMetrics={selectedMetrics} />
                <TotalScoreTrend reports={sortedReports} />
              </div>
            ) : (
              <Card className="p-8 text-center bg-amber-50 border-amber-200">
                <TrendingUp className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h3 className="font-heading font-bold text-lg text-amber-900 mb-2">Crea un report di un anno diverso</h3>
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