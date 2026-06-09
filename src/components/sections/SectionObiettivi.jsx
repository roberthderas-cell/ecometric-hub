import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Zap, Users, Shield, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Circle } from 'lucide-react';
import SectionHeader from '@/components/report/SectionHeader';
import { calcESGScore } from '@/lib/vsmeDefaults';

const PILLARS = [
  { key: 'E', label: 'Ambiente', icon: Zap, color: '#16A34A', bg: '#dcfce7', desc: 'Score ambientale: rinnovabili, GHG, rifiuti' },
  { key: 'S', label: 'Sociale', icon: Users, color: '#2563EB', bg: '#dbeafe', desc: 'Score sociale: H&S, genere, formazione' },
  { key: 'G', label: 'Governance', icon: Shield, color: '#A855F7', bg: '#f3e8ff', desc: 'Score governance: compliance, certificazioni' },
  { key: 'tot', label: 'Score ESG Totale', icon: Target, color: '#059669', bg: '#d1fae5', desc: 'Score ESG complessivo pesato' },
];

function ProgressBar({ value, target, color }) {
  const pct = Math.min(100, value);
  const targetPct = Math.min(100, target);
  return (
    <div className="relative h-3 bg-muted rounded-full overflow-visible">
      {/* Target marker */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full z-10"
        style={{ left: `${targetPct}%`, backgroundColor: color, opacity: 0.5 }}
      />
      {/* Progress fill */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function PillarTargetCard({ pillar, currentScore, targetN, targetN1, onChangeN, onChangeN1 }) {
  const Icon = pillar.icon;
  const current = currentScore[pillar.key] ?? 0;
  const gapN = Math.max(0, targetN - current);
  const gapN1 = Math.max(0, targetN1 - targetN);
  const reachedN = current >= targetN;
  const reachedN1 = current >= targetN1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-5 hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: pillar.bg }}>
            <Icon className="w-5 h-5" style={{ color: pillar.color }} />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-bold text-sm">{pillar.label}</h3>
            <p className="text-xs text-muted-foreground">{pillar.desc}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold font-heading" style={{ color: pillar.color }}>{current}</div>
            <div className="text-[10px] text-muted-foreground">attuale /100</div>
          </div>
        </div>

        {/* Progress vs Anno N */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground">Obiettivo Anno N</span>
            <div className="flex items-center gap-1.5">
              {reachedN
                ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600 font-bold">Raggiunto!</span></>
                : <><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /><span className="text-amber-600 font-semibold">+{gapN} punti mancanti</span></>
              }
            </div>
          </div>
          <ProgressBar value={current} target={targetN} color={pillar.color} />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Attuale: <strong>{current}</strong></span>
            <span>Target: <strong style={{ color: pillar.color }}>{targetN}</strong></span>
          </div>
        </div>

        {/* Slider Anno N */}
        <div className="mb-5">
          <Slider
            value={[targetN]}
            onValueChange={([v]) => onChangeN(v)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0</span><span>100</span>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground">Obiettivo Anno N+1</span>
            <div className="flex items-center gap-1.5">
              {reachedN1
                ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600 font-bold">Già superato!</span></>
                : <span className="text-slate-500 font-semibold">+{gapN1} da target N</span>
              }
            </div>
          </div>
          <ProgressBar value={current} target={targetN1} color={pillar.color} />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Attuale: <strong>{current}</strong></span>
            <span>Target: <strong style={{ color: pillar.color }}>{targetN1}</strong></span>
          </div>
          <Slider
            value={[targetN1]}
            onValueChange={([v]) => onChangeN1(v)}
            min={targetN}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </Card>
    </motion.div>
  );
}

export default function SectionObiettivi({ data, onUpdate, onNavigate, report }) {
  const esg = calcESGScore(data);
  const year = report?.year || data?.ana?.anno || new Date().getFullYear();

  const saved = data?.obiettivi || {};
  const [targets, setTargets] = useState({
    E_N: saved.E_N ?? Math.min(100, esg.E + 8),
    S_N: saved.S_N ?? Math.min(100, esg.S + 8),
    G_N: saved.G_N ?? Math.min(100, esg.G + 8),
    tot_N: saved.tot_N ?? Math.min(100, esg.tot + 8),
    E_N1: saved.E_N1 ?? Math.min(100, esg.E + 18),
    S_N1: saved.S_N1 ?? Math.min(100, esg.S + 18),
    G_N1: saved.G_N1 ?? Math.min(100, esg.G + 18),
    tot_N1: saved.tot_N1 ?? Math.min(100, esg.tot + 18),
  });

  const handleChange = (key, val) => {
    const newTargets = { ...targets, [key]: val };
    // se N+1 < N, alza N+1
    if (key.endsWith('_N')) {
      const n1Key = key.replace('_N', '_N1');
      if (newTargets[n1Key] < val) newTargets[n1Key] = val;
    }
    setTargets(newTargets);
    onUpdate('obiettivi', key, val);
    // Sync legacy targets (pillar key only) for KPI alert compatibility
    if (key.endsWith('_N')) {
      onUpdate('targets', key.replace('_N', ''), val);
    }
  };

  const overallProgress = () => {
    const pillarsN = PILLARS.filter(p => p.key !== 'tot');
    const reached = pillarsN.filter(p => esg[p.key] >= targets[p.key + '_N']).length;
    return { reached, total: pillarsN.length };
  };
  const prog = overallProgress();

  return (
    <div>
      <SectionHeader
        icon="🎯"
        title="Obiettivi ESG"
        description={`Definisci i target per l'anno in corso (${year}) e per il prossimo anno (${year + 1}). Il progresso viene calcolato in tempo reale dai dati inseriti nel report.`}
        reference={`Anno ${year} in corso · Confronto con score reale`}
      />

      {/* Summary banner */}
      <Card className="p-4 mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm">Progresso Obiettivi Anno {year}</p>
              <p className="text-xs text-muted-foreground">{prog.reached}/{prog.total} pilastri raggiunti</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {PILLARS.filter(p => p.key !== 'tot').map(p => {
              const reached = esg[p.key] >= targets[p.key + '_N'];
              const Icon = p.icon;
              return (
                <div key={p.key} className="flex items-center gap-1.5 text-xs font-semibold">
                  {reached
                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                    : <Circle className="w-4 h-4 text-muted-foreground" />
                  }
                  <Icon className="w-3.5 h-3.5" style={{ color: p.color }} />
                  <span style={{ color: reached ? '#16a34a' : undefined }}>{p.label}</span>
                </div>
              );
            })}
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold font-heading text-primary">{esg.tot}</div>
            <div className="text-xs text-muted-foreground">Score ESG attuale</div>
          </div>
        </div>
      </Card>

      {/* Pillar cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {PILLARS.map(p => (
          <PillarTargetCard
            key={p.key}
            pillar={p}
            currentScore={esg}
            targetN={targets[p.key + '_N']}
            targetN1={targets[p.key + '_N1']}
            onChangeN={(v) => handleChange(p.key + '_N', v)}
            onChangeN1={(v) => handleChange(p.key + '_N1', v)}
          />
        ))}
      </div>

      {/* Legend */}
      <Card className="p-4 mb-6 bg-muted/30">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 <strong>Come leggere i grafici:</strong> La barra colorata mostra lo score attuale. Il segno verticale indica il target impostato. Quando la barra supera il segno, l'obiettivo è raggiunto. I target Anno N vengono anche usati dal pannello Alert KPI nella campanella.
        </p>
      </Card>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => onNavigate('consigli')} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Consigli ESG
        </Button>
        <Button onClick={() => onNavigate('dash')} className="bg-primary gap-2">
          Dashboard <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}