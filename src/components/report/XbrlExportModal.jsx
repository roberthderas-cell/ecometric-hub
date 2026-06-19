import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink, CheckCircle2, AlertTriangle, FileCode2, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadVsmeXlsx } from '@/lib/vsmeXbrlExport';

const STEPS = [
  {
    icon: '📥',
    title: 'Esporta il file Excel XBRL-ready',
    desc: 'Genera un file Excel con i named ranges ufficiali EFRAG (VSME Digital Template v1.3.0). Ogni cella è mappata al nome XBRL corrispondente nella tassonomia ufficiale.',
    action: 'download',
  },
  {
    icon: '🌐',
    title: 'Carica su xbrl.efrag.org',
    desc: 'Vai sul convertitore ufficiale EFRAG gratuito. Carica il file Excel scaricato. Il sistema esegue la validazione XBRL certificata (Arelle) e genera il report iXBRL.',
    action: 'link',
  },
  {
    icon: '✅',
    title: 'Scarica il report iXBRL ufficiale',
    desc: 'EFRAG produce il file iXBRL (Inline XBRL) valido per la trasmissione ufficiale, più un XBRL Report Package e XBRL-JSON. Questi sono i formati richiesti per la rendicontazione digitale.',
    action: null,
  },
];

const FIELD_CHECKS = [
  { label: 'Ragione Sociale', key: d => d?.ana?.ragioneSociale, critical: true },
  { label: 'Anno di riferimento', key: d => d?.ana?.annoRif, critical: true },
  { label: 'Codice ATECO/NACE', key: d => d?.ana?.codiceAteco, critical: true },
  { label: 'Dipendenti (HC)', key: d => d?.pe?.hc, critical: false },
  { label: 'Emissioni GHG Scope 1', key: d => d?.en?.scope1, critical: false },
  { label: 'Emissioni GHG Scope 2', key: d => d?.en?.scope2, critical: false },
  { label: 'Fatturato Netto (€)', key: d => d?.ana?.fatturato, critical: false },
];

export default function XbrlExportModal({ reportData, reportMeta, onClose }) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    downloadVsmeXlsx(reportData, reportMeta);
    setDownloaded(true);
  };

  const checks = FIELD_CHECKS.map(f => ({
    label: f.label,
    ok: !!f.key(reportData),
    critical: f.critical,
  }));

  const criticalMissing = checks.filter(c => c.critical && !c.ok);
  const warningMissing = checks.filter(c => !c.critical && !c.ok);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-forest-900 to-forest-700 rounded-t-2xl p-6 text-white">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg">Export XBRL — VSME Digital Template</h2>
                <p className="text-white/65 text-xs">Conforme alla VSME XBRL Taxonomy EFRAG v1.3.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 bg-green-400/15 border border-green-400/30 rounded-lg px-3 py-2">
              <Info className="w-3.5 h-3.5 text-green-300 shrink-0" />
              <p className="text-[11px] text-green-100">Il file generato usa i named ranges ufficiali EFRAG e può essere convertito in iXBRL su <strong>xbrl.efrag.org/convert/</strong> gratuitamente.</p>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* Verifica campi critici */}
            <div>
              <h3 className="font-heading font-bold text-sm text-foreground mb-3">Verifica dati per la conversione XBRL</h3>
              <div className="grid grid-cols-1 gap-1.5">
                {checks.map(c => (
                  <div key={c.label} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${c.ok ? 'bg-green-50' : c.critical ? 'bg-red-50' : 'bg-amber-50'}`}>
                    <div className="flex items-center gap-2">
                      {c.ok
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        : <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${c.critical ? 'text-red-500' : 'text-amber-500'}`} />
                      }
                      <span className={c.ok ? 'text-green-800' : c.critical ? 'text-red-700 font-semibold' : 'text-amber-700'}>{c.label}</span>
                    </div>
                    <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${c.ok ? 'bg-green-100 text-green-700' : c.critical ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                      {c.ok ? '✓ Compilato' : c.critical ? '✗ Obbligatorio' : '⚠ Mancante'}
                    </span>
                  </div>
                ))}
              </div>
              {criticalMissing.length > 0 && (
                <p className="text-xs text-red-600 mt-2 font-semibold">⚠ {criticalMissing.length} campo/i obbligatorio/i mancante/i — il convertitore EFRAG potrebbe generare errori fatali.</p>
              )}
            </div>

            {/* Flusso in 3 passi */}
            <div>
              <h3 className="font-heading font-bold text-sm text-foreground mb-3">Come ottenere il file iXBRL ufficiale</h3>
              <div className="space-y-3">
                {STEPS.map((step, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-muted/40 rounded-xl border border-border">
                    <div className="text-2xl shrink-0 mt-0.5">{step.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                        <span className="font-heading font-bold text-sm">{step.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Named ranges info */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-[11px] font-bold text-primary mb-1">📋 Named ranges inclusi nel file</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Il file contiene <strong>{9 + 12 + 13 + 5} named ranges XBRL</strong> mappati sulla tassonomia VSME EFRAG:
                General Information (9), Environmental B3/B6/B7 (12), Social B8/B9/B10 (13), Governance B11 (5).
                Ogni named range corrisponde esattamente al nome dell'elemento nella tassonomia XBRL ufficiale.
              </p>
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleDownload}
                className={`flex-1 gap-2 ${downloaded ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                {downloaded ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                {downloaded ? 'File scaricato ✓' : 'Scarica Excel XBRL-ready'}
              </Button>
              <a
                href="https://xbrl.efrag.org/convert/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full gap-2" disabled={!downloaded}>
                  <ExternalLink className="w-4 h-4" />
                  Converti su EFRAG
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
            {downloaded && (
              <p className="text-[11px] text-green-700 text-center -mt-3">
                ✅ File pronto! Ora caricalo su <strong>xbrl.efrag.org/convert/</strong> per ottenere il file iXBRL certificato.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}