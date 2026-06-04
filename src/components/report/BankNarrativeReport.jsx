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

      {/* Narrative output — documento A4 da stampa */}
      {narrative && expanded && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-100 px-6 py-8"
        >
          {/* Foglio A4 */}
          <div
            id="bank-narrative-content"
            className="bg-white mx-auto shadow-xl"
            style={{ maxWidth: '210mm', minHeight: '297mm', padding: '20mm 22mm', fontFamily: 'Georgia, "Times New Roman", serif', color: '#1a1a1a', lineHeight: 1.7 }}
          >
            {/* Intestazione documento */}
            <div style={{ borderBottom: '2px solid #1a1a1a', paddingBottom: '10mm', marginBottom: '8mm' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '8pt', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666', marginBottom: '3mm' }}>
                    Relazione di Sostenibilità — Standard VSME EFRAG 2024
                  </p>
                  <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>{report.name}</h1>
                  <p style={{ fontSize: '10pt', color: '#444', marginTop: '2mm' }}>
                    Esercizio {report.year} · Predisposta ai sensi EBA/GL/2020/06
                  </p>
                </div>
                <div style={{ textAlign: 'right', minWidth: '40mm' }}>
                  <div style={{ border: `2px solid ${ratingCfg.color}`, borderRadius: '6px', padding: '3mm 5mm', display: 'inline-block' }}>
                    <p style={{ fontSize: '7pt', textTransform: 'uppercase', letterSpacing: '0.1em', color: ratingCfg.color, margin: 0 }}>ESG Score</p>
                    <p style={{ fontSize: '22pt', fontWeight: 'bold', color: ratingCfg.color, margin: 0, lineHeight: 1 }}>{esg.tot}</p>
                    <p style={{ fontSize: '8pt', color: ratingCfg.color, margin: 0 }}>{ratingCfg.label}</p>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '8pt', color: '#888', marginTop: '4mm', marginBottom: 0 }}>
                Data di emissione: {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Corpo del documento — sezioni */}
            {sections.length > 0 ? (
              <div>
                {sections.map((section, idx) => {
                  const lines = section.trim().split('\n');
                  const rawTitle = lines[0] || '';
                  const title = rawTitle.replace(/^\d+\.\s*/, '');
                  const body = lines.slice(1).join('\n').trim();
                  return (
                    <div key={idx} style={{ marginBottom: '8mm' }}>
                      <h2 style={{
                        fontSize: '10pt',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        borderLeft: '3px solid #1a1a1a',
                        paddingLeft: '4mm',
                        marginBottom: '3mm',
                        marginTop: idx === 0 ? 0 : '6mm',
                        color: '#1a1a1a',
                      }}>
                        {idx + 1}. {title}
                      </h2>
                      <p style={{ fontSize: '10pt', textAlign: 'justify', whiteSpace: 'pre-line', margin: 0, color: '#222' }}>
                        {body}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '10pt', textAlign: 'justify', whiteSpace: 'pre-line' }}>{narrative}</p>
            )}

            {/* Blocco firma */}
            <div style={{ borderTop: '1px solid #ccc', marginTop: '14mm', paddingTop: '8mm' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20mm' }}>
                <div>
                  <p style={{ fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '10mm' }}>Luogo e Data</p>
                  <div style={{ borderBottom: '1px solid #999', paddingBottom: '15mm' }} />
                </div>
                <div>
                  <p style={{ fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '10mm' }}>Firma del Legale Rappresentante</p>
                  <div style={{ borderBottom: '1px solid #999', paddingBottom: '15mm' }} />
                </div>
              </div>
              <p style={{ fontSize: '7pt', color: '#bbb', marginTop: '6mm', textAlign: 'center' }}>
                Documento generato da VSME Builder · AI-assisted · Standard EFRAG 2024 · EBA/GL/2020/06
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}