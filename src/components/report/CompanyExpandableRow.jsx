import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Link as LinkIcon, Briefcase, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PILLAR_COLORS = {
  E: '#16A34A',
  S: '#2563EB',
  G: '#A855F7',
  tot: '#059669',
};

const RATING_COLORS = {
  Leader: '#34D399',
  Avanzato: '#60A5FA',
  Buono: '#22D3EE',
  'In crescita': '#FCD34D',
  Base: '#94A3B8',
};

export default function CompanyExpandableRow({ company, reports, selectedMetrics, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const aggregatedByYear = {};
  reports.forEach(r => {
    const year = r.year;
    if (!aggregatedByYear[year] || (r.esg_score?.tot || 0) > (aggregatedByYear[year].esg_score?.tot || 0)) {
      aggregatedByYear[year] = r;
    }
  });
  
  const years = Object.keys(aggregatedByYear).sort((a, b) => parseInt(b) - parseInt(a));
  const latestReport = aggregatedByYear[years[0]];
  const esg = latestReport?.esg_score || { E: 0, S: 0, G: 0, tot: 0 };
  const targets = latestReport?.data?.obiettivi?.[parseInt(latestReport.year) + 1] || {};
  const ana = latestReport?.data?.ana || {};
  
  const ratingColor = RATING_COLORS[esg.rating] || '#94A3B8';

  // Calcola gap percentuale vs target
  const calculateGap = (actual, target) => {
    if (!target || target === 0) return null;
    const gap = ((actual - target) / target) * 100;
    return Math.round(gap * 10) / 10;
  };

  const gaps = {
    tot: calculateGap(esg.tot, targets.tot),
    E: calculateGap(esg.E, targets.E),
    S: calculateGap(esg.S, targets.S),
    G: calculateGap(esg.G, targets.G),
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="grid grid-cols-13 gap-4 items-center p-4 border-b border-border hover:bg-muted/50 transition-colors"
      >
        {/* Azienda */}
        <div className="col-span-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <div className="min-w-0">
            <h4 className="font-heading font-bold text-base truncate">{company}</h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div 
                className="px-2 py-0.5 rounded-full text-xs font-bold inline-block"
                style={{ color: ratingColor, backgroundColor: ratingColor + '15' }}
              >
                {esg.rating}
              </div>
              {ana?.ateco && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  ATECO {ana.ateco}
                </span>
              )}
              {ana?.dimensione && (
                <span className="text-xs text-muted-foreground capitalize">
                  {ana.dimensione === 'micro' ? 'Micro' : ana.dimensione === 'piccola' ? 'Piccola' : 'Media'}
                </span>
              )}
              {ana?.regione && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {ana.regione}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score Totale */}
        <div className="col-span-1 text-center">
          <span className="font-heading font-extrabold text-lg" style={{ color: PILLAR_COLORS.tot }}>
            {esg.tot}
          </span>
        </div>

        {/* Pilastri */}
        {selectedMetrics.includes('E') && (
          <div className="col-span-1 text-center">
            <span className="font-bold text-sm" style={{ color: PILLAR_COLORS.E }}>{esg.E}</span>
          </div>
        )}
        {selectedMetrics.includes('S') && (
          <div className="col-span-1 text-center">
            <span className="font-bold text-sm" style={{ color: PILLAR_COLORS.S }}>{esg.S}</span>
          </div>
        )}
        {selectedMetrics.includes('G') && (
          <div className="col-span-1 text-center">
            <span className="font-bold text-sm" style={{ color: PILLAR_COLORS.G }}>{esg.G}</span>
          </div>
        )}

        {/* Gap vs Target */}
        <div className="col-span-3 text-center">
          {gaps.tot !== null ? (
            <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block ${
              gaps.tot >= 0 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {gaps.tot >= 0 ? '+' : ''}{gaps.tot}%
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Nessun target</span>
          )}
        </div>

        {/* Azioni */}
        <div className="col-span-2 flex justify-center gap-2">
          <Link to={`/report/${latestReport?.id}/dash`}>
            <Button variant="outline" size="sm" className="gap-1">
              <LinkIcon className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Righe espande per anno */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-muted/30"
          >
            <div className="p-4 space-y-2">
              <h5 className="font-heading font-bold text-sm mb-3">Storico per Anno</h5>
              {years.map(year => {
                const report = aggregatedByYear[year];
                const score = report.esg_score || { E: 0, S: 0, G: 0, tot: 0 };
                const yearTargets = report.data?.obiettivi?.[parseInt(year) + 1] || {};
                const yearGap = calculateGap(score.tot, yearTargets.tot);
                
                return (
                  <div key={year} className="grid grid-cols-13 gap-4 items-center p-3 bg-card rounded-lg">
                    <div className="col-span-3 font-bold">{year}</div>
                    <div className="col-span-1 text-center font-bold" style={{ color: PILLAR_COLORS.tot }}>
                      {score.tot}
                    </div>
                    {selectedMetrics.includes('E') && (
                      <div className="col-span-1 text-center" style={{ color: PILLAR_COLORS.E }}>
                        {score.E}
                      </div>
                    )}
                    {selectedMetrics.includes('S') && (
                      <div className="col-span-1 text-center" style={{ color: PILLAR_COLORS.S }}>
                        {score.S}
                      </div>
                    )}
                    {selectedMetrics.includes('G') && (
                      <div className="col-span-1 text-center" style={{ color: PILLAR_COLORS.G }}>
                        {score.G}
                      </div>
                    )}
                    <div className="col-span-3 text-center">
                      {yearGap !== null ? (
                        <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block ${
                          yearGap >= 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {yearGap >= 0 ? '+' : ''}{yearGap}%
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="col-span-2 text-center">
                      <Badge variant={report.status === 'completato' ? 'default' : 'secondary'}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}