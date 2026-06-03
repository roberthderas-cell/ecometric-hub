import SectionHeader from '@/components/report/SectionHeader';
import { TextArea } from '@/components/report/FormField';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SectionB1({ data, onUpdate, onNavigate }) {
  const a = data?.ana || {};
  const b1 = data?.b1 || {};
  const u = (field, value) => onUpdate('b1', field, value);

  const cat = a.dimManuale && a.dimManuale !== 'auto' ? a.dimManuale :
    (() => {
      const att = parseFloat(a.attivo) || 0, fatt = parseFloat(a.fatturato) || 0, dip = parseInt(a.hc) || 0;
      let micro = 0, small = 0;
      if (att <= 450000) micro++; if (fatt <= 900000) micro++; if (dip <= 10) micro++;
      if (att <= 5000000) small++; if (fatt <= 10000000) small++; if (dip <= 50) small++;
      return micro >= 2 ? 'Micro' : small >= 2 ? 'Piccola' : 'Media';
    })();

  const rows = [
    ['Ragione Sociale', a.ragione || '—'],
    ['Sede', a.sede || '—'],
    ['Codice ATECO/NACE', a.ateco || '—'],
    ['Forma Giuridica', a.forma || '—'],
    ['Anno di riferimento', a.anno || '—'],
    ['Perimetro', a.perimetro === 'consolidato' ? 'Consolidato' : 'Individuale'],
    ['Paesi di operatività', a.paesi || '—'],
    ['Totale Attivo', a.attivo ? `€ ${parseFloat(a.attivo).toLocaleString('it-IT')}` : '—'],
    ['Fatturato Netto', a.fatturato ? `€ ${parseFloat(a.fatturato).toLocaleString('it-IT')}` : '—'],
    ['N. Dipendenti FTE', a.fte || '—'],
    ['N. Dipendenti Headcount', a.hc || '—'],
    ['Categoria VSME', cat],
    ['Modulo applicabile', a.modulo === 'comprehensive' ? 'Base + Completo (B1–B11 + C1–C9)' : 'Solo Modulo Base (B1–B11)'],
    ['Certificazioni ESG', a.cert || 'Nessuna'],
  ];

  return (
    <div>
      <SectionHeader icon="📋" title="B1 — Basi di Preparazione" description="La disclosure introduttiva: chi siete, cosa copre questo documento, eventuali omissioni. È già quasi tutta compilata grazie all'anagrafica." reference="VSME B1 | Raccomandazione UE 2025/1710 | par. 1-50" />

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Dati Pre-popolati dall'Anagrafica</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800 mb-4">
          ✅ Questi dati vengono automaticamente dall'Anagrafica — vai lì per modificarli.
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/50"><th className="text-left p-3 font-bold text-muted-foreground text-xs uppercase tracking-wide">Campo</th><th className="text-left p-3 font-bold text-muted-foreground text-xs uppercase tracking-wide">Valore</th></tr></thead>
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-t border-border hover:bg-muted/20">
                  <td className="p-3 text-muted-foreground text-sm">{label}</td>
                  <td className="p-3 font-semibold text-primary text-sm">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <TextArea label="Omissioni di informazioni materiali" value={b1.omissioni} onChange={(v) => u('omissioni', v)} rows={3} hint="Se non ci sono omissioni scrivi: 'Nessuna omissione materiale.'" />
        {a.perimetro === 'consolidato' && (
          <div className="mt-4">
            <TextArea label="Elenco entità nel perimetro consolidato" value={b1.subsidiary} onChange={(v) => u('subsidiary', v)} rows={3} hint="Ragione sociale e paese per ogni società inclusa nel consolidato." />
          </div>
        )}
        <div className="mt-4">
          <TextArea label="Note aggiuntive" value={b1.noteB1} onChange={(v) => u('noteB1', v)} rows={2} hint="Standard di riferimento, assurance esterne, confrontabilità con anni precedenti…" />
        </div>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('gov')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('b2')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}