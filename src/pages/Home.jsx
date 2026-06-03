import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, TrendingUp, Leaf, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_DATA } from '@/lib/vsmeDefaults';

export default function Home() {
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [year, setYear] = useState('2025');
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.list('-updated_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.Report.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); setShowNew(false); setName(''); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Report.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  });

  const handleCreate = () => {
    if (!name.trim()) return;
    createMutation.mutate({
      name: name.trim(),
      year: parseInt(year),
      status: 'bozza',
      completion: 0,
      module: 'basic',
      data: JSON.parse(JSON.stringify(DEFAULT_DATA)),
    });
  };

  const statusColors = {
    bozza: 'bg-slate-100 text-slate-600',
    in_corso: 'bg-amber-50 text-amber-700',
    completato: 'bg-green-50 text-green-700',
  };
  const statusLabels = { bozza: 'Bozza', in_corso: 'In corso', completato: 'Completato' };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 800 400"><circle cx="650" cy="200" r="180" fill="none" stroke="white" strokeWidth="1"/><circle cx="650" cy="200" r="120" fill="none" stroke="white" strokeWidth="1"/></svg>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 bg-green-400/12 border border-green-400/25 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              <Leaf className="w-3.5 h-3.5" /> VSME Standard · EFRAG 2024
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Report di<br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">Sostenibilità</span>
            </h1>
            <p className="text-white/55 text-base max-w-md leading-relaxed mb-8">
              Costruisci il tuo report VSME per le PMI. Dati ESG strutturati, calcoli automatici, dashboard KPI e export.
            </p>
            <Button onClick={() => setShowNew(true)} className="bg-gradient-to-r from-green-500 to-green-400 text-forest-900 font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all">
              <Plus className="w-4 h-4 mr-2" /> Nuovo Report
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Reports list */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-bold text-foreground">I tuoi Report</h2>
          <span className="text-sm text-muted-foreground">{reports.length} report</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-heading font-bold text-muted-foreground mb-2">Nessun report ancora</p>
            <p className="text-sm text-muted-foreground/60 mb-6">Crea il tuo primo report VSME per iniziare</p>
            <Button onClick={() => setShowNew(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Crea il primo report
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {reports.map((r, i) => {
                const score = r.esg_score;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/report/${r.id}/ana`}>
                      <Card className="p-5 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group border-green-100 hover:border-green-300">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors">{r.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Anno {r.year} · {r.module === 'comprehensive' ? 'Completo' : 'Base'}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColors[r.status] || statusColors.bozza}`}>
                            {statusLabels[r.status] || 'Bozza'}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                          <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all" style={{ width: `${r.completion || 0}%` }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{r.completion || 0}% completato</span>
                          {score && <span className="text-xs font-bold text-primary flex items-center gap-1"><TrendingUp className="w-3 h-3" /> ESG {score.tot || '—'}</span>}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (confirm('Eliminare questo report?')) deleteMutation.mutate(r.id); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* New report dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Nuovo Report VSME</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nome dell'impresa *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Alfa Metalli S.r.l." className="mt-1.5" />
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
            <Button onClick={handleCreate} disabled={!name.trim()} className="bg-primary">Crea Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}