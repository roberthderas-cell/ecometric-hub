import SectionHeader from '@/components/report/SectionHeader';
import PmiBancheReference from '@/components/report/PmiBancheReference';
import { TextInput, SelectField, ComputedValue } from '@/components/report/FormField';
import NotesField from '@/components/report/NotesField';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';

export default function SectionAnagrafica({ data, onUpdate, onNavigate }) {
  const ana = data?.ana || {};
  const sedi = data?.sedi?.lista || [];
  const u = (field, value) => onUpdate('ana', field, value);

  const att = parseFloat(ana.attivo) || 0;
  const fatt = parseFloat(ana.fatturato) || 0;
  const dip = parseInt(ana.hc) || 0;
  let micro = 0, small = 0;
  if (att <= 450000) micro++; if (fatt <= 900000) micro++; if (dip <= 10) micro++;
  if (att <= 5000000) small++; if (fatt <= 10000000) small++; if (dip <= 50) small++;
  const catAuto = micro >= 2 ? 'Micro' : small >= 2 ? 'Piccola' : 'Media';
  const cat = (ana.dimManuale && ana.dimManuale !== 'auto') ? ana.dimManuale : catAuto;

  const updateSede = (i, key, val) => {
    const rows = [...sedi];
    rows[i] = { ...rows[i], [key]: val };
    onUpdate('sedi', 'lista', rows);
  };

  const addSede = () => {
    onUpdate('sedi', 'lista', [...sedi, { nome: '', indirizzo: '', tipo: 'Operativa', paese: 'Italia' }]);
  };

  const removeSede = (i) => {
    onUpdate('sedi', 'lista', sedi.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <SectionHeader
        sectionId="ana"
        title="Anagrafica Impresa"
        description="Inserisci i dati identificativi, le sedi aziendali e i dati dimensionali. Le sedi vengono usate automaticamente nella verifica Biodiversità."
        reference="VSME B1 — Basi per la preparazione"
      />

      <PmiBancheReference sectionKey="ana" />

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-4">Dati Identificativi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Ragione Sociale" value={ana.ragione} onChange={(v) => u('ragione', v)} placeholder="Es. Alfa Metalli S.r.l."
            tooltip={{ label: 'Ragione Sociale', desc: 'Nome legale completo dell\'azienda come risulta dalla visura camerale. Deve corrispondere esattamente all\'intestazione del bilancio.', source: 'Visura camerale ordinaria (Registro Imprese).', efrag: 'VSME B1-1 — Informazioni generali sull\'impresa', link: 'https://www.registroimprese.it/' }} />
          <TextInput label="Codice ATECO / NACE" value={ana.ateco} onChange={(v) => u('ateco', v)} placeholder="Es. 25.62" hint="Camera di Commercio o visura camerale"
            tooltip={{ label: 'Codice ATECO primario', desc: 'Il codice ATECO (classificazione italiana delle attività economiche) identifica il settore principale dell\'azienda. È usato per il benchmarking settoriale ESG e per la verifica del perimetro di rendicontazione.', source: 'Visura camerale (voce "Attività") o modello F24 INPS.', tip: 'In caso di attività multiple, usa il codice dell\'attività prevalente per fatturato.', efrag: 'VSME B1 — Settore di attività', link: 'https://www.istat.it/it/archivio/17888' }} />
          <SelectField label="Forma Giuridica" value={ana.forma} onChange={(v) => u('forma', v)} options={[['SRL','S.r.l.'],['SPA','S.p.A.'],['SNC','S.n.c.'],['SAS','S.a.s.'],['ALTRO','Altro']]}
            tooltip={{ label: 'Forma Giuridica', desc: 'La forma giuridica dell\'impresa come da atto costitutivo. Influenza gli obblighi di governance (es. SPA obbligato al CDA).', source: 'Visura camerale o atto costitutivo.', efrag: 'VSME B1 — Struttura societaria' }} />
          <SelectField label="Anno di Riferimento" value={String(ana.anno || '2025')} onChange={(v) => u('anno', v)} options={[['2025','2025'],['2024','2024'],['2023','2023'],['2022','2022']]}
            tooltip={{ label: 'Anno di riferimento ESG', desc: 'L\'anno solare (1 gen–31 dic) a cui si riferiscono i dati del report. Deve coincidere con l\'esercizio fiscale del bilancio approvato.', tip: 'Per esercizi non solari (es. 1 apr–31 mar), usa l\'anno in cui cade la chiusura prevalente.', efrag: 'VSME — Periodo di riferimento' }} />
          <SelectField label="Perimetro" value={ana.perimetro} onChange={(v) => u('perimetro', v)} options={[['individuale','Individuale'],['consolidato','Consolidato (Gruppo)']]} hint="Consolidato se il report copre più società"
            tooltip={{ label: 'Perimetro di rendicontazione', desc: '"Individuale" = una sola entità legale. "Consolidato" = il report copre la società madre + tutte le società controllate (>50% quote). In caso di consolidato, tutti i dati devono includere le filiali.', warning: 'Non mescolare dati di perimetri diversi tra sezioni: il perimetro deve essere coerente in tutto il report.', efrag: 'VSME B1-3 — Perimetro di rendicontazione' }} />
          <TextInput label="Paesi di Operatività" value={ana.paesi} onChange={(v) => u('paesi', v)} placeholder="Es. Italia, Germania"
            tooltip={{ label: 'Paesi di operatività', desc: 'Elenco dei paesi in cui l\'azienda ha sedi operative, stabilimenti, uffici o personale. Rilevante per la localizzazione dei rischi ESG.', source: 'Elenco sedi dalla visura camerale o dall\'organigramma.', efrag: 'VSME B1 — Localizzazione geografica' }} />
          <TextInput label="Certificazioni ESG" value={ana.cert} onChange={(v) => u('cert', v)} placeholder="Nessuna se non applicabile"
            tooltip={{ label: 'Certificazioni ESG', desc: 'Certificazioni di sostenibilità o qualità attive. Esempi: ISO 14001 (ambiente), ISO 45001 (sicurezza), SA8000 (sociale), UNI PdR 125 (parità genere), EMAS, EcoVadis.', tip: 'Anche una sola certificazione migliora il rating ESG. Se non ne hai, scrivi "Nessuna": è più credibile di un campo vuoto.', efrag: 'VSME B11 — Politiche e certificazioni' }} />
          <SelectField label="Info sostenibilità rese pubbliche? (DP.3)" value={ana.sostPubblica || 'no'} onChange={(v) => u('sostPubblica', v)} options={[['no','No'],['si','Sì — report/sito web'],['pianif','In pianificazione']]} hint="Sito web, report ESG, banche dati pubbliche"
            tooltip={{ label: 'Comunicazione pubblica sostenibilità (DP.3)', desc: 'Indica se l\'azienda pubblica volontariamente informazioni ESG (report annuale, pagina web dedicata, banca dati pubblica). Questo datapoint è richiesto esplicitamente dal dialogo PMI-Banche.', tip: 'Anche una sezione "Sostenibilità" sul sito web è sufficiente. Inserisci l\'URL nelle Note.', efrag: 'PMI-Banche DP.3 — Trasparenza ESG' }} />
          <TextInput label="% Fatturato allineato Tassonomia UE (DP.11)" type="number" value={ana.pctFattTassonomia} onChange={(v) => u('pctFattTassonomia', v)} hint="Stima. 0 se nessuna attività eleggibile" placeholder="0–100"
            tooltip={{ label: '% Fatturato Tassonomia UE (DP.11)', desc: 'Quota percentuale del fatturato derivante da attività economiche "eligibili" secondo la Tassonomia UE (Reg. 852/2020). Un\'attività è eleggibile se rientra nelle categorie della Tassonomia, anche senza essere ancora "allineata".', source: 'Verifica l\'elenco delle attività NACE eligibili sul sito della Commissione Europea.', tip: 'Se non hai eseguito la verifica, inserisci 0 e documenta nelle Note che l\'analisi è in corso.', warning: 'PMI non sono obbligate alla Tassonomia, ma le banche la richiedono come indicatore di rischio di transizione.', efrag: 'PMI-Banche DP.11 — Allineamento Tassonomia UE', link: 'https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_it' }} />
          <TextInput label="% CapEx allineata Tassonomia UE (DP.12)" type="number" value={ana.pctCapexTassonomia} onChange={(v) => u('pctCapexTassonomia', v)} hint="Stima spesa in conto capitale allineata" placeholder="0–100"
            tooltip={{ label: '% CapEx Tassonomia UE (DP.12)', desc: 'Quota della spesa in conto capitale (investimenti in immobilizzazioni) destinata ad attività allineate alla Tassonomia UE. Indicatore di orientamento strategico verso la transizione ecologica.', source: 'Piano degli investimenti o nota integrativa al bilancio.', tip: 'Include: impianti FV, veicoli elettrici, isolamento edifici, macchinari a basse emissioni.', efrag: 'PMI-Banche DP.12 — CapEx verde' }} />
        </div>
      </Card>

      {/* SEDI AZIENDALI */}
      <Card className="p-6 mb-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-heading font-bold text-primary text-sm">Sedi Aziendali</h3>
          <Button size="sm" variant="outline" onClick={addSede}><Plus className="w-3.5 h-3.5 mr-1" /> Aggiungi sede</Button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Inserisci la sede legale e tutte le sedi operative. Gli indirizzi saranno geolocalizzati automaticamente nella mappa Biodiversità per la verifica delle aree protette.
        </p>

        {/* Sede legale (campo rapido) */}
        <div className="mb-4">
          <TextInput
            label="Sede Legale (indirizzo completo)"
            value={ana.sede}
            onChange={(v) => u('sede', v)}
            placeholder="Es. Via Roma 1, 20121 Milano MI"
            hint="Indirizzo completo per geocoding preciso"
          />
        </div>

        {/* Sedi operative */}
        {sedi.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Sedi Operative</p>
            {sedi.map((row, i) => (
              <div key={i} className="flex gap-2 items-center p-3 rounded-lg border border-green-100 bg-green-50/30">
                <input
                  className="flex-1 px-2.5 py-1.5 border border-green-200 rounded text-xs focus:border-primary focus:outline-none"
                  placeholder="Nome sede (es. Stabilimento Nord)"
                  value={row.nome || ''}
                  onChange={e => updateSede(i, 'nome', e.target.value)}
                />
                <input
                  className="flex-[2] px-2.5 py-1.5 border border-green-200 rounded text-xs focus:border-primary focus:outline-none"
                  placeholder="Indirizzo completo (es. Via Verdi 5, 10121 Torino TO)"
                  value={row.indirizzo || ''}
                  onChange={e => updateSede(i, 'indirizzo', e.target.value)}
                />
                <select
                  className="px-2.5 py-1.5 border border-green-200 rounded text-xs focus:border-primary focus:outline-none"
                  value={row.tipo || 'Operativa'}
                  onChange={e => updateSede(i, 'tipo', e.target.value)}
                >
                  {['Operativa', 'Magazzino', 'Ufficio', 'Produzione', 'Logistica'].map(o => <option key={o}>{o}</option>)}
                </select>
                <button onClick={() => removeSede(i)} className="text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!sedi.length && (
          <div className="text-xs text-muted-foreground italic text-center py-3 border border-dashed border-border rounded-lg">
            Nessuna sede operativa aggiunta. Usa "Aggiungi sede" per sedi diverse dalla sede legale.
          </div>
        )}
      </Card>

      <Card className="p-6 mb-5">
        <h3 className="font-heading font-bold text-primary text-sm mb-1">Dati Dimensionali e Categoria VSME</h3>
        <p className="text-xs text-muted-foreground mb-4">Dall'ultimo bilancio approvato</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-5 leading-relaxed">
          ℹ️ La categoria si determina con almeno 2 su 3 criteri: totale attivo, fatturato netto, dipendenti medi.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Totale Attivo (€)" type="number" value={ana.attivo} onChange={(v) => u('attivo', v)}
            tooltip={{ label: 'Totale Attivo (€)', desc: 'La somma di tutte le attività patrimoniali dell\'azienda (attivo fisso + attivo circolante) dall\'ultimo bilancio approvato. Usato per determinare la categoria VSME.', source: 'Stato patrimoniale — voce "Totale Attivo" (bilancio approvato dall\'assemblea).', tip: 'Soglie VSME: ≤ €450.000 = Micro | ≤ €5.000.000 = Piccola | > €5.000.000 = Media.', efrag: 'VSME — Soglie dimensionali (Direttiva 2013/34/UE)' }} />
          <TextInput label="Fatturato Netto (€)" type="number" value={ana.fatturato} onChange={(v) => u('fatturato', v)}
            tooltip={{ label: 'Fatturato Netto (€)', desc: 'Il valore dei ricavi delle vendite e delle prestazioni al netto di IVA e sconti. Dall\'ultimo bilancio approvato.', source: 'Conto economico — voce "Ricavi delle vendite e delle prestazioni" (A.1).', tip: 'Soglie VSME: ≤ €900.000 = Micro | ≤ €10.000.000 = Piccola | > €10.000.000 = Media.', efrag: 'VSME — Soglie dimensionali' }} />
          <TextInput label="N. Dipendenti (Headcount)" type="number" value={ana.hc} onChange={(v) => u('hc', v)} hint="Media durante l'anno"
            tooltip={{ label: 'Dipendenti — Headcount (HC)', desc: 'Il numero medio di dipendenti calcolato come media delle presenze nel corso dell\'anno (non la fotografia al 31/12). Include tutti i contratti di lavoro subordinato (esclusi collaboratori autonomi).', source: 'Libro Unico del Lavoro (LUL) — media annua dei dipendenti presenti.', tip: 'Soglie VSME: ≤ 10 = Micro | ≤ 50 = Piccola | ≤ 250 = Media. La categoria si determina con almeno 2 su 3 criteri.', efrag: 'VSME — Soglie dimensionali (Direttiva 2013/34/UE)' }} />
          <TextInput label="N. Dipendenti (FTE)" type="number" value={ana.fte} onChange={(v) => u('fte', v)}
            tooltip={{ label: 'Dipendenti — FTE (Full Time Equivalent)', desc: 'Misura standardizzata che converte i part-time in "equivalenti" a tempo pieno. Un dipendente al 50% = 0,5 FTE. Usato per i KPI di intensità (es. m³ acqua per FTE).', source: 'Elaborazione del LUL: somma delle ore contrattuali / ore standard annue per FTE (es. 1.768 h/anno in Italia).', efrag: 'VSME B8 — Caratteristiche forza lavoro' }} />
        </div>

        <div className="border-t border-dashed border-border my-5" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ComputedValue label="Categoria calcolata" value={catAuto} />
          <SelectField
            label="Override manuale categoria"
            value={ana.dimManuale || ''}
            onChange={(v) => u('dimManuale', v)}
            options={[['auto','— Usa calcolo automatico —'],['Micro','Micro impresa'],['Piccola','Piccola impresa'],['Media','Media impresa']]}
            hint="Sovrascrive il calcolo automatico"
          />
          <SelectField
            label="Modulo VSME"
            value={ana.modulo || 'basic'}
            onChange={(v) => u('modulo', v)}
            options={[['basic','Solo Modulo Base (B1–B11)'],['comprehensive','Base + Completo (B1–B11 + C1–C9)']]}
          />
        </div>

        <div className={`mt-4 p-3 rounded-lg text-xs leading-relaxed ${cat === 'Micro' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
          {cat === 'Micro' ? '✅ Micro-impresa: il Modulo Base è sufficiente.' : cat === 'Piccola' ? '📋 Piccola impresa: il Modulo Base copre la maggior parte delle esigenze.' : '📋 Media impresa: considera il Modulo Comprehensive.'}
        </div>
      </Card>

      <div className="mb-5">
        <NotesField value={data?.ana?.noteAna} onChange={(v) => u('noteAna', v)} section="ana" rows={3} />
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={() => onNavigate('en')} className="bg-primary gap-2">Avanti <ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}