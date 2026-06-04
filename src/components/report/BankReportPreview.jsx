import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts';

const ratingConfig = {
  Leader:        { color: '#059669', label: '🏆 Leader',       bg: '#f0fdf4', border: '#86efac' },
  Avanzato:      { color: '#2563EB', label: '⭐ Avanzato',      bg: '#eff6ff', border: '#93c5fd' },
  Buono:         { color: '#0891B2', label: '✅ Buono',         bg: '#ecfeff', border: '#67e8f9' },
  'In crescita': { color: '#D97706', label: '📈 In crescita',  bg: '#fffbeb', border: '#fcd34d' },
  Base:          { color: '#9CA3AF', label: '🌱 Base',          bg: '#f9fafb', border: '#d1d5db' },
};

function Section({ num, title, children }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5 pb-2 border-b-2 border-green-100">
        <span className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-extrabold flex items-center justify-center shrink-0">{num}</span>
        <h2 className="font-heading text-base font-extrabold text-foreground uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className={`flex items-start justify-between py-2 px-3 rounded-lg mb-1 ${highlight ? 'bg-green-50' : 'bg-slate-50/60'}`}>
      <span className="text-xs text-muted-foreground w-56 shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-right ${highlight ? 'text-green-700' : 'text-foreground'}`}>{value || '—'}</span>
    </div>
  );
}

function ScoreBadge({ label, value, color }) {
  return (
    <div className="rounded-xl border p-4 text-center" style={{ borderColor: color + '40', background: color + '08' }}>
      <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color }}>{label}</p>
      <p className="font-heading text-3xl font-extrabold" style={{ color }}>{value}</p>
      <p className="text-[10px] text-muted-foreground">/ 100</p>
      <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function ChartCard({ title, children, note }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-3">{title}</p>
      {children}
      {note && <p className="text-[10px] text-muted-foreground mt-2 italic">{note}</p>}
    </div>
  );
}

function InfoBox({ color = 'green', children }) {
  const styles = {
    green: 'border-green-200 bg-green-50 text-green-800',
    blue:  'border-blue-200 bg-blue-50 text-blue-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  };
  return (
    <div className={`p-4 rounded-xl border text-xs leading-relaxed ${styles[color]}`}>
      {children}
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

  // ── CHART DATA ──────────────────────────────────────────────

  const radarData = [
    { area: 'Energia Rinnovabile', val: Math.min(100, g.pRen * 2.5) },
    { area: 'GHG Intensity', val: Math.min(100, g.intensity > 0 ? Math.max(0, 100 - g.intensity / 3) : 80) },
    { area: 'Recupero Rifiuti', val: w.pRec },
    { area: 'Parità di Genere', val: pe.hc > 0 ? Math.min(100, (pe.donne / pe.hc) * 200) : 30 },
    { area: 'Sicurezza', val: Math.min(100, Math.max(0, 100 - (parseFloat(p.IF) || 0) * 3)) },
    { area: 'Governance', val: esg.G },
  ];

  const ghgData = [
    { name: 'Scope 1', value: parseFloat(g.s1.toFixed(2)), fill: '#f97316' },
    { name: 'Scope 2', value: parseFloat(g.s2LB.toFixed(2)), fill: '#fbbf24' },
    { name: 'Evitato FV', value: parseFloat(g.avoided.toFixed(2)), fill: '#34d399' },
  ].filter(d => d.value > 0);

  const energyData = [
    { name: 'Rete', kwh: parseFloat((((parseFloat(data?.en?.elReteN) || 0)) / 1000).toFixed(1)), fill: '#64748b' },
    { name: 'Fotovoltaico', kwh: parseFloat(((parseFloat(data?.en?.elFVN) || 0) / 1000).toFixed(1)), fill: '#10b981' },
    { name: 'Combustibili', kwh: parseFloat((g.fuelKwh / 1000).toFixed(1)), fill: '#f59e0b' },
  ].filter(d => d.kwh > 0);

  const wasteData = [
    { name: 'Recupero', value: parseFloat(w.rec.toFixed(2)), fill: '#10b981' },
    { name: 'Smaltimento', value: parseFloat(w.smal.toFixed(2)), fill: '#ef4444' },
    { name: 'Pericolosi', value: parseFloat(w.per.toFixed(2)), fill: '#f97316' },
  ].filter(d => d.value > 0);

  const genderData = pe.hc > 0
    ? [
        { name: 'Donne', value: parseInt(pe.donne) || 0, fill: '#8b5cf6' },
        { name: 'Uomini', value: parseInt(pe.uomini) || (parseInt(pe.hc) - parseInt(pe.donne)) || 0, fill: '#3b82f6' },
      ]
    : [];

  const esgBarData = [
    { name: 'E — Ambiente', score: esg.E, fill: '#059669' },
    { name: 'S — Sociale', score: esg.S, fill: '#2563EB' },
    { name: 'G — Governance', score: esg.G, fill: '#7C3AED' },
    { name: 'Score Totale', score: esg.tot, fill: '#0f172a' },
  ];

  const govItems = [
    ['Codice Etico', gov.codEtico === 'si'],
    ['MOG 231', gov.mog231 === 'si'],
    ['ISO 45001', gov.iso45001 === 'si'],
    ['ISO 14001', gov.iso14001 === 'si'],
    ['SA8000', gov.sa8000 === 'si'],
    ['Parità Genere', gov.pariGen === 'si'],
    ['Whistleblowing', gov.wb === 'si'],
    ['Resp. ESG', gov.rESG === 'si'],
  ];
  const govCount = govItems.filter(([,v]) => v).length;

  // ── RENDER ──────────────────────────────────────────────────
  return (
    <div id="bank-report-content" className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">

      {/* ── COVER ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-10 py-14 text-white">
        <div className="flex items-start justify-between mb-8 gap-6">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/35 mb-3">Relazione di Sostenibilità · VSME Standard EFRAG 2024</p>
            <h1 className="font-heading text-4xl font-extrabold leading-tight mb-2">{report.name}</h1>
            {ana.sede && <p className="text-white/50 text-sm mb-1">📍 {ana.sede}</p>}
            <p className="text-white/40 text-sm">Anno di riferimento: <strong className="text-white">{report.year}</strong>
              {ana.ateco && <> · ATECO <strong className="text-white">{ana.ateco}</strong></>}
            </p>
          </div>
          <div style={{ background: ratingCfg.bg, border: `2px solid ${ratingCfg.border}` }} className="rounded-2xl px-6 py-4 text-center shrink-0 min-w-[130px]">
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: ratingCfg.color }}>ESG Score</p>
            <p className="font-heading text-6xl font-extrabold leading-none" style={{ color: ratingCfg.color }}>{esg.tot}</p>
            <p className="text-xs font-bold mt-2" style={{ color: ratingCfg.color }}>{ratingCfg.label}</p>
          </div>
        </div>

        {/* E/S/G pills */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[['🌿 Ambiente (E)', esg.E, '#10b981'], ['👥 Sociale (S)', esg.S, '#3b82f6'], ['⚖️ Governance (G)', esg.G, '#8b5cf6']].map(([l, v, c]) => (
            <div key={l} className="bg-white/8 rounded-xl px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-wide text-white/50 mb-1">{l}</p>
              <div className="flex items-end gap-2">
                <p className="font-heading text-3xl font-extrabold" style={{ color: c }}>{v}</p>
                <p className="text-white/30 text-xs mb-1">/100</p>
              </div>
              <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${v}%`, backgroundColor: c }} />
              </div>
            </div>
          ))}
        </div>

        {/* Key metrics summary */}
        <div className="grid grid-cols-4 gap-3 pt-5 border-t border-white/10">
          {[
            { icon: '🏭', label: 'Scope 1+2', val: `${g.tot.toFixed(1)} tCO₂` },
            { icon: '☀️', label: '% Rinnovabile', val: `${g.pRen.toFixed(1)}%` },
            { icon: '♻️', label: '% Recupero', val: `${w.pRec.toFixed(1)}%` },
            { icon: '👤', label: 'Dipendenti', val: pe.hc || ana.hc || '—' },
          ].map(m => (
            <div key={m.label} className="text-center">
              <p className="text-lg mb-0.5">{m.icon}</p>
              <p className="font-heading text-lg font-extrabold text-white">{m.val}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-wide">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-white/25">
          <span>Preparata per istituti di credito · EBA ESG Risk Guidelines 2025</span>
          <span>Generata il {today}</span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="px-10 py-10">

        {/* 1. Anagrafica */}
        <Section num="1" title="Dati dell'Impresa">
          <div className="grid grid-cols-2 gap-x-8 gap-y-0 mb-3">
            <div>
              <Row label="Ragione sociale" value={ana.ragione} highlight />
              <Row label="Forma giuridica" value={ana.forma} />
              <Row label="Codice ATECO" value={ana.ateco} />
              <Row label="Sede principale" value={ana.sede} />
              <Row label="Paesi di operatività" value={ana.paesi} />
            </div>
            <div>
              <Row label="Fatturato (€)" value={ana.fatturato ? `€ ${Number(ana.fatturato).toLocaleString('it-IT')}` : '—'} highlight />
              <Row label="Totale attivo (€)" value={ana.attivo ? `€ ${Number(ana.attivo).toLocaleString('it-IT')}` : '—'} />
              <Row label="Dipendenti FTE" value={pe.fte || ana.fte} />
              <Row label="Dipendenti headcount" value={pe.hc || ana.hc} />
              <Row label="CCNL applicato" value={pe.ccnl} />
            </div>
          </div>
          <InfoBox color="slate">
            <strong>Modulo VSME:</strong> {report.module === 'comprehensive' ? 'Completo (PMI con obbligo)' : 'Base (volontario)'}
            &nbsp;·&nbsp;<strong>Perimetro:</strong> {ana.perimetro === 'consolidato' ? 'Consolidato' : 'Individuale'}
            {data?.b1?.omissioni && <><br/><strong>Omissioni materiali:</strong> {data.b1.omissioni}</>}
          </InfoBox>
        </Section>

        {/* 2. Risultati ESG + grafici principali */}
        <Section num="2" title="Sintesi ESG — Punteggi e Radar di Sostenibilità">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="col-span-1 rounded-xl border-2 p-5 text-center flex flex-col items-center justify-center" style={{ borderColor: ratingCfg.color + '60', background: ratingCfg.bg }}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: ratingCfg.color }}>Score Totale</p>
              <p className="font-heading text-6xl font-extrabold leading-none" style={{ color: ratingCfg.color }}>{esg.tot}</p>
              <p className="text-sm font-bold mt-2" style={{ color: ratingCfg.color }}>{ratingCfg.label}</p>
            </div>
            <ScoreBadge label="Ambiente (E)" value={esg.E} color="#059669" />
            <ScoreBadge label="Sociale (S)" value={esg.S} color="#2563EB" />
            <ScoreBadge label="Governance (G)" value={esg.G} color="#7C3AED" />
          </div>

          {/* Radar + Bar side by side */}
          <div className="grid grid-cols-2 gap-5 mb-4">
            <ChartCard title="Radar di Sostenibilità — 6 dimensioni chiave">
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="area" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Radar name="Score" dataKey="val" stroke="#059669" fill="#059669" fillOpacity={0.18} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Score ESG per Pilastro">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={esgBarData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(v) => [`${v}/100`]} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {esgBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <InfoBox color="green">
            <strong>Interpretazione per la Banca:</strong> Il punteggio ESG di <strong>{esg.tot}/100</strong> ({ratingCfg.label.replace(/[^\w\s]/g, '').trim()}) è calcolato secondo la metodologia VSME EFRAG 2024 con ponderazione E:40% / S:35% / G:25%. Secondo le linee guida EBA sull'integrazione del rischio ESG (EBA/GL/2020/06), un punteggio ≥55 indica adeguata gestione dei rischi di sostenibilità. Il valore corrente è{' '}
            <strong>{esg.tot >= 70 ? 'nella fascia superiore alla soglia minima' : esg.tot >= 55 ? 'sopra la soglia EBA minima' : 'in fase di sviluppo e miglioramento'}</strong>.
          </InfoBox>
        </Section>

        {/* 3. Ambiente + grafici */}
        <Section num="3" title="Performance Ambientale (E) — Emissioni, Energia, Risorse">
          <div className="grid grid-cols-2 gap-x-8 mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">Emissioni GHG</p>
              <Row label="Scope 1 — Emissioni dirette (tCO₂eq)" value={g.s1.toFixed(3)} />
              <Row label="Scope 2 — Indirette da elettricità (tCO₂eq)" value={g.s2LB.toFixed(3)} />
              <Row label="Totale Scope 1+2 (tCO₂eq)" value={g.tot.toFixed(3)} highlight />
              <Row label="Intensità GHG (tCO₂eq / M€ fatturato)" value={g.intensity > 0 ? g.intensity.toFixed(2) : '—'} />
              <Row label="Emissioni evitate da FV (tCO₂eq)" value={g.avoided.toFixed(3)} highlight />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">Energia & Acqua & Rifiuti</p>
              <Row label="Consumo energetico totale (MWh)" value={(g.totKwh / 1000).toFixed(2)} />
              <Row label="% Energia da fonti rinnovabili" value={g.pRen.toFixed(1) + '%'} highlight />
              <Row label="Prelievi idrici totali (m³)" value={wa.tot.toFixed(0)} />
              <Row label="di cui aree ad alto stress idrico" value={wa.high.toFixed(0)} />
              <Row label="Rifiuti totali prodotti (t)" value={w.tot.toFixed(3)} />
              <Row label="di cui pericolosi (t)" value={w.per.toFixed(3)} />
              <Row label="% Avviati a recupero" value={w.pRec.toFixed(1) + '%'} highlight />
            </div>
          </div>

          {/* 3 grafici */}
          <div className="grid grid-cols-3 gap-4">
            <ChartCard title="Emissioni GHG (tCO₂eq)" note="Scope 1: dirette · Scope 2: elettricità">
              {ghgData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={ghgData} barCategoryGap="25%">
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip formatter={(v) => [`${v} tCO₂eq`]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {ghgData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-xs text-muted-foreground text-center py-10">Dati non disponibili</p>}
            </ChartCard>

            <ChartCard title="Mix Energetico (MWh)" note="Verde = rinnovabile">
              {energyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={energyData} barCategoryGap="25%">
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip formatter={(v) => [`${v} MWh`]} />
                    <Bar dataKey="kwh" radius={[4, 4, 0, 0]}>
                      {energyData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-xs text-muted-foreground text-center py-10">Dati non disponibili</p>}
            </ChartCard>

            <ChartCard title="Destinazione Rifiuti (t)" note="Verde = recupero">
              {wasteData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={wasteData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={8}>
                      {wasteData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} t`]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-xs text-muted-foreground text-center py-10">Dati non disponibili</p>}
            </ChartCard>
          </div>
        </Section>

        {/* 4. Sociale + grafici */}
        <Section num="4" title="Performance Sociale (S) — Forza Lavoro, Sicurezza e Formazione">
          <div className="grid grid-cols-2 gap-x-8 mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">Composizione Forza Lavoro</p>
              <Row label="Headcount totale (n.)" value={pe.hc} />
              <Row label="Di cui donne (n.)" value={pe.donne} />
              <Row label="% Donne" value={pe.hc && pe.donne ? ((pe.donne / pe.hc) * 100).toFixed(1) + '%' : '—'} highlight />
              <Row label="Contratti a tempo indeterminato" value={pe.indet} />
              <Row label="Contratti a tempo determinato" value={pe.det} />
              <Row label="Part-time" value={pe.pt} />
              <Row label="Lavoratori con disabilità" value={pe.disab} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">Salute, Sicurezza, Formazione & Retribuzione</p>
              <Row label="Infortuni sul lavoro (n.)" value={pe.infort} />
              <Row label="Indice di frequenza (×1M ore)" value={p.IF} highlight />
              <Row label="Giorni persi per infortuni" value={pe.ggPersi} />
              <Row label="Malattie professionali (n.)" value={pe.malProf} />
              <Row label="Ore di formazione pro-capite/anno" value={pe.oreForm} />
              <Row label="Gender Pay Gap (%)" value={p.gpg + '%'} />
              <Row label="Retribuzione media annua (€)" value={pe.retMedia ? `€ ${Number(pe.retMedia).toLocaleString('it-IT')}` : '—'} highlight />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="Distribuzione di Genere (n. dipendenti)">
              {genderData.length > 0 && genderData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`} fontSize={9}>
                      {genderData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-xs text-muted-foreground text-center py-10">Dati non disponibili</p>}
            </ChartCard>

            <ChartCard title="Indicatori Sociali chiave" note="Normalizzati 0–100">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart layout="vertical" barCategoryGap="20%" data={[
                  { name: 'Parità genere', val: pe.hc > 0 ? Math.min(100, (parseInt(pe.donne) / parseInt(pe.hc)) * 200) : 0 },
                  { name: 'Sicurezza (IF)', val: Math.min(100, Math.max(0, 100 - (parseFloat(p.IF) || 0) * 3)) },
                  { name: 'Formazione', val: Math.min(100, ((parseFloat(pe.oreForm) || 0) / 18) * 100) },
                  { name: 'Score S', val: esg.S },
                ]}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 9 }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <Tooltip formatter={(v) => [`${v.toFixed(0)}/100`]} />
                  <Bar dataKey="val" fill="#2563EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </Section>

        {/* 5. Governance + visual */}
        <Section num="5" title="Struttura di Governance (G) — Presidi, Certificazioni e CDA">
          <div className="grid grid-cols-2 gap-x-8 mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">Organo di Gestione</p>
              <Row label="Composizione CDA" value={gov.compCDA} />
              <Row label="Componenti donne nel CDA" value={gov.donneCDA} />
              <Row label="Condanne e procedimenti rilevanti" value={gov.cond || '0'} />
              <Row label="Sanzioni significative (n.)" value={gov.san || '0'} />
              <Row label="Tempi medi di pagamento (giorni)" value={gov.tempiPag} />
              {data?.gov?.altreCert && <Row label="Altre certificazioni" value={data.gov.altreCert} />}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">Presidi Adottati ({govCount}/{govItems.length})</p>
              <div className="grid grid-cols-2 gap-2">
                {govItems.map(([label, val]) => (
                  <div key={label} className={`rounded-lg px-3 py-2 text-center border text-[10px] font-semibold ${val ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    {val ? '✅' : '○'} {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Governance progress bar */}
          <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-purple-700">Maturità Governance ESG</p>
              <p className="text-xs font-bold text-purple-700">{govCount}/{govItems.length} presidi attivi · Score G: {esg.G}/100</p>
            </div>
            <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all" style={{ width: `${(govCount / govItems.length) * 100}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-purple-400 mt-1">
              <span>Base</span><span>In sviluppo</span><span>Avanzato</span><span>Leader</span>
            </div>
          </div>
        </Section>

        {/* 6. Analisi dei rischi */}
        <Section num="6" title="Analisi dei Rischi ESG e Piani di Miglioramento">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              {
                area: '🌿 Rischio Ambientale',
                color: 'green',
                level: esg.E >= 65 ? 'Basso' : esg.E >= 40 ? 'Medio' : 'Alto',
                notes: [
                  g.pRen < 15 && 'Quota rinnovabile inferiore al 15% — potenziale di miglioramento',
                  g.intensity > 200 && 'Intensità GHG elevata rispetto al settore',
                  w.pRec < 65 && 'Tasso di recupero rifiuti sotto il 65%',
                ].filter(Boolean),
              },
              {
                area: '👥 Rischio Sociale',
                color: 'blue',
                level: esg.S >= 65 ? 'Basso' : esg.S >= 40 ? 'Medio' : 'Alto',
                notes: [
                  parseFloat(p.gpg) > 15 && 'Gender pay gap superiore al 15%',
                  parseFloat(p.IF) > 20 && 'Indice di frequenza infortuni elevato',
                  (parseFloat(pe.oreForm) || 0) < 8 && 'Ore formazione sotto le 8h pro-capite',
                ].filter(Boolean),
              },
              {
                area: '⚖️ Rischio Governance',
                color: 'purple',
                level: esg.G >= 65 ? 'Basso' : esg.G >= 40 ? 'Medio' : 'Alto',
                notes: [
                  gov.codEtico !== 'si' && 'Codice Etico non adottato',
                  gov.wb !== 'si' && 'Assenza canale Whistleblowing',
                  gov.mog231 !== 'si' && 'Modello 231 non implementato',
                ].filter(Boolean),
              },
            ].map(item => {
              const levelColor = item.level === 'Basso' ? 'bg-green-50 border-green-200 text-green-700' : item.level === 'Medio' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700';
              return (
                <div key={item.area} className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-bold text-slate-700 mb-2">{item.area}</p>
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border mb-3 ${levelColor}`}>Rischio: {item.level}</span>
                  {item.notes.length > 0 ? (
                    <ul className="space-y-1">
                      {item.notes.map((n, i) => <li key={i} className="text-[10px] text-slate-600 flex gap-1.5"><span className="text-amber-500 shrink-0">→</span>{n}</li>)}
                    </ul>
                  ) : <p className="text-[10px] text-green-600">✓ Nessuna criticità rilevata</p>}
                </div>
              );
            })}
          </div>
          {data?.b2?.inizFuture && (
            <InfoBox color="blue">
              <strong>Iniziative e obiettivi futuri dichiarati dall'impresa:</strong><br/>{data.b2.inizFuture}
            </InfoBox>
          )}
        </Section>

        {/* 7. Dichiarazione */}
        <Section num="7" title="Dichiarazione del Legale Rappresentante">
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 leading-relaxed space-y-2.5">
            <p>Il/la sottoscritto/a, nella qualità di legale rappresentante di <strong>{ana.ragione || '[Ragione Sociale]'}</strong>, dichiara sotto la propria responsabilità che le informazioni contenute nella presente Relazione di Sostenibilità sono veritiere, complete e conformi allo standard <strong>VSME — EFRAG 2024</strong>.</p>
            <p>I dati ambientali, sociali e di governance sono stati elaborati con riferimento all'anno di esercizio <strong>{report.year}</strong>, con perimetro di rendicontazione <strong>{ana.perimetro === 'consolidato' ? 'consolidato' : 'individuale'}</strong>{ana.paesi ? `, operante in ${ana.paesi}` : ''}.</p>
            <p>La metodologia di calcolo dell'ESG Score segue le linee guida VSME (Voluntary Standard for non-listed SMEs) dell'EFRAG, con pesi E:40% / S:35% / G:25%.</p>
            <p>La presente relazione è predisposta ai fini della valutazione del merito creditizio ESG da parte degli istituti di credito, in conformità alle linee guida EBA sull'integrazione dei rischi di sostenibilità nei processi di concessione del credito (<strong>EBA/GL/2020/06</strong> e revisione 2025).</p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-10">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Luogo e data</p>
              <div className="border-b-2 border-dashed border-slate-300 pb-8" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Firma del Legale Rappresentante</p>
              <div className="border-b-2 border-dashed border-slate-300 pb-8" />
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground">Documento generato da <strong>VSME Builder</strong> · Standard EFRAG 2024</p>
            <p className="text-[10px] text-muted-foreground">Metodologia: VSME · EBA/GL/2020/06 · GHG Protocol Corporate Standard</p>
          </div>
          <p className="text-[10px] text-muted-foreground">{today}</p>
        </div>
      </div>
    </div>
  );
}