import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, BookOpen, Download, ShieldCheck, Database, FileBarChart, 
  Layers, Target, Scale, Zap, Users2, Activity, Globe
} from 'lucide-react';

export default function Manuale() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const res = await base44.functions.invoke('exportManualPdf', {});
      if (res.data && res.data.base64) {
        const byteCharacters = atob(res.data.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Manuale_Dettagliato_VSME_Builder.pdf';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert('Errore: formato risposta non valido dal server.');
      }
    } catch (e) {
      console.error("Export error", e);
      alert("Errore durante l'esportazione: " + (e.response?.data?.error || e.message));
    } finally {
      setIsExporting(false);
    }
  };

  const images = {
    cover: 'https://media.base44.com/images/public/6a207a6e28a8f0aa0202cca9/28af46590_generated_image.png',
    arch: 'https://media.base44.com/images/public/6a207a6e28a8f0aa0202cca9/37718efe0_generated_image.png',
    dashboard: 'https://media.base44.com/images/public/6a207a6e28a8f0aa0202cca9/172864a38_generated_image.png',
    audience: 'https://media.base44.com/images/public/6a207a6e28a8f0aa0202cca9/ec2ee0aeb_generated_image.png',
  };

  return (
    <div className="min-h-screen bg-background pb-20 font-body">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Manuale Dettagliato VSME Builder
            </h1>
          </div>
          <Button onClick={handleExportPdf} disabled={isExporting} className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-md font-bold px-5">
            {isExporting ? <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full"/> : <Download className="w-4 h-4" />}
            Esporta Manuale in PDF
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-16">
        
        {/* ── COVER & INTRO ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl overflow-hidden shadow-2xl shadow-green-900/10 border border-border">
          <img src={images.cover} alt="Cover Manuale" className="w-full h-64 object-cover object-center" />
          <div className="bg-card p-8 md:p-10">
            <h2 className="font-heading text-3xl font-extrabold text-foreground mb-4">1. Il Framework EFRAG e lo Standard VSME</h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-6">
              L'applicazione è la piattaforma definitiva per il reporting ESG dedicata alle PMI italiane, costruita nativamente sullo standard <strong>VSME (Voluntary Standard for SMEs)</strong> redatto dall'EFRAG (European Financial Reporting Advisory Group). 
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Il suo scopo è semplificare e automatizzare la raccolta dati, garantendo la conformità alle direttive europee (CSRD) e supportando le aziende nella transizione sostenibile attraverso un'interfaccia guidata, algoritmi di validazione e output pronti per banche e stakeholder.
            </p>
          </div>
        </motion.div>

        {/* ── DESTINATARI ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-heading text-2xl font-bold">2. Destinatari e Casi d'Uso</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Card className="bg-card/50 hover:bg-card transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground text-sm">PMI (Micro, Piccole e Medie)</h4>
                    <p className="text-xs text-muted-foreground mt-1">Per auto-valutare le proprie performance ESG, accedere a linee di credito agevolate e qualificarsi come fornitori sostenibili per le grandi aziende soggette a CSRD.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 hover:bg-card transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground text-sm">Consulenti e Commercialisti</h4>
                    <p className="text-xs text-muted-foreground mt-1">Per gestire un portafoglio clienti tramite la multi-site dashboard, redigere bilanci di sostenibilità in conformità e ridurre i tempi di validazione dei dati.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 hover:bg-card transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                  <Scale className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground text-sm">Banche e Istituti Finanziari</h4>
                    <p className="text-xs text-muted-foreground mt-1">Fruitori finali dei dati tramite la "Relazione PMI-Banche", essenziale per l'erogazione di finanza green in conformità alle direttive EBA (European Banking Authority).</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
              <img src={images.audience} alt="Ecosistema Utenti" className="w-full h-full object-cover" />
            </div>
          </div>
        </motion.div>

        {/* ── STRUTTURA DEI MODULI ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-heading text-2xl font-bold">3. I Moduli di Rendicontazione VSME</h3>
          </div>
          <p className="text-muted-foreground mb-6">
            Il sistema guida l'utente attraverso il Modulo Base e le estensioni avanzate, garantendo una copertura totale degli indicatori ESG richiesti dalle normative.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'B1/C1', title: 'Anagrafica & Taxonomy', desc: 'Classificazione dimensionale (FTE, fatturato) e allineamento alla Tassonomia UE per ricavi e CapEx.' },
              { id: 'B3', title: 'Energia ed Emissioni', desc: 'Calcolo automatico GHG Scope 1, 2 (Location/Market based) e Scope 3, mix rinnovabile e intensità.' },
              { id: 'B6', title: 'Acqua e Risorse Idriche', desc: 'Prelievi, scarichi e stress idrico localizzato tramite integrazione API geografiche.' },
              { id: 'B7', title: 'Gestione Rifiuti', desc: 'Mappatura CER, rifiuti pericolosi, e percentuali di riciclo/recupero vs smaltimento.' },
              { id: 'B4/B5', title: 'Inquinamento & Natura', desc: 'Aspetti ambientali, inventario inquinanti e prossimità a siti Natura 2000 (mappa interattiva).' },
              { id: 'B8-10', title: 'Sociale (Forza Lavoro)', desc: 'Diversità, pay-gap, infortuni, salute e sicurezza, ore di formazione medie.' },
              { id: 'C', title: 'Governance & Etica', desc: 'Composizione CdA, indipendenza, policy anticorruzione, e certificazioni aziendali ISO.' }
            ].map(mod => (
              <div key={mod.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all">
                <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md mb-2">{mod.id}</span>
                <h4 className="font-bold text-sm mb-1">{mod.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── ARCHITETTURA E DATI ────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-heading text-2xl font-bold">4. Fonti Dati, AI e Architettura</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg order-2 md:order-1">
              <img src={images.arch} alt="Architettura Software" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <div>
                <h4 className="font-bold text-foreground flex items-center gap-2 mb-2"><Globe className="w-4 h-4 text-primary" /> Integrazione API e Visure</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  L'app azzera il data-entry manuale permettendo l'upload della Visura Camerale: l'Intelligenza Artificiale estrae ATECO, ragione sociale e dipendenti. Le API territoriali arricchiscono il profilo aziendale con dati su clima, qualità dell'aria (PM2.5) e stress idrico della zona.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-foreground flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-primary" /> Data Quality e Anomalie</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Il motore <span className="font-mono text-xs">AnomalyDetector</span> esegue controlli di congruenza in background: verifica salti anno-su-anno, controlla la coerenza matematica (es. dipendenti vs ore lavorate) e valida l'intensità energetica per evitare greenwashing involontario.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── ESPORTAZIONE E OUTPUT ──────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <FileBarChart className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="font-heading text-2xl font-bold">5. Score ESG ed Esportazione</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h4 className="font-heading font-bold text-lg mb-4 text-primary flex items-center gap-2"><Zap className="w-5 h-5"/> Motore di Scoring</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Il punteggio ESG (0-100) viene ricalcolato live ad ogni input, aggregando i pilastri Ambiente (peso maggiore in manifattura), Sociale e Governance. Genera un Rating formale e fornisce un'area "AI Coach" con raccomandazioni per incrementare i punteggi più deboli.
              </p>
              <h4 className="font-heading font-bold text-lg mb-4 text-primary flex items-center gap-2 mt-8"><Download className="w-5 h-5"/> Gli Output Ufficiali</h4>
              <ul className="space-y-3">
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span><strong>Relazione PMI-Banche (PDF):</strong> Formattata secondo il questionario ABI/MEF per agevolare l'accesso ai finanziamenti.</span>
                </li>
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span><strong>Tracciato EFRAG (Excel):</strong> Export grezzo con <em>named-ranges</em> predisposto per l'ingestione nei software di conversione ufficiale iXBRL richiesti dalla CSRD.</span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
              <img src={images.dashboard} alt="Dashboard ESG" className="w-full h-full object-cover" />
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}