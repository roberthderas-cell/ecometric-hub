import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutTemplate, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

/** Shown inside the New Report dialog — lets the user pick a template */
export function TemplatePicker({ onSelect, selectedId }) {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['report_templates'],
    queryFn: () => base44.entities.ReportTemplate.list('-created_date', 50),
  });

  if (isLoading) return <div className="text-xs text-muted-foreground py-2">Caricamento modelli...</div>;
  if (!templates.length) return (
    <p className="text-xs text-muted-foreground italic">Nessun modello salvato ancora. Puoi crearne uno dalla <span className="font-semibold">Dashboard KPI</span> di un report completato.</p>
  );

  return (
    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
      {/* "blank" option */}
      <button
        onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${!selectedId ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
      >
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Plus className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">Report vuoto</p>
          <p className="text-xs text-muted-foreground">Inizia da zero</p>
        </div>
        {!selectedId && <Check className="w-4 h-4 text-primary shrink-0" />}
      </button>

      {templates.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${selectedId === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
        >
          <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
            <LayoutTemplate className="w-4 h-4 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{t.name}</p>
            {t.description && <p className="text-xs text-muted-foreground truncate">{t.description}</p>}
          </div>
          {selectedId === t.id && <Check className="w-4 h-4 text-primary shrink-0" />}
        </button>
      ))}
    </div>
  );
}

/** Full management modal: save current report as template + list/delete existing */
export function TemplateManagerModal({ open, onClose, currentData }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['report_templates'],
    queryFn: () => base44.entities.ReportTemplate.list('-created_date', 50),
    enabled: open,
  });

  const saveMutation = useMutation({
    mutationFn: (d) => base44.entities.ReportTemplate.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report_templates'] });
      toast.success('Modello salvato!');
      setName('');
      setDescription('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ReportTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['report_templates'] }),
  });

  const handleSave = () => {
    if (!name.trim()) return;
    saveMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      data: currentData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <span className="w-8 h-8 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
              <LayoutTemplate className="w-4 h-4 text-green-700" />
            </span>
            Modelli di Report
          </DialogTitle>
        </DialogHeader>

        {/* Save current as template */}
        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/3 p-4 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Salva questo report come modello</p>
          <Input
            placeholder="Nome modello (es. Sede di Milano, Reparto Produzione)"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Input
            placeholder="Descrizione opzionale"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saveMutation.isPending}
            className="w-full gap-2 bg-primary"
          >
            {saveMutation.isPending
              ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Plus className="w-4 h-4" />}
            Salva come Modello
          </Button>
        </div>

        {/* Existing templates */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Modelli salvati ({templates.length})</p>
          {isLoading ? (
            <p className="text-xs text-muted-foreground py-2">Caricamento...</p>
          ) : templates.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">Nessun modello ancora salvato.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <AnimatePresence>
                {templates.map(t => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-card"
                  >
                    <LayoutTemplate className="w-4 h-4 text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{t.name}</p>
                      {t.description && <p className="text-xs text-muted-foreground truncate">{t.description}</p>}
                    </div>
                    <button
                      onClick={() => { if (confirm(`Eliminare il modello "${t.name}"?`)) deleteMutation.mutate(t.id); }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Chiudi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}