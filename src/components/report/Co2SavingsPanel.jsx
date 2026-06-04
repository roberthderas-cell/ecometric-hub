import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown, Euro, Leaf, Zap, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

// Parametri economici di riferimento (2024-2025)
const PARAMS = {
  co2PriceETS: 65,         // €/tCO₂ — prezzo medio ETS EU 2024
  co2PriceSocial: 150,     // €/tCO₂ — costo sociale CO₂ (SCC, valore medio EU)
  energyCostKwh: 0.22,     // €/kWh — costo medio energia elettrica PMI Italia
  gasCostM3: 1.10,         // €/m³ — costo medio gas naturale PMI Italia
  reductionTarget: 0.30,   // obiettivo riduzione 30% in 5 anni (PNIEC)
  discountRate: 0.05,      // tasso attualizzazione 5%
};

function fmt(n, decimals = 0) {
  return Number(n).toLocaleString('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function calcSavings(metrics) {
  const { g, data } = metrics;
  const totCO2 = g.tot || 0;
  const totKwh = g.totKwh || 0;
  const pRen = g.pRen || 0;

  // Riduzione CO2 potenziale (target -30% in 5 anni)
  const co2ReductionTarget = totCO2 * PARAMS.reductionTarget;

  // Risparmio annuo stimato (ETS)
  const annualSavingETS = co2ReductionTarget * PARAMS.co2PriceETS;
  // Risparmio annuo (costo sociale)
  const annualSavingSocial = co2ReductionTarget * PARAMS.co2PriceSocial;

  // Potenziale risparmio energia (portare rinnovabile al 50%)
  const renewableGap = Math.max(0, 50 - pRen);
  const kwhToConvert = (totKwh * renewableGap) / 100;
  const energySavingAnnual = kwhToConvert * PARAMS.energyCostKwh * 0.15; // 15% risparmio medio FV vs rete

  // Proiezione 5 anni con attualizzazione
  const years = [1, 2, 3, 4, 5];
  const projection = years.map(year => {
    const progressiveReduction = PARAMS.reductionTarget * (year / 5);
    const co2Red = totCO2 * progressiveReduction;
    const savingETS = co2Red * PARAMS.co2PriceETS;
    const savingEnergy = energySavingAnnual * year * 0.3;
    const totalGross = savingETS + savingEnergy;
    // NPV con attualizzazione
    const npvFactor = 1 / Math.pow(1 + PARAMS.discountRate, year);
    return {
      anno: `Anno ${year}`,
      risparmioETS: Math.round(savingETS),
      risparmioEnergia: Math.round(savingEnergy),
      totale: Math.round(totalGross),
      netto: Math.round(totalGross * npvFactor),
      co2Ridotta: parseFloat(co2Red.toFixed(2)),
    };
  });

  const npv5y = projection.reduce((sum, y) => sum + y.netto, 0);
  const totalGross5y = projection.reduce((sum, y) => sum + y.totale, 0);

  // Esposizione rischio climatico per la banca (Basel III / EBA)
  const riskScore = totCO2 > 500 ? 'Elevato' : totCO2 > 100 ? 'Medio' : 'Basso';
  const riskColor = totCO2 > 500 ? '#ef4444' : totCO2 > 100 ? '#f59e0b' : '#10b981';

  return {
    totCO2, co2ReductionTarget, annualSavingETS, annualSavingSocial,
    energySavingAnnual, projection, npv5y, totalGross5y,
    riskScore, riskColor, pRen, totKwh,
  };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold">€ {fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Co2SavingsPanel({ metrics }) {
  const s = useMemo(() => calcSavings(metrics), [metrics]);

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-green-800 px-8 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-400/20 border border-green-400/30 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="font-heading text-base font-extrabold text-white">Analisi Risparmio CO₂ & Benefici Finanziari</h2>
            <p className="text-white/45 text-xs">Proiezione 5 anni · ETS EU 2024 · Rilevante per la valutazione del rischio climatico bancario</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold px-3 py-1 rounded-full border" style={{ color: s.riskColor, borderColor: s.riskColor + '50', background: s.riskColor + '12' }}>
            Rischio climatico: {s.riskScore}
          </span>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* KPI principali */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              icon: <Leaf className="w-4 h-4" />,
              label: 'Emissioni attuali',
              value: `${fmt(s.totCO2, 1)} tCO₂eq`,
              sub: 'Scope 1+2 anno corrente',
              color: '#1a1a1a',
              bg: '#f8fafc',
            },
            {
              icon: <TrendingDown className="w-4 h-4" />,
              label: 'Riduzione target (-30%)',
              value: `${fmt(s.co2ReductionTarget, 1)} tCO₂eq`,
              sub: 'Obiettivo 5 anni (PNIEC)',
              color: '#059669',
              bg: '#f0fdf4',
            },
            {
              icon: <Euro className="w-4 h-4" />,
              label: 'Risparmio ETS annuo',
              value: `€ ${fmt(s.annualSavingETS)}`,
              sub: `@ €${PARAMS.co2PriceETS}/tCO₂ (ETS EU 2024)`,
              color: '#2563EB',
              bg: '#eff6ff',
            },
            {
              icon: <Zap className="w-4 h-4" />,
              label: 'NPV risparmio 5 anni',
              value: `€ ${fmt(s.npv5y)}`,
              sub: `Attualizzato al ${(PARAMS.discountRate * 100).toFixed(0)}%`,
              color: '#7C3AED',
              bg: '#f5f3ff',
            },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-xl border p-4"
              style={{ background: kpi.bg, borderColor: kpi.color + '25' }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: kpi.color }}>
                {kpi.icon}
                <p className="text-[10px] font-bold uppercase tracking-wide">{kpi.label}</p>
              </div>
              <p className="font-heading text-xl font-extrabold" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Grafico proiezione */}
        <div className="rounded-xl border border-slate-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Proiezione risparmio economico cumulativo — 5 anni (€)</p>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-emerald-500 inline-block" /> Risparmio ETS</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-blue-400 inline-block" /> Risparmio Energia</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-purple-400 inline-block" /> NPV netto</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={s.projection} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradETS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradNPV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="anno" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `€${fmt(v)}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="risparmioETS" name="Risparmio ETS" stroke="#059669" fill="url(#gradETS)" strokeWidth={2} />
              <Area type="monotone" dataKey="risparmioEnergia" name="Risparmio Energia" stroke="#3b82f6" fill="none" strokeWidth={2} strokeDasharray="4 2" />
              <Area type="monotone" dataKey="netto" name="NPV netto" stroke="#7C3AED" fill="url(#gradNPV)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tabella proiezione dettagliata */}
        <div className="rounded-xl border border-slate-100 overflow-hidden mb-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-2.5 font-bold text-slate-600 uppercase tracking-wide text-[10px]">Anno</th>
                <th className="text-right px-4 py-2.5 font-bold text-slate-600 uppercase tracking-wide text-[10px]">CO₂ ridotta (t)</th>
                <th className="text-right px-4 py-2.5 font-bold text-slate-600 uppercase tracking-wide text-[10px]">Risparmio ETS</th>
                <th className="text-right px-4 py-2.5 font-bold text-slate-600 uppercase tracking-wide text-[10px]">Risparmio Energia</th>
                <th className="text-right px-4 py-2.5 font-bold text-slate-600 uppercase tracking-wide text-[10px]">Totale lordo</th>
                <th className="text-right px-4 py-2.5 font-bold text-slate-600 uppercase tracking-wide text-[10px]">NPV (att. 5%)</th>
              </tr>
            </thead>
            <tbody>
              {s.projection.map((row, i) => (
                <tr key={i} className={`border-b border-slate-50 ${i === s.projection.length - 1 ? 'bg-green-50 font-bold' : ''}`}>
                  <td className="px-4 py-2.5 font-semibold text-slate-700">{row.anno}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-700">{fmt(row.co2Ridotta, 1)} t</td>
                  <td className="px-4 py-2.5 text-right text-blue-700">€ {fmt(row.risparmioETS)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">€ {fmt(row.risparmioEnergia)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-800">€ {fmt(row.totale)}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-purple-700">€ {fmt(row.netto)}</td>
                </tr>
              ))}
              <tr className="bg-slate-900 text-white">
                <td className="px-4 py-2.5 font-bold text-xs uppercase tracking-wide" colSpan={4}>Totale 5 anni</td>
                <td className="px-4 py-2.5 text-right font-extrabold">€ {fmt(s.totalGross5y)}</td>
                <td className="px-4 py-2.5 text-right font-extrabold text-green-400">€ {fmt(s.npv5y)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rilevanza per la banca */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-blue-800">Rilevanza per la valutazione bancaria</p>
            </div>
            <p className="text-xs text-blue-700 leading-relaxed">
              La riduzione delle emissioni CO₂ si traduce in <strong>minore esposizione al rischio di transizione climatica</strong> (Basel III / EBA 2025). Un risparmio proiettato di <strong>€ {fmt(s.totalGross5y)}</strong> in 5 anni migliora la capacità di rimborso del debito e riduce il rischio di stranded assets per l'istituto finanziatore.
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-amber-800">Ipotesi e disclaimer</p>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              Proiezione basata su: prezzo ETS medio €{PARAMS.co2PriceETS}/tCO₂eq (2024), target riduzione PNIEC -30% in 5 anni, costo energia €{PARAMS.energyCostKwh}/kWh, tasso attualizzazione 5%. I valori sono stime indicative a fini valutativi e non costituiscono garanzia di rendimento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}