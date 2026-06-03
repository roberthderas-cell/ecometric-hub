import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Layers, Info } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon for Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Buffer radius in meters for proximity check
const BUFFER_M = 5000;

function FlyToLocation({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 13, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

export default function BiodiversitaMap({ onSitoFound }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [placeLabel, setPlaceLabel] = useState('');
  const [showNatura, setShowNatura] = useState(true);
  const [showWDPA, setShowWDPA] = useState(true);
  const [error, setError] = useState('');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'it' } });
      const data = await res.json();
      if (!data.length) { setError('Indirizzo non trovato. Prova a essere più specifico.'); setLoading(false); return; }
      const { lat, lon, display_name, address } = data[0];
      const c = [parseFloat(lat), parseFloat(lon)];
      setCoords(c);
      setPlaceLabel(display_name);
      // Notify parent if callback provided
      if (onSitoFound) {
        onSitoFound({
          sito: query,
          paese: address?.country || 'Italia',
          regione: address?.state || '',
          fonte: 'Verifica su mappa Natura 2000 / WDPA',
        });
      }
    } catch {
      setError('Errore di connessione. Riprova.');
    }
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Search bar */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 text-sm border border-green-200 rounded-lg focus:border-primary focus:outline-none"
            placeholder="Cerca indirizzo o nome sito (es. 'Via Roma 1, Milano')…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
          <Button onClick={search} disabled={loading} className="gap-2 shrink-0">
            <Search className="w-4 h-4" /> {loading ? 'Ricerca…' : 'Cerca'}
          </Button>
        </div>
        {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
        {placeLabel && !error && (
          <p className="text-xs text-green-700 mt-1.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {placeLabel}
          </p>
        )}
      </div>

      {/* Layer toggles */}
      <div className="px-4 py-2 border-b border-border bg-muted/20 flex flex-wrap items-center gap-3 text-xs">
        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
        <button
          onClick={() => setShowNatura(v => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold transition-colors ${showNatura ? 'bg-green-100 border-green-400 text-green-800' : 'bg-white border-border text-muted-foreground'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Natura 2000 (Habitat + Uccelli)
        </button>
        <button
          onClick={() => setShowWDPA(v => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold transition-colors ${showWDPA ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-border text-muted-foreground'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> WDPA — Aree Protette Globali
        </button>
        {coords && (
          <span className="text-muted-foreground ml-auto">Buffer analisi: {(BUFFER_M / 1000).toFixed(0)} km</span>
        )}
      </div>

      {/* Map */}
      <div style={{ height: 420 }}>
        <MapContainer
          center={coords || [42.5, 12.5]}
          zoom={coords ? 13 : 6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Natura 2000 WMS — EEA */}
          {showNatura && (
            <WMSTileLayer
              url="https://bio.discomap.eea.europa.eu/arcgis/services/Natura2000/Natura2000_End2021_WM/MapServer/WMSServer"
              layers="0,1,2"
              format="image/png"
              transparent
              opacity={0.5}
              attribution='© <a href="https://www.eea.europa.eu/">EEA Natura 2000</a>'
            />
          )}

          {/* WDPA WMS — Protected Planet */}
          {showWDPA && (
            <WMSTileLayer
              url="https://arcgis.unep-wcmc.org/arcgis/services/wdpa/wdpa_gis_service/MapServer/WMSServer"
              layers="1"
              format="image/png"
              transparent
              opacity={0.4}
              attribution='© <a href="https://www.protectedplanet.net/">UNEP-WCMC WDPA</a>'
            />
          )}

          {coords && (
            <>
              <Marker position={coords}>
                <Popup>
                  <strong>Sito analizzato</strong><br />
                  <span className="text-xs">{placeLabel}</span><br />
                  <span className="text-xs text-muted-foreground">
                    {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
                  </span>
                </Popup>
              </Marker>
              <Circle
                center={coords}
                radius={BUFFER_M}
                pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.07, weight: 2, dashArray: '6 4' }}
              />
            </>
          )}

          <FlyToLocation coords={coords} />
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-muted/20 border-t border-border">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground items-center">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span><strong className="text-green-700">Verde</strong> = Zone Habitat (SAC) + ZPS Natura 2000</span>
          <span><strong className="text-blue-700">Blu</strong> = Aree WDPA (Parchi Naz., Riserve, Ramsar…)</span>
          <span>Cerchio tratteggiato = buffer 5 km dal sito</span>
          <span>Fonte dati: EEA (Natura 2000) · UNEP-WCMC (WDPA)</span>
        </div>
      </div>
    </div>
  );
}