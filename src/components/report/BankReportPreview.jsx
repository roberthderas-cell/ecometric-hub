import { motion } from 'framer-motion';

const ratingConfig = {
  Leader:        { color: '#059669', label: '🏆 Leader',        bg: '#f0fdf4', border: '#86efac' },
  Avanzato:      { color: '#2563EB', label: '⭐ Avanzato',       bg: '#eff6ff', border: '#93c5fd' },
  Buono:         { color: '#0891B2', label: '✅ Buono',          bg: '#ecfeff', border: '#67e8f9' },
  'In crescita': { color: '#D97706', label: '📈 In crescita',   bg: '#fffbeb', border: '#fcd34d' },
  Base:          { color: '#9CA3AF', label: '🌱 Base',           bg: '#f9fafb', border: '#d1d5db' },
};

function Section({ num, title, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-green-100">
        <span className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-extrabold flex items-center justify-center shrink-0">{num}</span>
        <h2 className="font-heading text-base font-extrabold text-foreground uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className={`flex items-start justify-between py-2 px-3 rounded-lg mb-1 ${highlight ? 'bg-green-50' : 'odd:bg-muted/30'}`}>
      <span className="text-xs text-muted-foreground w-56 shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-right ${highlight ? 'text-green-700' : 'text-foreground'}`}>{value || '—'}</span>
    </div>
  );
}

function ScoreBadge({ label, value, color }) {
  return (
    <div className="rounded-xl border p-4 text-center" style={{ borderColor: color + '40', background: color + '10' }}>
      <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color }}>{label}</p>
      <p className="font-heading text-3xl font-extrabold" style={{ color }}>{value}</p>
      <p className="text-[10px] text-muted-foreground">/ 100</p>
    </div>
  );
}

export default function BankReportPreview({ report, metrics }) {
  const { g, w, wa, p, esg, data } = metrics;
  const ana = data?.ana || {};
  const gov = data?.gov || {};
  const pe  = data?.pe  || {};
  const ratingCfg = ratingConfig[esg.rating] || ratingConfig.Base;
  const today = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div id="bank-report-content" className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">

      {/* Cover */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-10 py-12 text-white">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-2">RELAZIONE DI SOSTENIBILITÀ</p>
            <h1 className="font-heading text-3xl font-extrabold leading-tight mb-1">{report.name}</h1>
            <p className="text-white/50 text-sm">Anno di riferimento: <strong className="text-white">{report.year}</strong></p>
          </div>
          <div className="text-right">
            <div className="inline-block rounded-2xl px-5 py-3 text-center" style={{ background: ratingCfg.bg, border: `2px solid ${ratingCfg.border}` }}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: ratingCfg.color }}>ESG Score</p>
              <p className="font-heading text-4xl font-extrabold" style={{ color: ratingCfg.color }}>{esg.tot}</p>
              <p className="text-[10px] font-bold mt-1" style={{ color: ratingCfg.color }}>{ratingCfg.label}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[['E — Ambiente', esg.E, '#059669'], ['S — Sociale', esg.S, '#2563EB'], ['G — Governance', esg.G, '#7C3AED']].map(([l, v, c]) => (
            <div key={l} className="bg-white/8 rounded-xl px-4 py-3 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wide opacity-60 mb-1">{l}</p>
              <p className="font-heading text-2xl font-extrabold" style={{ color: c }}>{v}<span className="text-xs text-white/30">/100</span></p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-white/30">
          <span>Redatta secondo lo standard VSME — EFRAG 2024</span>
          <span>Data: {today}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-10 py-10">

        {/* 1. Dati Anagrafici */}
        <Section num="1" title="Dati dell'Impresa">
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <Row label="Ragione sociale" value={ana.ragione} highlight />
              <Row label="Forma giuridica" value={ana.forma} />
              <Row label="Codice ATECO" value={ana.ateco} />
              <Row label="Sede principale" value={ana.sede} />
              <Row label="Paesi di operatività" value={ana.paesi} />
            </div>
            <div>
              <Row label="Anno di riferimento" value={report.year} />
              <Row label="Fatturato (€)" value={ana.fatturato ? `€ ${Number(ana.fatturato).toLocaleString('it-IT')}` : '—'} />
              <Row label="Totale attivo (€)" value={ana.attivo ? `€ ${Number(ana.attivo).toLocaleString('it-IT')}` : '—'} />
              <Row label="Dipendenti (FTE)" value={pe.fte || ana.fte} />
              <Row label="Dipendenti (headcount)" value={pe.hc || ana.hc} />
            </div>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-muted/30 text-xs text-muted-foreground">
            <strong>Modulo VSME applicato:</strong> {report.module === 'comprehensive' ? 'Modulo Completo (PMI con obbligo di rendicontazione)' : 'Modulo Base (PMI volontario)'}
            {' · '} <strong>Perimetro:</strong> {ana.perimetro === 'consolidato' ? 'Consolidato' : 'Individuale'}
          </div>
        </Section>

        {/* 2. Score ESG */}
        <Section num="2" title="Risultati ESG — Sintesi per la Banca">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="col-span-1 rounded-xl border-2 p-4 text-center" style={{ borderColor: ratingCfg.color + '50', background: ratingCfg.bg }}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: ratingCfg.color }}>Score Totale</p>
              <p className="font-heading text-5xl font-extrabold leading-none" style={{ color: ratingCfg.color }}>{esg.tot}</p>
              <p className="text-[10px] mt-1" style={{ color: ratingCfg.color }}>{ratingCfg.label}</p>
            </div>
            <ScoreBadge label="Ambiente (E)" value={esg.E} color="#059669" />
            <ScoreBadge label="Sociale (S)" value={esg.S} color="#2563EB" />
            <ScoreBadge label="Governance (G)" value={esg.G} color="#7C3AED" />
          </div>
          <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-xs text-green-800">
            <strong>Nota interpretativa:</strong> Il punteggio ESG è calcolato secondo la metodologia VSME EFRAG 2024. Un punteggio superiore a 55 indica una gestione sostenibile adeguata per le soglie di valutazione del rischio ESG bancario (EBA Guidelines on ESG Risk, 2025).
          </div>
        </Section>

        {/* 3. Ambiente */}
        <Section num="3" title="Indicatori Ambientali (E)">
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Emissioni GHG</p>
              <Row label="Emissioni Scope 1 (tCO₂eq)" value={g.s1.toFixed(3)} />
              <Row label="Emissioni Scope 2 location-based (tCO₂eq)" value={g.s2LB.toFixed(3)} />
              <Row label="Totale Scope 1+2 (tCO₂eq)" value={g.tot.toFixed(3)} highlight />
              <Row label="Intensità GHG (tCO₂eq/M€ fatturato)" value={g.intensity > 0 ? g.intensity.toFixed(2) : '—'} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Energia & Risorse</p>
              <Row label="Consumo energetico totale (MWh)" value={(g.totKwh / 1000).toFixed(2)} />
              <Row label="Quota energia rinnovabile (%)" value={g.pRen.toFixed(1) + '%'} highlight />
              <Row label="Prelievi idrici totali (m³)" value={wa.tot.toFixed(0)} />
              <Row label="Acqua in aree stress idrico (m³)" value={wa.high.toFixed(0)} />
              <Row label="Rifiuti totali (t)" value={w.tot.toFixed(3)} />
              <Row label="% Rifiuti avviati a recupero" value={w.pRec.toFixed(1) + '%'} highlight />
            </div>
          </div>
        </Section>

        {/* 4. Sociale */}
        <Section num="4" title="Indicatori Sociali (S)">
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Forza Lavoro</p>
              <Row label="Headcount totale" value={pe.hc} />
              <Row label="Di cui donne" value={pe.donne} />
              <Row label="% Donne sul totale" value={pe.hc && pe.donne ? ((pe.donne / pe.hc) * 100).toFixed(1) + '%' : '—'} highlight />
              <Row label="Contratti a tempo indeterminato" value={pe.indet} />
              <Row label="Lavoratori con disabilità" value={pe.disab} />
              <Row label="CCNL applicato" value={pe.ccnl} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Salute, Sicurezza & Formazione</p>
              <Row label="Infortuni sul lavoro (n.)" value={pe.infort} />
              <Row label="Indice di frequenza infortuni" value={p.IF} highlight />
              <Row label="Giornate perse per infortuni" value={pe.ggPersi} />
              <Row label="Ore di formazione pro capite" value={pe.oreForm} />
              <Row label="Gender Pay Gap (%)" value={p.gpg + '%'} />
              <Row label="Retribuzione media (€)" value={pe.retMedia ? `€ ${Number(pe.retMedia).toLocaleString('it-IT')}` : '—'} />
            </div>
          </div>
        </Section>

        {/* 5. Governance */}
        <Section num="5" title="Struttura di Governance (G)">
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Organo di Gestione</p>
              <Row label="Composizione CDA" value={gov.compCDA} />
              <Row label="Componenti donne nel CDA" value={gov.donneCDA} />
              <Row label="Condanne rilevanti (n.)" value={gov.cond || '0'} />
              <Row label="Sanzioni significative (n.)" value={gov.san || '0'} />
              <Row label="Tempi medi di pagamento (gg)" value={gov.tempiPag} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Presidi e Certificazioni</p>
              {[
                ['Codice Etico adottato', gov.codEtico === 'si'],
                ['Modello Organizzativo 231', gov.mog231 === 'si'],
                ['Sistema ISO 45001 (Sicurezza)', gov.iso45001 === 'si'],
                ['Sistema ISO 14001 (Ambiente)', gov.iso14001 === 'si'],
                ['Certificazione SA8000', gov.sa8000 === 'si'],
                ['Policy Parità di Genere', gov.pariGen === 'si'],
                ['Canale di Whistleblowing', gov.wb === 'si'],
                ['Responsabile ESG interno', gov.rESG === 'si'],
              ].map(([label, val]) => (
                <Row key={label} label={label} value={val ? '✅ Sì' : '— No'} highlight={val} />
              ))}
            </div>
          </div>
        </Section>

        {/* 6. Dichiarazione */}
        <Section num="6" title="Dichiarazione del Legale Rappresentante">
          <div className="p-5 rounded-xl border border-border bg-muted/20 text-xs text-foreground leading-relaxed space-y-2">
            <p>Il/la sottoscritto/a, nella qualità di legale rappresentante di <strong>{ana.ragione || '[Ragione Sociale]'}</strong>, dichiara sotto la propria responsabilità che le informazioni contenute nella presente Relazione di Sostenibilità sono veritiere, complete e conformi allo standard <strong>VSME — EFRAG 2024</strong>.</p>
            <p>I dati ambientali, sociali e di governance riportati sono stati elaborati con riferimento all'anno <strong>{report.year}</strong>, con perimetro di rendicontazione <strong>{ana.perimetro === 'consolidato' ? 'consolidato' : 'individuale'}</strong>.</p>
            <p>La presente relazione è predisposta ai fini della valutazione del merito creditizio ESG da parte degli istituti di credito, in conformità alle linee guida EBA sull'integrazione dei rischi ESG nei processi di concessione del credito (EBA/GL/2020/06 e successive revisioni).</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Luogo e data</p>
              <div className="border-b border-dashed border-border pb-6 pt-2" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Firma del Legale Rappresentante</p>
              <div className="border-b border-dashed border-border pb-6 pt-2" />
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div className="pt-4 border-t border-border text-[10px] text-muted-foreground flex items-center justify-between">
          <span>Documento generato da VSME Builder — Standard EFRAG 2024</span>
          <span>{today}</span>
        </div>
      </div>
    </div>
  );
}