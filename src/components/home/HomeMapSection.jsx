import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { MapPin, Clock, AlertTriangle, CheckCircle, ExternalLink, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calcESGScore } from '@/lib/vsmeDefaults';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RATING_COLOR = {
  Leader:        '#059669',
  Avanzato:      '#2563EB',
  Buono:         '#0891B2',
  'In crescita': '#D97706',
  Base:          '#9CA3AF',
};

function coloredPin(color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:22px;height:32px;
        background:${color};
        border:2.5px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 3px 8px rgba(0,0,0,0.3);
      "></div>`,
    iconSize: [22, 32],
    iconAnchor: [11, 32],
    popupAnchor: [0, -34],
  });
}

function FitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (!markers.length) return;
    const valid = markers.filter(m => {
      const [lat, lng] = m.coords || [];
      return Number.isFinite(lat) && Number.isFinite(lng);
    });
    if (!valid.length) return;
    if (valid.length === 1) {
      map.flyTo(valid[0].coords, 13, { duration: 1.2 });
    } else {
      const bounds = L.latLngBounds(valid.map(m => m.coords));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
    }
  }, [markers.length]);
  return null;
}

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'it' } });
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

function EsgBadge({ score }) {
  if (!score) return null;
  const color = RATING_COLOR[score.rating] || '#9CA3AF';
  return (
    <div style={{ borderLeft: `3px solid ${color}` }} className="pl-2 my-1">
      <p className="text-[11px] font-bold" style={{ color }}>
        {score.rIcon} {score.rating} · Score {score.tot}/100
      </p>
      <p className="text-[10px] text-gray-500">E:{score.E} S:{score.S} G:{score.G}</p>
    </div>
  );
}

export default function HomeMapSection({ azienda, reports = [] }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Build address list: sede legale from AziendaProfilo + sedi from reports
  const addressList = useMemo(() => {
    const list = [];

    // Use lat/lng from AziendaProfilo if available (no geocoding needed)
    if (azienda?.lat && azienda?.lng) {
      const latestReport = reports.find(r => r.data);
      const esg = latestReport ? calcESGScore(latestReport.data) : null;
      list.push({
        coords: [azienda.lat, azienda.lng],
        nome: azienda.ragione_sociale || 'Sede principale',
        tipo: 'Sede Legale',
        indirizzo: [azienda.indirizzo, azienda.comune, azienda.provincia].filter(Boolean).join(', '),
        esg,
        reportId: latestReport?.id,
        reportName: latestReport?.name,
        color: '#dc2626',
        preGeocoded: true,
      });
    }

    // Sedi operative from report data
    reports.forEach(r => {
      if (!r.data?.sedi?.lista) return;
      r.data.sedi.lista.forEach(s => {
        if (s.indirizzo) {
          const esg = calcESGScore(r.data);
          list.push({
            nome: s.nome || s.tipo || 'Sede Operativa',
            tipo: s.tipo || 'Operativa',
            indirizzo: s.indirizzo,
            esg,
            reportId: r.id,
            reportName: r.name,
            color: '#2563eb',
            preGeocoded: false,
          });
        }
      });
    });

    return list;
  }, [azienda, reports]);

  const addressKey = addressList.map(a => a.indirizzo || `${a.coords}`).join('|');

  useEffect(() => {
    if (!addressList.length) { setMarkers([]); return; }

    const preGeocoded = addressList.filter(a => a.preGeocoded);
    const toGeocode   = addressList.filter(a => !a.preGeocoded);

    if (!toGeocode.length) {
      setMarkers(preGeocoded);
      return;
    }

    setLoading(true);
    Promise.all(
      toGeocode.map(async (s) => {
        const result = await geocode(s.indirizzo);
        if (!result) return null;
        return { ...s, coords: [result.lat, result.lon] };
      })
    ).then(results => {
      setMarkers([...preGeocoded, ...results.filter(Boolean)]);
      setLoading(false);
    });
  }, [addressKey]);

  if (!azienda?.lat && !addressList.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Localizzazione Sedi Aziendali
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Clicca un puntatore per vedere il riepilogo ESG della sede
          </p>
        </div>
        {azienda?.lat && (
          <a
            href={`https://www.openstreetmap.org/?mlat=${azienda.lat}&mlon=${azienda.lng}#map=14/${azienda.lat}/${azienda.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Apri OSM
          </a>
        )}
      </div>

      <Card className="overflow-hidden border border-border">
        {/* Status bar */}
        <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex flex-wrap items-center gap-3 text-xs">
          {loading ? (
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <Clock className="w-3.5 h-3.5 animate-pulse text-amber-500" /> Geolocalizzazione in corso…
            </span>
          ) : markers.length ? (
            <span className="flex items-center gap-1.5 text-green-700 font-semibold">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" /> {markers.length} {markers.length === 1 ? 'sede' : 'sedi'} visualizzate
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Nessuna sede geolocalizzata — aggiungi coordinate in <Link to="/onboarding" className="underline ml-1">Anagrafica</Link>
            </span>
          )}

          {/* Sede type legend */}
          {markers.length > 0 && (
            <div className="flex gap-3 ml-auto">
              {[...new Set(markers.map(m => m.tipo))].map(tipo => (
                <span key={tipo} className="flex items-center gap-1 text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: tipo === 'Sede Legale' ? '#dc2626' : '#2563eb' }} />
                  {tipo}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ height: 380 }}>
          <MapContainer
            center={azienda?.lat ? [azienda.lat, azienda.lng] : [42.5, 12.5]}
            zoom={azienda?.lat ? 12 : 6}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {markers.filter(m => {
              const [lat, lng] = m.coords || [];
              return Number.isFinite(lat) && Number.isFinite(lng);
            }).map((m, i) => (
              <Marker
                key={i}
                position={m.coords}
                icon={coloredPin(m.color)}
              >
                <Popup minWidth={220} maxWidth={280}>
                  <div className="py-1">
                    {/* Header */}
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: m.color + '22' }}>
                        <Building2 className="w-3.5 h-3.5" style={{ color: m.color }} />
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight text-gray-800">{m.nome}</p>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: m.color + '20', color: m.color }}>{m.tipo}</span>
                      </div>
                    </div>

                    {/* Address */}
                    {m.indirizzo && (
                      <p className="text-[11px] text-gray-500 mb-2 leading-tight flex items-start gap-1">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-gray-400" />{m.indirizzo}
                      </p>
                    )}

                    {/* ESG Score */}
                    {m.esg && <EsgBadge score={m.esg} />}

                    {/* Link to report */}
                    {m.reportId && (
                      <Link
                        to={`/report/${m.reportId}/dash`}
                        className="mt-2 flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        Apri report: {m.reportName}
                      </Link>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {markers.length > 0 && <FitBounds markers={markers} />}
          </MapContainer>
        </div>
      </Card>
    </motion.div>
  );
}