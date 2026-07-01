import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Users, Database, Layers, CheckCircle2, Shield, Settings, Download } from 'lucide-react';

export default function Manuale() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportWord = async () => {
    try {
      setIsExporting(true);
      const res = await base44.functions.invoke('exportManualWord', {});
      if (res.data && res.data.base64) {
        const byteCharacters = atob(res.data.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Manuale_VSME_Builder.docx';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert('Errore: formato risposta non valido.');
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
              Manuale Utente VSME Builder
            </h1>
          </div>
          <Button onClick={handleExportWord} disabled={isExporting} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md">
            {isExporting ? <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full"/> : <Download className="w-4 h-4" />}
            Scarica in Word
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        
        {/* ── COVER ──────────────────────────────────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-green-900/10 border border-border"
        >
          <img src={images.cover} alt="Cover Manuale" className="w-full h-64 object-cover object-center" />
          <div className="bg-card p-8">
            <h2 className="font-heading text-3xl font-extrabold text-foreground mb-3">Introduzione alla piattaforma</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              La piattaforma definitiva per il reporting ESG dedicata alle PMI italiane. Basata sullo standard <strong>VSME</strong> (Voluntary Standard for SMEs) di EFRAG, integra le linee guida EFRAG 2026 e il framework di dialogo PMI-Banche sulla sostenibilità.
            </p>
          </div>
        </motion.div>

        {/* ── DESTINATARI ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-heading text-2xl font-bold">Destinatari e Utenti</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              {[
                { title: 'PMI e Imprese', desc: 'Aziende che devono o desiderano rendicontare la propria sostenibilità.' },
                { title: 'Consulenti e Commercialisti', desc: 'Professionisti che compilano e validano report per conto dei propri clienti.' },
                { title: 'Banche e Istituti', desc: 'Destinatari finali dei report (tramite la "Relazione per la Banca" ottimizzata).' },
                { title: 'Amministratori', desc: 'Management aziendale che monitora storici, KPI e benchmark di settore.' }
              ].map((item, i) => (
                <Card key={i} className="bg-card/50 hover:bg-card transition-colors">
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
              <img src={images.audience} alt="Ecosistema Utenti" className="w-full h-full object-cover" />
            </div>
          </div>
        </motion.div>

        {/* ── ARCHITETTURA & FONTI ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-heading text-2xl font-bold">Fonti Dati e Architettura</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg order-2 md:order-1">
              <img src={images.arch} alt="Architettura Software" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <div>
                <h4 className="font-bold text-foreground flex items-center gap-2 mb-2"><Layers className="w-4 h-4 text-primary" /> Moduli Dati</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  L'app struttura i dati in moduli specifici: Anagrafica e Taxonomy UE (B1/C1), Energia e GHG (B3), Acqua (B6), Rifiuti (B7), Inquinamento (B4), Biodiversità (B5), Personale (B8-B10) e Governance (C).
                </p>
              </div>
              <div>
                <h4 className="font-bold text-foreground flex items-center gap-2 mb-2"><Database className="w-4 h-4 text-primary" /> Integrazione Automatica</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I dati provengono da input manuali (guidati da tooltip EFRAG), import massivo Excel/CSV, estrazione AI da visura camerale, e API territoriali (clima, aria, rischio idrico).
                </p>
              </div>
              <div>
                <h4 className="font-bold text-foreground flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-primary" /> Riferimenti Normativi</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Standard EFRAG VSME/ESRS, framework Dialogo PMI-Banche (MEF), e D.Lgs. 152/2006 (gestione rifiuti ambientali).
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── FLUSSO DI UTILIZZO E DASHBOARD ─────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-heading text-2xl font-bold">Flusso d'Utilizzo e Score</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h4 className="font-heading font-bold text-lg mb-4">Come usare l'app</h4>
              <ol className="space-y-4 relative before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-muted">
                {[
                  "Onboarding: Inserisci i dati anagrafici e la visura.",
                  "Compilazione: Naviga le sezioni Ambiente, Sociale, Governance. I dati vengono validati live.",
                  "Dashboard: Analizza lo score ESG, gli alert e i benchmark in tempo reale.",
                  "Export: Genera la relazione in PDF per la banca o il tracciato XBRL."
                ].map((step, i) => (
                  <li key={i} className="relative pl-8 text-sm text-muted-foreground">
                    <span className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold ring-4 ring-background">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
              <img src={images.dashboard} alt="Dashboard ESG" className="w-full h-full object-cover" />
              <div className="p-4 bg-card">
                <h4 className="font-bold text-sm">Calcolo dello Score ESG</h4>
                <p className="text-xs text-muted-foreground mt-1">L'algoritmo calcola in locale un punteggio da 0 a 100 suddiviso per pilastri (E, S, G), generando un rating da "Base" a "Leader" aggiornato ad ogni input.</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}