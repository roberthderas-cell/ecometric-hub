import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Download, CheckCircle2, AlertTriangle, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseExcelFile, downloadTemplate } from '@/lib/excelImport';

function mergeDeep(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object'
    ) {
      out[key] = mergeDeep(target[key], source[key]);
    } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
      // Merge arrays element-by-element (preserving existing rows)
      out[key] = target[key].map((item, i) =>
        source[key][i] ? mergeDeep(item, source[key][i]) : item
      );
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

const SECTION_LABELS = {
  ana: '🏢 Anagrafica',
  en: '⚡ Energia',
  enfuels: '🔥 Combustibili',
  ac: '💧 Acqua',
  acfonti: '💧 Fonti idriche',
  ri: '♻️ Rifiuti',
  pe: '👥 Personale',
  gov: '⚖️ Governance',
};

export default function ExcelImportModal({ currentData, onImport, onClose }) {
  const [step, setStep] = useState('upload'); // upload | preview | done
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsed, setParsed] = useState(null); // { data, importedFields, warnings }
  const [mergedData, setMergedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setError('Formato non supportato. Carica un file .xlsx, .xls o .csv.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await parseExcelFile(file);
      if (result.importedFields.length === 0) {
        setError('Nessun campo riconosciuto. Assicurati di usare il template scaricabile.');
        setIsLoading(false);
        return;
      }
      const merged = mergeDeep(currentData, result.data);
      setParsed(result);
      setMergedData(merged);
      setStep('preview');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleConfirm = () => {
    onImport(mergedData);
    setStep('done');
  };

  // Group imported fields by section
  const groupedFields = parsed
    ? parsed.importedFields.reduce((acc, col) => {
        // Find section from FIELD_MAP
        const section = col.includes('CdA') || col.includes('Codice etico') || col.includes('MOG') || col.includes('ISO') || col.includes('SA8000') || col.includes('Parità') || col.includes('Whistle') || col.includes('Condanne') || col.includes('Sanzioni') || col.includes('Tempi') ? 'gov'
          : col.includes('Rifiuti') ? 'ri'
          : col.includes('Scarico') ? 'ac'
          : col.includes('Prelievo') || col.includes('pozzo') ? 'acfonti'
          : col.includes('Headcount') || col.includes('Dipendenti') || col.includes('FTE') || col.includes('Infortuni') || col.includes('Ore') || col.includes('Ritribuzione') || col.includes('Retribuzione') || col.includes('Part-time') || col.includes('Contratti') || col.includes('Giorni') || col.includes('Lavoratori') ? 'pe'
          : col.includes('Gas') || col.includes('Gasolio') || col.includes('Benzina') ? 'enfuels'
          : col.includes('Elettricità') || col.includes('FV') || col.includes('ISPRA') ? 'en'
          : col.includes('Ragione') || col.includes('ATECO') || col.includes('Fatturato') ? 'ana'
          : 'altro';
        if (!acc[section]) acc[section] = [];
        acc[section].push(col);
        return acc;
      }, {})
    : {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-heading font-extrabold text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              Importa dati da Excel
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Carica un file .xlsx per compilare automaticamente le sezioni del report
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">

            {/* ── STEP: Upload ── */}
            {step === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Download template */}
                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-5">
                  <div>
                    <p className="text-sm font-bold">1. Scarica il template Excel</p>
                    <p className="text-xs text-muted-foreground">Contiene tutte le colonne pre-intestate con istruzioni</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={downloadTemplate} className="gap-1.5 shrink-0">
                    <Download className="w-3.5 h-3.5" />
                    Template .xlsx
                  </Button>
                </div>

                {/* Dropzone */}
                <p className="text-sm font-bold mb-2">2. Carica il file compilato</p>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-sm">Analisi in corso...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-foreground mb-1">Trascina qui il file o clicca per selezionarlo</p>
                      <p className="text-xs text-muted-foreground">Formati supportati: .xlsx, .xls, .csv</p>
                    </>
                  )}
                </div>

                {error && (
                  <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP: Preview ── */}
            {step === 'preview' && parsed && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-800">{parsed.importedFields.length} campi riconosciuti e pronti all'importazione</p>
                    <p className="text-xs text-green-700">I valori attuali verranno sovrascritti solo per i campi presenti nel file.</p>
                  </div>
                </div>

                {/* Grouped field list */}
                <div className="space-y-3 mb-4">
                  {Object.entries(groupedFields).map(([sec, cols]) => (
                    <div key={sec} className="border border-border rounded-xl overflow-hidden">
                      <div className="bg-muted/40 px-3 py-2 text-xs font-bold">
                        {SECTION_LABELS[sec] || sec.toUpperCase()} <span className="text-muted-foreground font-normal">({cols.length} campi)</span>
                      </div>
                      <div className="px-3 py-2 flex flex-wrap gap-1.5">
                        {cols.map(c => (
                          <span key={c} className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Warnings */}
                {parsed.warnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs font-bold text-amber-800 mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {parsed.warnings.length} avviso{parsed.warnings.length > 1 ? 'i' : ''}
                    </p>
                    <ul className="space-y-0.5">
                      {parsed.warnings.map((w, i) => (
                        <li key={i} className="text-[11px] text-amber-700">{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setStep('upload'); setParsed(null); }}>
                    ← Torna indietro
                  </Button>
                  <Button size="sm" onClick={handleConfirm} className="gap-1.5 flex-1">
                    <ArrowRight className="w-3.5 h-3.5" />
                    Importa nel report
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP: Done ── */}
            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <p className="font-heading font-extrabold text-lg text-green-800 mb-1">Importazione completata!</p>
                <p className="text-sm text-muted-foreground mb-6">
                  {parsed?.importedFields.length} campi importati con successo. Il report è stato aggiornato automaticamente.
                </p>
                <Button onClick={onClose}>Chiudi</Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}