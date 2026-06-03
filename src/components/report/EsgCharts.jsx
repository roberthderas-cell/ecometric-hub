import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Sector
} from 'recharts';

/* ─── Custom Tooltip ────────────────────────────── */
const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-3 text-sm">
      {label && <p className="font-bold text-slate-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color || p.fill }}>
          {p.name}: <span className="font-extrabold">{typeof p.value === 'number' ? p.value.toLocaleString('it-IT', { maximumFractionDigits: 2 }) : p.value}</span>
          {unit && <span className="font-normal text-slate-500 ml-1">{unit}</span>}
        </p>
      ))}
    </div>
  );
};

/* ─── Radar ESG ─────────────────────────────────── */
export function RadarEsg({ esg }) {
  const data = [
    { area: 'Ambiente', value: esg.E, fullMark: 100 },
    { area: 'Sociale', value: esg.S, fullMark: 100 },
    { area: 'Governance', value: esg.G, fullMark: 100 },
  ];

  return (
    <Card className="p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading text-sm font-bold text-primary">🎯 Profilo ESG</h4>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Score /100</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={data} outerRadius="75%">
          <defs>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#059669" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.05} />
            </radialGradient>
          </defs>
          <PolarGrid stroke="#E2E8F0" strokeDasharray="4 2" />
          <PolarAngleAxis
            dataKey="area"
            tick={({ payload, x, y, cx, cy, ...rest }) => {
              const color = payload.value === 'Ambiente' ? '#059669'
                : payload.value === 'Sociale' ? '#2563EB' : '#7C3AED';
              return (
                <text {...rest} x={x} y={y} fill={color} fontSize={12} fontWeight={700} textAnchor="middle">
                  {payload.value}
                </text>
              );
            }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickCount={5} />
          <Radar
            name="ESG"
            dataKey="value"
            stroke="#059669"
            fill="url(#radarFill)"
            strokeWidth={2.5}
            dot={{ fill: '#059669', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
          />
          <Tooltip content={<CustomTooltip unit="pt" />} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-1">
        {[['Ambiente', '#059669'], ['Sociale', '#2563EB'], ['Governance', '#7C3AED']].map(([name, color]) => (
          <span key={name} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {name}
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ─── GHG Bar ───────────────────────────────────── */
const GhgBarLabel = ({ x, y, width, value }) => {
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="#475569">
      {value.toLocaleString('it-IT', { maximumFractionDigits: 2 })}
    </text>
  );
};

export function GhgBarChart({ g }) {
  const data = [
    { name: 'Scope 1', value: parseFloat(g.s1.toFixed(2)), fill: '#F59E0B' },
    { name: 'Scope 2 LB', value: parseFloat(g.s2LB.toFixed(2)), fill: '#3B82F6' },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading text-sm font-bold text-primary">🌍 Emissioni GHG per Scope</h4>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">tCO₂eq · totale: {total.toFixed(2)}</span>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} barCategoryGap="40%" margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradScope1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
              <stop offset="100%" stopColor="#D97706" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="gradScope2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity={1} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="name" fontSize={12} fontWeight={600} axisLine={false} tickLine={false} />
          <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
          <Tooltip content={<CustomTooltip unit="tCO₂eq" />} cursor={{ fill: '#F8FAFC' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} label={<GhgBarLabel />} isAnimationActive animationDuration={1200} animationEasing="ease-out">
            <Cell fill="url(#gradScope1)" />
            <Cell fill="url(#gradScope2)" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-1">
        {data.map(d => (
          <span key={d.name} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: d.fill }} />
            {d.name}: <strong>{d.value}</strong> tCO₂eq
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ─── Waste Donut ───────────────────────────────── */
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#1e293b" fontSize={15} fontWeight={800}>{value.toFixed(2)}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#64748b" fontSize={11}>t</text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="#64748b" fontSize={10}>{(percent * 100).toFixed(1)}%</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={innerRadius - 1} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

export function WasteDonut({ w }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const raw = [
    { name: 'Recupero', value: parseFloat(w.rec) || 0, fill: '#22C55E' },
    { name: 'Smaltimento', value: parseFloat(w.smal) || 0, fill: '#EF4444' },
    { name: 'Altro', value: Math.max(0, parseFloat(w.tot) - (parseFloat(w.rec) || 0) - (parseFloat(w.smal) || 0)), fill: '#94A3B8' },
  ].filter(d => d.value > 0);

  if (!raw.length) return null;

  return (
    <Card className="p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading text-sm font-bold text-primary">♻️ Destinazione Rifiuti</h4>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">tot. {w.tot.toFixed(2)} t</span>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={raw}
            cx="50%" cy="50%"
            innerRadius={55} outerRadius={80}
            dataKey="value"
            onMouseEnter={(_, i) => setActiveIndex(i)}
            isAnimationActive animationDuration={1000} animationEasing="ease-out"
          >
            {raw.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
          <Tooltip content={<CustomTooltip unit="t" />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-5 mt-1 flex-wrap">
        {raw.map(d => (
          <span key={d.name} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />{d.name}
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ─── Gender Donut ──────────────────────────────── */
export function GenderDonut({ pe }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const data = [
    { name: 'Donne', value: parseFloat(pe.donne) || 0, fill: '#EC4899' },
    { name: 'Uomini', value: parseFloat(pe.uomini) || 0, fill: '#3B82F6' },
  ].filter(d => d.value > 0);

  if (!data.length) return null;
  const tot = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading text-sm font-bold text-primary">👥 Composizione per Genere</h4>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{tot} dipendenti</span>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%" cy="50%"
            innerRadius={55} outerRadius={80}
            dataKey="value"
            onMouseEnter={(_, i) => setActiveIndex(i)}
            isAnimationActive animationDuration={1000} animationEasing="ease-out"
          >
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
          <Tooltip content={<CustomTooltip unit="pers." />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-1">
        {data.map(d => (
          <span key={d.name} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
            {d.name}: <strong>{d.value}</strong> ({tot > 0 ? (d.value / tot * 100).toFixed(1) : 0}%)
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ─── Energy Mix Bar ────────────────────────────── */
export function EnergyMixBar({ g }) {
  const data = [
    { name: 'Elettricità rete', value: parseFloat((g.eNet / 1000).toFixed(1)), fill: '#6366F1' },
    { name: 'Fotovoltaico', value: parseFloat((g.eFv / 1000).toFixed(1)), fill: '#22C55E' },
    { name: 'Combustibili', value: parseFloat((g.eFuel / 1000).toFixed(1)), fill: '#F59E0B' },
  ].filter(d => d.value > 0);

  if (!data.length) return null;

  return (
    <Card className="p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading text-sm font-bold text-primary">⚡ Mix Energetico</h4>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">MWh · tot. {(g.totKwh / 1000).toFixed(1)}</span>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
          <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
          <YAxis type="category" dataKey="name" fontSize={11} fontWeight={600} axisLine={false} tickLine={false} width={110} />
          <Tooltip content={<CustomTooltip unit="MWh" />} cursor={{ fill: '#F8FAFC' }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 11, fontWeight: 700, fill: '#475569' }} isAnimationActive animationDuration={1200}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}