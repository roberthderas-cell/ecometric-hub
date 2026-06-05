import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';

/**
 * Campo note contestuale per ogni sezione del report VSME.
 * Guida l'utente a giustificare i dati e spiegare variazioni rispetto agli anni precedenti.
 */
export default function NotesField({ value, onChange, section, rows = 4 }) {
  const configs = {
    // B3 Energia
    en: {
      label: 'Note, giustificazioni e variazioni YoY — Energia & GHG (B3)',
      hint: 'Spiega variazioni significative rispetto all\'anno precedente (es. nuovo impianto FV, cambio mix energetico, variazione produzione), metodologie adottate, fattori di stima.',
      placeholder: 'Es. "L\'aumento del consumo elettrico (+12%) è dovuto all\'avvio della nuova linea produttiva a febbraio. Il calo delle emissioni Scope 2 riflette l\'installazione di un impianto FV da 50 kWp (agosto). Fattore ISPRA aggiornato al 2024."',
    },
    // B6 Acqua
    ac: {
      label: 'Note, giustificazioni e variazioni YoY — Acqua (B6)',
      hint: 'Spiega variazioni nei prelievi idrici, eventuali misure di efficienza introdotte, cambi di processo o di denominatore (es. organico).',
      placeholder: 'Es. "La riduzione del 18% dei prelievi da acquedotto è attribuibile all\'installazione di un sistema di recupero acque piovane (aprile). Il consumo/dip. è aumentato per l\'inserimento di 5 nuovi dipendenti."',
    },
    // B7 Rifiuti
    ri: {
      label: 'Note, giustificazioni e variazioni YoY — Rifiuti (B7)',
      hint: 'Giustifica variazioni nei totali prodotti, nel tasso di recupero e nella quota di pericolosi. Indica eventuali smaltitori certificati o interventi di riduzione.',
      placeholder: 'Es. "L\'aumento dei rifiuti totali (+8%) è correlato all\'incremento produttivo. La % di recupero è cresciuta dal 62% al 71% grazie alla nuova convenzione con un impianto R13 certificato."',
    },
    // B4 Inquinamento
    inq: {
      label: 'Note, giustificazioni e variazioni YoY — Inquinamento (B4)',
      hint: 'Se B4 non è applicabile, dichiara il motivo. Altrimenti spiega metodologie di misura, risultati rispetto ai limiti e azioni correttive.',
      placeholder: 'Es. "L\'impresa non è soggetta ad AIA/AUA. Non sono presenti emissioni in atmosfera significative né scarichi idrici non domestici. Nessun sistema EMS è attivo."',
    },
    // B5 Biodiversità
    biod: {
      label: 'Note, giustificazioni e variazioni YoY — Biodiversità (B5)',
      hint: 'Documenta l\'esito della verifica prossimità ad aree protette. Se applicabile, descrivi misure di compensazione o gestione della biodiversità.',
      placeholder: 'Es. "Verifica effettuata su mappa EEA (buffer 5 km). Nessun sito è ubicato in prossimità di aree Natura 2000 o WDPA. La sede di Torino si trova a 6,2 km dall\'area SIC IT1110023."',
    },
    // B8-B10 Personale
    pe: {
      label: 'Note, giustificazioni e variazioni YoY — Personale & H&S (B8–B10)',
      hint: 'Spiega variazioni nell\'organico, nel tasso di infortuni, nel gender pay gap o nelle ore di formazione. Indica eventuali iniziative welfare o piani di assunzione.',
      placeholder: 'Es. "L\'organico è cresciuto da 42 a 51 unità (+9) per l\'apertura della nuova sede. L\'IF è azzerato grazie al progetto sicurezza avviato in Q1. Il gap retributivo di genere (8%) verrà affrontato nel piano 2025."',
    },
    // B11 Governance
    gov: {
      label: 'Note, giustificazioni e variazioni YoY — Governance & Integrità (B11)',
      hint: 'Spiega variazioni nella composizione del CdA, nuove certificazioni o policy adottate, esito di audit interni, gestione di eventuali segnalazioni whistleblowing.',
      placeholder: 'Es. "Il CdA ha accolto una nuova componente femminile (ora 33%). Il Codice Etico è stato aggiornato in luglio. Nessuna segnalazione whistleblowing ricevuta nell\'anno."',
    },
    // Anagrafica
    ana: {
      label: 'Note — Anagrafica e contesto aziendale',
      hint: 'Descrivi eventuali cambiamenti organizzativi rilevanti avvenuti nell\'anno (fusioni, acquisizioni, nuove attività, cambi di perimetro di rendicontazione).',
      placeholder: 'Es. "Nel corso dell\'anno la società ha acquisito la controllata Alfa Srl (luglio), ampliando il perimetro di rendicontazione al consolidato. Il codice ATECO è invariato."',
    },
  };

  const cfg = configs[section] || {
    label: 'Note e commenti',
    hint: 'Aggiungi note, giustificazioni o spiegazioni sulle variazioni rispetto all\'anno precedente.',
    placeholder: 'Note...',
  };

  return (
    <div className="border border-dashed border-primary/30 rounded-xl p-5 bg-primary/[0.02]">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-primary/70 shrink-0" />
        <span className="font-heading font-bold text-sm text-primary/80">{cfg.label}</span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">{cfg.hint}</p>
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={cfg.placeholder}
        className="border-primary/20 focus:border-primary/50 focus:ring-primary/10 resize-y text-sm bg-white"
      />
    </div>
  );
}