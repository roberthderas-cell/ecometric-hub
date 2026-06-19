// Riferimenti "Dialogo di Sostenibilità tra PMI e Banche"
// Tavolo per la Finanza Sostenibile — Dicembre 2024 (Aggiornato dicembre 2025)
// Fonte: Ministero dell'Economia e delle Finanze / Banca d'Italia
export const PMI_BANCHE_DOC_TITLE = 'Dialogo di Sostenibilità PMI-Banche (dic. 2025)';
export const PMI_BANCHE_URL = 'https://www.bancaditalia.it/compiti/sef/finanza-sostenibile/index.html';

/**
 * Tutti e 40 i datapoint del Documento PMI-Banche, raggruppati per sezione del report.
 * key = sezione interna app (en, ac, ri, pe, gov, ana, biod, inq)
 * Priorità: 1 = imprescindibile (anche microimprese), 2 = utile ma opzionale
 */
export const PMI_BANCHE_BY_SECTION = {
  ana: [
    {
      n: 1,
      priority: 1,
      tipologia: 'Informazioni generali',
      label: 'Ubicazione/geolocalizzazione siti, codice NACE, fatturato per sito, N. dipendenti per sito',
      norma: 'Terzo Pilastro Modello 5 (Rischio fisico) e Modello 3 (Rischio di transizione)',
    },
    {
      n: 2,
      priority: 1,
      tipologia: 'Informazioni generali',
      label: 'Struttura organizzativa e di governance, ruoli ESG, strategia di sostenibilità',
      norma: 'Terzo Pilastro Tab. qualitative 1-2-3 sui rischi ESG — Art. 87a CRD VI / EBA',
    },
    {
      n: 3,
      priority: 2,
      tipologia: 'Informazioni generali',
      label: 'Rating/scoring ESG esterno, certificazioni ambientali/sociali, info sostenibilità rese pubbliche',
      norma: 'Terzo Pilastro Tab. qualitative 1-2-3 — Art. 87a CRD VI / EBA',
    },
  ],
  en: [
    {
      n: 4,
      priority: 1,
      tipologia: 'Metrica',
      label: 'Classe energetica APE degli immobili in garanzia (da A a G)',
      norma: 'Terzo Pilastro Modello 2 — SFDR PAI',
    },
    {
      n: 5,
      priority: 1,
      tipologia: 'Metrica',
      label: 'Consumo totale di energia: da fonti rinnovabili e non rinnovabili (MWh/anno)',
      norma: 'SFDR PAI — CSRD/ESRS',
    },
    {
      n: 6,
      priority: 1,
      tipologia: 'Metrica',
      label: 'Emissioni GHG Scope 1 (tCO₂eq/anno) — combustibili propri',
      norma: 'Terzo Pilastro Modello 1 — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 7,
      priority: 1,
      tipologia: 'Metrica',
      label: 'Emissioni GHG Scope 2 location-based (tCO₂eq/anno) — elettricità acquistata',
      norma: 'Terzo Pilastro Modello 1 — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 8,
      priority: 2,
      tipologia: 'Obiettivo',
      label: 'Target di riduzione emissioni GHG (anno base, anno target, % riduzione)',
      norma: 'Terzo Pilastro Modello 3 — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 9,
      priority: 1,
      tipologia: 'Azioni/Risorse',
      label: 'Investimenti e azioni per ridurre rischio fisico e di transizione climatica (€)',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 10,
      priority: 1,
      tipologia: 'Azioni/Risorse',
      label: 'Copertura assicurativa contro rischi fisici/calamità (tipo, valore, validità, franchigia)',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — L. 213/2023 art. 1 c. 101',
    },
    {
      n: 11,
      priority: 2,
      tipologia: 'Metrica',
      label: '% fatturato allineato Tassonomia UE (mitigazione e adattamento CC, per codice NACE)',
      norma: 'Terzo Pilastro Modello 9 e Modello 10 (BTAR)',
    },
    {
      n: 12,
      priority: 2,
      tipologia: 'Metrica',
      label: '% CapEx allineata Tassonomia UE (mitigazione e adattamento CC, per codice NACE)',
      norma: 'Terzo Pilastro Modello 9 e Modello 10 (BTAR)',
    },
  ],
  inq: [
    {
      n: 13,
      priority: 2,
      tipologia: 'Metrica',
      label: 'Emissioni annuali di sostanze inquinanti in aria, acqua e suolo (kg o ton/anno)',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 14,
      priority: 2,
      tipologia: 'Obiettivo',
      label: 'Obiettivi di riduzione emissioni inquinanti in aria, acqua e suolo',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
  ],
  ac: [
    {
      n: 15,
      priority: 1,
      tipologia: 'Metrica',
      label: 'Volume annuo di acqua consumata (m³/anno) — prelievi meno scarichi',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 16,
      priority: 2,
      tipologia: 'Metrica',
      label: 'Volume annuo prelievi idrici da zone ad elevato stress idrico (m³/anno)',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 17,
      priority: 2,
      tipologia: 'Obiettivo',
      label: 'Obiettivi di riduzione consumi idrici e/o prelievi da zone a stress idrico',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
  ],
  biod: [
    {
      n: 18,
      priority: 1,
      tipologia: 'Metrica',
      label: 'Area (ha) siti in/adiacenti ad aree protette e ad elevato valore biodiversità (Natura 2000, WDPA, KBA)',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 19,
      priority: 2,
      tipologia: 'Metrica',
      label: 'Area e % di terreno impermeabilizzata (ha e %)',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
    {
      n: 20,
      priority: 2,
      tipologia: 'Obiettivo',
      label: 'Obiettivi di protezione o ripristino della biodiversità',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
  ],
  ri: [
    {
      n: 21,
      priority: 1,
      tipologia: 'Metrica',
      label: 'Tonnellate di rifiuti pericolosi e radioattivi prodotti nell\'anno (kg o ton/anno)',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 22,
      priority: 2,
      tipologia: 'Metrica',
      label: '% rifiuti destinati a smaltimento e % rifiuti riciclati/riutilizzati durante l\'anno',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 23,
      priority: 2,
      tipologia: 'Metrica',
      label: '% contenuto riciclato/recuperato/sottoprodotto nei prodotti finiti/semilavorati e imballaggi',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
    {
      n: 24,
      priority: 2,
      tipologia: 'Metrica',
      label: '% contenuto riciclabile negli imballaggi',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
    {
      n: 25,
      priority: 2,
      tipologia: 'Obiettivo',
      label: 'Obiettivi di miglioramento della gestione circolare delle risorse',
      norma: 'Terzo Pilastro Tab. qualitative 1 e 3 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
  ],
  pe: [
    {
      n: 26,
      priority: 2,
      tipologia: 'Politiche/Procedure',
      label: 'Policy e procedure per promuovere i diritti dei lavoratori (inclusi non dipendenti)',
      norma: 'Terzo Pilastro Tab. qualitative 2 e 3 — Art. 87a CRD VI / EBA — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 27,
      priority: 1,
      tipologia: 'Metrica',
      label: 'N. casi violazione diritti umani con provvedimenti definitivi/sanzioni (ultimi 3 esercizi)',
      norma: 'Terzo Pilastro Tab. qualitative 2 e 3 — Art. 87a CRD VI / EBA — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 28,
      priority: 1,
      tipologia: 'Politiche/Procedure',
      label: '% lavoratori coperti da CCNL (contrattazione collettiva nazionale)',
      norma: 'Terzo Pilastro Tab. qualitative 2 e 3 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
    {
      n: 29,
      priority: 2,
      tipologia: 'Metrica',
      label: 'N. dipendenti "categorie protette" L. 68/1999 oltre la soglia di legge',
      norma: 'Terzo Pilastro Tab. qualitative 2 e 3 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
    {
      n: 30,
      priority: 1,
      tipologia: 'Metrica',
      label: '% divario retributivo medio di genere per livello di inquadramento (Gender Pay Gap)',
      norma: 'Terzo Pilastro Tab. qualitative 2 e 3 — Art. 87a CRD VI / EBA — SFDR PAI — CSRD',
    },
    {
      n: 31,
      priority: 1,
      tipologia: 'Metrica',
      label: 'N. medio ore formazione per dipendente, per tipologia (obbligatoria/non), per genere',
      norma: 'Terzo Pilastro Tab. 2 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
    {
      n: 32,
      priority: 1,
      tipologia: 'Metrica',
      label: 'N. e tasso infortuni comunicati all\'INAIL nell\'anno (D.Lgs. 151/2015)',
      norma: 'Terzo Pilastro Tab. qualitative 2 e 3 — Art. 87a CRD VI / EBA — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 33,
      priority: 1,
      tipologia: 'Metrica',
      label: 'N. giornate perse per infortuni e/o malattie professionali nell\'anno',
      norma: 'Terzo Pilastro Tab. qualitative 2 e 3 — Art. 87a CRD VI / EBA — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 34,
      priority: 1,
      tipologia: 'Metrica',
      label: 'N. decessi per incidenti/malattie professionali nell\'anno',
      norma: 'Terzo Pilastro Tab. qualitative 2 e 3 — Art. 87a CRD VI / EBA — SFDR PAI 14 — CSRD/ESRS',
    },
    {
      n: 35,
      priority: 1,
      tipologia: 'Metrica',
      label: 'N. dipendenti a tempo determinato e indeterminato, per genere e inquadramento',
      norma: 'Terzo Pilastro Tab. 2 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
    {
      n: 36,
      priority: 2,
      tipologia: 'Azioni',
      label: 'Iniziative implementate per minimizzare impatti negativi sulla forza lavoro',
      norma: 'Terzo Pilastro Tab. qualitative 2 e 3 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
    {
      n: 37,
      priority: 2,
      tipologia: 'Azioni',
      label: 'Iniziative implementate per minimizzare impatti negativi su comunità e territorio',
      norma: 'Terzo Pilastro Tab. qualitative 2 e 3 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
  ],
  gov: [
    {
      n: 38,
      priority: 2,
      tipologia: 'Politiche/Procedure',
      label: 'Adozione Codice Etico, Modello 231, procedure anticorruzione, sistemi Whistleblowing (D.Lgs. 24/2023)',
      norma: 'Terzo Pilastro Tab. qualitative 2 e 3 — Art. 87a CRD VI / EBA — SFDR PAI — CSRD/ESRS',
    },
    {
      n: 39,
      priority: 1,
      tipologia: 'Politiche/Procedure',
      label: 'Procedure per segnalazione situazioni di pericolo H&S dei lavoratori (D.Lgs. 81/2008)',
      norma: 'Terzo Pilastro Tab. qualitative 2 e 3 — Art. 87a CRD VI / EBA — CSRD/ESRS',
    },
    {
      n: 40,
      priority: 2,
      tipologia: 'Metrica',
      label: 'N. e ammontare sanzioni pecuniarie/interdittive per corruzione attiva/passiva e per violazioni ambientali (€/anno)',
      norma: 'Terzo Pilastro Tab. qualitative 2 e 3 — Art. 87a CRD VI / EBA — SFDR PAI — CSRD/ESRS',
    },
  ],
};

/** Mappa sezione → label leggibile */
export const SECTION_LABELS = {
  ana: 'Anagrafica',
  en: 'Energia & GHG',
  inq: 'Inquinamento',
  ac: 'Acqua',
  biod: 'Biodiversità',
  ri: 'Rifiuti',
  pe: 'Personale & H&S',
  gov: 'Governance',
};