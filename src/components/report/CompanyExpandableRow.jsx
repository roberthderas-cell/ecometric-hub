import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
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
  
  const ratingColor = RATING_COLORS[esg.rating] || '#94A3B8';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="grid grid-cols-12 gap-4 items-center p-4 border-b border-border hover:bg-muted/50 transition-colors"
      >
        {/* Azienda */}
        <div className="col-span-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <div>
            <h4 className="font-heading font-bold text-base">{company}</h4>
            <div 
              className="px-2 py-0.5 rounded-full text-xs font-bold inline-block mt-1"
              style={{ color: ratingColor, backgroundColor: ratingColor + '15' }}
            >
              {esg.rating}
            </div>
          </div>
        </div>

        {/* Score Totale */}
        <div className="col-span-2 text-center">
          <span className="font-heading font-extrabold text-2xl" style={{ color: PILLAR_COLORS.tot }}>
            {esg.tot}
          </span>
          <span className="text-xs text-muted-foreground ml-1">/100</span>
        </div>

        {/* Pilastri */}
        {selectedMetrics.includes('E') && (
          <div className="col-span-2 text-center">
            <span className="font-bold" style={{ color: PILLAR_COLORS.E }}>{esg.E}</span>
          </div>
        )}
        {selectedMetrics.includes('S') && (
          <div className="col-span-2 text-center">
            <span className="font-bold" style={{ color: PILLAR_COLORS.S }}>{esg.S}</span>
          </div>
        )}
        {selectedMetrics.includes('G') && (
          <div className="col-span-2 text-center">
            <span className="font-bold" style={{ color: PILLAR_COLORS.G }}>{esg.G}</span>
          </div>
        )}

        {/* Azioni */}
        <div className="col-span-1 flex justify-center">
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
                return (
                  <div key={year} className="grid grid-cols-12 gap-4 items-center p-3 bg-card rounded-lg">
                    <div className="col-span-3 font-bold">{year}</div>
                    <div className="col-span-2 text-center font-bold" style={{ color: PILLAR_COLORS.tot }}>
                      {score.tot}
                    </div>
                    {selectedMetrics.includes('E') && (
                      <div className="col-span-2 text-center" style={{ color: PILLAR_COLORS.E }}>
                        {score.E}
                      </div>
                    )}
                    {selectedMetrics.includes('S') && (
                      <div className="col-span-2 text-center" style={{ color: PILLAR_COLORS.S }}>
                        {score.S}
                      </div>
                    )}
                    {selectedMetrics.includes('G') && (
                      <div className="col-span-2 text-center" style={{ color: PILLAR_COLORS.G }}>
                        {score.G}
                      </div>
                    )}
                    <div className="col-span-1 text-center">
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