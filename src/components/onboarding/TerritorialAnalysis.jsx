import { useEffect, useState } from 'react';
import { Loader2, Thermometer, Wind, Droplets, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

function Semaphore({ value, thresholds, unit, label }) {
  const color = value === null ? 'bg-gray-200 text-gray-500'
    : value < thresholds[0] ? 'bg-green-100 text-green-700 border-green-300'
    : value < thresholds[1] ? 'bg-amber-100 text-amber-700 border-amber-300'
    : 'bg-red-100 text-red-700 border-red-300';
  const dot = value === null ? 'bg-gray-300'
    : value < thresholds[0] ? 'bg-green-500'
    : value < thresholds[1] ? 'bg-amber-500'
    : 'bg-red-500';
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${color}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</p>
        <p className="font-bold text-sm">{value !== null ? `${value.toFixed(1)} ${unit}` : '—'}</p>
      </div>
    </div>
  );
}

export default function TerritorialAnalysis({ lat, lng, comune, onDataReady }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lat || !lng) return;
    fetchAll();
  }, [lat, lng]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [weatherRes, airRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe%2FRome&forecast_days=7`),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&hourly=pm2_5,nitrogen_dioxide,carbon_monoxide&timezone=Europe%2FRome&forecast_days=1`),
      ]);
      const weather = await weatherRes.json();
      const air = await airRes.json();

      // Process weather
      const maxTemps = weather.daily?.temperature_2m_max || [];
      const minTemps = weather.daily?.temperature_2m_min || [];
      const precip = weather.daily?.precipitation_sum || [];
      const avgTemp = maxTemps.length ? (maxTemps.reduce((a, b) => a + b, 0) + minTemps.reduce((a, b) => a + b, 0)) / (maxTemps.length * 2) : null;
      const avgPrecip = precip.length ? precip.reduce((a, b) => a + b, 0) / precip.length : null;

      // Process air quality
      const pm25 = air.hourly?.pm2_5 || [];
      const no2 = air.hourly?.nitrogen_dioxide || [];
      const avgPm25 = pm25.filter(v => v !== null).length ? pm25.filter(v => v !== null).reduce((a, b) => a + b, 0) / pm25.filter(v => v !== null).length : null;
      const avgNo2 = no2.filter(v => v !== null).length ? no2.filter(v => v !== null).reduce((a, b) => a + b, 0) / no2.filter(v => v !== null).length : null;

      // Zona climatica
      let zonaClimatica = 'Temperata';
      if (avgTemp !== null) {
        if (avgTemp < 5) zonaClimatica = 'Alpina/Fredda';
        else if (avgTemp < 12) zonaClimatica = 'Continentale';
        else if (avgTemp < 18) zonaClimatica = 'Temperata';
        else zonaClimatica = 'Mediterranea/Calda';
      }

      // Stress idrico
      const stressIdrico = avgPrecip !== null && avgPrecip < 2;

      // Alert
      const alerts = [];
      if (stressIdrico) alerts.push({ type: 'warning', text: 'Zona ad alto stress idrico: monitora il consumo idrico come KPI prioritario (VSME B4-W1).' });
      if (avgPm25 !== null && avgPm25 > 25) alerts.push({ type: 'warning', text: `PM2.5 elevato (${avgPm25.toFixed(1)} µg/m³): valuta monitoraggio qualità aria interna e filtraggio HVAC.` });
      if (avgNo2 !== null && avgNo2 > 40) alerts.push({ type: 'danger', text: `NO₂ critico (${avgNo2.toFixed(1)} µg/m³): zona ad alta pressione traffico. Rilevante per disclosure Scope 3.` });
      if (avgTemp !== null && avgTemp > 17) alerts.push({ type: 'info', text: 'Clima caldo: considera efficientamento impianti di raffreddamento per ridurre Scope 2.' });

      const profilo = {
        zona_climatica: zonaClimatica,
        temp_media: avgTemp,
        precipitazioni_media_giornaliera: avgPrecip,
        stress_idrico: stressIdrico,
        pm25_medio: avgPm25,
        no2_medio: avgNo2,
        alerts,
        aggiornato: new Date().toISOString(),
      };

      setData(profilo);
      onDataReady(profilo);
    } catch (e) {
      setError('Impossibile caricare i dati territoriali. Riprova o procedi comunque.');
      onDataReady({ error: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Recupero dati climatici e qualità aria per <strong>{comune || 'la tua sede'}</strong>...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-700 text-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-1">Attenzione</p>
          <p>{error}</p>
          <button onClick={fetchAll} className="mt-2 text-xs underline font-bold">Riprova</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Climate overview */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <Thermometer className="w-8 h-8 text-blue-500 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase text-blue-500 tracking-wide">Zona Climatica</p>
            <p className="font-bold text-blue-800">{data?.zona_climatica}</p>
            {data?.temp_media !== null && <p className="text-xs text-blue-600">{data.temp_media?.toFixed(1)}°C media</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`border rounded-xl p-4 flex items-center gap-3 ${data?.stress_idrico ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          <Droplets className={`w-8 h-8 shrink-0 ${data?.stress_idrico ? 'text-amber-500' : 'text-green-500'}`} />
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wide ${data?.stress_idrico ? 'text-amber-500' : 'text-green-500'}`}>Stress Idrico</p>
            <p className={`font-bold ${data?.stress_idrico ? 'text-amber-800' : 'text-green-800'}`}>{data?.stress_idrico ? 'Alto' : 'Normale'}</p>
            {data?.precipitazioni_media_giornaliera !== null && <p className={`text-xs ${data?.stress_idrico ? 'text-amber-600' : 'text-green-600'}`}>{data?.precipitazioni_media_giornaliera?.toFixed(1)} mm/giorno</p>}
          </div>
        </motion.div>
      </div>

      {/* Air quality */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5" /> Qualità dell'Aria
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Semaphore value={data?.pm25_medio} thresholds={[15, 35]} unit="µg/m³" label="PM2.5" />
          <Semaphore value={data?.no2_medio} thresholds={[20, 40]} unit="µg/m³" label="NO₂" />
        </div>
      </motion.div>

      {/* Alerts */}
      {data?.alerts?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Alert Contestuali ESG</p>
          {data.alerts.map((a, i) => (
            <div key={i} className={`flex items-start gap-2.5 rounded-lg px-3.5 py-2.5 text-sm border ${
              a.type === 'danger' ? 'bg-red-50 border-red-200 text-red-700' :
              a.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700' :
              'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{a.text}</span>
            </div>
          ))}
        </motion.div>
      )}

      {!data?.alerts?.length && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3.5 py-2.5 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Nessun alert critico per questa zona. Profilo territoriale favorevole.
        </div>
      )}
    </div>
  );
}