import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, FileText, Loader2, CheckCircle2, X } from 'lucide-react';

export default function VisuraUploader({ onExtracted }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | extracting | done | error
  const [error, setError] = useState('');
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
Restituisci SOLO il JSON, niente altro.

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

      setStatus('done');
      onExtracted(result);
    } catch (e) {
      setStatus('error');
      setError("Errore durante l'estrazione. Riprova o inserisci i dati manualmente.");
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setError('');
  };

  if (status === 'uploading' || status === 'extracting') {
    return (
      <div className="flex flex-col items-center gap-3 py-5 bg-blue-50 border border-blue-200 rounded-xl">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-blue-700">
          {status === 'uploading' ? 'Caricamento documento...' : 'Estrazione dati con AI...'}
        </p>
        <p className="text-xs text-blue-500">Operazione in corso, attendi qualche secondo</p>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="flex items-center gap-3 py-3 px-4 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-green-800">Dati estratti con successo!</p>
          <p className="text-xs text-green-600 truncate">{file?.name}</p>
        </div>
        <button onClick={reset} className="text-green-400 hover:text-green-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

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
          PDF, PNG o JPG · I dati saranno estratti automaticamente con AI
        </p>
        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <FileText className="w-3 h-3" /> Compilazione automatica
        </span>
      </button>
      {error && <p className="text-xs text-destructive mt-2 text-center">{error}</p>}
    </div>
  );
}