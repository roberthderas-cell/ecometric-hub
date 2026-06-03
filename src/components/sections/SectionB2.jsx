import SectionHeader from '@/components/report/SectionHeader';
import { TextArea } from '@/components/report/FormField';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import KPICard from '@/components/report/KPICard';

const ISSUE_DEFAULTS = [
  'Cambiamento climatico', 'Inquinamento', 'Acqua e risorse marine', 'Biodiversità ed ecosistemi',
  'Uso delle risorse ed economia circolare', 'Forza lavoro propria', 'Lavoratori nella catena del valore',
  'Comunità interessate', 'Consumatori e utilizzatori finali', 'Condotta di impresa'
];

export default function SectionB2({ data, onUpdate, onNavigate }) {
  const b2 = data?.b2 || {};
  const issues = data?.b2mat?.issues?.length ? data.b2mat.issues : ISSUE_DEFAULTS.map(tema => ({ tema, pratiche: '', politica: '', target: '', kpi: '' }));
  const u = (field, value) => onUpdate('b2', field, value);

  const updateIssue = (i, key, val) => {
    const rows = [...issues];
    rows[i] = { ...rows[i], [key]: val };
    onUpdate('b2mat', 'issues', rows);
  };

  const active = issues.filter(r => r.pratiche || r.politica || r.target).length;
  const tgt = issues.filter(r => r.target).length;

  return (
    <div>
      <SectionHeader icon="📌" title="B2 — Pratiche, Politiche e Iniziative" description="Matrice completa dei 10 temi VSME (Appendice B): pratiche attive, policy formalizzate, target e KPI per ciascun tema." reference="VSME B2 | Standard par. 51–77 | Appendice B: 10 temi" />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <KPICard label="Temi con pratiche/policy" value={`${active}/10`} color="green" />
        <KPICard label="Con policy formalizzata" value={issues.filter(r => r.politica?.trim().length).length} color="blue" delay={0.05} />
        <KPICard label="Target definiti" value={tgt} color="amber" delay={0.1} />
      </div>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-3">Matrice 10 Temi Sostenibilità</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-green-50">
              {['Tema VSME', 'Pratiche operative attive', 'Policy formalizzata', 'Target e KPI', 'Indicatore di monitoraggio'].map(h => (
                <th key={h} className="text-left p-2 font-bold text-primary border-b border-green-200">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {issues.map((row, i) => (
                <tr key={i} className="border-b border-green-100">
                  <td className="p-2 font-semibold text-primary text-xs w-40">{row.tema}</td>
                  {['pratiche', 'politica', 'target', 'kpi'].map(key => (
                    <td key={key} className="p-1.5">
                      <textarea rows={2} className="w-full px-2 py-1.5 border border-green-200 rounded text-xs resize-y focus:border-green-500 focus:outline-none min-w-[140px]"
                        value={row[key] || ''} onChange={e => updateIssue(i, key, e.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Testo Narrativo (opzionale)</h3>
        <div className="grid grid-cols-1 gap-4">
          <TextArea label="Descrizione pratiche ESG" value={b2.descPrat} onChange={(v) => u('descPrat', v)} rows={3} />
          <TextArea label="Politiche formalizzate" value={b2.politiche} onChange={(v) => u('politiche', v)} rows={3} />
          <TextArea label="Iniziative future" value={b2.inizFuture} onChange={(v) => u('inizFuture', v)} rows={3} />
          <TextArea label="Target quantitativi e monitoraggio" value={b2.target} onChange={(v) => u('target', v)} rows={3} />
        </div>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('b1')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('c1')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}