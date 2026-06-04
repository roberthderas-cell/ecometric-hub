import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Zap, Users, Shield } from 'lucide-react';

const PILLAR_ICONS = {
  E: Zap,
  S: Users,
  G: Shield,
  tot: Target,
};

const PILLAR_COLORS = {
  E: '#16A34A',
  S: '#2563EB',
  G: '#A855F7',
  tot: '#059669',
};

const PILLAR_LABELS = {
  E: 'Ambiente',
  S: 'Sociale',
  G: 'Governance',
  tot: 'Score Totale',
};

export default function TargetSetter({ report, onSave, onClose }) {
  const currentScore = report.esg_score || { E: 0, S: 0, G: 0, tot: 0 };
  const existingTargets = report.data?.targets || {};
  
  const [targets, setTargets] = useState({
    E: existingTargets.E || Math.min(100, currentScore.E + 5),
    S: existingTargets.S || Math.min(100, currentScore.S + 5),
    G: existingTargets.G || Math.min(100, currentScore.G + 5),
    tot: existingTargets.tot || Math.min(100, currentScore.tot + 5),
  });

  const handleSave = () => {
    onSave({
      ...report.data,
      targets,
    });
  };

  const renderSlider = (pillar) => {
    const Icon = PILLAR_ICONS[pillar];
    const color = PILLAR_COLORS[pillar];
    const current = currentScore[pillar];
    const target = targets[pillar];
    const improvement = target - current;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: color + '20' }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <Label className="font-bold">{PILLAR_LABELS[pillar]}</Label>
              <p className="text-xs text-muted-foreground">
                Attuale: <span className="font-bold">{current}</span> → Target: <span className="font-bold" style={{ color }}>{target}</span>
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${improvement > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
          >
            {improvement > 0 ? '+' : ''}{improvement}
          </span>
        </div>
        
        <Slider
          value={[target]}
          onValueChange={([v]) => setTargets({ ...targets, [pillar]: v })}
          min={current}
          max={100}
          step={1}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Attuale ({current})</span>
          <span>100 (Eccellenza)</span>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Imposta Obiettivi {report.year + 1}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <p className="text-xs text-blue-800">
              💡 <strong>Suggerimento:</strong> Imposta obiettivi ambiziosi ma realistici. Un miglioramento di 5-10 punti per pilastro è considerato buono.
            </p>
          </motion.div>

          {renderSlider('E')}
          {renderSlider('S')}
          {renderSlider('G')}
          
          <div className="border-t pt-4">
            {renderSlider('tot')}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={handleSave} className="gap-2 bg-primary">
            <Target className="w-4 h-4" />
            Salva Obiettivi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}