import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, TrendingUp, Leaf, Users, Shield, ChevronRight } from 'lucide-react';

// Pesi ufficiali VSME nel calcolo del totale
const PILLARS = [
  {
    key: 'E',
    label: 'Ambiente',
    icon: Leaf,
    weight: 0.40,
    color: '#16A34A',
    bg: 'from-green-50 to-green-100',
    border: 'border-green-200',
    textColor: 'text-green-700',
    subMetrics: [
      { label: '% Energia rinnovabile', ideal: '≥ 35%', section: 'en' },
      { label: 'Intensità GHG', ideal: '≤ 100 tCO₂/M€', section: 'en' },
      { label: '% Recupero rifiuti', ideal: '≥ 85%', section: 'ri' },
    ],
    getLevel: (score) => score >= 75 ? 'good' : score >= 50 ? 'medium' : 'critical',
  },
  {
    key: 'S',
    label: 'Sociale',
    icon: Users,
    weight: 0.35,
    color: '#2563EB',
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    textColor: 'text-blue-700',
    subMetrics: [
      { label: 'Indice infortuni (IF)', ideal: '≤ 8 /Mh', section: 'pe' },
      { label: 'Diversity (% donne)', ideal: '≥ 40%', section: 'pe' },
      { label: 'Ore formazione/dip.', ideal: '≥ 18 h/anno', section: 'pe' },
    ],
    getLevel: (score) => score >= 75 ? 'good' : score >= 50 ? 'medium' : 'critical',
  },
  {
    key: 'G',
    label: 'Governance',
    icon: Shield,
    weight: 0.25,
    color: '#7C3AED',
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    textColor: 'text-purple-700',
    subMetrics: [
      { label: 'MOG 231 / Cod. Etico', ideal: 'Entrambi adottati', section: 'gov' },
      { label: 'Certificazioni sicurezza', ideal: 'ISO 45001 attiva', section: 'gov' },
      { label: 'Policy parità genere', ideal: 'Pari opportunità', section: 'gov' },
    ],
    getLevel: (score) => score >= 75 ? 'good' : score >= 50 ? 'medium' : 'critical',
  },
];

const LEVEL_CONFIG = {
  good:     { label: 'Buono',       icon: CheckCircle2,  iconColor: 'text-green-500',  badgeBg: 'bg-green-100 text-green-700 border-green-200' },
  medium:   { label: 'Migliorabile', icon: TrendingUp,   iconColor: 'text-amber-500',  badgeBg: 'bg-amber-100 text-amber-700 border-amber-200' },
  critical: { label: 'Critico',      icon: AlertTriangle, iconColor: 'text-red-500',   badgeBg: 'bg-red-100 text-red-700 border-red-200' },
};

function PillarCard({ pillar, score, index, onNavigate }) {
  const level = pillar.getLevel(score ?? 0);
  const cfg = LEVEL_CONFIG[level];
  const LevelIcon = cfg.icon;
  const PillarIcon = pillar.icon;
  const contribution = ((score ?? 0) * pillar.weight).toFixed(1);
  const maxContribution = (100 * pillar.weight).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`bg-gradient-to-br ${pillar.bg} ${pillar.border} border overflow-hidden`}>
        {/* Critical top bar */}
        {level === 'critical' && (
          <div className="h-1 w-full bg-red-400" />
        )}
        {level === 'medium' && (
          <div className="h-1 w-full bg-amber-400" />
        )}
        {level === 'good' && (
          <div className="h-1 w-full bg-green-400" />
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: pillar.color + '20' }}>
                <PillarIcon className="w-4 h-4" style={{ color: pillar.color }} />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-foreground">{pillar.label}</p>
                <p className="text-[10px] text-muted-foreground">Peso: {Math.round(pillar.weight * 100)}% del totale</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold ${cfg.badgeBg}`}>
              <LevelIcon className={`w-3 h-3 ${cfg.iconColor}`} />
              {cfg.label}
            </div>
          </div>

          {/* Score */}
          <div className="flex items-end gap-2 mb-3">
            <span className="font-heading text-4xl font-extrabold leading-none" style={{ color: pillar.color }}>
              {score ?? 0}
            </span>
            <span className="text-sm text-muted-foreground mb-1">/100</span>
            <span className="text-xs text-muted-foreground mb-1 ml-auto">
              Contributo: <strong>{contribution}/{maxContribution} pt</strong>
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-white/70 rounded-full mb-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score ?? 0}%` }}
              transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
              className="h-full rounded-full"
              style={{ backgroundColor: pillar.color }}
            />
          </div>

          {/* Sub-metrics */}
          <div className="space-y-2">
            {pillar.subMetrics.map((m) => (
              <button
                key={m.label}
                onClick={() => onNavigate?.(m.section)}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{m.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-medium" style={{ color: pillar.color }}>{m.ideal}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: pillar.color }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function EsgPriorityOverview({ esg, onNavigate }) {
  if (!esg) return null;

  // Ordina per urgenza: i più bassi prima
  const sorted = [...PILLARS].sort((a, b) => (esg[a.key] ?? 0) - (esg[b.key] ?? 0));
  const mostCritical = sorted[0];
  const criticalCount = PILLARS.filter(p => p.getLevel(esg[p.key] ?? 0) === 'critical').length;
  const mediumCount = PILLARS.filter(p => p.getLevel(esg[p.key] ?? 0) === 'medium').length;

  return (
    <div className="mb-8">
      {/* Summary banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3 mb-4 p-4 rounded-xl bg-muted/50 border border-border"
      >
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-sm text-foreground">
            🎯 Analisi Priorità ESG
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Score pesato complessivo: <strong className="text-foreground">{esg.tot}/100</strong>
            {' · '}
            {criticalCount > 0
              ? <span className="text-red-600 font-semibold">{criticalCount} area{criticalCount > 1 ? 'e' : ''} critica{criticalCount > 1 ? 'he' : ''} da correggere</span>
              : mediumCount > 0
                ? <span className="text-amber-600 font-semibold">{mediumCount} area{mediumCount > 1 ? 'e' : ''} migliorabile{mediumCount > 1 ? 'i' : ''}</span>
                : <span className="text-green-600 font-semibold">Tutte le aree in buono stato</span>
            }
          </p>
        </div>
        {/* Pesi formula */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 font-bold">E×40%</span>
          <span className="text-muted-foreground">+</span>
          <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 font-bold">S×35%</span>
          <span className="text-muted-foreground">+</span>
          <span className="px-2 py-1 rounded-md bg-purple-100 text-purple-700 font-bold">G×25%</span>
        </div>
      </motion.div>

      {/* Pillar cards — sorted by urgency (worst first) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sorted.map((pillar, i) => (
          <PillarCard
            key={pillar.key}
            pillar={pillar}
            score={esg[pillar.key]}
            index={i}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {/* Focus tip */}
      {criticalCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200"
        >
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">
            <strong>Area prioritaria:</strong> {mostCritical.label} (score {esg[mostCritical.key]}/100).{' '}
            Migliorare questa area ha il maggiore impatto sullo score totale grazie al suo peso del {Math.round(mostCritical.weight * 100)}%.{' '}
            <button
              onClick={() => onNavigate?.(mostCritical.subMetrics[0].section)}
              className="underline font-semibold hover:text-red-900"
            >
              Vai alla sezione →
            </button>
          </p>
        </motion.div>
      )}
    </div>
  );
}