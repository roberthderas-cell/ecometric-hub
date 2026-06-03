import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Layers, MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BUFFER_M = 5000;

// Custom colored marker icons
function coloredIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:24px;background:${color};border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [16, 24],
    iconAnchor: [8, 24],
    popupAnchor: [0, -24],
  });
}

const TIPO_COLORS = {
  'Sede Legale': '#dc2626',
  'Operativa': '#2563eb',
  'Produzione': '#d97706',
  'Magazzino': '#7c3aed',
  'Ufficio': '#059669',
  'Logistica': '#0891b2',
};

function FitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    if (markers.length === 1) {
      map.flyTo(markers[0].coords, 13, { duration: 1 });
    } else {
      const bounds = L.latLngBounds(markers.map(m => m.coords));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
    }
  }, [markers.length]);
  return null;
}

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'it' } });
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), label: data[0].display_name };
}

export default function BiodiversitaMap({ sedeLegale, sediOperative = [] }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNatura, setShowNatura] = useState(true);
  const [showWDPA, setShowWDPA] = useState(true);
  const [geocoded, setGeocoded] = useState(false);

  // Build list of all addresses to geocode
  const allSedi = [];
  if (sedeLegale) allSedi.push({ nome: 'Sede Legale', indirizzo: sedeLegale, tipo: 'Sede Legale' });
  sediOperative.forEach(s => {
    if (s.indirizzo) allSedi.push({ nome: s.nome || s.tipo || 'Sede Operativa', indirizzo: s.indirizzo, tipo: s.tipo || 'Operativa' });
  });

  const addressKey = allSedi.map(s => s.indirizzo).join('|');

  useEffect(() => {
    if (!allSedi.length) { setMarkers([]); setGeocoded(false); return; }
    setLoading(true);
    setGeocoded(false);

    Promise.all(
      allSedi.map(async (s) => {
        const result = await geocode(s.indirizzo);
        if (!result) return null;
        return { ...s, coords: [result.lat, result.lon], label: result.label };
      })
    ).then(results => {
      setMarkers(results.filter(Boolean));
      setLoading(false);
      setGeocoded(true);
    });
  }, [addressKey]);

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Status bar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold">
          {loading ? (
            <><Clock className="w-4 h-4 text-amber-500 animate-pulse" /><span className="text-amber-700">Geolocalizzazione sedi in corso…</span></>
          ) : !allSedi.length ? (
            <><AlertTriangle className="w-4 h-4 text-amber-500" /><span className="text-amber-700">Nessuna sede inserita nell'anagrafica.</span></>
          ) : (
            <><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-green-700">{markers.length}/{allSedi.length} sedi geolocalizzate</span></>
          )}
        </div>

        {!allSedi.length && (
          <span className="text-xs text-muted-foreground">→ Vai in <strong>Anagrafica</strong> e inserisci sede legale e sedi operative.</span>
        )}

        {/* Legend dots */}
        {markers.length > 0 && (
          <div className="flex flex-wrap gap-2 ml-auto">
            {[...new Set(markers.map(m => m.tipo))].map(tipo => (
              <span key={tipo} className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: TIPO_COLORS[tipo] || '#6b7280' }} />
                {tipo}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Layer toggles */}
      <div className="px-4 py-2 border-b border-border bg-muted/20 flex flex-wrap items-center gap-3 text-xs">
        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
        <button
          onClick={() => setShowNatura(v => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold transition-colors ${showNatura ? 'bg-green-100 border-green-400 text-green-800' : 'bg-white border-border text-muted-foreground'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Natura 2000
        </button>
        <button
          onClick={() => setShowWDPA(v => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold transition-colors ${showWDPA ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-border text-muted-foreground'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> WDPA Aree Protette
        </button>
        <span className="text-muted-foreground ml-auto text-xs">Buffer analisi: {BUFFER_M / 1000} km per sede</span>
      </div>

      {/* Map */}
      <div style={{ height: 450 }}>
        <MapContainer
          center={[42.5, 12.5]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {showNatura && (
            <WMSTileLayer
              url="https://bio.discomap.eea.europa.eu/arcgis/services/Natura2000/Natura2000_End2021_WM/MapServer/WMSServer"
              layers="0,1,2"
              format="image/png"
              transparent
              opacity={0.5}
              attribution='© EEA Natura 2000'
            />
          )}

          {showWDPA && (
            <WMSTileLayer
              url="https://arcgis.unep-wcmc.org/arcgis/services/wdpa/wdpa_gis_service/MapServer/WMSServer"
              layers="1"
              format="image/png"
              transparent
              opacity={0.4}
              attribution='© UNEP-WCMC WDPA'
            />
          )}

          {markers.map((m, i) => (
            <>
              <Marker key={`m-${i}`} position={m.coords} icon={coloredIcon(TIPO_COLORS[m.tipo] || '#6b7280')}>
                <Popup>
                  <strong>{m.nome}</strong><br />
                  <span className="text-xs font-semibold" style={{ color: TIPO_COLORS[m.tipo] || '#6b7280' }}>{m.tipo}</span><br />
                  <span className="text-xs">{m.label}</span>
                </Popup>
              </Marker>
              <Circle
                key={`c-${i}`}
                center={m.coords}
                radius={BUFFER_M}
                pathOptions={{
                  color: TIPO_COLORS[m.tipo] || '#6b7280',
                  fillColor: TIPO_COLORS[m.tipo] || '#6b7280',
                  fillOpacity: 0.06,
                  weight: 1.5,
                  dashArray: '6 4',
                }}
              />
            </>
          ))}

          {markers.length > 0 && <FitBounds markers={markers} />}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-muted/20 border-t border-border text-xs text-muted-foreground flex flex-wrap gap-4 items-center">
        <span><strong className="text-green-700">Verde</strong> = Zone Natura 2000 (SAC/ZPS)</span>
        <span><strong className="text-blue-700">Blu</strong> = Aree WDPA (Parchi, Riserve, Ramsar)</span>
        <span>Cerchio tratteggiato = buffer 5 km da ogni sede</span>
      </div>
    </div>
  );
}