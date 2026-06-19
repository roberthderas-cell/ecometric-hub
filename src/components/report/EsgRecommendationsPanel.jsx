import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, TrendingUp, Leaf, Shield, Users,
  Zap, CheckCircle2, AlertTriangle, Target, Award,
  RefreshCw, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';

const priorityColors = {
  alta: 'bg-red-100 text-red-700 border-red-200',
  media: 'bg-amber-100 text-amber-700 border-amber-200',
  bassa: 'bg-blue-100 text-blue-700 border-blue-200',
};

const pillarConfig = {
  ambiente: {
    icon: Leaf,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    ring: 'ring-green-400',
    label: 'Ambiente & Energia',
    scoreKey: 'E',
    scoreColor: 'text-green-700',
    scoreBg: 'bg-green-50 border-green-200',
  },
  sociale: {
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    ring: 'ring-blue-400',
    label: 'Sociale',
    scoreKey: 'S',
    scoreColor: 'text-blue-700',
    scoreBg: 'bg-blue-50 border-blue-200',
  },
  governance: {
    icon: Shield,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    ring: 'ring-purple-400',
    label: 'Governance',
    scoreKey: 'G',
    scoreColor: 'text-purple-700',
    scoreBg: 'bg-purple-50 border-purple-200',
  },
};

function ScoreBar({ value, color }) {
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

function PillarScore({ label, value, icon: Icon, color, barColor, bg, border }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${border} ${bg} flex items-center gap-3`}
    >
      <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon className={`w-4.5 h-4.5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">{label}</p>
        <div className="flex items-end gap-1">
          <span className={`font-heading font-bold text-xl ${color}`}>{value}</span>
          <span className="text-xs text-muted-foreground mb-0.5">/100</span>
        </div>
        <ScoreBar value={value} color={barColor} />
      </div>
    </motion.div>
  );
}

function RecommendationCard({ rec, index, pillar }) {
  const config = pillarConfig[pillar];
  const Icon = config.icon;
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden hover:shadow-sm transition-all`}
    >
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-4"
      >
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground">{rec.azione}</span>
              <Badge className={`text-[9px] font-bold border ${priorityColors[rec.priorita]}`}>
                {rec.priorita?.toUpperCase()}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <Target className="w-3 h-3 shrink-0" />
              {rec.impatto}
            </p>
          </div>
          <div className={`shrink-0 ${config.color} transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`px-4 pb-4 pt-0 border-t ${config.border} mt-0`}>
              <div className="pt-3 grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <p className="font-bold text-muted-foreground uppercase tracking-wide mb-1">Area</p>
                  <p className="text-foreground">{rec.area}</p>
                </div>
                <div>
                  <p className="font-bold text-muted-foreground uppercase tracking-wide mb-1">Target</p>
                  <p className="text-foreground">{rec.target}</p>
                </div>
                {rec.punti && (
                  <div className="col-span-2">
                    <p className="font-bold text-muted-foreground uppercase tracking-wide mb-1">Impatto score</p>
                    <p className="text-green-600 font-bold flex items-center gap-1">
                      <Award className="w-3 h-3" /> +{rec.punti} punti ESG
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PillarSection({ pillar, recs }) {
  const config = pillarConfig[pillar];
  const Icon = config.icon;
  if (!recs || recs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className={`flex items-center gap-2 mb-3`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
        <h3 className="font-heading font-bold text-sm text-foreground">{config.label}</h3>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.scoreBg} ${config.scoreColor}`}>
          {recs.length} azione{recs.length > 1 ? 'i' : 'e'}
        </span>
      </div>
      <div className="space-y-2">
        {recs.map((rec, i) => (
          <RecommendationCard key={`${pillar}-${i}`} rec={rec} index={i} pillar={pillar} />
        ))}
      </div>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <div className="w-14 h-14 border-4 border-green-100 border-t-green-500 rounded-full animate-spin" />
        <Sparkles className="w-5 h-5 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">Analisi ESG in corso...</p>
        <p className="text-xs text-muted-foreground mt-1">Elaboro i tuoi dati per generare consigli personalizzati</p>
      </div>
    </div>
  );
}

export default function EsgRecommendationsPanel({ reportId, data, report }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('generateRecommendations', { reportId });
      setResult(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Errore nel caricamento dei consigli');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  // Carica al mount
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (loading) return <LoadingState />;

  if (error || !result) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Analisi non disponibile</p>
          <p className="text-xs text-muted-foreground mt-1">{error || 'Errore nel caricamento'}</p>
        </div>
        <Button onClick={fetchRecommendations} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Riprova
        </Button>
      </div>
    );
  }

  const { esg, recommendations: recs } = result;
  const hasAny = (recs.ambiente?.length || 0) + (recs.sociale?.length || 0) + (recs.governance?.length || 0) > 0;
  const totalActions = (recs.ambiente?.length || 0) + (recs.sociale?.length || 0) + (recs.governance?.length || 0);
  const potenziale = totalActions * 3 + 5;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={lastUpdated?.toISOString()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Piano di Miglioramento ESG
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Consigli personalizzati basati sui tuoi dati per ottimizzare lo score
            </p>
            {lastUpdated && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Aggiornato: {lastUpdated.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          <Button
            onClick={fetchRecommendations}
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
        </div>

        {/* ESG Scores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <PillarScore
            label="Ambiente (E)"
            value={esg.E ?? 0}
            icon={Leaf}
            color="text-green-600"
            barColor="bg-green-500"
            bg="bg-green-50"
            border="border-green-200"
          />
          <PillarScore
            label="Sociale (S)"
            value={esg.S ?? 0}
            icon={Users}
            color="text-blue-600"
            barColor="bg-blue-500"
            bg="bg-blue-50"
            border="border-blue-200"
          />
          <PillarScore
            label="Governance (G)"
            value={esg.G ?? 0}
            icon={Shield}
            color="text-purple-600"
            barColor="bg-purple-500"
            bg="bg-purple-50"
            border="border-purple-200"
          />
        </div>

        {/* Sezioni raccomandazioni */}
        {hasAny ? (
          <div className="space-y-6">
            <PillarSection pillar="ambiente" recs={recs.ambiente} />
            <PillarSection pillar="sociale" recs={recs.sociale} />
            <PillarSection pillar="governance" recs={recs.governance} />
          </div>
        ) : (
          <div className="text-center py-10 bg-green-50 rounded-xl border border-green-200">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-heading font-bold text-green-800">Ottimo lavoro!</p>
            <p className="text-sm text-green-600 mt-1">Il tuo report ha già un ottimo livello ESG</p>
          </div>
        )}

        {/* Footer potenziale */}
        {hasAny && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Potenziale di miglioramento</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Implementando {totalActions} azioni puoi aumentare il tuo score ESG fino a{' '}
                  <span className="font-bold">+{potenziale}-{potenziale + 5} punti</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}