import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
    { headers: { 'Accept-Language': 'it' } }
  );
  return res.json();
}

async function searchAddress(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=it`,
    { headers: { 'Accept-Language': 'it' } }
  );
  return res.json();
}

function parseNominatim(data) {
  const a = data.address || {};
  return {
    indirizzo: [a.road, a.house_number].filter(Boolean).join(' '),
    comune: a.city || a.town || a.village || a.municipality || '',
    provincia: a.county || a.state_district || '',
    regione: a.state || '',
    cap: a.postcode || '',
    lat: parseFloat(data.lat),
    lng: parseFloat(data.lon),
  };
}

export default function OnboardingMap({ geoData, onGeoChange }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const data = await searchAddress(search);
    setResults(data);
    setSearching(false);
  };

  const handleSelectResult = (item) => {
    const parsed = parseNominatim(item);
    onGeoChange(parsed);
    setResults([]);
    setSearch(parsed.indirizzo || item.display_name);
    if (mapRef.current) {
      mapRef.current.setView([parsed.lat, parsed.lng], 15);
    }
  };

  const handleMapClick = async (lat, lng) => {
    setLoading(true);
    const data = await reverseGeocode(lat, lng);
    const parsed = parseNominatim(data);
    onGeoChange({ ...parsed, lat, lng });
    setLoading(false);
  };

  const center = geoData.lat ? [geoData.lat, geoData.lng] : [41.9, 12.5];

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-3">
        <div className="flex gap-2">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Cerca indirizzo sede aziendale..."
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={searching} variant="outline" className="gap-1.5 shrink-0">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Cerca
          </Button>
        </div>
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-[9999] bg-white border border-border rounded-lg shadow-xl mt-1 overflow-hidden">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => handleSelectResult(r)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-start gap-2 border-b border-border last:border-0"
              >
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span className="line-clamp-2">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative h-72 rounded-xl overflow-hidden border border-border">
        {loading && (
          <div className="absolute inset-0 bg-white/70 z-[9999] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        <MapContainer
          center={center}
          zoom={geoData.lat ? 15 : 6}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onMapClick={handleMapClick} />
          {geoData.lat && <Marker position={[geoData.lat, geoData.lng]} />}
        </MapContainer>
      </div>

      {/* Address display */}
      {geoData.lat && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted rounded-lg px-3 py-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Indirizzo</p>
            <p className="font-medium truncate">{geoData.indirizzo || '—'}</p>
          </div>
          <div className="bg-muted rounded-lg px-3 py-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Comune</p>
            <p className="font-medium truncate">{geoData.comune || '—'}</p>
          </div>
          <div className="bg-muted rounded-lg px-3 py-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Provincia / Regione</p>
            <p className="font-medium truncate">{[geoData.provincia, geoData.regione].filter(Boolean).join(' · ') || '—'}</p>
          </div>
          <div className="bg-muted rounded-lg px-3 py-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Coordinate</p>
            <p className="font-medium text-xs font-mono">{geoData.lat?.toFixed(5)}, {geoData.lng?.toFixed(5)}</p>
          </div>
        </div>
      )}
    </div>
  );
}