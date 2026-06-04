import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Loader2, ArrowLeft, FileText, Building2, Leaf } from 'lucide-react';
import { calcEnergy, calcWaste, calcWater, calcPersonnel, calcESGScore } from '@/lib/vsmeDefaults';
import BankReportPreview from '@/components/report/BankReportPreview';
import { exportBankReportPDF } from '@/lib/exportBankPdf';
import { motion } from 'framer-motion';

export default function RelazioneESG() {
  const [selectedId, setSelectedId] = useState('');
  const [exporting, setExporting] = useState(false);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.list('-updated_date', 50),
  });

  const scored = reports.filter(r => r.esg_score?.tot || r.data);
  const selected = scored.find(r => r.id === selectedId) || scored[0] || null;

  // Precompute metrics for selected report
  const metrics = selected ? (() => {
    const d = selected.data || {};
    return {
      g: calcEnergy(d),
      w: calcWaste(d),
      wa: calcWater(d),
      p: calcPersonnel(d),
      esg: selected.esg_score?.tot ? selected.esg_score : calcESGScore(d),
      data: d,
    };
  })() : null;

  const handleExport = async () => {
    if (!selected || !metrics) return;
    setExporting(true);
    try {
      await exportBankReportPDF({ report: selected, metrics });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Torna alla Home
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-green-400/15 border border-green-400/25 text-green-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" /> Relazione Tecnica ESG per Banca
                </span>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-white mb-2">
                Relazione di Sostenibilità
              </h1>
              <p className="text-white/50 text-sm max-w-lg">
                Documento professionale conforme allo standard VSME — EFRAG 2024, predisposto per la valutazione del merito creditizio ESG da parte degli istituti bancari.
              </p>
            </div>
            <Button
              onClick={handleExport}
              disabled={exporting || !selected}
              className="shrink-0 bg-gradient-to-r from-green-500 to-emerald-400 text-forest-900 font-extrabold px-5 py-2.5 rounded-xl shadow-lg gap-2 hover:scale-105 transition-all"
            >
              {exporting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando PDF...</>
                : <><FileDown className="w-4 h-4" /> Scarica PDF</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Report selector */}
        <Card className="p-5 mb-8 flex items-center gap-4 flex-wrap">
          <FileText className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Seleziona il report da includere nella relazione</p>
            <p className="text-xs text-muted-foreground">Solo i report con dati ESG sono disponibili</p>
          </div>
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
          ) : (
            <Select value={selectedId || selected?.id || ''} onValueChange={setSelectedId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Scegli un report..." />
              </SelectTrigger>
              <SelectContent>
                {scored.map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} — {r.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Card>

        {/* Preview */}
        {selected && metrics ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <BankReportPreview report={selected} metrics={metrics} />
          </motion.div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            <Leaf className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nessun report disponibile. Crea e compila un report ESG per generare la relazione.</p>
            <Link to="/">
              <Button className="mt-4 bg-primary gap-2">Vai ai Report</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}