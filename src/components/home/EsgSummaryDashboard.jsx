import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Target, TrendingUp, Zap, Users, Shield, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { calcESGScore } from '@/lib/vsmeDefaults';

function useCountUp(target, duration = 1100) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let startTs = null;
    const step = (ts) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

const PILLAR_CFG = {
  E: { label: 'Ambiente',    icon: Zap,       color: '#16A34A', bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700'  },
  S: { label: 'Sociale',     icon: Users,     color: '#2563EB', bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700'   },
  G: { label: 'Governance',  icon: Shield,    color: '#A855F7', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
};

const RATING_CFG = {
  Leader:        { gradient: 'from-emerald-500 to-green-400', emoji: '🏆', textColor: 'text-emerald-600' },
  Avanzato:      { gradient: 'from-blue-600 to-blue-400',     emoji: '⭐', textColor: 'text-blue-600'    },
  Buono:         { gradient: 'from-cyan-600 to-cyan-400',     emoji: '✅', textColor: 'text-cyan-600'    },
  'In crescita': { gradient: 'from-amber-500 to-yellow-400',  emoji: '📈', textColor: 'text-amber-600'  },
  Base:          { gradient: 'from-slate-500 to-slate-400',   emoji: '🌱', textColor: 'text-slate-600'  },
};

function RingProgress({ value, max = 100, color, size = 72, strokeWidth = 7 }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  );
}

function PillarCard({ pillarKey, score, target, index }) {
  const cfg = PILLAR_CFG[pillarKey];
  const Icon = cfg.icon;
  const reached = score >= target;
  const pct = target > 0 ? Math.min(100, Math.round((score / target) * 100)) : 100;
  const gap = Math.max(0, target - score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className={`p-4 border ${cfg.border} ${cfg.bg} relative overflow-hidden`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
            <Icon className="w-4 h-4" style={{ color: cfg.color }} />
          </div>
          <div className="flex-1">
            <p className="font-heading font-bold text-sm text-foreground">{cfg.label}</p>
            <p className="text-[11px] text-muted-foreground">Target anno: <strong>{target}</strong>/100</p>
          </div>
          <div className="relative flex items-center justify-center">
            <RingProgress value={score} max={Math.max(target, 1)} color={cfg.color} size={56} strokeWidth={6} />
            <div className="absolute text-center">
              <p className="font-extrabold text-sm leading-none" style={{ color: cfg.color }}>{score}</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: index * 0.08 + 0.2 }}
            className="h-full rounded-full"
            style={{ backgroundColor: cfg.color }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Progresso: <strong>{pct}%</strong></span>
          {reached
            ? <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle2 className="w-3.5 h-3.5" />Obiettivo raggiunto</span>
            : <span className="flex items-center gap-1 text-amber-600 font-semibold"><AlertTriangle className="w-3.5 h-3.5" />+{gap} punti mancanti</span>
          }
        </div>
      </Card>
    </motion.div>
  );
}

function AnimatedTot({ value }) {
  const c = useCountUp(value);
  return <>{c}</>;
}

export default function EsgSummaryDashboard({ reports }) {
  // Pick the most recent report with ESG data
  const latest = useMemo(() => {
    return reports
      .filter(r => r.data)
      .sort((a, b) => (b.year || 0) - (a.year || 0))[0];
  }, [reports]);

  const esg = useMemo(() => latest ? calcESGScore(latest.data) : null, [latest]);
  const targets = latest?.data?.obiettivi || {};
  const year = latest?.year || new Date().getFullYear();

  const tE   = targets.E_N   ?? Math.min(100, (esg?.E   ?? 0) + 8);
  const tS   = targets.S_N   ?? Math.min(100, (esg?.S   ?? 0) + 8);
  const tG   = targets.G_N   ?? Math.min(100, (esg?.G   ?? 0) + 8);
  const tTot = targets.tot_N ?? Math.min(100, (esg?.tot ?? 0) + 8);

  if (!latest || !esg) return null;

  const ratingCfg = RATING_CFG[esg.rating] || RATING_CFG['Base'];

  const radarData = [
    { subject: 'Ambiente',   A: esg.E,   T: tE   },
    { subject: 'Sociale',    A: esg.S,   T: tS   },
    { subject: 'Governance', A: esg.G,   T: tG   },
  ];

  const barData = [
    { name: 'E',  attuale: esg.E,   target: tE,   fill: '#16A34A' },
    { name: 'S',  attuale: esg.S,   target: tS,   fill: '#2563EB' },
    { name: 'G',  attuale: esg.G,   target: tG,   fill: '#A855F7' },
    { name: 'ESG',attuale: esg.tot, target: tTot, fill: '#059669' },
  ];

  const reachedCount = [
    esg.E >= tE, esg.S >= tS, esg.G >= tG
  ].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {/* Section title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Dashboard ESG — {year}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Report: <strong>{latest.name}</strong> · Progresso vs obiettivi anno in corso
          </p>
        </div>
        <Link
          to={`/report/${latest.id}/obiettivi`}
          className="flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5 transition-colors"
        >
          Modifica obiettivi <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT — Score card + radar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Global score */}
          <Card className={`p-5 bg-gradient-to-br ${ratingCfg.gradient} text-white relative overflow-hidden`}>
            {/* Pulsing glow ring */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.06, 0.15] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-8 -top-8 w-36 h-36 bg-white rounded-full pointer-events-none"
            />
            <div className="absolute -right-2 bottom-0 w-16 h-16 bg-white/5 rounded-full" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mb-1">Score ESG Complessivo</p>
            <div className="flex items-end gap-3 mb-3">
              <p className="font-heading font-extrabold text-6xl text-white leading-none">
                <AnimatedTot value={esg.tot} />
              </p>
              <div className="mb-1">
                <p className="text-white/80 text-xs">su 100</p>
                <p className="font-bold text-base">{ratingCfg.emoji} {esg.rating}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/15 rounded-lg px-3 py-1.5">
              <Target className="w-3.5 h-3.5" />
              Target {year}: <strong className="text-white ml-1">{tTot}/100</strong>
              {esg.tot >= tTot
                ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-300 ml-auto" /><span className="text-green-300 font-bold">Raggiunto!</span></>
                : <span className="ml-auto text-white/80">+{tTot - esg.tot} mancanti</span>
              }
            </div>
            <div className="mt-2 text-xs text-white/60">
              {reachedCount}/3 pilastri raggiunti
            </div>
          </Card>

          {/* Radar */}
          <Card className="p-4 flex-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Radar E·S·G vs Target</p>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Radar name="Target" dataKey="T" stroke="#d1d5db" fill="#f3f4f6" fillOpacity={0.6} strokeDasharray="4 3" />
                <Radar name="Attuale" dataKey="A" stroke="#16A34A" fill="#16A34A" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 justify-center mt-1">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-4 h-0.5 bg-green-600 rounded-full inline-block" />Attuale</span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-4 h-0.5 bg-gray-300 rounded-full inline-block border-dashed" />Target {year}</span>
            </div>
          </Card>
        </div>

        {/* RIGHT — pillar cards + bar chart */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Pillar progress cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <PillarCard pillarKey="E" score={esg.E} target={tE} index={0} />
            <PillarCard pillarKey="S" score={esg.S} target={tS} index={1} />
            <PillarCard pillarKey="G" score={esg.G} target={tG} index={2} />
          </div>

          {/* Bar comparison */}
          <Card className="p-4 flex-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Confronto Attuale vs Target {year}</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} barGap={4} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  formatter={(v, name) => [`${v}/100`, name === 'attuale' ? 'Score attuale' : `Target ${year}`]}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                {/* Target bars (lighter) */}
                <Bar dataKey="target" radius={[4, 4, 0, 0]} name="target">
                  {barData.map((d, i) => (
                    <Cell key={i} fill={d.fill} opacity={0.22} />
                  ))}
                </Bar>
                {/* Actual bars */}
                <Bar dataKey="attuale" radius={[4, 4, 0, 0]} name="attuale">
                  {barData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 justify-center mt-1">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-3 h-3 rounded bg-green-600 inline-block" />Score attuale</span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-3 h-3 rounded bg-green-200 inline-block" />Target {year}</span>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}