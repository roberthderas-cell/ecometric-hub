import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, FileText, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ratingConfig = {
  Leader:        { color: '#059669', label: 'Leader' },
  Avanzato:      { color: '#2563EB', label: 'Avanzato' },
  Buono:         { color: '#0891B2', label: 'Buono' },
  'In crescita': { color: '#D97706', label: 'In crescita' },
  Base:          { color: '#9CA3AF', label: 'Base' },
};

function buildPrompt({ report, metrics }) {
  const { g, w, wa, p, esg, data } = metrics;
  const ana = data?.ana || {};
  const gov = data?.gov || {};
  const pe  = data?.pe  || {};

  const govItems = [
    gov.codEtico === 'si' && 'Codice Etico',
    gov.mog231 === 'si' && 'Modello Organizzativo 231',
    gov.iso45001 === 'si' && 'ISO 45001 (Sicurezza)',
    gov.iso14001 === 'si' && 'ISO 14001 (Ambiente)',
    gov.sa8000 === 'si' && 'SA8000',
    gov.pariGen === 'si' && 'Policy Parità di Genere',
    gov.wb === 'si' && 'Canale Whistleblowing',
    gov.rESG === 'si' && 'Responsabile ESG interno',
  ].filter(Boolean);

  return `Sei un consulente ESG senior. Redigi una RELAZIONE TECNICA DI SOSTENIBILITÀ in italiano, formale e professionale, da allegare a una domanda di credito bancario. 
Il documento deve seguire esattamente questa struttura con sezioni numerate e titoli in maiuscolo. Ogni sezione deve essere sostanziosa (3-6 frasi), con riferimenti precisi ai dati forniti.

DATI AZIENDALI:
- Ragione sociale: ${ana.ragione || 'Non specificata'}
- Forma giuridica: ${ana.forma || '—'}
- Codice ATECO: ${ana.ateco || '—'}
- Sede: ${ana.sede || '—'}
- Fatturato (€): ${ana.fatturato ? Number(ana.fatturato).toLocaleString('it-IT') : '—'}
- Attivo (€): ${ana.attivo ? Number(ana.attivo).toLocaleString('it-IT') : '—'}
- Dipendenti (HC): ${pe.hc || ana.hc || '—'}
- Anno di riferimento: ${report.year}
- Modulo VSME: ${report.module === 'comprehensive' ? 'Completo' : 'Base'}
- Perimetro: ${ana.perimetro || 'individuale'}

DATI ESG:
- Score ESG totale: ${esg.tot}/100 (Rating: ${esg.rating})
- Score E (Ambiente): ${esg.E}/100
- Score S (Sociale): ${esg.S}/100
- Score G (Governance): ${esg.G}/100

DATI AMBIENTALI:
- Emissioni Scope 1: ${g.s1.toFixed(2)} tCO₂eq
- Emissioni Scope 2 (location): ${g.s2LB.toFixed(2)} tCO₂eq
- Totale Scope 1+2: ${g.tot.toFixed(2)} tCO₂eq
- Intensità GHG: ${g.intensity > 0 ? g.intensity.toFixed(2) + ' tCO₂eq/M€' : 'n.d.'}
- Energia totale: ${(g.totKwh / 1000).toFixed(1)} MWh
- % Rinnovabile: ${g.pRen.toFixed(1)}%
- Prelievi idrici: ${wa.tot.toFixed(0)} m³
- Rifiuti totali: ${w.tot.toFixed(2)} t
- % Recupero rifiuti: ${w.pRec.toFixed(1)}%

DATI SOCIALI:
- Dipendenti totali: ${pe.hc || '—'}
- % Donne: ${pe.hc && pe.donne ? ((pe.donne / pe.hc) * 100).toFixed(1) + '%' : '—'}
- Infortuni: ${pe.infort || 0}
- Indice frequenza infortuni: ${p.IF}
- Ore formazione pro capite: ${pe.oreForm || '—'}
- Gender Pay Gap: ${p.gpg}%
- CCNL applicato: ${pe.ccnl || '—'}

GOVERNANCE:
- Presidi adottati: ${govItems.length > 0 ? govItems.join(', ') : 'In fase di implementazione'}
- Condanne/procedimenti: ${gov.cond || 0}
- Tempi medi pagamento: ${gov.tempiPag || '—'} giorni

BENCHMARK EBA: La soglia EBA/GL/2020/06 per adeguata gestione del rischio ESG è 55/100. L'azienda ha ottenuto ${esg.tot}/100.

STRUTTURA RICHIESTA:

1. PRESENTAZIONE DELL'IMPRESA E CONTESTO DI RENDICONTAZIONE
[Descrivi l'impresa, settore, dimensione, perimetro e standard VSME adottato]

2. RISULTATI ESG COMPLESSIVI E POSIZIONAMENTO
[Illustra il punteggio ESG totale, il rating, il confronto con la soglia EBA e il significato per la valutazione del rischio creditizio]

3. PERFORMANCE AMBIENTALE — EMISSIONI, ENERGIA E RISORSE
[Analizza le emissioni GHG Scope 1+2, il mix energetico, l'efficienza idrica e la gestione dei rifiuti. Cita i dati specifici]

4. PERFORMANCE SOCIALE — FORZA LAVORO E SICUREZZA
[Descrivi la composizione della forza lavoro, parità di genere, sicurezza sul lavoro e formazione. Cita i dati specifici]

5. STRUTTURA DI GOVERNANCE E PRESIDI ADOTTATI
[Illustra i presidi di governance, certificazioni, composizione CDA e conformità normativa]

6. ANALISI DEI RISCHI ESG E AREE DI MIGLIORAMENTO
[Identifica le principali aree di rischio ESG e i piani di intervento per il miglioramento]

7. CONCLUSIONI E RILEVANZA PER LA VALUTAZIONE DEL MERITO CREDITIZIO
[Concludi con una sintesi professionale che evidenzi il profilo ESG dell'impresa ai fini del credito bancario, facendo riferimento alle linee guida EBA]

Usa un tono formale, tecnico e professionale. Cita sempre i dati numerici specifici. Non usare bullet point nelle sezioni, solo prosa continua. Scrivi interamente in italiano.`;
}

export default function BankNarrativeReport({ report, metrics }) {
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const esg = metrics?.esg || {};
  const ratingCfg = ratingConfig[esg.rating] || ratingConfig.Base;

  const generate = async () => {
    setLoading(true);
    setNarrative('');
    try {
      const prompt = buildPrompt({ report, metrics });
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'claude_sonnet_4_6',
      });
      setNarrative(typeof result === 'string' ? result : result?.text || result?.content || JSON.stringify(result));
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(narrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse sections from narrative
  const sections = narrative
    ? narrative.split(/\n(?=\d+\.\s+[A-ZÀÈÉÌÒÙ])/).filter(Boolean)
    : [];

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-extrabold text-white">Relazione Tecnica AI — Pronta per la Banca</h2>
            <p className="text-white/45 text-xs">Documento formale generato da AI · Standard VSME EFRAG 2024 · EBA/GL/2020/06</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {narrative && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-white/60 hover:text-white hover:bg-white/10 gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiato!' : 'Copia testo'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(e => !e)}
                className="text-white/60 hover:text-white hover:bg-white/10 gap-1.5"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expanded ? 'Comprimi' : 'Espandi'}
              </Button>
            </>
          )}
          <Button
            onClick={generate}
            disabled={loading || !report || !metrics}
            className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-900 font-extrabold gap-2 hover:scale-105 transition-all shadow-lg"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generazione in corso...</>
              : <><Sparkles className="w-4 h-4" /> {narrative ? 'Rigenera' : 'Genera Relazione AI'}</>}
          </Button>
        </div>
      </div>

      {/* Score banner */}
      {!narrative && !loading && (
        <div className="px-8 py-6 border-b border-border">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border-2 flex items-center justify-center font-heading text-2xl font-extrabold" style={{ borderColor: ratingCfg.color + '60', color: ratingCfg.color, background: ratingCfg.color + '10' }}>
                {esg.tot}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">ESG Score</p>
                <p className="font-bold text-sm" style={{ color: ratingCfg.color }}>{ratingCfg.label}</p>
              </div>
            </div>
            <div className="flex gap-4 text-center">
              {[['E', esg.E, '#059669'], ['S', esg.S, '#2563EB'], ['G', esg.G, '#7C3AED']].map(([k, v, c]) => (
                <div key={k} className="w-12">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">{k}</p>
                  <p className="font-heading text-xl font-extrabold" style={{ color: c }}>{v}</p>
                </div>
              ))}
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm text-muted-foreground">
                Clicca <strong className="text-foreground">Genera Relazione AI</strong> per ottenere un documento tecnico professionale in 7 sezioni, pronto da allegare alla domanda di credito bancario.
              </p>
              <p className="text-[11px] text-amber-600 mt-1">⚠️ Usa crediti AI avanzati (Claude Sonnet) per una qualità professionale ottimale.</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="px-8 py-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-amber-100 border-t-amber-400 animate-spin" />
            <FileText className="absolute inset-0 m-auto w-7 h-7 text-amber-400" />
          </div>
          <div>
            <p className="font-bold text-foreground">Generazione relazione tecnica in corso...</p>
            <p className="text-sm text-muted-foreground mt-1">L'AI sta analizzando tutti i dati ESG e redigendo il documento professionale</p>
            <p className="text-xs text-muted-foreground mt-0.5">Operazione richiede circa 15–30 secondi</p>
          </div>
          <div className="flex gap-2 mt-2">
            {['Analisi dati ESG', 'Calcolo benchmark EBA', 'Redazione sezioni', 'Revisione formale'].map((step, i) => (
              <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>{step}</span>
            ))}
          </div>
        </div>
      )}

      {/* Narrative output */}
      <AnimatePresence>
        {narrative && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div id="bank-narrative-content" className="px-8 py-8">
              {/* Document header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2">RELAZIONE DI SOSTENIBILITÀ</p>
                <h1 className="font-heading text-2xl font-extrabold text-slate-900 mb-1">{report.name}</h1>
                <p className="text-sm text-slate-500">Anno {report.year} · Standard VSME EFRAG 2024 · Predisposta ai sensi EBA/GL/2020/06</p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold border" style={{ color: ratingCfg.color, borderColor: ratingCfg.color + '40', background: ratingCfg.color + '10' }}>
                    ESG Score: {esg.tot}/100 · {ratingCfg.label}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border border-slate-200 text-slate-600 bg-slate-50">
                    {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Sections */}
              {sections.length > 0 ? (
                <div className="space-y-7">
                  {sections.map((section, idx) => {
                    const lines = section.trim().split('\n');
                    const title = lines[0] || '';
                    const body = lines.slice(1).join('\n').trim();
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="prose-section"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className="w-6 h-6 rounded-md bg-slate-900 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                          <h3 className="font-heading text-sm font-extrabold text-slate-800 uppercase tracking-wide leading-snug">
                            {title.replace(/^\d+\.\s*/, '')}
                          </h3>
                        </div>
                        <div className="ml-9 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          {body}
                        </div>
                        {idx < sections.length - 1 && <div className="mt-6 border-b border-slate-100" />}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{narrative}</div>
              )}

              {/* Signature block */}
              <div className="mt-10 pt-6 border-t-2 border-slate-100">
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">Luogo e Data</p>
                    <div className="border-b-2 border-dashed border-slate-200 pb-8 pt-1" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">Firma Legale Rappresentante</p>
                    <div className="border-b-2 border-dashed border-slate-200 pb-8 pt-1" />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between text-[10px] text-slate-300">
                  <span>Documento generato da VSME Builder · AI-assisted · Standard EFRAG 2024</span>
                  <span>{new Date().toLocaleDateString('it-IT')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}