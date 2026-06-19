// Riferimenti ufficiali EFRAG — Standard VSME (consegnato alla Commissione UE il 17/12/2024)
// Fonte: https://www.efrag.org/sites/default/files/sites/webpublishing/SiteAssets/VSME%20Standard.pdf
export const EFRAG_STANDARD_URL = 'https://www.efrag.org/sites/default/files/sites/webpublishing/SiteAssets/VSME%20Standard.pdf';
export const EFRAG_HUB_URL = 'https://knowledgehub.efrag.org/';

// Mappa keyed per codice disclosure (B1–B11 Modulo Base, C1–C9 Modulo Completo)
// `datapoints`: lista dei parametri specifici richiesti dallo standard VSME per ciascun disclosure
export const EFRAG_REFERENCES = {
  // ─── MODULO BASE ───
  B1: {
    title: 'Basi per la preparazione',
    module: 'Modulo Base',
    requires: 'Indicare il modulo adottato (Base/Completo), se il report è su base individuale o consolidata (con elenco delle controllate), forma giuridica, codice NACE/ATECO, totale attivo, fatturato e numero di dipendenti, Paesi di operatività con localizzazione dei siti e certificazioni di sostenibilità.',
    datapoints: [
      { id: 'B1-1', label: 'Modulo adottato (Base / Base+Completo)' },
      { id: 'B1-2', label: 'Perimetro di rendicontazione (individuale / consolidato)' },
      { id: 'B1-3', label: 'Forma giuridica e codice NACE/ATECO' },
      { id: 'B1-4', label: 'Totale attivo, fatturato netto e N. dipendenti' },
      { id: 'B1-5', label: 'Paesi di operatività e localizzazione sedi (geocoding)' },
      { id: 'B1-6', label: 'Certificazioni di sostenibilità possedute' },
      { id: 'B1-7', label: 'Informazioni di sostenibilità rese pubblicamente disponibili (DP.3)' },
      { id: 'B1-8', label: '% Fatturato allineato Tassonomia UE (DP.11) — stima' },
      { id: 'B1-9', label: '% CapEx allineata Tassonomia UE (DP.12) — stima' },
    ],
  },
  B2: {
    title: 'Pratiche, politiche e iniziative future',
    module: 'Modulo Base',
    requires: 'Descrivere le pratiche, le politiche e le iniziative future adottate per la transizione verso un\'economia più sostenibile, per ciascuno dei temi ESG rilevanti.',
    datapoints: [
      { id: 'B2-1', label: 'Descrizione pratiche e politiche di sostenibilità in atto' },
      { id: 'B2-2', label: 'Iniziative future di transizione sostenibile pianificate' },
      { id: 'B2-3', label: 'Analisi di materialità: impatti, rischi e opportunità rilevanti' },
    ],
  },
  B3: {
    title: 'Energia ed emissioni di gas serra (GHG)',
    module: 'Modulo Base',
    requires: 'Riportare il consumo energetico totale in MWh suddiviso tra fonti rinnovabili e non rinnovabili, le emissioni lorde GHG Scope 1 e Scope 2 (location-based; market-based se disponibile) e, se applicabile, l\'intensità delle emissioni rapportata al fatturato.',
    datapoints: [
      { id: 'B3-1', label: 'Consumo energetico totale (MWh)' },
      { id: 'B3-2', label: 'di cui da fonti rinnovabili (MWh e %)' },
      { id: 'B3-3', label: 'di cui da fonti non rinnovabili (MWh)' },
      { id: 'B3-4', label: 'Emissioni GHG Scope 1 — combustibili propri (tCO₂eq)' },
      { id: 'B3-5', label: 'Emissioni GHG Scope 2 location-based — elettricità rete (tCO₂eq)' },
      { id: 'B3-6', label: 'Emissioni GHG Scope 2 market-based — facoltativo (tCO₂eq)' },
      { id: 'B3-7', label: 'Intensità GHG rapportata al fatturato (tCO₂eq/M€)' },
      { id: 'B3-8', label: 'Classe energetica APE immobili in garanzia (DP.4)' },
      { id: 'B3-9', label: 'Target di riduzione emissioni GHG fissati (DP.8)' },
      { id: 'B3-10', label: 'Investimenti per riduzione rischio fisico/transizione (DP.9)' },
      { id: 'B3-11', label: 'Copertura assicurativa contro rischi fisici/calamità (DP.10)' },
    ],
  },
  B4: {
    title: 'Inquinamento di aria, acqua e suolo',
    module: 'Modulo Base',
    requires: 'Dichiarare gli inquinanti emessi in aria, acqua e suolo per i quali esiste un obbligo di comunicazione di legge (es. registro E-PRTR, autorizzazioni AIA/AUA).',
    datapoints: [
      { id: 'B4-1', label: 'Soggettività a AIA/AUA o Registro E-PRTR' },
      { id: 'B4-2', label: 'Inventario inquinanti emessi in aria, acqua e suolo (DP.13)' },
      { id: 'B4-3', label: 'Aspetti ambientali significativi per processo produttivo' },
      { id: 'B4-4', label: 'Obiettivi di riduzione emissioni inquinanti (DP.14)' },
    ],
  },
  B5: {
    title: 'Biodiversità ed ecosistemi',
    module: 'Modulo Base',
    requires: 'Indicare il numero e l\'area (in ettari) dei siti ubicati in aree sensibili per la biodiversità o nelle loro adiacenze (Natura 2000, WDPA), e l\'uso del suolo.',
    datapoints: [
      { id: 'B5-1', label: 'N. siti in/adiacenti ad aree protette (Natura 2000, WDPA)' },
      { id: 'B5-2', label: 'Superficie totale dei siti (m² / ha)' },
      { id: 'B5-3', label: 'Superficie impermeabilizzata (m²) — DP.19' },
      { id: 'B5-4', label: 'Superficie a vocazione naturale (m²)' },
      { id: 'B5-5', label: 'Obiettivi per la protezione o il ripristino della biodiversità (DP.20)' },
    ],
  },
  B6: {
    title: 'Acqua',
    module: 'Modulo Base',
    requires: 'Riportare il prelievo idrico totale e, separatamente, il consumo idrico nelle aree soggette a stress idrico.',
    datapoints: [
      { id: 'B6-1', label: 'Prelievi idrici totali per fonte (m³) — DP.15' },
      { id: 'B6-2', label: 'di cui da zone ad elevato stress idrico (m³) — DP.16' },
      { id: 'B6-3', label: 'Scarichi idrici (m³)' },
      { id: 'B6-4', label: 'Consumo idrico netto (prelievi − scarichi) (m³)' },
      { id: 'B6-5', label: 'Obiettivi di riduzione consumi idrici (DP.17)' },
    ],
  },
  B7: {
    title: 'Uso delle risorse, economia circolare e rifiuti',
    module: 'Modulo Base',
    requires: 'Dichiarare i rifiuti totali generati nell\'anno per tipologia, la quota di rifiuti pericolosi e non pericolosi e la quota avviata a recupero/riciclo, oltre ai principi di economia circolare applicati.',
    datapoints: [
      { id: 'B7-1', label: 'Rifiuti totali generati nell\'anno (t) — DP.21' },
      { id: 'B7-2', label: 'di cui Pericolosi e radioattivi (t) — DP.21' },
      { id: 'B7-3', label: '% rifiuti destinati a smaltimento vs recupero/riciclo — DP.22' },
      { id: 'B7-4', label: 'Dettaglio analitico per codice CER (RENTRI)' },
      { id: 'B7-5', label: '% contenuto riciclato/recuperato nei prodotti finiti (DP.23)' },
      { id: 'B7-6', label: '% contenuto riciclabile negli imballaggi (DP.24)' },
      { id: 'B7-7', label: 'Obiettivi di miglioramento gestione circolare (DP.25)' },
    ],
  },
  B8: {
    title: 'Forza lavoro — Caratteristiche generali',
    module: 'Modulo Base',
    requires: 'Riportare il numero di dipendenti per headcount o FTE, la suddivisione per genere e per Paese (se più Paesi) e la tipologia contrattuale (determinato/indeterminato, full/part-time).',
    datapoints: [
      { id: 'B8-1', label: 'N. dipendenti totali — Headcount (HC)' },
      { id: 'B8-2', label: 'N. dipendenti totali — FTE' },
      { id: 'B8-3', label: 'Suddivisione per genere (Donne / Uomini)' },
      { id: 'B8-4', label: 'Contratto indeterminato vs determinato — DP.35' },
      { id: 'B8-5', label: 'Part-time e dipendenti con disabilità' },
    ],
  },
  B9: {
    title: 'Forza lavoro — Salute e sicurezza',
    module: 'Modulo Base',
    requires: 'Dichiarare il numero e il tasso di infortuni sul lavoro registrabili e il numero di decessi correlati al lavoro.',
    datapoints: [
      { id: 'B9-1', label: 'N. infortuni registrabili comunicati all\'INAIL — DP.32' },
      { id: 'B9-2', label: 'Tasso di frequenza infortuni (IF = infort. × 1M / ore lav.)' },
      { id: 'B9-3', label: 'N. decessi dovuti a incidenti / malattie professionali — DP.34' },
      { id: 'B9-4', label: 'Giornate perse per infortuni e malattie prof. — DP.33' },
      { id: 'B9-5', label: 'Tasso di assenteismo' },
      { id: 'B9-6', label: 'Procedure per segnalazione situazioni di pericolo H&S — DP.39' },
    ],
  },
  B10: {
    title: 'Forza lavoro — Retribuzione, contrattazione collettiva e formazione',
    module: 'Modulo Base',
    requires: 'Indicare se tutti i dipendenti percepiscono almeno il salario minimo applicabile, il gender pay gap, la % di dipendenti coperti da contrattazione collettiva e le ore medie di formazione suddivise per genere.',
    datapoints: [
      { id: 'B10-1', label: 'Tutti i dipendenti retribuiti ≥ salario minimo applicabile' },
      { id: 'B10-2', label: 'Gender Pay Gap % (per livello di inquadramento) — DP.30' },
      { id: 'B10-3', label: 'CCNL applicato e % dipendenti coperti da contrattazione collettiva — DP.28' },
      { id: 'B10-4', label: 'Ore medie di formazione per dipendente (per tipologia) — DP.31' },
      { id: 'B10-5', label: 'Ore di formazione suddivise per genere (Donne / Uomini)' },
      { id: 'B10-6', label: 'N. dipendenti "categorie protette" oltre soglia legale — DP.29' },
      { id: 'B10-7', label: 'Iniziative per la forza lavoro (welfare, smart working, ecc.) — DP.36' },
      { id: 'B10-8', label: 'Iniziative per la comunità e il territorio — DP.37' },
    ],
  },
  B11: {
    title: 'Condanne e sanzioni per corruzione e ambiente',
    module: 'Modulo Base',
    requires: 'Dichiarare il numero di condanne e l\'importo delle sanzioni per violazioni in materia di corruzione attiva e passiva, nonché le sanzioni per violazioni di norme ambientali.',
    datapoints: [
      { id: 'B11-1', label: 'N. condanne per corruzione (ultimi 3 esercizi) — DP.38' },
      { id: 'B11-2', label: 'Importo sanzioni pecuniarie per corruzione (€) — DP.40' },
      { id: 'B11-3', label: 'Sanzioni per violazioni norme ambientali (€) — DP.40' },
      { id: 'B11-4', label: 'Codice Etico adottato' },
      { id: 'B11-5', label: 'Modello Organizzativo D.Lgs. 231/2001 (MOG)' },
      { id: 'B11-6', label: 'Policy anti-corruzione formale' },
      { id: 'B11-7', label: 'Sistema Whistleblowing (D.Lgs. 24/2023)' },
      { id: 'B11-8', label: 'Procedure segnalazione pericoli H&S attive — DP.39' },
    ],
  },
  // ─── MODULO COMPLETO ───
  C1: {
    title: 'Strategia: modello di business e iniziative di sostenibilità',
    module: 'Modulo Completo',
    requires: 'Descrivere il modello di business, i gruppi significativi di prodotti/servizi e mercati, e come la strategia integra la sostenibilità.',
    datapoints: [
      { id: 'C1-1', label: 'Descrizione modello di business e catena del valore' },
      { id: 'C1-2', label: 'Prodotti/servizi significativi e mercati di riferimento' },
      { id: 'C1-3', label: 'Strategia di sostenibilità e orizzonti temporali' },
    ],
  },
  C2: {
    title: 'Descrizione di pratiche, politiche e iniziative future (dettaglio)',
    module: 'Modulo Completo',
    requires: 'Approfondire, per ciascun tema materiale, le pratiche e le politiche adottate, gli obiettivi e i relativi KPI di monitoraggio.',
    datapoints: [
      { id: 'C2-1', label: 'Pratiche dettagliate per tema materiale' },
      { id: 'C2-2', label: 'Politiche formali ESG con KPI di monitoraggio' },
      { id: 'C2-3', label: 'Iniziative future con scadenze e target misurabili' },
    ],
  },
  C3: {
    title: 'Obiettivi di riduzione GHG e transizione climatica',
    module: 'Modulo Completo',
    requires: 'Riportare gli obiettivi di riduzione delle emissioni GHG (anno base, anno target, % di riduzione) e il piano di transizione climatica.',
    datapoints: [
      { id: 'C3-1', label: 'Anno base e anno target per riduzione GHG' },
      { id: 'C3-2', label: '% riduzione GHG prevista (Scope 1+2, Scope 3 se noto)' },
      { id: 'C3-3', label: 'Piano di transizione climatica e azioni concrete' },
    ],
  },
  C4: {
    title: 'Rischi fisici e di transizione climatica',
    module: 'Modulo Completo',
    requires: 'Descrivere i rischi fisici (acuti/cronici) e di transizione, l\'orizzonte temporale, le azioni di adattamento e l\'eventuale impatto finanziario.',
    datapoints: [
      { id: 'C4-1', label: 'Rischi fisici acuti e cronici identificati' },
      { id: 'C4-2', label: 'Rischi di transizione (normativi, tecnologici, di mercato)' },
      { id: 'C4-3', label: 'Impatto finanziario stimato dei rischi climatici' },
    ],
  },
  C5: {
    title: 'Caratteristiche aggiuntive della forza lavoro',
    module: 'Modulo Completo',
    requires: 'Riportare indicatori aggiuntivi come il tasso di turnover e la stabilità contrattuale suddivisa per genere.',
    datapoints: [
      { id: 'C5-1', label: 'Tasso di turnover annuo (%)' },
      { id: 'C5-2', label: 'Contratti indeterminati per genere (Donne/Uomini %)' },
    ],
  },
  C6: {
    title: 'Diritti umani — Politiche e processi',
    module: 'Modulo Completo',
    requires: 'Descrivere le politiche sui diritti umani della forza lavoro, i meccanismi di reclamo e i processi di due diligence.',
    datapoints: [
      { id: 'C6-1', label: 'Policy sui diritti umani della forza lavoro — DP.26' },
      { id: 'C6-2', label: 'Meccanismi di reclamo/grievance per i lavoratori' },
      { id: 'C6-3', label: 'Processo di due diligence sui diritti umani' },
    ],
  },
  C7: {
    title: 'Incidenti gravi sui diritti umani',
    module: 'Modulo Completo',
    requires: 'Dichiarare il numero di incidenti gravi relativi ai diritti umani nella catena del valore, con descrizione del contesto e della risposta dell\'impresa.',
    datapoints: [
      { id: 'C7-1', label: 'N. casi violazione diritti umani con provvedimenti definitivi — DP.27' },
      { id: 'C7-2', label: 'Tipologia degli incidenti e risposta aziendale' },
    ],
  },
  C8: {
    title: 'Ricavi da settori specifici ed esclusione dai benchmark UE',
    module: 'Modulo Completo',
    requires: 'Indicare i ricavi generati da settori esclusi dai benchmark UE Paris-aligned (es. carbone, armi controverse) ai sensi del Reg. UE 2016/1011.',
    datapoints: [
      { id: 'C8-1', label: 'Ricavi da settori esclusi dai benchmark EU Paris-aligned' },
      { id: 'C8-2', label: '% fatturato da attività fossili / armi / tabacco / gioco d\'azzardo' },
    ],
  },
  C9: {
    title: 'Diversità di genere nell\'organo di governo',
    module: 'Modulo Completo',
    requires: 'Riportare la composizione per genere dell\'organo di governo e il relativo rapporto di diversità.',
    datapoints: [
      { id: 'C9-1', label: 'N. componenti donne nell\'organo di governo' },
      { id: 'C9-2', label: 'N. componenti uomini nell\'organo di governo' },
      { id: 'C9-3', label: 'Rapporto di diversità di genere nel CDA (%)' },
    ],
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