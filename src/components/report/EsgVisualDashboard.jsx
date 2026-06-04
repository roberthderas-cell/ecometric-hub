import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Leaf, Droplets, Recycle, Users, Shield, TrendingUp } from 'lucide-react';

const COLORS = {
  E: '#16A34A',
  S: '#2563EB',
  G: '#A855F7',
  tot: '#059669',
  positive: '#22C55E',
  warning: '#F59E0B',
  negative: '#EF4444'
};

const pieColors = ['#16A34A', '#2563EB', '#A855F7'];

function EsgScoreCard({ esg }) {
  const data = [
    { name: 'Ambiente (E)', value: esg.E || 0, color: COLORS.E },
    { name: 'Sociale (S)', value: esg.S || 0, color: COLORS.S },
    { name: 'Governance (G)', value: esg.G || 0, color: COLORS.G },
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-green-50 border-green-200">
      <h3 className="font-heading font-bold text-lg text-foreground mb-4 flex items-center gap-2">
        <Leaf className="w-5 h-5 text-green-600" />
        Composizione Score ESG
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center gap-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">{item.name}</p>
                <p className="font-heading font-bold text-lg" style={{ color: item.color }}>{item.value}/100</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function EnergyMixChart({ data }) {
  const en = data?.en || {};
  const elRete = parseFloat(en.elReteN) || 0;
  const elFV = parseFloat(en.elFVN) || 0;
  const tot = elRete + elFV;
  const pRete = tot > 0 ? (elRete / tot) * 100 : 0;
  const pFV = tot > 0 ? (elFV / tot) * 100 : 0;

  const chartData = [
    { name: 'Rete', value: pRete, color: '#64748B' },
    { name: 'Fotovoltaico', value: pFV, color: '#F59E0B' },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-heading font-bold text-lg text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-amber-500" />
        Mix Energetico
      </h3>
      {tot > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center gap-3">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium">{item.name}</p>
                  <p className="font-heading font-bold text-lg" style={{ color: item.color }}>{item.value.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">Dati energetici non disponibili</p>
      )}
    </Card>
  );
}

function WasteChart({ data }) {
  const ri = data?.ri || {};
  const tot = parseFloat(ri.totN) || 0;
  const peri = parseFloat(ri.periN) || 0;
  const rec = parseFloat(ri.recN) || 0;
  const nonPer = Math.max(0, tot - peri);
  const nonRec = Math.max(0, tot - rec);

  const compositionData = [
    { name: 'Non Pericolosi', value: nonPer, color: '#22C55E' },
    { name: 'Pericolosi', value: peri, color: '#EF4444' },
  ];

  const destinationData = [
    { name: 'Recupero', value: rec, color: '#22C55E' },
    { name: 'Smaltimento', value: nonRec, color: '#F59E0B' },
  ];

  const pRec = tot > 0 ? (rec / tot) * 100 : 0;

  return (
    <Card className="p-6">
      <h3 className="font-heading font-bold text-lg text-foreground mb-4 flex items-center gap-2">
        <Recycle className="w-5 h-5 text-green-600" />
        Gestione Rifiuti
      </h3>
      {tot > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-2">Composizione</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={compositionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={({ value }) => `${(value / tot * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {compositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-2">Destinazione</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={destinationData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={({ value }) => `${(value / tot * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {destinationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">Tasso di riciclo</span>
              <span className="text-2xl font-bold text-green-600">{pRec.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">Dati rifiuti non disponibili</p>
      )}
    </Card>
  );
}

function WaterChart({ data }) {
  const acfonti = data?.acfonti?.fonti || [];
  const fontiData = acfonti.map(f => ({
    name: f.fonte,
    value: parseFloat(f.prelievo) || 0,
    color: f.stress?.toLowerCase() === 'si' ? '#EF4444' : '#3B82F6'
  }));

  const tot = fontiData.reduce((s, f) => s + f.value, 0);

  return (
    <Card className="p-6">
      <h3 className="font-heading font-bold text-lg text-foreground mb-4 flex items-center gap-2">
        <Droplets className="w-5 h-5 text-blue-600" />
        Prelievo Idrico
      </h3>
      {tot > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fontiData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${(value / tot * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {fontiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3">
            {fontiData.map((item) => (
              <div key={item.name} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium">{item.name}</p>
                  <p className="font-heading font-bold text-lg" style={{ color: item.color }}>{item.value} m³</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">Dati idrici non disponibili</p>
      )}
    </Card>
  );
}

function PersonnelChart({ data }) {
  const pe = data?.pe || {};
  const donne = parseFloat(pe.donne) || 0;
  const uomini = parseFloat(pe.uomini) || 0;
  const tot = donne + uomini;

  const genderData = [
    { name: 'Donne', value: donne, color: '#EC4899' },
    { name: 'Uomini', value: uomini, color: '#3B82F6' },
  ];

  const pDonne = tot > 0 ? (donne / tot) * 100 : 0;
  const pUomini = tot > 0 ? (uomini / tot) * 100 : 0;

  return (
    <Card className="p-6">
      <h3 className="font-heading font-bold text-lg text-foreground mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-purple-600" />
        Composizione Forza Lavoro
      </h3>
      {tot > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${((value / tot) * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center gap-3">
            {genderData.map((item) => (
              <div key={item.name} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium">{item.name}</p>
                  <p className="font-heading font-bold text-lg" style={{ color: item.color }}>{item.value} ({((item.value / tot) * 100).toFixed(1)}%)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">Dati personale non disponibili</p>
      )}
    </Card>
  );
}

function GovernanceBarChart({ data }) {
  const gov = data?.gov || {};
  
  const certifications = [
    { name: 'Codice Etico', value: gov.codEtico === 'si' ? 1 : 0, color: COLORS.positive },
    { name: 'Modello 231', value: gov.mog231 === 'si' ? 1 : 0, color: COLORS.positive },
    { name: 'ISO 45001', value: gov.iso45001 === 'si' ? 1 : 0, color: COLORS.positive },
    { name: 'Pari Opportunità', value: gov.pariGen === 'si' ? 1 : 0, color: COLORS.positive },
    { name: 'Whistleblowing', value: gov.wb === 'si' ? 1 : 0, color: COLORS.positive },
  ];

  const adopted = certifications.filter(c => c.value === 1).length;
  const total = certifications.length;

  return (
    <Card className="p-6">
      <h3 className="font-heading font-bold text-lg text-foreground mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-purple-600" />
        Certificazioni & Policy
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={certifications} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 1]} hide />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {certifications.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value ? COLORS.positive : '#E2E8F0'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 bg-purple-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-purple-800">Adozione certificazioni</span>
          <span className="text-2xl font-bold text-purple-600">{adopted}/{total}</span>
        </div>
      </div>
    </Card>
  );
}

export default function EsgVisualDashboard({ data }) {
  const en = data?.en || {};
  const elRete = parseFloat(en.elReteN) || 0;
  const elFV = parseFloat(en.elFVN) || 0;
  const ispra = parseFloat(en.ispra) || 0.211;
  const s2 = (elRete * ispra) / 1000;

  const ri = data?.ri || {};
  const totRifiuti = parseFloat(ri.totN) || 0;
  const recRifiuti = parseFloat(ri.recN) || 0;
  const pRec = totRifiuti > 0 ? (recRifiuti / totRifiuti) * 100 : 0;

  const pe = data?.pe || {};
  const donne = parseFloat(pe.donne) || 0;
  const totPersonale = (parseFloat(pe.donne) || 0) + (parseFloat(pe.uomini) || 0);
  const pDonne = totPersonale > 0 ? (donne / totPersonale) * 100 : 0;

  const gov = data?.gov || {};
  let certCount = 0;
  if (gov.codEtico === 'si') certCount++;
  if (gov.mog231 === 'si') certCount++;
  if (gov.iso45001 === 'si') certCount++;
  if (gov.pariGen === 'si') certCount++;
  if (gov.wb === 'si') certCount++;

  const kpiData = [
    { label: 'Energie Rinnovabili', value: ((elFV / (elRete + elFV)) * 100) || 0, unit: '%', icon: '⚡', color: COLORS.positive },
    { label: 'Riciclo Rifiuti', value: pRec, unit: '%', icon: '♻️', color: COLORS.positive },
    { label: 'Donne in Azienda', value: pDonne, unit: '%', icon: '👥', color: COLORS.S },
    { label: 'Certificazioni', value: certCount, unit: '/5', icon: '🏆', color: COLORS.G },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Dashboard ESG</h2>
        <p className="text-sm text-muted-foreground">Visualizza grafici e metriche ambientali basati sui dati inseriti</p>
      </div>

      {/* KPI Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiData.map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 border border-border shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{kpi.icon}</span>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">{kpi.label}</p>
            </div>
            <p className="font-heading font-extrabold text-2xl" style={{ color: kpi.color }}>
              {kpi.value.toFixed(kpi.unit === '/5' ? 0 : 1)}{kpi.unit}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EsgScoreCard esg={data?._esg || { E: 0, S: 0, G: 0, tot: 0 }} />
        <EnergyMixChart data={data} />
        <WasteChart data={data} />
        <WaterChart data={data} />
        <PersonnelChart data={data} />
        <GovernanceBarChart data={data} />
      </div>
    </div>
  );
}