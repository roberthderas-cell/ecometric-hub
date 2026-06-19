import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, BookOpen,
  Building2, Zap, Droplets, Recycle, Wind, TreePine, Users, Shield,
  AlertTriangle, FileText, Lightbulb, Link as LinkIcon
} from 'lucide-react';

const GUIDE_STEPS = [
  {
    id: 'intro',
    area: 'C',
    areaLabel: 'Introduzione',
    icon: BookOpen,
    title: 'Come usare il VSME Builder',
    desc: 'Panoramica del flusso di compilazione e delle sezioni del report.',
    content: {
      obiettivo: 'Questo strumento ti guida nella compilazione del report VSME (Voluntary Sustainability Reporting for SMEs) secondo lo standard EFRAG 2024/2026. Il report è strutturato in sezioni tematiche che coprono Ambiente (E), Sociale (S) e Governance (G).',
      steps: [
        { label: '1. Anagrafica', text: 'Inizia con i dati identificativi dell\'azienda: ragione sociale, codice ATECO, dimensione e sede. Questi dati alimentano automaticamente altre sezioni.' },
        { label: '2. Dati ambientali (B3–B7)', text: 'Compila nell\'ordine: Energia → Acqua → Rifiuti → Inquinamento → Biodiversità. Per ogni sezione hai campi obbligatori e facoltativi.' },
        { label: '3. Personale (B8–B10)', text: 'Inserisci organico, dati H&S e retribuzioni. Molti KPI (IF, assenteismo, pay gap) vengono calcolati automaticamente.' },
        { label: '4. Governance (B11)', text: 'Documenta composizione CDA, certificazioni, policy anti-corruzione e compliance normativa.' },
        { label: '5. Output', text: 'Usa la Dashboard, la Relazione Banca e la sezione Consigli per analizzare i risultati e generare documenti.' },
      ],
      warning: 'Salva frequentemente. Il salvataggio automatico avviene ogni 1,2 secondi dopo una modifica.',
      links: [
        { label: 'Standard VSME ufficiale EFRAG', url: 'https://www.efrag.org/en/projects/esrs-for-smes' },
        { label: 'EFRAG Knowledge Hub', url: 'https://efrag.org/en/news-and-events/news/efrag-knowledge-hub-for-the-vsme' },
      ],
    },
  },
  {
    id: 'ana',
    area: 'C',
    areaLabel: 'Configurazione',
    icon: Building2,
    title: 'Anagrafica Impresa',
    desc: 'Come compilare correttamente i dati identificativi e dimensionali.',
    content: {
      obiettivo: 'L\'Anagrafica popola automaticamente la sezione B1 del report e determina la categoria VSME (Micro/Piccola/Media). È il punto di partenza obbligatorio.',
      steps: [
        { label: 'Ragione Sociale e ATECO', text: 'Inserisci la ragione sociale esatta da visura camerale. Il codice ATECO è il codice primario (es. 25.62 per lavorazione meccanica). È usato per il benchmarking di settore.' },
        { label: 'Forma giuridica e perimetro', text: 'Scegli "Consolidato" solo se il report copre un gruppo di società. Altrimenti usa "Individuale".' },
        { label: 'Categoria VSME', text: 'La categoria (Micro/Piccola/Media) si determina con almeno 2 su 3 soglie: Attivo ≤ 450k/5M€, Fatturato ≤ 900k/10M€, Dipendenti ≤ 10/50. La piattaforma la calcola automaticamente dai dati dimensionali.' },
        { label: 'Modulo VSME', text: 'Scegli "Base (B1–B11)" per la rendicontazione standard. Aggiungi il Modulo Completo (C1–C9) solo se richiesto dalla banca, dall\'investitore o dal rating ESG.' },
        { label: 'Sedi aziendali', text: 'Inserisci sede legale e sedi operative con indirizzo completo (es. "Via Roma 1, 20121 Milano MI"). Vengono usate nella mappa Biodiversità per la verifica automatica delle aree protette.' },
      ],
      warning: 'I dati dimensionali (attivo, fatturato, dipendenti) devono riferirsi all\'ultimo bilancio approvato.',
      tips: [
        'Il codice ATECO si trova in visura camerale o sull\'F24 INPS.',
        'Per la sede legale usa l\'indirizzo completo con CAP: migliora la precisione del geocoding.',
        'Il modulo si può cambiare in qualsiasi momento: i dati già inseriti non vengono persi.',
      ],
      links: [
        { label: 'Registro Imprese — visura gratuita', url: 'https://www.registroimprese.it/' },
        { label: 'Classificazione ATECO 2007', url: 'https://www.istat.it/it/archivio/17888' },
      ],
    },
  },
  {
    id: 'en',
    area: 'E',
    areaLabel: 'Ambiente',
    icon: Zap,
    title: 'B3 — Energia & Emissioni GHG',
    desc: 'Come raccogliere e inserire correttamente i dati energetici e le emissioni.',
    content: {
      obiettivo: 'La sezione B3 richiede il consumo energetico totale (MWh) suddiviso per fonte (rinnovabile/non rinnovabile) e le emissioni GHG Scope 1 e 2. È tra i datapoint più controllati dagli istituti di credito.',
      steps: [
        { label: 'Fonti dati', text: 'Usa le bollette elettriche per kWh da rete. Per il fotovoltaico: produzione autoconsumata dal sistema di monitoraggio o dalla stima della centrale (kWh = kWp × H_pic_annuali, dove H_pic ≈ 1.200–1.400 h/anno in Italia).' },
        { label: 'Fattore ISPRA', text: 'Il fattore emissivo della rete elettrica italiana (location-based) è aggiornato annualmente da ISPRA. 2023 = 0,211 kgCO₂eq/kWh; 2022 = 0,233. Fonte: Rapporto ISPRA "Fattori di emissione".' },
        { label: 'Combustibili Scope 1', text: 'Inserisci i quantitativi effettivi consumati (da DDT, contatori o fatture): gas naturale in Sm³, gasolio in litri, GPL in kg. I fattori CO₂ sono precompilati secondo ISPRA 2022.' },
        { label: 'Metodo Scope 2', text: 'Scegli "Location-based" per semplicità (fattore ISPRA). Usa "Market-based" solo se hai contratti con Garanzie d\'Origine (GO) o Power Purchase Agreement (PPA): fornisce il fattore emissivo contrattuale.' },
        { label: 'Intensità GHG', text: 'Il KPI "tCO₂eq/M€ fatturato" si calcola automaticamente. Benchmark settoriale: manifattura leggera < 50 tCO₂eq/M€, servizi < 20.' },
      ],
      warning: 'Scope 3 non è richiesto dal Modulo Base VSME. Se lo includi, documenta la metodologia nel campo Note.',
      tips: [
        'Aggiungi sempre l\'anno N-1 per abilitare il confronto YoY nella dashboard.',
        'Se usi pannelli FV, la quota di autoconsumato riduce direttamente il Scope 2 market-based.',
        'Il gas naturale è il combustibile Scope 1 più comune nelle PMI: 1 Sm³ = 1,96 kgCO₂eq.',
      ],
      links: [
        { label: 'Fattori emissione ISPRA 2023', url: 'https://www.isprambiente.gov.it/it/pubblicazioni/rapporti/fattori-di-emissione-in-atmosfera-di-gas-a-effetto-serra-nel-settore-elettrico' },
        { label: 'GHG Protocol — SME Guidance', url: 'https://ghgprotocol.org/' },
      ],
    },
  },
  {
    id: 'ac',
    area: 'E',
    areaLabel: 'Ambiente',
    icon: Droplets,
    title: 'B6 — Acqua',
    desc: 'Come misurare e dichiarare i prelievi idrici aziendali.',
    content: {
      obiettivo: 'B6 richiede il prelievo idrico totale suddiviso per fonte (acquedotto, pozzo, acque superficiali, acque piovane) e i volumi in zone a stress idrico.',
      steps: [
        { label: 'Fonte dei dati', text: 'Usa le bollette del gestore idrico per i prelievi da acquedotto. Per pozzi e acque superficiali: misuratori volumetrici o stime da portata × ore di utilizzo.' },
        { label: 'Stress idrico', text: 'Verifica se le sedi si trovano in zone a stress idrico su WRI Aqueduct (aqueduct.wri.org). In Italia, le zone critiche includono alcune aree della Pianura Padana e del Sud.' },
        { label: 'Consumo netto', text: 'Consumo = Prelievo − Scarico. Lo scarico si ricava dalle autorizzazioni o dalla stima (tipicamente 60–80% del prelievo per attività ufficio, variabile per produzione).' },
        { label: 'KPI intensità idrica', text: 'Il KPI "m³/dipendente" si calcola automaticamente. Benchmark: uffici ≈ 15 m³/dip/anno; manifattura: molto variabile per settore.' },
      ],
      warning: 'Se l\'azienda non ha misuratori, usa le stime delle bollette come proxy. Documenta la metodologia nelle Note.',
      tips: [
        'Il campo "Dipendenti medi" nella sezione Acqua serve solo per calcolare l\'intensità: usa lo stesso valore inserito nella sezione Personale.',
        'Le acque piovane recuperate riducono il prelievo da fonti tradizionali: documentalo per valorizzare l\'iniziativa.',
      ],
      links: [
        { label: 'WRI Aqueduct — stress idrico', url: 'https://www.wri.org/aqueduct' },
        { label: 'VSME B6 — EFRAG', url: 'https://www.efrag.org/en/projects/esrs-for-smes' },
      ],
    },
  },
  {
    id: 'ri',
    area: 'E',
    areaLabel: 'Ambiente',
    icon: Recycle,
    title: 'B7 — Rifiuti',
    desc: 'Come compilare i dati di produzione e gestione dei rifiuti aziendali.',
    content: {
      obiettivo: 'B7 richiede il totale dei rifiuti prodotti (kg o tonnellate), la suddivisione pericolosi/non pericolosi e il tasso di avvio a recupero/riciclo.',
      steps: [
        { label: 'Fonte dati', text: 'La fonte principale è il Registro di Carico/Scarico (D.Lgs. 152/2006) e, dal 2023, il portale RENTRI. Il formulario di identificazione rifiuti (FIR) contiene peso, codice CER e destinazione.' },
        { label: 'Codici CER', text: 'Ogni rifiuto ha un codice CER (Catalogo Europeo Rifiuti) a 6 cifre. I codici con asterisco (*) sono pericolosi (es. 15 01 10* = imballaggi contaminati da sostanze pericolose). La tabella CER nella sezione ti guida voce per voce.' },
        { label: 'Destinazioni', text: 'Recupero (R): riciclo di materia (R3), recupero energetico (R1), preparazione al riutilizzo (R4). Smaltimento (D): discarica (D1), incenerimento senza recupero (D10). Solo il recupero conta nel tasso di circolarità.' },
        { label: 'Totali aggregati', text: 'Se non hai il registro dettagliato per codice CER, inserisci almeno i totali: rifiuti totali (kg), di cui pericolosi, di cui a recupero. Il tasso di recupero viene calcolato automaticamente.' },
      ],
      warning: 'Il RENTRI è obbligatorio dal 2024 per i produttori di rifiuti pericolosi e dal 2025 per i non pericolosi. I dati RENTRI sono la fonte privilegiata per l\'audit.',
      tips: [
        'Obiettivo di circolarità VSME: tasso di recupero ≥ 85%. La dashboard evidenzia lo scostamento.',
        'Includi anche i rifiuti prodotti da fornitori in conto lavorazione se il contratto ti rende produttore.',
        'I rifiuti da costruzione/demolizione vanno inclusi se prodotti nell\'anno di riferimento.',
      ],
      links: [
        { label: 'Portale RENTRI', url: 'https://www.rentri.gov.it/' },
        { label: 'Catalogo Europeo Rifiuti (CER)', url: 'https://www.isprambiente.gov.it/it/temi/rifiuti/catalogo-europeo-rifiuti' },
      ],
    },
  },
  {
    id: 'inq',
    area: 'E',
    areaLabel: 'Ambiente',
    icon: Wind,
    title: 'B4 — Inquinamento',
    desc: 'Quando si applica B4 e come compilare la matrice aspetti-impatti.',
    content: {
      obiettivo: 'B4 riguarda gli impatti sulla qualità di aria, acqua e suolo. Per la maggior parte delle PMI di servizi o commercio, B4 non è applicabile: basta dichiararlo.',
      steps: [
        { label: 'Applicabilità', text: 'B4 è rilevante se l\'azienda: è soggetta ad AIA (Autorizzazione Integrata Ambientale) o AUA (Autorizzazione Unica Ambientale), ha un sistema EMS certificato (ISO 14001, EMAS), o produce scarichi in acque superficiali non domestici.' },
        { label: 'Dichiarazione di non applicabilità', text: 'Se B4 non si applica, seleziona "No" nel campo "Monitoraggio obbligatorio o EMS attivo?" e inserisci una breve giustificazione nelle Note (es. "Attività di sola commercializzazione, nessuna emissione in atmosfera significativa").' },
        { label: 'Matrice aspetti-impatti', text: 'Se B4 è applicabile: identifica per ogni processo aziendale l\'aspetto ambientale (es. utilizzo solventi), la matrice impattata (aria), il presidio adottato (filtri, captazione) e il documento di evidenza (autorizzazione, rapporto di misura).' },
        { label: 'Inventario inquinanti', text: 'Elenca gli inquinanti monitorati con: sostanza, mezzo, metodo di misura (misura diretta o fattore emissivo), quantità, unità e confronto con i limiti autorizzativi.' },
      ],
      warning: 'Non dichiarare B4 non applicabile se l\'azienda ha un\'AIA o AUA attiva: è una non conformità grave in sede di audit.',
      tips: [
        'L\'AUA è rilasciata dalla Provincia/SUAP e comprende autorizzazioni alle emissioni in atmosfera e allo scarico.',
        'L\'AIA riguarda gli impianti di maggiori dimensioni soggetti al D.Lgs. 152/2006, Parte II.',
        'Per le emissioni in atmosfera, il fattore emissivo ISPRA può sostituire la misura diretta se l\'impianto non è soggetto a monitoraggio obbligatorio.',
      ],
      links: [
        { label: 'AUA — Guida MASE', url: 'https://www.mase.gov.it/pagina/autorizzazione-unica-ambientale-aua' },
        { label: 'ISPRA — Inventario emissioni atmosfera', url: 'https://www.isprambiente.gov.it/it/banche-dati/banche-dati-folder/aria/INEMAR' },
      ],
    },
  },
  {
    id: 'biod',
    area: 'E',
    areaLabel: 'Ambiente',
    icon: TreePine,
    title: 'B5 — Biodiversità',
    desc: 'Come verificare la prossimità ad aree protette e documentare l\'uso del suolo.',
    content: {
      obiettivo: 'B5 richiede di verificare se le sedi aziendali si trovano in prossimità di aree protette (Natura 2000, WDPA) e di documentare l\'uso del suolo.',
      steps: [
        { label: 'Verifica automatica', text: 'La mappa integrata nella sezione Biodiversità geolocalizza automaticamente le sedi inserite in Anagrafica e le visualizza rispetto ai layer Natura 2000 (siti SIC/ZSC/ZPS) e WDPA. Attiva i layer con i toggle sulla mappa.' },
        { label: 'Buffer di verifica', text: 'Il buffer raccomandato da EFRAG è 1 km dal confine dell\'area protetta. La piattaforma mostra visivamente la distanza: usa lo strumento di misura di OpenStreetMap per una verifica puntuale.' },
        { label: 'Esito verifica', text: 'Per ogni sede, compila il campo "Esito verifica": "No — fuori da aree protette" se il buffer 1 km è libero; "Sì — in/adiacente" se c\'è sovrapposizione. L\'esito viene riportato nel report B5.' },
        { label: 'Uso del suolo', text: 'Inserisci la superficie totale dei siti, la quota impermeabilizzata (asfalto, calcestruzzo) e l\'area nature-oriented (verde, permeabile). Fonti: planimetrie catastali, sopralluogo, o stime da Google Maps.' },
      ],
      warning: 'La verifica Natura 2000 è obbligatoria per le aziende che richiedono finanziamenti europei (PNRR, BEI). Documenta sempre la data della verifica.',
      tips: [
        'Il Geoportale Natura 2000 EEA mostra i confini esatti dei siti: natura2000.eea.europa.eu.',
        'Il WDPA (World Database on Protected Areas) copre anche le riserve nazionali non in Rete Natura 2000.',
        'Se la sede è in area industriale consolidata, la probabilità di prossimità è bassa — documentalo ugualmente.',
      ],
      links: [
        { label: 'Geoportale Natura 2000 — EEA', url: 'https://natura2000.eea.europa.eu/' },
        { label: 'WDPA — Protected Planet', url: 'https://www.protectedplanet.net/' },
        { label: 'Geoportale Nazionale — MASE', url: 'https://www.geoportale.mase.gov.it/' },
      ],
    },
  },
  {
    id: 'pe',
    area: 'S',
    areaLabel: 'Sociale',
    icon: Users,
    title: 'B8–B10 — Personale',
    desc: 'Come raccogliere dati su organico, H&S, retribuzioni e formazione.',
    content: {
      obiettivo: 'Le sezioni B8–B10 coprono: caratteristiche della forza lavoro (B8), salute e sicurezza (B9), e retribuzione/formazione (B10). Sono tra i dati più richiesti dalle banche nel dialogo PMI-Banche.',
      steps: [
        { label: 'Headcount e FTE', text: 'Il Headcount (HC) è il numero di dipendenti al 31/12 (o media annua). Gli FTE (Full Time Equivalent) convertono i part-time: un dipendente al 50% conta 0,5 FTE. Fonte: LUL (Libro Unico del Lavoro) o buste paga.' },
        { label: 'Salute & Sicurezza (B9)', text: 'Infortuni: solo quelli con almeno 1 giorno di assenza (escluso il giorno dell\'infortunio), fonte INAIL. Ore lavorate: totale annuo da LUL. L\'Indice di Frequenza (IF) = (infortuni / ore lavorate) × 1.000.000 si calcola automaticamente.' },
        { label: 'Decessi correlati al lavoro', text: 'Dato richiesto da EFRAG 2026: inserire il numero di decessi avvenuti in occasione di lavoro (inclusi infortuni in itinere), fonte denuncia INAIL. Se 0, inserire 0 esplicitamente.' },
        { label: 'Retribuzione e pay gap', text: 'Inserisci la retribuzione media annua lorda (RAL) separata per genere. Il Gender Pay Gap = (RAL Uomini − RAL Donne) / RAL Uomini × 100%. Obiettivo VSME: GPG < 15%. Fonte: buste paga, cedolini o modello 770.' },
        { label: 'Formazione', text: 'Ore medie di formazione per dipendente per anno. Include formazione obbligatoria (sicurezza) e facoltativa. Obiettivo VSME: ≥ 18 h/dip/anno. Fonte: registro formazione aziendale o piattaforma LMS.' },
      ],
      warning: 'Il salario minimo (DP.30 Banche) va verificato rispetto al CCNL applicato. Non è richiesto il salario minimo legale in Italia (non ancora in vigore), ma la conformità al CCNL è obbligatoria.',
      tips: [
        'I dati INAIL sugli infortuni sono disponibili nel cassetto previdenziale datore di lavoro.',
        'Il tasso di assenteismo = (giorni assenza / giorni lavorativi teorici) × 100. Benchmark settoriale: 3–5%.',
        'Il turnover = (assunzioni + cessazioni) / 2 / organico medio × 100. Elevato turnover (> 20%) è un segnale ESG negativo.',
      ],
      links: [
        { label: 'INAIL — statistiche infortuni', url: 'https://www.inail.it/cs/internet/attivita/dati-e-statistiche.html' },
        { label: 'D.Lgs. 81/2008 — Testo Unico Sicurezza', url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2008-04-09;81' },
      ],
    },
  },
  {
    id: 'gov',
    area: 'G',
    areaLabel: 'Governance',
    icon: Shield,
    title: 'B11 — Governance & Integrità',
    desc: 'Come documentare la struttura di governo e la compliance aziendale.',
    content: {
      obiettivo: 'B11 copre la composizione dell\'organo di governo, le policy etiche, la conformità normativa e l\'integrità (anti-corruzione, sanzioni). È fondamentale per il rating ESG e per l\'accesso al credito.',
      steps: [
        { label: 'Organo di governo (CDA)', text: 'Indica il numero totale di componenti del CDA/CdA e la quota femminile. Obiettivo VSME/EFRAG: ≥ 33% donne. Fonte: atto costitutivo, verbali assembleari, visura camerale.' },
        { label: 'Codice Etico e MOG 231', text: 'Il Codice Etico è un documento aziendale che definisce valori e regole di condotta. Il Modello 231 (D.Lgs. 231/2001) è il sistema di prevenzione dei reati societari con Organismo di Vigilanza (ODV): obbligatorio per le imprese esposte al rischio di reati 231.' },
        { label: 'Certificazioni', text: 'Documenta le certificazioni attive: ISO 9001 (qualità), ISO 14001 (ambiente), ISO 45001 (sicurezza), SA8000 (responsabilità sociale), UNI PdR 125 (parità di genere). Fonte: certificati rilasciati dall\'ente di certificazione.' },
        { label: 'Whistleblowing', text: 'Il D.Lgs. 24/2023 obbliga le aziende con > 50 dipendenti ad adottare un canale di segnalazione interna. Le PMI con > 250 dip. erano già soggette dal 17/12/2023; quelle tra 50 e 249 dal 17/12/2023 (termine prorogato).' },
        { label: 'Condanne e sanzioni', text: 'Indicare il numero di condanne per corruzione o reati 231 negli ultimi 3 anni e il valore delle sanzioni. Se 0, inserire 0 esplicitamente: la dichiarazione esplicita di zero è più credibile dell\'assenza di dati.' },
        { label: 'Tempi di pagamento', text: 'I tempi medi di pagamento ai fornitori (in giorni) sono un indicatore di governance finanziaria. Il riferimento è D.Lgs. 231/2002: termine legale 30/60 gg. Fonte: prima nota o gestionale contabile.' },
      ],
      warning: 'Le sanzioni GDPR (Garante Privacy) rientrano nella sezione governance: se presenti, documentale con importo e anno.',
      tips: [
        'Anche l\'assenza di certificazioni è un dato: dichiararlo esplicitamente è meglio che lasciare il campo vuoto.',
        'Il rating ESG esterno (es. Ecovadis, Sustainalytics) va menzionato se disponibile: aumenta la credibilità del report.',
        'La policy anti-corruzione non deve necessariamente essere un documento formale: anche un capitolo del Codice Etico è sufficiente.',
      ],
      links: [
        { label: 'D.Lgs. 231/2001 — Confindustria', url: 'https://www.confindustria.it/home/centro-studi/temi-di-ricerca/valutazione-delle-politiche-pubbliche/tutti/dettaglio/modello-organizzativo-231' },
        { label: 'D.Lgs. 24/2023 — Whistleblowing', url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2023-03-10;24' },
        { label: 'UNI PdR 125 — Parità di genere', url: 'https://www.uni.com/index.php?option=com_content&view=article&id=2649' },
      ],
    },
  },
  {
    id: 'output',
    area: 'C',
    areaLabel: 'Output',
    icon: FileText,
    title: 'Output e Documenti',
    desc: 'Come utilizzare i risultati del report: dashboard, relazione banca, PDF.',
    content: {
      obiettivo: 'Una volta compilate le sezioni, la piattaforma genera automaticamente KPI, score ESG, alert e documenti pronti per la condivisione con banche e stakeholder.',
      steps: [
        { label: 'Dashboard ESG', text: 'La sezione "📊 Dashboard" aggrega tutti i KPI calcolati, il punteggio E/S/G e il rating complessivo (Base → Leader). I grafici mostrano l\'andamento YoY se hai inserito i dati dell\'anno precedente.' },
        { label: 'Relazione Banca', text: 'La pagina "Relazione ESG" (accessibile dal menu home) genera una relazione narrativa strutturata secondo il dialogo PMI-Banche (Tavolo MEF). Include automaticamente tutti i 40 datapoint richiesti dagli istituti di credito.' },
        { label: 'Alert e anomalie', text: 'Il sistema "Anomalie" (bottone nella topbar) analizza i dati alla ricerca di incongruenze (es. FV > consumo totale, IF troppo alto) e le segnala con spiegazione e azione correttiva.' },
        { label: 'Confronto anni', text: 'La pagina "Confronto Anni" (accessibile dalla home) confronta fino a 3 anni di report per lo stesso dominio, mostrando trend KPI e variazioni percentuali.' },
        { label: 'Snapshot storici', text: 'Ogni salvataggio significativo (variazione score ≥ 2 punti) genera uno snapshot automatico. Lo "Storico" (bottone topbar) mostra l\'evoluzione del report e consente di confrontare versioni per la tracciabilità audit.' },
      ],
      warning: 'Prima di condividere il report con una banca o un revisore, usa "Completa report" per verificare che tutti i campi obbligatori siano stati compilati.',
      tips: [
        'Il pulsante "Consigli AI" genera raccomandazioni personalizzate per migliorare lo score ESG.',
        'Usa il bottone "Importa Excel" per caricare dati storici da file: la piattaforma mappa automaticamente le colonne.',
        'Esporta il report in PDF dalla sezione "Relazione Banca" con layout pronto per la firma digitale.',
      ],
      links: [
        { label: 'Tavolo MEF — Dialogo PMI-Banche', url: 'https://www.mef.gov.it/finanza-sostenibile/' },
        { label: 'EFRAG VSME — FAQ', url: 'https://www.efrag.org/en/projects/esrs-for-smes' },
      ],
    },
  },
];

const AREA_COLORS = {
  C: { bg: 'bg-slate-700',  light: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-700',  badge: 'bg-slate-100 text-slate-600' },
  E: { bg: 'bg-emerald-700', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  S: { bg: 'bg-blue-700',   light: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700' },
  G: { bg: 'bg-purple-700', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
};

function StepContent({ step }) {
  const { content } = step;
  const colors = AREA_COLORS[step.area];

  return (
    <div className="space-y-5">
      {/* Obiettivo */}
      <div className={`rounded-xl p-4 ${colors.light} border ${colors.border}`}>
        <p className={`text-xs font-bold uppercase tracking-wide ${colors.text} mb-1.5 flex items-center gap-1.5`}>
          <BookOpen className="w-3.5 h-3.5" /> Obiettivo della sezione
        </p>
        <p className="text-sm text-foreground leading-relaxed">{content.obiettivo}</p>
      </div>

      {/* Steps */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-3">Istruzioni passo per passo</p>
        <div className="space-y-2.5">
          {content.steps.map((s, i) => (
            <div key={i} className="flex gap-3">
              <div className={`w-5 h-5 rounded-full ${colors.bg} text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5`}>
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      {content.warning && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed"><strong>Attenzione: </strong>{content.warning}</p>
        </div>
      )}

      {/* Tips */}
      {content.tips?.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> Suggerimenti pratici
          </p>
          <ul className="space-y-1">
            {content.tips.map((t, i) => (
              <li key={i} className="text-xs text-green-800 flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5 shrink-0">✓</span> {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Links */}
      {content.links?.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
            <LinkIcon className="w-3 h-3" /> Fonti e riferimenti normativi
          </p>
          <div className="flex flex-wrap gap-2">
            {content.links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${colors.border} ${colors.text} hover:${colors.light} transition-colors`}
              >
                <LinkIcon className="w-3 h-3" /> {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EsgWizard({ onClose }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const step = GUIDE_STEPS[stepIdx];
  const colors = AREA_COLORS[step.area];
  const Icon = step.icon;
  const isLast = stepIdx === GUIDE_STEPS.length - 1;

  const go = (delta) => {
    setDirection(delta);
    setStepIdx(i => Math.max(0, Math.min(GUIDE_STEPS.length - 1, i + delta)));
  };

  const areas = ['C', 'E', 'S', 'G'];
  const areaLabels = { C: 'Generale', E: 'Ambiente', S: 'Sociale', G: 'Governance' };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className={`${colors.bg} px-6 py-4 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest">{step.areaLabel} · {stepIdx + 1} di {GUIDE_STEPS.length}</p>
              <p className="text-white font-heading font-bold text-lg leading-tight">{step.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted shrink-0">
          <motion.div
            className={`h-full ${colors.bg}`}
            animate={{ width: `${((stepIdx + 1) / GUIDE_STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 shrink-0 border-r border-border bg-muted/30 py-4 px-3 overflow-y-auto hidden sm:block">
            {areas.map((area) => {
              const ac = AREA_COLORS[area];
              const areaSteps = GUIDE_STEPS.filter(s => s.area === area);
              if (!areaSteps.length) return null;
              return (
                <div key={area} className="mb-4">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${ac.text} mb-1.5 px-1`}>{areaLabels[area]}</p>
                  {areaSteps.map((s) => {
                    const idx = GUIDE_STEPS.findIndex(x => x.id === s.id);
                    const done = idx < stepIdx;
                    const active = idx === stepIdx;
                    const SIcon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => { setDirection(idx > stepIdx ? 1 : -1); setStepIdx(idx); }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs mb-0.5 flex items-center gap-2 transition-all
                          ${active ? `${ac.light} ${ac.border} border font-bold ${ac.text}` : 'hover:bg-muted text-muted-foreground'}`}
                      >
                        {done
                          ? <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${ac.text}`} />
                          : <SIcon className={`w-3.5 h-3.5 shrink-0 ${active ? ac.text : 'text-muted-foreground/40'}`} />
                        }
                        <span className="truncate">{s.title}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-sm text-muted-foreground mb-5 italic">{step.desc}</p>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -24 }}
                  transition={{ duration: 0.2 }}
                >
                  <StepContent step={step} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-4 flex items-center justify-between shrink-0 bg-background">
              <Button variant="outline" onClick={() => go(-1)} disabled={stepIdx === 0} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Indietro
              </Button>
              <span className="text-xs text-muted-foreground">{stepIdx + 1} / {GUIDE_STEPS.length}</span>
              {isLast ? (
                <Button onClick={onClose} className="gap-2 bg-primary">
                  <CheckCircle2 className="w-4 h-4" /> Chiudi guida
                </Button>
              ) : (
                <Button onClick={() => go(1)} className={`gap-2 ${colors.bg} hover:opacity-90 text-white border-0`}>
                  Avanti <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}