import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const RATING_COLOR = { Leader: '#059669', Avanzato: '#2563EB', Buono: '#0891B2', 'In crescita': '#D97706', Base: '#9CA3AF' };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 text-xs min-w-[160px]">
      <p className="font-bold text-muted-foreground mb-2">{label}</p>
      <p className="font-extrabold text-lg" style={{ color: RATING_COLOR[d?.rating] || '#059669' }}>
        {d?.esg_tot} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
      </p>
      {d?.rating && <p className="text-muted-foreground">Rating: <span className="font-bold">{d.rating}</span></p>}
      <div className="mt-2 space-y-0.5">
        <p><span className="text-green-600 font-bold">E</span> {d?.esg_e ?? '—'}</p>
        <p><span className="text-blue-600 font-bold">S</span> {d?.esg_s ?? '—'}</p>
        <p><span className="text-purple-600 font-bold">G</span> {d?.esg_g ?? '—'}</p>
      </div>
      {d?.completion != null && <p className="mt-1.5 text-muted-foreground">Completamento: {d.completion}%</p>}
    </div>
  );
}

export default function EsgTrendChart({ reportId }) {
  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ['esg_snapshots', reportId],
    queryFn: () => base44.entities.EsgSnapshot.filter({ report_id: reportId }, 'created_date', 100),
    refetchInterval: 8000,
  });

  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm animate-pulse">
          Caricamento trend ESG...
        </div>
      </Card>
    );
  }

  if (snapshots.length < 2) {
    return (
      <Card className="p-6 border-dashed">
        <div className="text-center text-muted-foreground">
          <p className="text-3xl mb-2">📈</p>
          <p className="font-heading font-bold text-sm mb-1">Trend ESG non ancora disponibile</p>
          <p className="text-xs">Il grafico si popola man mano che inserisci dati. Servono almeno 2 salvataggi per visualizzare l'andamento.</p>
        </div>
      </Card>
    );
  }

  const chartData = snapshots.map(s => ({
    label: format(new Date(s.created_date), 'd MMM HH:mm', { locale: it }),
    esg_tot: s.esg_tot,
    esg_e: s.esg_e,
    esg_s: s.esg_s,
    esg_g: s.esg_g,
    rating: s.rating,
    completion: s.completion,
  }));

  const latest = snapshots[snapshots.length - 1];
  const first = snapshots[0];
  const delta = (latest?.esg_tot ?? 0) - (first?.esg_tot ?? 0);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h4 className="font-heading text-sm font-bold text-primary">📈 Andamento ESG nel Tempo</h4>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">{snapshots.length} punti rilevati</span>
            {delta !== 0 && (
              <span className={`font-bold px-2.5 py-1 rounded-full ${delta > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {delta > 0 ? '▲' : '▼'} {Math.abs(delta)} pt dall'inizio
              </span>
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0FDF4" />
            <XAxis dataKey="label" fontSize={10} tick={{ fill: '#94a3b8' }} />
            <YAxis domain={[0, 100]} fontSize={10} tick={{ fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={70} stroke="#2563EB" strokeDasharray="4 3" label={{ value: 'Avanzato 70', fontSize: 10, fill: '#2563EB', position: 'right' }} />
            <ReferenceLine y={85} stroke="#059669" strokeDasharray="4 3" label={{ value: 'Leader 85', fontSize: 10, fill: '#059669', position: 'right' }} />
            <Line type="monotone" dataKey="esg_tot" name="ESG Totale" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: '#059669' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="esg_e" name="Ambiente (E)" stroke="#16a34a" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
            <Line type="monotone" dataKey="esg_s" name="Sociale (S)" stroke="#2563EB" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
            <Line type="monotone" dataKey="esg_g" name="Governance (G)" stroke="#7C3AED" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}