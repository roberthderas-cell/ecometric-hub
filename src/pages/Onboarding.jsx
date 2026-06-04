import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Building2, Leaf, ChevronRight, ChevronLeft, CheckCircle2, Wind, Droplets, Thermometer, AlertTriangle, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import OnboardingMap from '@/components/onboarding/OnboardingMap';
import TerritorialAnalysis from '@/components/onboarding/TerritorialAnalysis';
import OnboardingSummary from '@/components/onboarding/OnboardingSummary';

const STEPS = [
  { id: 1, label: 'Anagrafica', icon: Building2 },
  { id: 2, label: 'Geolocalizzazione', icon: MapPin },
  { id: 3, label: 'Analisi Territoriale', icon: Leaf },
  { id: 4, label: 'Conferma', icon: CheckCircle2 },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 data
  const [form, setForm] = useState({
    ragione_sociale: '',
    codice_ateco: '',
    settore_descrizione: '',
    dimensione: '',
    anno_riferimento_esg: new Date().getFullYear(),
  });

  // Step 2 data
  const [geoData, setGeoData] = useState({
    indirizzo: '', comune: '', provincia: '', regione: '', cap: '',
    lat: null, lng: null,
  });

  // Step 3 data
  const [profiloTerritoriale, setProfiloTerritoriale] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const existing = await base44.entities.AziendaProfilo.filter({ user_id: user?.id });
      if (existing?.length > 0) {
        return base44.entities.AziendaProfilo.update(existing[0].id, payload);
      }
      return base44.entities.AziendaProfilo.create(payload);
    },
    onSuccess: () => navigate('/'),
  });

  const handleSave = () => {
    saveMutation.mutate({
      ...form,
      ...geoData,
      profilo_territoriale: profiloTerritoriale,
      onboarding_completato: true,
      user_id: user?.id,
    });
  };

  const canNext1 = form.ragione_sociale.trim() && form.dimensione;
  const canNext2 = geoData.lat !== null && geoData.lng !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-2xl">🌿</span>
        <span className="font-heading text-xl font-extrabold text-white">VSME Builder</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isDone ? 'bg-green-500/30 text-green-400' :
                isActive ? 'bg-white/15 text-white' :
                'text-white/30'
              }`}>
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-1 ${step > s.id ? 'bg-green-500/60' : 'bg-white/15'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="p-8">
                <h2 className="font-heading text-2xl font-extrabold mb-1">Anagrafica aziendale</h2>
                <p className="text-muted-foreground text-sm mb-6">Inserisci i dati della tua impresa per personalizzare il percorso ESG.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Ragione Sociale *</label>
                    <Input
                      value={form.ragione_sociale}
                      onChange={e => setForm(f => ({ ...f, ragione_sociale: e.target.value }))}
                      placeholder="Es. Alfa Metalli S.r.l."
                      className="mt-1.5"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Codice ATECO</label>
                    <Input
                      value={form.codice_ateco}
                      onChange={e => setForm(f => ({ ...f, codice_ateco: e.target.value }))}
                      placeholder="Es. 62.01 - Produzione software"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Descrizione Settore</label>
                    <Input
                      value={form.settore_descrizione}
                      onChange={e => setForm(f => ({ ...f, settore_descrizione: e.target.value }))}
                      placeholder="Es. Manifatturiero - Lavorazione metalli"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Dimensione *</label>
                      <Select value={form.dimensione} onValueChange={v => setForm(f => ({ ...f, dimensione: v }))}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Seleziona..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="micro">Micro (&lt;10 dip.)</SelectItem>
                          <SelectItem value="piccola">Piccola (10–49 dip.)</SelectItem>
                          <SelectItem value="media">Media (50–249 dip.)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Anno ESG</label>
                      <Input
                        type="number"
                        value={form.anno_riferimento_esg}
                        onChange={e => setForm(f => ({ ...f, anno_riferimento_esg: parseInt(e.target.value) }))}
                        className="mt-1.5"
                        min={2020} max={2030}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-8">
                  <Button onClick={() => setStep(2)} disabled={!canNext1} className="gap-2 bg-primary px-6">
                    Avanti <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="p-8">
                <h2 className="font-heading text-2xl font-extrabold mb-1">Sede aziendale</h2>
                <p className="text-muted-foreground text-sm mb-6">Cerca l'indirizzo o clicca sulla mappa per posizionare la sede.</p>
                <OnboardingMap geoData={geoData} onGeoChange={setGeoData} />
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                    <ChevronLeft className="w-4 h-4" /> Indietro
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!canNext2} className="gap-2 bg-primary px-6">
                    Avanti <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="p-8">
                <h2 className="font-heading text-2xl font-extrabold mb-1">Analisi Territoriale ESG</h2>
                <p className="text-muted-foreground text-sm mb-6">Dati climatici e ambientali automatici per la tua sede.</p>
                <TerritorialAnalysis lat={geoData.lat} lng={geoData.lng} comune={geoData.comune} onDataReady={setProfiloTerritoriale} />
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                    <ChevronLeft className="w-4 h-4" /> Indietro
                  </Button>
                  <Button onClick={() => setStep(4)} disabled={!profiloTerritoriale} className="gap-2 bg-primary px-6">
                    Avanti <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="p-8">
                <h2 className="font-heading text-2xl font-extrabold mb-1">Riepilogo e Conferma</h2>
                <p className="text-muted-foreground text-sm mb-6">Verifica i dati prima di accedere alla dashboard.</p>
                <OnboardingSummary form={form} geoData={geoData} profiloTerritoriale={profiloTerritoriale} />
                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
                    <ChevronLeft className="w-4 h-4" /> Indietro
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold px-6"
                  >
                    {saveMutation.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvataggio...</>
                      : <><CheckCircle2 className="w-4 h-4" /> Completa setup e accedi</>}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-white/20 text-xs mt-6">VSME Standard · EFRAG 2024</p>
    </div>
  );
}