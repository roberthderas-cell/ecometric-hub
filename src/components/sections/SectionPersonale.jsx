import SectionHeader from '@/components/report/SectionHeader';
import { TextInput, ComputedValue, SelectField, TextArea } from '@/components/report/FormField';
import PmiBancheReference from '@/components/report/PmiBancheReference';
import NotesField from '@/components/report/NotesField';
import CongruenceAlerts from '@/components/report/CongruenceAlerts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import KPICard from '@/components/report/KPICard';
import { calcPersonnel } from '@/lib/vsmeDefaults';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function SectionPersonale({ data, onUpdate, onNavigate }) {
  const pe = data?.pe || {};
  const u = (field, value) => onUpdate('pe', field, value);
  const p = calcPersonnel(data);

  const genData = [
    { name: 'Donne', value: parseFloat(pe.donne) || 0 },
    { name: 'Uomini', value: parseFloat(pe.uomini) || 0 },
  ].filter(d => d.value > 0);

  return (
    <div>
      <SectionHeader sectionId="pe" title="B8-B10 — Personale & H&S" description="Composizione forza lavoro, salute e sicurezza, retribuzioni e formazione." reference="VSME B8/B9/B10 | D.Lgs. 81/2008 | ESRS S1" />

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Composizione Forza Lavoro</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TextInput label="Dipendenti (Headcount)" type="number" value={pe.hc} onChange={(v) => u('hc', v)}
            tooltip={{ label: 'Headcount (HC)', desc: 'Numero di dipendenti al 31/12 dell\'anno di riferimento (o media annua). Include tutti i contratti subordinati, esclusi i collaboratori autonomi (P.IVA, co.co.co.).', source: 'Libro Unico del Lavoro (LUL) — posizione al 31/12 o media mensile.', efrag: 'VSME B8-1 — Caratteristiche forza lavoro' }} />
          <TextInput label="Dipendenti FTE" type="number" value={pe.fte} onChange={(v) => u('fte', v)}
            tooltip={{ label: 'FTE (Full Time Equivalent)', desc: 'Equivalente a tempo pieno. Un dipendente part-time al 50% conta 0,5 FTE. Usato per KPI normalizzati.', source: 'LUL — calcola: Σ(ore contrattuali di ciascun dipendente) / ore standard FT (es. 1.768 h/anno).', tip: 'Se non hai il dato preciso, stima: HC − (n. part-time × 0,5).', efrag: 'VSME B8 — Forza lavoro' }} />
          <TextInput label="di cui Donne" type="number" value={pe.donne} onChange={(v) => u('donne', v)}
            tooltip={{ label: 'Dipendenti donne', desc: 'Numero di dipendenti di genere femminile. La % donne sull\'HC totale è un KPI VSME e PMI-Banche. Obiettivo di riferimento: ≥ 40%.', source: 'LUL o anagrafica HR.', efrag: 'VSME B8-2 — Diversità di genere' }} />
          <TextInput label="di cui Uomini" type="number" value={pe.uomini} onChange={(v) => u('uomini', v)}
            tooltip={{ label: 'Dipendenti uomini', desc: 'Numero di dipendenti di genere maschile. La somma Donne + Uomini deve corrispondere all\'HC (o escludere eventuali "Altro/Non binario" se rilevati).', source: 'LUL o anagrafica HR.', efrag: 'VSME B8-2 — Diversità di genere' }} />
          <TextInput label="Contratto Indeterminato" type="number" value={pe.indet} onChange={(v) => u('indet', v)}
            tooltip={{ label: 'Contratto a tempo indeterminato', desc: 'Numero di dipendenti con contratto di lavoro a tempo indeterminato (inclusi apprendisti a scadenza successiva all\'anno). Indicatore di stabilità occupazionale.', source: 'LUL — tipo contratto.', tip: '% indeterminato = indeterminato / HC × 100. Obiettivo VSME: > 70%.', efrag: 'VSME B8-3 — Tipi di contratto' }} />
          <TextInput label="Contratto Determinato" type="number" value={pe.det} onChange={(v) => u('det', v)}
            tooltip={{ label: 'Contratto a tempo determinato', desc: 'Numero di dipendenti con contratto a termine (inclusi stagionali, interinali diretti). Non include i lavoratori somministrati tramite agenzia.', source: 'LUL.', efrag: 'VSME B8-3 — Tipi di contratto' }} />
          <TextInput label="Part-Time" type="number" value={pe.pt} onChange={(v) => u('pt', v)}
            tooltip={{ label: 'Dipendenti Part-Time', desc: 'Numero di dipendenti con orario ridotto rispetto al full-time contrattuale del CCNL (es. < 40h/settimana per i metalmeccanici).', source: 'LUL — tipo orario.', efrag: 'VSME B8-3 — Caratteristiche occupazione' }} />
          <TextInput label="Con Disabilità" type="number" value={pe.disab} onChange={(v) => u('disab', v)}
            tooltip={{ label: 'Dipendenti con disabilità', desc: 'Numero di dipendenti con disabilità riconosciuta ai sensi della L. 68/1999 (collocamento obbligatorio). Obbligatoria la quota di riserva per aziende > 15 dipendenti.', source: 'Registro L.68/99 tenuto dall\'HR o comunicazione al Centro per l\'Impiego.', warning: 'L.68/1999: aziende 15–35 dip. devono assumere 1 disabile; 36–50 dip. = 2; > 50 dip. = 7% dell\'organico.', efrag: 'VSME B8 — Inclusione' }} />
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Salute & Sicurezza</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TextInput label="Infortuni (≥1 gg assenza)" type="number" value={pe.infort} onChange={(v) => u('infort', v)}
            tooltip={{ label: 'Infortuni sul lavoro', desc: 'Numero di infortuni occorsi in occasione di lavoro con almeno 1 giorno di assenza dal giorno successivo all\'evento (escluso il giorno dell\'infortunio stesso).', source: 'Denunce INAIL presentate nell\'anno. Disponibile nel cassetto previdenziale INAIL.', tip: 'Includi anche gli infortuni in itinere (percorso casa-lavoro) se si usano per il calcolo dell\'IF.', warning: 'Non includere infortuni senza giorni di assenza (infortuni "in franchigia").', efrag: 'VSME B9-1 — Infortuni sul lavoro', link: 'https://www.inail.it/' }} />
          <TextInput label="Giorni persi" type="number" value={pe.ggPersi} onChange={(v) => u('ggPersi', v)}
            tooltip={{ label: 'Giorni di assenza per infortunio', desc: 'Totale dei giorni di calendario persi per infortuni nell\'anno, per il calcolo dell\'Indice di Gravità (IG = giorni persi × 1.000.000 / ore lavorate).', source: 'Registro infortuni aziendale (D.Lgs. 81/2008, art. 53) o denunce INAIL.', efrag: 'VSME B9 — Gravità infortuni' }} />
          <TextInput label="Ore lavorate totali" type="number" value={pe.oreLav} onChange={(v) => u('oreLav', v)} hint="Da LUL"
            tooltip={{ label: 'Ore lavorate totali', desc: 'Somma di tutte le ore effettivamente lavorate da tutti i dipendenti nell\'anno. Denominatore per l\'Indice di Frequenza (IF) e di Gravità (IG).', source: 'Libro Unico del Lavoro (LUL) annuale. Stima rapida: HC × settimane × ore settimanali (es. 20 dip × 47 sett × 40h = 37.600h).', tip: 'Sottrai le ferie e i permessi non lavorati per un calcolo preciso.', efrag: 'VSME B9 — Salute e sicurezza' }} />
          <TextInput label="Giorni assenteismo" type="number" value={pe.assentGg} onChange={(v) => u('assentGg', v)}
            tooltip={{ label: 'Giorni di assenteismo', desc: 'Totale dei giorni di assenza (malattia, maternità, permessi non retribuiti) nell\'anno, escludendo ferie e festività programmate. Il Tasso di Assenteismo = gg assenza / (HC × 220 gg lavorativi) × 100.', source: 'LUL — voci assenza per malattia, maternità, permessi.', tip: 'Benchmark: 3–5% è nella norma. Oltre l\'8% segnala possibili problemi organizzativi o di sicurezza.', efrag: 'VSME B9-2 — Assenteismo' }} />
          <TextInput label="Decessi correlati al lavoro" type="number" value={pe.decessi} onChange={(v) => u('decessi', v)} hint="VSME B9 — infortuni/malattie mortali"
            tooltip={{ label: 'Decessi correlati al lavoro', desc: 'Numero di decessi avvenuti in occasione di lavoro (infortuni mortali) o per malattie professionali riconosciute nell\'anno. Dato obbligatorio VSME B9 — inserire 0 se nessuno.', source: 'Denuncia INAIL di infortunio mortale o comunicazione di malattia professionale.', warning: 'Non lasciare vuoto: la dichiarazione esplicita di "0" è richiesta dallo standard EFRAG. Un campo vuoto è interpretato come dato mancante.', efrag: 'VSME B9-1 — Infortuni mortali' }} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <ComputedValue label="Tasso Frequenza IF" value={p.IF} unit="(n.inf × 1M) / ore" />
          <ComputedValue label="Tasso Assenteismo" value={p.tassoAss + '%'} unit="gg/HC×220" />
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Retribuzione e Formazione</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SelectField label="Tutti retribuiti ≥ salario minimo?" value={pe.salarioMin} onChange={(v) => u('salarioMin', v)} hint="VSME B10 — salario minimo applicabile" options={[['si', 'Sì — tutti ≥ minimo'], ['no', 'No — alcuni sotto'], ['na', 'Non applicabile']]}
            tooltip={{ label: 'Salario minimo (VSME B10)', desc: 'In Italia non esiste un salario minimo legale (al 2024): il riferimento è il minimo tabellare del CCNL applicato. VSME B10 richiede di dichiarare se tutti i dipendenti sono retribuiti almeno al minimo del CCNL.', source: 'Tabelle retributive del CCNL applicato (disponibili sul sito del Ministero del Lavoro o dell\'associazione datoriale).', warning: 'Alcuni CCNL hanno minimi differenziati per livello: verifica che anche i livelli più bassi (es. 1° livello) siano rispettati.', efrag: 'VSME B10-1 — Retribuzione adeguata' }} />
          <TextInput label="CCNL Applicato" value={pe.ccnl} onChange={(v) => u('ccnl', v)} placeholder="Es. Metalmeccanici"
            tooltip={{ label: 'Contratto Collettivo Nazionale (CCNL)', desc: 'Il CCNL applicato ai lavoratori. Identifica il sistema di relazioni industriali e i minimi tabellari di riferimento per la verifica del salario adeguato.', source: 'Busta paga o LUL (intestazione del contratto applicato).', tip: 'Specifica l\'anno del CCNL (es. "CCNL Metalmeccanici Confapi 2021"). Ogni settore ha il suo.', efrag: 'VSME B10 — Dialogo sociale' }} />
          <TextInput label="Retrib. Media Uomini (€)" type="number" value={pe.retUom} onChange={(v) => u('retUom', v)}
            tooltip={{ label: 'Retribuzione media annua — Uomini (€)', desc: 'Retribuzione annua lorda (RAL) media dei dipendenti di genere maschile. Usata per calcolare il Gender Pay Gap.', source: 'CUD/770 annuale, buste paga o elaborazione paghe. Media = Σ RAL uomini / n. uomini.', tip: 'Usa la Retribuzione Annua Lorda (RAL) — al lordo di contributi e imposte — non la busta paga netta.', efrag: 'VSME B10-2 — Divario retributivo di genere' }} />
          <TextInput label="Retrib. Media Donne (€)" type="number" value={pe.retDon} onChange={(v) => u('retDon', v)}
            tooltip={{ label: 'Retribuzione media annua — Donne (€)', desc: 'RAL media delle dipendenti di genere femminile. Il Gender Pay Gap = (RAL Uomini − RAL Donne) / RAL Uomini × 100%. Obiettivo VSME: < 15%.', source: 'CUD/770 o elaborazione paghe.', tip: 'Se il gap è > 15%, analizza le cause (differenze di livello, settore, anzianità) e documentale nelle Note.', warning: 'Un GPG elevato è un segnale di rischio ESG per le banche finanziatrici.', efrag: 'VSME B10-2 — Gender Pay Gap' }} />
          <TextInput label="Ore formazione/dip./anno" type="number" value={pe.oreForm} onChange={(v) => u('oreForm', v)} hint="Media totale"
            tooltip={{ label: 'Ore di formazione medie per dipendente', desc: 'Media annua delle ore di formazione erogate per dipendente (include formazione obbligatoria sulla sicurezza, professionale, manageriale, e-learning).', source: 'Registro della formazione aziendale (obbligatorio per la sicurezza ex D.Lgs. 81/2008) o piattaforma LMS.', tip: 'Obiettivo VSME: ≥ 18 ore/dip/anno. La formazione obbligatoria sulla sicurezza conta nel totale.', efrag: 'VSME B10-3 — Sviluppo competenze' }} />
          <TextInput label="Ore formazione — Donne" type="number" value={pe.oreFormDonne} onChange={(v) => u('oreFormDonne', v)} hint="VSME B10"
            tooltip={{ label: 'Ore formazione per genere — Donne', desc: 'Totale ore di formazione erogate alle dipendenti donne. Consente di verificare la parità di accesso alla formazione.', source: 'Registro formazione suddiviso per genere.', efrag: 'VSME B10-3 — Formazione per genere' }} />
          <TextInput label="Ore formazione — Uomini" type="number" value={pe.oreFormUomini} onChange={(v) => u('oreFormUomini', v)} hint="VSME B10"
            tooltip={{ label: 'Ore formazione per genere — Uomini', desc: 'Totale ore di formazione erogate ai dipendenti uomini. Confronto con le donne per verificare l\'equità di accesso.', source: 'Registro formazione.', efrag: 'VSME B10-3 — Formazione per genere' }} />
          <ComputedValue label="Gender Pay Gap" value={p.gpg + '%'} unit="(uom−don)/uom" variant={parseFloat(p.gpg) > 15 ? '' : 'blue'} />
        </div>
      </Card>

      {genData.length > 0 && (
        <Card className="p-5 mb-5">
          <h4 className="font-heading text-sm font-bold text-primary mb-3">Composizione per Genere</h4>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart><Pie data={genData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
              <Cell fill="#EC4899" /><Cell fill="#2563EB" />
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      <PmiBancheReference sectionKey="pe" />

      {/* Iniziative FL e Comunità — DP.36-37 Banche */}
      <Card className="p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-heading font-bold text-primary text-sm">Impatto su Lavoratori, Comunità e Territorio</h3>
          <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">Dialogo PMI-Banche — DP.36, 37</span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <TextArea label="Iniziative per la forza lavoro (DP.36)" value={pe.iniziativeFL} onChange={(v) => u('iniziativeFL', v)} rows={3} placeholder="Es. Piano welfare, smart working, formazione continua, assunzioni stabili, CCNL migliorativo..." />
          <TextArea label="Iniziative per la comunità e il territorio (DP.37)" value={pe.iniziativeCT} onChange={(v) => u('iniziativeCT', v)} rows={3} placeholder="Es. Sponsorizzazioni sportive locali, volontariato aziendale, partnership scuole, donazioni enti no-profit..." />
        </div>
      </Card>

      <div className="mb-5">
        <CongruenceAlerts data={data} section="pe" />
      </div>

      <div className="mb-5">
        <NotesField value={pe.notePe} onChange={(v) => u('notePe', v)} section="pe" />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => onNavigate('biod')} className="gap-2"><ChevronLeft className="w-4 h-4" /> Precedente</Button>
        <Button onClick={() => onNavigate('gov')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}