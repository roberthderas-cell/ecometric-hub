import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, TrendingUp, Leaf, Trash2, Sparkles, ArrowRight, BarChart3, Shield, Zap, Building2 } from 'lucide-react';
import YearComparisonChart from '@/components/report/YearComparisonChart';
import { TemplatePicker } from '@/components/report/TemplateManager';
import MultiSiteDashboard from '@/components/report/MultiSiteDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_DATA } from '@/lib/vsmeDefaults';
import HeroParticles from '@/components/home/HeroParticles';
import VisuraWithAnalysis from '../components/home/VisuraWithAnalysis.jsx';

const ratingConfig = {
  Leader:        { color: '#059669', bg: 'from-emerald-500 to-green-400', label: '🏆 Leader' },
  Avanzato:      { color: '#2563EB', bg: 'from-blue-600 to-blue-400',     label: '⭐ Avanzato' },
  Buono:         { color: '#0891B2', bg: 'from-cyan-600 to-cyan-400',     label: '✅ Buono' },
  'In crescita': { color: '#D97706', bg: 'from-amber-500 to-yellow-400',  label: '📈 In crescita' },
  Base:          { color: '#9CA3AF', bg: 'from-slate-500 to-slate-400',   label: '🌱 Base' },
};

const statusConfig = {
  bozza:     { bg: 'bg-slate-100 text-slate-600 border-slate-200',       dot: 'bg-slate-400',   label: 'Bozza' },
  in_corso:  { bg: 'bg-amber-50 text-amber-700 border-amber-200',        dot: 'bg-amber-400',   label: 'In corso' },
  completato:{ bg: 'bg-green-50 text-green-700 border-green-200',        dot: 'bg-green-500',   label: 'Completato' },
};

function useAnimatedCount(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || typeof target !== 'number') return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

function StatPill({ icon: Icon, value, label, color }) {
  const numeric = typeof value === 'number' ? value : parseInt(value);
  const isNum = !isNaN(numeric) && typeof value === 'number';
  const { count, ref } = useAnimatedCount(isNum ? numeric : 0);

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.06, backgroundColor: 'rgba(255,255,255,0.14)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="flex items-center gap-3 bg-white/8 rounded-2xl px-5 py-3.5 cursor-default"
    >
      <motion.div
        whileHover={{ rotate: 10 }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon className="w-4 h-4 text-white" />
      </motion.div>
      <div>
        <p className="font-heading font-extrabold text-white text-xl leading-none">
          {isNum ? count : value}
        </p>
        <p className="text-white/50 text-[11px] mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

function ReportCard({ report, onDelete, index }) {
  const score = report.esg_score;
  const rating = score?.rating;
  const cfg = ratingConfig[rating];
  const st = statusConfig[report.status] || statusConfig.bozza;
  const completion = report.completion || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      viewport={{ once: true, margin: '-30px' }}
      whileHover={{ y: -6, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group relative rounded-xl"
    >
      <Link to={`/report/${report.id}/ana`}>
        <Card className="relative overflow-hidden p-0 cursor-pointer border-border group-hover:border-primary/30 transition-colors duration-300">
          {/* Top accent bar */}
          {cfg && (
            <div className={`h-1 w-full bg-gradient-to-r ${cfg.bg}`} />
          )}

          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors truncate">{report.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Anno {report.year} · {report.module === 'comprehensive' ? 'Modulo Completo' : 'Modulo Base'}</p>
              </div>
              <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ml-2 ${st.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </span>
            </div>

            {/* Completion bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-muted-foreground">Completamento</span>
                <span className="text-[11px] font-bold text-foreground">{completion}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.8, delay: index * 0.06 + 0.2, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                />
              </div>
            </div>

            {/* ESG Score */}
            {score?.tot ? (
              <div className={`flex items-center gap-3 bg-gradient-to-r ${cfg?.bg || 'from-slate-500 to-slate-400'} rounded-xl px-4 py-3`}>
                <div>
                  <p className="text-[9px] text-white/70 uppercase tracking-widest">ESG Score</p>
                  <p className="font-heading font-extrabold text-2xl text-white leading-none">{score.tot}</p>
                </div>
                <div className="flex-1 grid grid-cols-3 text-center gap-1">
                  {[['E', score.E], ['S', score.S], ['G', score.G]].map(([l, v]) => (
                    <div key={l} className="bg-white/15 rounded-lg py-1">
                      <p className="text-[8px] text-white/60 uppercase">{l}</p>
                      <p className="text-xs font-bold text-white">{v}</p>
                    </div>
                  ))}
                </div>
                <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-3 text-xs text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
                Inizia a compilare per calcolare lo score ESG
                <ArrowRight className="w-3.5 h-3.5 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </div>
        </Card>
      </Link>

      {/* Delete button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(report.id); }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm border border-border hover:border-destructive hover:text-destructive text-muted-foreground z-10"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default function Home() {
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [year, setYear] = useState('2025');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [visuraData, setVisuraData] = useState(null);
  const [visuraTerritorial, setVisuraTerritorial] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  useOnboardingGuard(user);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.list('-updated_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.Report.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setShowNew(false);
      setName('');
      setSelectedTemplate(null);
      setVisuraData(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Report.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  });

  const handleVisuraExtracted = (extracted, territorial) => {
    setVisuraData(extracted);
    if (territorial) setVisuraTerritorial(territorial);
    if (extracted?.ragione_sociale && !name.trim()) {
      setName(extracted.ragione_sociale);
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const baseData = selectedTemplate?.data
      ? JSON.parse(JSON.stringify(selectedTemplate.data))
      : JSON.parse(JSON.stringify(DEFAULT_DATA));

    // Pre-fill anagrafica data from visura if available
    if (visuraData) {
      if (!baseData.ana) baseData.ana = {};
      if (visuraData.ragione_sociale) baseData.ana.ragione = visuraData.ragione_sociale;
      if (visuraData.ateco) baseData.ana.ateco = visuraData.ateco;
      if (visuraData.forma_giuridica) {
        const formaMap = { 'SRL': 'SRL', 'S.R.L.': 'SRL', 'SPA': 'SPA', 'S.P.A.': 'SPA', 'SNC': 'SNC', 'SAS': 'SAS' };
        baseData.ana.forma = formaMap[visuraData.forma_giuridica?.toUpperCase()] || 'SRL';
      }
      if (visuraData.sede_legale) baseData.ana.sede = visuraData.sede_legale;
      if (visuraData.num_dipendenti) {
        baseData.ana.hc = String(visuraData.num_dipendenti);
        baseData.pe = baseData.pe || {};
        baseData.pe.hc = String(visuraData.num_dipendenti);
      }
    }

    createMutation.mutate({
      name: name.trim(),
      year: parseInt(year),
      status: 'bozza',
      completion: 0,
      module: selectedTemplate?.module || 'basic',
      data: baseData,
      ...(visuraTerritorial ? { profilo_territoriale: visuraTerritorial } : {}),
    });
  };

  const completedCount = reports.filter(r => r.completion === 100).length;
  const avgScore = reports.filter(r => r.esg_score?.tot).length
    ? Math.round(reports.filter(r => r.esg_score?.tot).reduce((s, r) => s + r.esg_score.tot, 0) / reports.filter(r => r.esg_score?.tot).length)
    : null;

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700">
        {/* Particles */}
        <HeroParticles />
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-green-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-300/5 rounded-full blur-2xl" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-16 top-1/2 -translate-y-1/2 opacity-[0.04]"
          >
            <svg width="400" height="400" viewBox="0 0 400 400">
              <circle cx="200" cy="200" r="180" fill="none" stroke="white" strokeWidth="1"/>
              <circle cx="200" cy="200" r="120" fill="none" stroke="white" strokeWidth="1"/>
              <circle cx="200" cy="200" r="60" fill="none" stroke="white" strokeWidth="1"/>
              <line x1="200" y1="20" x2="200" y2="380" stroke="white" strokeWidth="0.5"/>
              <line x1="20" y1="200" x2="380" y2="200" stroke="white" strokeWidth="0.5"/>
            </svg>
          </motion.div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 bg-green-400/12 border border-green-400/25 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
                <Leaf className="w-3.5 h-3.5" /> VSME Standard · EFRAG 2024
              </span>

            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Il tuo Report<br />
              <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                ESG Intelligente
              </span>
            </h1>
            <p className="text-white/50 text-base md:text-lg max-w-lg leading-relaxed mb-8">
              L'unica piattaforma italiana per PMI che calcola, valida e ottimizza il tuo score ESG in tempo reale secondo lo standard VSME.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-12">
              <Button
                onClick={() => setShowNew(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-400 text-forest-900 font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transition-all gap-2"
              >
                <Plus className="w-4 h-4" /> Nuovo Report
              </Button>
              {reports.length > 0 && (
                <>
                  <Link to="/relazione-banca">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2 bg-white/5">
                      <Building2 className="w-4 h-4" /> Relazione per la Banca
                    </Button>
                  </Link>
                  <Link to="/confronto-anni">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2 bg-white/5">
                      <BarChart3 className="w-4 h-4" /> Confronto Anni
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-3">
              <StatPill icon={FileText} value={reports.length} label="Report totali" color="bg-green-600/60" />
              <StatPill icon={Shield} value={completedCount} label="Completati" color="bg-blue-600/60" />
              {avgScore !== null && <StatPill icon={TrendingUp} value={avgScore} label="Score medio ESG" color="bg-purple-600/60" />}
              <StatPill icon={Zap} value="VSME" label="Standard EFRAG" color="bg-amber-600/60" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── FEATURES STRIP ───────────────────────────────── */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '⚡', title: 'Score ESG Live', desc: 'Ricalcolo automatico ad ogni modifica' },
            { icon: '🎯', title: 'Validazione Intelligente', desc: 'Alert critici e azioni correttive' },
            { icon: '📊', title: 'Dashboard Avanzata', desc: 'Trend, radar chart e 45 KPI' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 cursor-default"
            >
              <motion.span
                whileHover={{ scale: 1.3, rotate: -5 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="text-2xl select-none"
              >
                {f.icon}
              </motion.span>
              <div>
                <p className="text-sm font-bold text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── REPORT LIST ──────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">I tuoi Report</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{reports.length} report · aggiornati automaticamente</p>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button onClick={() => setShowNew(true)} className="gap-2 bg-primary">
              <Plus className="w-4 h-4" /> Nuovo
            </Button>
          </motion.div>
        </motion.div>

        {/* Multi-site ESG ranking (shown when ≥2 reports with ESG scores exist) */}
        <MultiSiteDashboard reports={reports} />

        {/* Year-over-year comparison (shown only when ≥2 reports with ESG scores exist) */}
        {reports.filter(r => r.data && r.esg_score?.tot).length >= 2 && (
          <div className="mb-6">
            <YearComparisonChart reports={reports} />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Leaf className="w-10 h-10 text-primary/40" />
            </div>
            <p className="text-lg font-heading font-bold text-foreground mb-2">Inizia la tua journey ESG</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">Crea il primo report VSME e scopri il tuo score ESG in pochi minuti</p>
            <Button onClick={() => setShowNew(true)} className="gap-2 bg-primary px-6">
              <Plus className="w-4 h-4" /> Crea il primo report
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {reports.map((r, i) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  index={i}
                  onDelete={(id) => { if (confirm('Eliminare questo report?')) deleteMutation.mutate(id); }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── NEW REPORT DIALOG ────────────────────────────── */}
      <Dialog open={showNew} onOpenChange={(o) => { setShowNew(o); if (!o) { setName(''); setVisuraData(null); setVisuraTerritorial(null); setSelectedTemplate(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary" />
              </span>
              Nuovo Report VSME
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Visura upload */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Compilazione automatica (opzionale)</label>
              <VisuraWithAnalysis onExtracted={handleVisuraExtracted} />
            </div>

            <div className="border-t border-dashed border-border" />

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nome dell'impresa *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Alfa Metalli S.r.l."
                className="mt-1.5"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              {visuraData?.ragione_sociale && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  ✅ Estratto dalla visura: {visuraData.ragione_sociale}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Modello di partenza</label>
              <TemplatePicker onSelect={setSelectedTemplate} selectedId={selectedTemplate?.id} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Anno di riferimento</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['2025', '2024', '2023', '2022'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Annulla</Button>
            <Button onClick={handleCreate} disabled={!name.trim() || createMutation.isPending} className="bg-primary gap-2">
              {createMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : <Plus className="w-4 h-4" />}
              Crea Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}