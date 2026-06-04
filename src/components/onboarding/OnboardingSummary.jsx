import { CheckCircle2, MapPin, Building2, Leaf, AlertTriangle } from 'lucide-react';

const Row = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-border last:border-0 text-sm">
    <span className="text-muted-foreground font-medium">{label}</span>
    <span className="font-bold text-right max-w-[60%] truncate">{value || '—'}</span>
  </div>
);

export default function OnboardingSummary({ form, geoData, profiloTerritoriale }) {
  const dimLabels = { micro: 'Micro (<10 dip.)', piccola: 'Piccola (10–49 dip.)', media: 'Media (50–249 dip.)' };

  return (
    <div className="space-y-5">
      {/* Anagrafica */}
      <div className="bg-muted/50 rounded-xl p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-3">
          <Building2 className="w-3.5 h-3.5" /> Anagrafica
        </p>
        <Row label="Ragione Sociale" value={form.ragione_sociale} />
        <Row label="Codice ATECO" value={form.codice_ateco} />
        <Row label="Settore" value={form.settore_descrizione} />
        <Row label="Dimensione" value={dimLabels[form.dimensione]} />
        <Row label="Anno ESG" value={form.anno_riferimento_esg} />
      </div>

      {/* Sede */}
      <div className="bg-muted/50 rounded-xl p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-3">
          <MapPin className="w-3.5 h-3.5" /> Sede
        </p>
        <Row label="Indirizzo" value={geoData.indirizzo} />
        <Row label="Comune" value={geoData.comune} />
        <Row label="Provincia" value={geoData.provincia} />
        <Row label="Regione" value={geoData.regione} />
        <Row label="CAP" value={geoData.cap} />
        <Row label="Coordinate" value={geoData.lat ? `${geoData.lat?.toFixed(5)}, ${geoData.lng?.toFixed(5)}` : null} />
      </div>

      {/* Profilo Territoriale */}
      {profiloTerritoriale && !profiloTerritoriale.error && (
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-3">
            <Leaf className="w-3.5 h-3.5" /> Profilo Territoriale ESG
          </p>
          <Row label="Zona Climatica" value={profiloTerritoriale.zona_climatica} />
          <Row label="Temperatura Media" value={profiloTerritoriale.temp_media ? `${profiloTerritoriale.temp_media?.toFixed(1)}°C` : null} />
          <Row label="Stress Idrico" value={profiloTerritoriale.stress_idrico ? '⚠️ Alto' : '✅ Normale'} />
          <Row label="PM2.5 Medio" value={profiloTerritoriale.pm25_medio ? `${profiloTerritoriale.pm25_medio?.toFixed(1)} µg/m³` : null} />
          <Row label="NO₂ Medio" value={profiloTerritoriale.no2_medio ? `${profiloTerritoriale.no2_medio?.toFixed(1)} µg/m³` : null} />
          {profiloTerritoriale.alerts?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border space-y-1.5">
              {profiloTerritoriale.alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{a.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Tutto pronto! Clicca "Completa setup" per accedere alla dashboard ESG.</span>
      </div>
    </div>
  );
}