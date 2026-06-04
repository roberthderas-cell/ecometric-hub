import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, FileText, Loader2, CheckCircle2, X, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import TerritorialAnalysis from '@/components/onboarding/TerritorialAnalysis';

async function geocodeAddress(address) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=1&countrycodes=it`,
    { headers: { 'Accept-Language': 'it' } }
  );
  const data = await res.json();
  if (!data || data.length === 0) return null;
  const item = data[0];
  const a = item.address || {};
  return {
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    comune: a.city || a.town || a.village || a.municipality || '',
    indirizzo: [a.road, a.house_number].filter(Boolean).join(' '),
    provincia: a.county || a.state_district || '',
    regione: a.state || '',
    cap: a.postcode || '',
  };
}

export default function VisuraWithAnalysis({ onExtracted }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | extracting | geocoding | analysis | done | error
  const [error, setError] = useState('');
  const [visuraData, setVisuraData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(f.type)) {
      setError('Formato non supportato. Usa PDF, PNG o JPG.');
      return;
    }
    setFile(f);
    setError('');
    setStatus('uploading');

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setStatus('extracting');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Sei un esperto di visure camerali italiane. Analizza questo documento e estrai i seguenti dati aziendali in formato JSON.
Se un campo non è presente o non è leggibile, lascia il valore come stringa vuota "".

Campi da estrarre:
- ragione_sociale: ragione sociale completa dell'impresa
- ateco: codice ATECO/NACE primario (solo il codice numerico, es. "25.62")
- forma_giuridica: forma giuridica (es. "SRL", "SPA", "SNC", "SAS")
- sede_legale: indirizzo sede legale completo (via, numero, CAP, comune, provincia)
- partita_iva: partita IVA (solo i numeri)
- codice_fiscale: codice fiscale
- anno_costituzione: anno di costituzione (numero)
- capitale_sociale: capitale sociale in euro (solo numero, es. 10000)
- num_dipendenti: numero dipendenti se presente (numero intero)
- descrizione_attivita: breve descrizione dell'attività principale`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            ragione_sociale: { type: 'string' },
            ateco: { type: 'string' },
            forma_giuridica: { type: 'string' },
            sede_legale: { type: 'string' },
            partita_iva: { type: 'string' },
            codice_fiscale: { type: 'string' },
            anno_costituzione: { type: 'number' },
            capitale_sociale: { type: 'number' },
            num_dipendenti: { type: 'number' },
            descrizione_attivita: { type: 'string' },
          },
        },
      });

      setVisuraData(result);

      // Geocode the sede legale
      if (result.sede_legale) {
        setStatus('geocoding');
        const geo = await geocodeAddress(result.sede_legale);
        if (geo) {
          setGeoData(geo);
          setStatus('analysis');
          setShowAnalysis(true);
        } else {
          setStatus('done');
        }
      } else {
        setStatus('done');
      }

      onExtracted(result, null); // pass visura data immediately, territorial data will come via onTerritorialReady
    } catch (e) {
      setStatus('error');
      setError("Errore durante l'estrazione. Riprova o inserisci i dati manualmente.");
    }
  };

  const handleTerritorialReady = (territorial) => {
    setStatus('done');
    onExtracted(visuraData, territorial);
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setError('');
    setVisuraData(null);
    setGeoData(null);
    setShowAnalysis(false);
  };

  // Loading states
  if (status === 'uploading' || status === 'extracting' || status === 'geocoding') {
    const messages = {
      uploading: 'Caricamento documento...',
      extracting: 'Estrazione dati con AI...',
      geocoding: 'Geolocalizzazione sede...',
    };
    return (
      <div className="flex flex-col items-center gap-3 py-5 bg-blue-50 border border-blue-200 rounded-xl">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-blue-700">{messages[status]}</p>
        <p className="text-xs text-blue-500">Operazione in corso, attendi qualche secondo</p>
      </div>
    );
  }

  // Analysis step
  if (status === 'analysis' && geoData) {
    return (
      <div className="space-y-3">
        {/* Visura extracted badge */}
        <div className="flex items-center gap-3 py-2.5 px-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-800">Dati visura estratti · {visuraData?.ragione_sociale}</p>
            {geoData.comune && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {geoData.comune} · Analisi territoriale in corso...
              </p>
            )}
          </div>
          <button onClick={reset} className="text-green-400 hover:text-green-600 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Territorial analysis */}
        <div className="border border-border rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
            🌍 Analisi Territoriale ESG
          </p>
          <TerritorialAnalysis
            lat={geoData.lat}
            lng={geoData.lng}
            comune={geoData.comune}
            onDataReady={handleTerritorialReady}
          />
        </div>
      </div>
    );
  }

  // Done
  if (status === 'done') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 py-2.5 px-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-800">Visura elaborata con successo!</p>
            <p className="text-xs text-green-600 truncate">{file?.name}</p>
          </div>
          <button onClick={() => setShowAnalysis(v => !v)} className="text-green-500 hover:text-green-700 shrink-0 px-1">
            {showAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={reset} className="text-green-400 hover:text-green-600 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {showAnalysis && geoData && (
          <div className="border border-border rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
              🌍 Analisi Territoriale · {geoData.comune}
            </p>
            <TerritorialAnalysis
              lat={geoData.lat}
              lng={geoData.lng}
              comune={geoData.comune}
              onDataReady={() => {}}
            />
          </div>
        )}
      </div>
    );
  }

  // Idle / error state
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
        className="w-full border-2 border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 rounded-xl py-5 px-4 flex flex-col items-center gap-2 transition-all cursor-pointer group"
      >
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">Carica Visura Camerale</p>
        <p className="text-xs text-muted-foreground text-center">
          PDF, PNG o JPG · Estrazione dati + Analisi territoriale ESG automatica
        </p>
        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <FileText className="w-3 h-3" /> Compilazione automatica + Mappa ESG
        </span>
      </button>
      {error && <p className="text-xs text-destructive mt-2 text-center">{error}</p>}
    </div>
  );
}