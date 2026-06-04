import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Award } from 'lucide-react';

const ratingConfig = {
  Leader:        { color: '#059669', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
  Avanzato:      { color: '#2563EB', bg: 'bg-blue-100 text-blue-700 border-blue-200',         bar: 'bg-blue-500' },
  Buono:         { color: '#0891B2', bg: 'bg-cyan-100 text-cyan-700 border-cyan-200',         bar: 'bg-cyan-500' },
  'In crescita': { color: '#D97706', bg: 'bg-amber-100 text-amber-700 border-amber-200',      bar: 'bg-amber-500' },
  Base:          { color: '#9CA3AF', bg: 'bg-slate-100 text-slate-600 border-slate-200',      bar: 'bg-slate-400' },
};

const AREA_COLORS = { E: '#059669', S: '#2563EB', G: '#7C3AED' };

function MiniBar({ value, color, max = 100 }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-bold w-5 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

function DeltaIcon({ delta }) {
  if (delta > 3) return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
  if (delta < -3) return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-slate-400" />;
}

export default function MultiSiteDashboard({ reports }) {
  const scored = reports.filter(r => r.esg_score?.tot);
  if (scored.length < 2) return null;

  const avg = Math.round(scored.reduce((s, r) => s + r.esg_score.tot, 0) / scored.length);
  const sorted = [...scored].sort((a, b) => b.esg_score.tot - a.esg_score.tot);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  // Avg per pillar
  const avgE = Math.round(scored.reduce((s, r) => s + (r.esg_score.E || 0), 0) / scored.length);
  const avgS = Math.round(scored.reduce((s, r) => s + (r.esg_score.S || 0), 0) / scored.length);
  const avgG = Math.round(scored.reduce((s, r) => s + (r.esg_score.G || 0), 0) / scored.length);

  const weakestPillar = avgE <= avgS && avgE <= avgG ? 'Ambiente (E)'
    : avgS <= avgE && avgS <= avgG ? 'Sociale (S)'
    : 'Governance (G)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-sm">Classifica ESG — Sedi & Reparti</h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Media fleet: <strong className="text-foreground">{avg}</strong></span>
          <span>Pilastro più debole: <strong className="text-amber-600">{weakestPillar}</strong></span>
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        {[
          { label: 'Media Ambiente (E)', value: avgE, color: AREA_COLORS.E },
          { label: 'Media Sociale (S)', value: avgS, color: AREA_COLORS.S },
          { label: 'Media Governance (G)', value: avgG, color: AREA_COLORS.G },
        ].map(item => (
          <div key={item.label} className="px-5 py-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{item.label}</p>
            <p className="font-heading text-xl font-extrabold" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Ranking table */}
      <div className="divide-y divide-border">
        {sorted.map((report, idx) => {
          const s = report.esg_score;
          const cfg = ratingConfig[s.rating] || ratingConfig.Base;
          const delta = s.tot - avg;

          return (
            <Link to={`/report/${report.id}/dash`} key={report.id}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer group"
              >
                {/* Rank */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-heading font-extrabold text-sm shrink-0 ${
                  idx === 0 ? 'bg-amber-100 text-amber-700' :
                  idx === 1 ? 'bg-slate-100 text-slate-600' :
                  idx === 2 ? 'bg-orange-50 text-orange-600' : 'bg-muted text-muted-foreground'
                }`}>
                  {idx + 1}
                </div>

                {/* Name + year */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{report.name}</p>
                  <p className="text-[11px] text-muted-foreground">Anno {report.year}</p>
                </div>

                {/* E/S/G bars */}
                <div className="hidden md:flex flex-col gap-1 w-28">
                  <MiniBar value={s.E || 0} color={AREA_COLORS.E} />
                  <MiniBar value={s.S || 0} color={AREA_COLORS.S} />
                  <MiniBar value={s.G || 0} color={AREA_COLORS.G} />
                </div>

                {/* Total score */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${cfg.bg}`}>{s.rating}</span>
                  <div className="flex items-center gap-1">
                    <DeltaIcon delta={delta} />
                    <span className="font-heading font-extrabold text-lg w-8 text-right">{s.tot}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-5 py-2.5 bg-muted/20 border-t border-border">
        <p className="text-[10px] text-muted-foreground">
          🏆 Migliore: <strong>{best.name}</strong> ({best.esg_score.tot}) &nbsp;·&nbsp;
          🌱 Da migliorare: <strong>{worst.name}</strong> ({worst.esg_score.tot}) &nbsp;·&nbsp;
          Delta: <strong>{best.esg_score.tot - worst.esg_score.tot} punti</strong>
        </p>
      </div>
    </motion.div>
  );
}