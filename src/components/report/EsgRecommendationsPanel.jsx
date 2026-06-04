import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  Leaf, 
  Shield, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  AlertTriangle,
  Target,
  Award
} from 'lucide-react';

const priorityColors = {
  alta: 'bg-red-100 text-red-700 border-red-200',
  media: 'bg-amber-100 text-amber-700 border-amber-200',
  bassa: 'bg-blue-100 text-blue-700 border-blue-200'
};

const pillarConfig = {
  ambiente: {
    icon: Leaf,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    label: 'Ambiente'
  },
  governance: {
    icon: Shield,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    label: 'Governance'
  }
};

function RecommendationCard({ rec, index, pillar }) {
  const config = pillarConfig[pillar];
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`p-4 rounded-xl border ${config.border} ${config.bg} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${config.color} bg-white flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm text-foreground">{rec.azione}</h4>
            <Badge className={`text-[9px] font-bold ${priorityColors[rec.priorita]}`}>
              {rec.priorita.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{rec.descrizione}</p>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Target className="w-3 h-3" />
              {rec.impatto}
            </span>
            {rec.punti && (
              <span className="flex items-center gap-1 text-green-600 font-bold">
                <Award className="w-3 h-3" />
                +{rec.punti} pts
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PillarScore({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border">
      <div className={`w-10 h-10 rounded-lg ${color} bg-white flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase font-bold">{label}</p>
        <p className="font-heading font-bold text-lg text-foreground">{value}/100</p>
      </div>
    </div>
  );
}

export default function EsgRecommendationsPanel({ reportId, data, report }) {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reportId) return;
    
    setLoading(true);
    base44.functions.invoke('generateRecommendations', { reportId })
      .then(res => {
        setRecommendations(res.data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setRecommendations(null);
      })
      .finally(() => setLoading(false));
  }, [reportId, report]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Analisi ESG in corso...</p>
        </div>
      </div>
    );
  }

  if (error || !recommendations) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">Analisi non disponibile</p>
          <p className="text-xs text-muted-foreground">{error || 'Errore nel caricamento dei consigli'}</p>
        </div>
      </div>
    );
  }

  const { esg, recommendations: recs } = recommendations;
  const hasAmbiente = recs.ambiente.length > 0;
  const hasGovernance = recs.governance.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Piano di Miglioramento ESG
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Consigli personalizzati basati sui tuoi dati per ottimizzare lo score
          </p>
        </div>
        <Button 
          onClick={() => base44.functions.invoke('generateRecommendations', { reportId })}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Zap className="w-4 h-4" />
          Aggiorna
        </Button>
      </div>

      {/* ESG Scores */}
      <div className="grid grid-cols-2 gap-3">
        <PillarScore 
          label="Ambiente (E)" 
          value={esg.E} 
          icon={Leaf} 
          color="text-green-600" 
        />
        <PillarScore 
          label="Governance (G)" 
          value={esg.G} 
          icon={Shield} 
          color="text-purple-600" 
        />
      </div>

      {/* Ambiente Recommendations */}
      {hasAmbiente && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold text-sm text-foreground">Ambiente & Energia</h3>
          </div>
          <div className="space-y-2">
            {recs.ambiente.map((rec, i) => (
              <RecommendationCard 
                key={i} 
                rec={rec} 
                index={i} 
                pillar="ambiente" 
              />
            ))}
          </div>
        </div>
      )}

      {/* Governance Recommendations */}
      {hasGovernance && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-sm text-foreground">Governance</h3>
          </div>
          <div className="space-y-2">
            {recs.governance.map((rec, i) => (
              <RecommendationCard 
                key={i} 
                rec={rec} 
                index={i} 
                pillar="governance" 
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasAmbiente && !hasGovernance && (
        <div className="text-center py-8 bg-green-50 rounded-xl border border-green-200">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="font-semibold text-green-800">Ottimo lavoro!</p>
          <p className="text-sm text-green-600 mt-1">
            Il tuo report ha già un ottimo livello di completezza ESG
          </p>
        </div>
      )}

      {/* Footer */}
      {(hasAmbiente || hasGovernance) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800 mb-1">
                Potenziale di miglioramento
              </p>
              <p className="text-xs text-green-700">
                Implementando queste azioni puoi aumentare il tuo score ESG fino a 
                <span className="font-bold"> +15-20 punti</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}