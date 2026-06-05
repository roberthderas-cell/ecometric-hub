import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { X, Clock, GitCompare, ChevronDown, ChevronUp, Tag, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SnapshotDiff from './SnapshotDiff';

const RATING_COLOR = {
  Leader: 'bg-green-100 text-green-700 border-green-200',
  Avanzato: 'bg-blue-100 text-blue-700 border-blue-200',
  Buono: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'In crescita': 'bg-amber-100 text-amber-700 border-amber-200',
  Base: 'bg-slate-100 text-slate-600 border-slate-200',
};

const SCORE_COLOR = {
  Leader: 'text-green-600',
  Avanzato: 'text-blue-600',
  Buono: 'text-cyan-600',
  'In crescita': 'text-amber-600',
  Base: 'text-slate-500',
};

function ScorePill({ label, value, color }) {
  return (
    <div className="text-center">
      <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`font-heading font-extrabold text-base ${color}`}>{value ?? '—'}</p>
    </div>
  );
}

function SnapshotCard({ snap, index, isFirst, isLast, prevSnap, onCompare, compareTarget, onLabel }) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelVal, setLabelVal] = useState(snap.label || '');
  const delta = prevSnap ? snap.esg_tot - prevSnap.esg_tot : null;
  const isCompareSelected = compareTarget?.id === snap.id;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`relative flex gap-4`}
    >
      {/* Timeline line */}
      <div className="flex flex-col items-center shrink-0 w-8">
        <div className={`w-3 h-3 rounded-full border-2 mt-3 ${isCompareSelected ? 'border-primary bg-primary' : 'border-border bg-card'}`} />
        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-4 rounded-xl border p-4 transition-all ${isCompareSelected ? 'border-primary/50 bg-primary/5 shadow-md' : 'border-border bg-card hover:shadow-sm'}`}>
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {format(new Date(snap.created_date), 'd MMM yyyy · HH:mm', { locale: it })}
              </span>
              {isFirst && (
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Versione corrente</span>
              )}
              {snap.label && !editingLabel && (
                <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                  <Bookmark className="w-2.5 h-2.5" /> {snap.label}
                </span>
              )}
            </div>

            {/* Inline label editor */}
            {editingLabel ? (
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  autoFocus
                  value={labelVal}
                  onChange={e => setLabelVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { onLabel(snap.id, labelVal); setEditingLabel(false); } if (e.key === 'Escape') setEditingLabel(false); }}
                  placeholder="Es. Prima bozza, Post audit..."
                  className="text-xs border border-border rounded-lg px-2 py-1 w-52 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button onClick={() => { onLabel(snap.id, labelVal); setEditingLabel(false); }} className="text-[10px] font-bold text-primary">Salva</button>
                <button onClick={() => setEditingLabel(false)} className="text-[10px] text-muted-foreground">Annulla</button>
              </div>
            ) : (
              <button
                onClick={() => setEditingLabel(true)}
                className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
              >
                <Tag className="w-2.5 h-2.5" /> {snap.label ? 'Modifica etichetta' : 'Aggiungi etichetta'}
              </button>
            )}
          </div>

          {/* Score badges */}
          <div className="flex items-center gap-3">
            {delta !== null && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${delta > 0 ? 'bg-green-50 text-green-700 border-green-200' : delta < 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-muted text-muted-foreground border-border'}`}>
                {delta > 0 ? '▲' : delta < 0 ? '▼' : '='} {Math.abs(delta)} pt
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${RATING_COLOR[snap.rating] || RATING_COLOR.Base}`}>
              {snap.rating || 'Base'}
            </span>
          </div>
        </div>

        {/* Scores row */}
        <div className="grid grid-cols-4 gap-2 bg-muted/40 rounded-lg px-3 py-2 mb-3">
          <ScorePill label="ESG Tot" value={snap.esg_tot} color={SCORE_COLOR[snap.rating] || 'text-foreground'} />
          <ScorePill label="Ambiente" value={snap.esg_e} color="text-green-600" />
          <ScorePill label="Sociale" value={snap.esg_s} color="text-blue-600" />
          <ScorePill label="Gov." value={snap.esg_g} color="text-purple-600" />
        </div>

        {/* Completion */}
        {snap.completion != null && (
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Completamento</span>
              <span className="text-[10px] font-bold">{snap.completion}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary/60 rounded-full" style={{ width: `${snap.completion}%` }} />
            </div>
          </div>
        )}

        {/* Actions */}
        {!isFirst && snap.data_snapshot && (
          <Button
            size="sm"
            variant={isCompareSelected ? 'default' : 'outline'}
            onClick={() => onCompare(isCompareSelected ? null : snap)}
            className="gap-1.5 h-7 text-xs"
          >
            <GitCompare className="w-3 h-3" />
            {isCompareSelected ? 'Deseleziona' : 'Confronta con versione attuale'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function HistoryPanel({ reportId, currentData, onClose }) {
  const queryClient = useQueryClient();
  const [compareTarget, setCompareTarget] = useState(null);

  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ['esg_snapshots', reportId],
    queryFn: () => base44.entities.EsgSnapshot.filter({ report_id: reportId }, '-created_date', 100),
  });

  const updateLabel = useMutation({
    mutationFn: ({ id, label }) => base44.entities.EsgSnapshot.update(id, { label }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['esg_snapshots', reportId] }),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-heading font-extrabold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Storico versioni ESG
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {snapshots.length} versione{snapshots.length !== 1 ? 'i' : 'e'} salvata{snapshots.length !== 1 ? 'e' : ''} · Aggiornato ad ogni modifica significativa
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diff viewer */}
        <AnimatePresence>
          {compareTarget && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-primary/30 bg-primary/5"
            >
              <SnapshotDiff
                oldSnap={compareTarget}
                currentData={currentData}
                onClose={() => setCompareTarget(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm animate-pulse">
              Caricamento storico...
            </div>
          ) : snapshots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-4xl mb-3">🕐</p>
              <p className="font-heading font-bold text-sm mb-1">Nessuna versione salvata</p>
              <p className="text-xs">Le versioni vengono create automaticamente ad ogni modifica significativa (variazione ≥ 2 punti ESG).</p>
            </div>
          ) : (
            snapshots.map((snap, i) => (
              <SnapshotCard
                key={snap.id}
                snap={snap}
                index={i}
                isFirst={i === 0}
                isLast={i === snapshots.length - 1}
                prevSnap={snapshots[i + 1] || null}
                compareTarget={compareTarget}
                onCompare={setCompareTarget}
                onLabel={(id, label) => updateLabel.mutate({ id, label })}
              />
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button onClick={onClose} variant="outline" size="sm">Chiudi</Button>
        </div>
      </motion.div>
    </div>
  );
}