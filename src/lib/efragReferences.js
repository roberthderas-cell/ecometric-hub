// Riferimenti ufficiali EFRAG — Standard VSME (consegnato alla Commissione UE il 17/12/2024)
// Fonte: https://www.efrag.org/en/vsme-digital-template-and-xbrl-taxonomy
export const EFRAG_STANDARD_URL = 'https://www.efrag.org/sites/default/files/sites/webpublishing/SiteAssets/VSME%20Standard.pdf';
export const EFRAG_HUB_URL = 'https://www.efrag.org/en/vsme-digital-template-and-xbrl-taxonomy';

// Mappa keyed per codice disclosure (B1–B11 Modulo Base, C1–C9 Modulo Completo)
export const EFRAG_REFERENCES = {
  // ─── MODULO BASE ───
  B1: {
    title: 'Basi per la preparazione',
    module: 'Modulo Base',
    requires: 'Indicare il modulo adottato (Base/Completo), se il report è su base individuale o consolidata (con elenco delle controllate), forma giuridica, codice NACE/ATECO, totale attivo, fatturato e numero di dipendenti, Paesi di operatività con localizzazione dei siti e certificazioni di sostenibilità.',
  },
  B2: {
    title: 'Pratiche, politiche e iniziative future',
    module: 'Modulo Base',
    requires: 'Descrivere le pratiche, le politiche e le iniziative future adottate per la transizione verso un\'economia più sostenibile, per ciascuno dei temi ESG rilevanti.',
  },
  B3: {
    title: 'Energia ed emissioni di gas serra (GHG)',
    module: 'Modulo Base',
    requires: 'Riportare il consumo energetico totale in MWh suddiviso tra fonti rinnovabili e non rinnovabili, le emissioni lorde GHG Scope 1 e Scope 2 (location-based; market-based se disponibile) e, se applicabile, l\'intensità delle emissioni rapportata al fatturato.',
  },
  B4: {
    title: 'Inquinamento di aria, acqua e suolo',
    module: 'Modulo Base',
    requires: 'Dichiarare gli inquinanti emessi in aria, acqua e suolo per i quali esiste un obbligo di comunicazione di legge (es. registro E-PRTR, autorizzazioni AIA/AUA).',
  },
  B5: {
    title: 'Biodiversità',
    module: 'Modulo Base',
    requires: 'Indicare il numero e l\'area (in ettari) dei siti ubicati in aree sensibili per la biodiversità o nelle loro adiacenze (Natura 2000, WDPA), e l\'uso del suolo.',
  },
  B6: {
    title: 'Acqua',
    module: 'Modulo Base',
    requires: 'Riportare il prelievo idrico totale e, separatamente, il consumo idrico nelle aree soggette a stress idrico.',
  },
  B7: {
    title: 'Uso delle risorse, economia circolare e rifiuti',
    module: 'Modulo Base',
    requires: 'Dichiarare i rifiuti totali generati nell\'anno per tipologia, la quota di rifiuti pericolosi e non pericolosi e la quota avviata a recupero/riciclo, oltre ai principi di economia circolare applicati.',
  },
  B8: {
    title: 'Forza lavoro — Caratteristiche generali',
    module: 'Modulo Base',
    requires: 'Riportare il numero di dipendenti per headcount o FTE, la suddivisione per genere e per Paese (se più Paesi) e la tipologia contrattuale (determinato/indeterminato, full/part-time).',
  },
  B9: {
    title: 'Forza lavoro — Salute e sicurezza',
    module: 'Modulo Base',
    requires: 'Dichiarare il numero e il tasso di infortuni sul lavoro registrabili e il numero di decessi correlati al lavoro.',
  },
  B10: {
    title: 'Forza lavoro — Retribuzione, contrattazione collettiva e formazione',
    module: 'Modulo Base',
    requires: 'Indicare se tutti i dipendenti percepiscono almeno il salario minimo applicabile, il gender pay gap, la % di dipendenti coperti da contrattazione collettiva e le ore medie di formazione suddivise per genere.',
  },
  B11: {
    title: 'Condanne e sanzioni per corruzione',
    module: 'Modulo Base',
    requires: 'Dichiarare il numero di condanne e l\'importo delle sanzioni per violazioni in materia di corruzione attiva e passiva.',
  },
  // ─── MODULO COMPLETO ───
  C1: {
    title: 'Strategia: modello di business e iniziative di sostenibilità',
    module: 'Modulo Completo',
    requires: 'Descrivere il modello di business, i gruppi significativi di prodotti/servizi e mercati, e come la strategia integra la sostenibilità.',
  },
  C2: {
    title: 'Descrizione di pratiche, politiche e iniziative future (dettaglio)',
    module: 'Modulo Completo',
    requires: 'Approfondire, per ciascun tema materiale, le pratiche e le politiche adottate, gli obiettivi e i relativi KPI di monitoraggio.',
  },
  C3: {
    title: 'Obiettivi di riduzione GHG e transizione climatica',
    module: 'Modulo Completo',
    requires: 'Riportare gli obiettivi di riduzione delle emissioni GHG (anno base, anno target, % di riduzione) e il piano di transizione climatica.',
  },
  C4: {
    title: 'Rischi climatici',
    module: 'Modulo Completo',
    requires: 'Descrivere i rischi fisici (acuti/cronici) e di transizione, l\'orizzonte temporale, le azioni di adattamento e l\'eventuale impatto finanziario.',
  },
  C5: {
    title: 'Caratteristiche aggiuntive della forza lavoro',
    module: 'Modulo Completo',
    requires: 'Riportare indicatori aggiuntivi come il tasso di turnover e la stabilità contrattuale suddivisa per genere.',
  },
  C6: {
    title: 'Diritti umani — Politiche e processi',
    module: 'Modulo Completo',
    requires: 'Descrivere le politiche sui diritti umani della forza lavoro, i meccanismi di reclamo e i processi di due diligence.',
  },
  C7: {
    title: 'Incidenti gravi sui diritti umani',
    module: 'Modulo Completo',
    requires: 'Dichiarare il numero di incidenti gravi relativi ai diritti umani nella catena del valore, con descrizione del contesto e della risposta dell\'impresa.',
  },
  C8: {
    title: 'Ricavi da settori specifici ed esclusione dai benchmark UE',
    module: 'Modulo Completo',
    requires: 'Indicare i ricavi generati da settori esclusi dai benchmark UE Paris-aligned (es. carbone, armi controverse) ai sensi del Reg. UE 2016/1011.',
  },
  C9: {
    title: 'Rapporto di diversità di genere nell\'organo di governo',
    module: 'Modulo Completo',
    requires: 'Riportare la composizione per genere dell\'organo di governo e il relativo rapporto di diversità.',
  },
};

/** Estrae i codici disclosure (B1..B11, C1..C9) da una stringa reference tipo "VSME B8/B9/B10 | ..." */
export function extractEfragCodes(reference) {
  if (!reference) return [];
  const matches = String(reference).toUpperCase().match(/[BC]\d{1,2}/g) || [];
  const seen = new Set();
  const codes = [];
  matches.forEach((c) => {
    if (EFRAG_REFERENCES[c] && !seen.has(c)) {
      seen.add(c);
      codes.push(c);
    }
  });
  return codes;
}