import SectionHeader from '@/components/report/SectionHeader';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import KPICard from '@/components/report/KPICard';
import { calcEnergy, calcWaste, calcWater, calcPersonnel, calcESGScore } from '@/lib/vsmeDefaults';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export default function SectionDashboard({ data }) {
  const g = calcEnergy(data);
  const w = calcWaste(data);
  const wa = calcWater(data);
  const p = calcPersonnel(data);
  const esg = calcESGScore(data);
  const pe = data?.pe || {};
  const gov = data?.gov || {};
  const hc = parseInt(pe.hc) || 0;
  const donne = parseFloat(pe.donne) || 0;

  const radarData = [
    { area: 'Ambiente', value: esg.E, fullMark: 100 },
    { area: 'Sociale', value: esg.S, fullMark: 100 },
    { area: 'Governance', value: esg.G, fullMark: 100 },
  ];

  const ghgData = [
    { name: 'Scope 1', value: parseFloat(g.s1.toFixed(2)), fill: '#D97706' },
    { name: 'Scope 2', value: parseFloat(g.s2LB.toFixed(2)), fill: '#2563EB' },
  ];

  const genData = [
    { name: 'Donne', value: parseFloat(pe.donne) || 0 },
    { name: 'Uomini', value: parseFloat(pe.uomini) || 0 },
  ].filter(d => d.value > 0);

  const ratingBg = {
    'Leader': 'from-green-600 to-green-500',
    'Avanzato': 'from-blue-600 to-blue-500',
    'Buono': 'from-cyan-600 to-cyan-500',
    'In crescita': 'from-amber-600 to-amber-500',
    'Base': 'from-slate-500 to-slate-400',
  };

  return (
    <div>
      <SectionHeader icon="📊" title="Dashboard KPI ESG" description="Panoramica completa delle performance Environmental, Social e Governance." reference="VSME Standard · 45 indicatori" />

      {/* ESG Score Hero */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`md:col-span-1 rounded-2xl bg-gradient-to-br ${ratingBg[esg.rating] || ratingBg.Base} p-6 text-white text-center shadow-xl`}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">ESG Score</p>
          <p className="font-heading text-6xl font-extrabold leading-none">{esg.tot}</p>
          <p className="text-sm opacity-70 mt-1">/ 100</p>
          <div className="mt-3 bg-white/20 rounded-lg py-2 px-4 text-sm font-bold">{esg.rIcon} {esg.rating}</div>
        </motion.div>

        <div className="md:col-span-3 grid grid-cols-3 gap-4">
          {[
            { label: 'Ambiente (E)', value: esg.E, color: '#059669', gradient: 'from-green-50 to-green-100 border-green-200' },
            { label: 'Sociale (S)', value: esg.S, color: '#2563EB', gradient: 'from-blue-50 to-blue-100 border-blue-200' },
            { label: 'Governance (G)', value: esg.G, color: '#7C3AED', gradient: 'from-purple-50 to-purple-100 border-purple-200' },
          ].map((area, i) => (
            <motion.div
              key={area.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className={`bg-gradient-to-br ${area.gradient} border rounded-xl p-5`}
            >
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{area.label}</p>
              <p className="font-heading text-3xl font-extrabold mt-2" style={{ color: area.color }}>
                {area.value}<span className="text-base text-muted-foreground">/100</span>
              </p>
              <div className="h-1.5 bg-white rounded-full mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${area.value}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: area.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Radar + Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <Card className="p-5">
          <h4 className="font-heading text-sm font-bold text-primary mb-3">Profilo ESG — Radar</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="area" tick={{ fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="ESG" dataKey="value" stroke="#059669" fill="#059669" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h4 className="font-heading text-sm font-bold text-primary mb-3">GHG per Scope (tCO₂eq)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ghgData}>
              <XAxis dataKey="name" fontSize={11} /><YAxis fontSize={10} /><Tooltip />
              <Bar dataKey="value" radius={[6,6,0,0]}>{ghgData.map((d,i) => <Cell key={i} fill={d.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* KPI Cards grid */}
      <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3 mt-8">🌡️ Clima & Energia</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Scope 1+2" value={g.tot.toFixed(2)} unit="tCO₂eq" color="amber" />
        <KPICard label="% Rinnovabile" value={g.pRen.toFixed(1) + '%'} unit="FV" color="green" delay={0.05} />
        <KPICard label="Energia Totale" value={(g.totKwh / 1000).toFixed(1)} unit="MWh" color="blue" delay={0.1} />
        <KPICard label="Intensità GHG" value={g.intensity > 0 ? g.intensity.toFixed(2) : '—'} unit="tCO₂eq/M€" delay={0.15} />
      </div>

      <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">💧 Acqua</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Prelievi" value={wa.tot.toFixed(0)} unit="m³" color="blue" />
        <KPICard label="Stress idrico" value={wa.high.toFixed(0)} unit="m³" color={wa.high > 0 ? 'amber' : 'default'} />
        <KPICard label="Consumo netto" value={wa.consumo.toFixed(0)} unit="m³" />
        <KPICard label="Consumo/dip." value={wa.consumoDip.toFixed(1)} unit="m³/dip." />
      </div>

      <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">♻️ Rifiuti</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Rifiuti totali" value={w.tot.toFixed(2)} unit="t" />
        <KPICard label="Pericolosi" value={w.per.toFixed(2)} unit="t" color={parseFloat(w.per) > 0 ? 'amber' : 'default'} />
        <KPICard label="% Recupero" value={w.pRec.toFixed(1) + '%'} color="green" />
        <KPICard label="Smaltimento" value={w.smal.toFixed(2)} unit="t" />
      </div>

      <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">👥 Personale</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPICard label="Dipendenti" value={hc || '—'} unit="headcount" color="blue" />
        <KPICard label="% Donne" value={hc > 0 ? (donne / hc * 100).toFixed(1) + '%' : '—'} />
        <KPICard label="Gender Pay Gap" value={p.gpg + '%'} color={parseFloat(p.gpg) > 15 ? 'red' : 'default'} />
        <KPICard label="Indice Frequenza" value={p.IF} unit="×1M ore" />
      </div>

      <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">⚖️ Governance</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Codice Etico', value: gov.codEtico === 'si' },
          { label: 'MOG 231', value: gov.mog231 === 'si' },
          { label: 'ISO 45001', value: gov.iso45001 === 'si' },
          { label: 'Whistleblowing', value: gov.wb === 'si' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`rounded-xl p-4 text-center border ${item.value ? 'bg-green-50 border-green-200' : 'bg-muted border-border'}`}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className={`text-lg font-bold mt-1 ${item.value ? 'text-green-600' : 'text-muted-foreground'}`}>{item.value ? '✅ Sì' : '— No'}</p>
          </motion.div>
        ))}
      </div>

      {genData.length > 0 && (
        <Card className="p-5">
          <h4 className="font-heading text-sm font-bold text-primary mb-3">Composizione per Genere</h4>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart><Pie data={genData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
              <Cell fill="#EC4899" /><Cell fill="#2563EB" />
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}