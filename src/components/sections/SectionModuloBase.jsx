import { calcEnergy, calcWaste, calcWater, calcPersonnel } from '@/lib/vsmeDefaults';

function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm border-collapse">
        {children}
      </table>
    </div>
  );
}
function Th({ children }) {
  return <th className="bg-muted/50 text-left px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wide border-b border-border">{children}</th>;
}
function Td({ children, bold }) {
  return <td className={`px-3 py-2 border-b border-border/50 last:border-0 ${bold ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{children}</td>;
}
function AutoBadge() {
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">auto</span>;
}
function SectionHeader({ id, title, ref: refText, badge }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
          <span className="text-xs font-extrabold px-2 py-1 rounded bg-primary/10 text-primary">{id}</span>
          {title}
        </h2>
        {refText && <p className="text-xs text-muted-foreground mt-1">{refText}</p>}
      </div>
      {badge}
    </div>
  );
}
function NarrativeBox({ text, placeholder }) {
  return (
    <div className={`mt-3 p-3 rounded-lg text-sm leading-relaxed border-l-2 ${text ? 'bg-muted/30 border-primary/40 text-foreground' : 'bg-muted/20 border-border text-muted-foreground italic'}`}>
      {text || placeholder}
    </div>
  );
}
function fmtN(v, dec = 0) {
  const n = parseFloat(v);
  if (isNaN(n) || n === 0) return '—';
  return dec > 0 ? n.toFixed(dec) : Math.round(n).toString();
}
function fmtE(v) {
  const n = parseFloat(v);
  return isNaN(n) || n === 0 ? '—' : '€ ' + n.toLocaleString('it-IT');
}
function Card({ children, className = '' }) {
  return <div className={`bg-card rounded-xl border border-border p-5 mb-5 ${className}`}>{children}</div>;
}

// ── B3 ──────────────────────────────────────────────────────────────────────
export function SectionB3({ data }) {
  const g = calcEnergy(data);
  const en = data?.en || {};
  const rows = data?.enfuels?.rows || [];
  return (
    <div>
      <SectionHeader id="B3" title="Energia e Emissioni GHG"
        ref="VSME B3 | GHG Protocol 2004 | Fattori ISPRA location-based"
        badge={<AutoBadge />} />
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4 text-xs text-green-700 dark:text-green-400">
        ✅ Valori calcolati automaticamente dalla sezione «Energia & Combustibili».
      </div>
      <Card>
        <h3 className="font-semibold text-sm mb-3">Consumi energetici totali</h3>
        <Table>
          <thead><tr><Th>Fonte</Th><Th>Tipo</Th><Th>Anno N</Th><Th>Anno N-1</Th></tr></thead>
          <tbody>
            <tr><Td>Elettricità da rete</Td><Td>Non rinnovabile</Td><Td bold>{fmtN(en.elReteN)} kWh</Td><Td>{fmtN(en.elReteN1)} kWh</Td></tr>
            {parseFloat(en.elFVN) > 0 && <tr><Td>FV aziendale (autoconsumo)</Td><Td>Rinnovabile ✓</Td><Td bold>{fmtN(en.elFVN)} kWh</Td><Td>{fmtN(en.elFVN1)} kWh</Td></tr>}
            {rows.filter(r => parseFloat(r.quantita) > 0).map((r, i) => (
              <tr key={i}><Td>{r.combustibile}</Td><Td>{r.rinnovabile === 'Si' ? 'Rinnovabile ✓' : 'Non rinnovabile'}</Td><Td bold>{r.quantita} {r.unita}</Td><Td>—</Td></tr>
            ))}
            <tr className="bg-muted/30"><Td bold>TOTALE (MWh equivalenti)</Td><Td></Td><Td bold>{(g.totKwh / 1000).toFixed(1)} MWh — {g.pRen.toFixed(1)}% rinn.</Td><Td>—</Td></tr>
          </tbody>
        </Table>
      </Card>
      <Card>
        <h3 className="font-semibold text-sm mb-3">Emissioni GHG — Scope 1 e Scope 2</h3>
        <Table>
          <thead><tr><Th>Scope</Th><Th>Fonte</Th><Th>tCO₂eq Anno N</Th></tr></thead>
          <tbody>
            <tr><Td>Scope 1</Td><Td>Combustibili (tabella editabile)</Td><Td bold>{g.s1.toFixed(2)}</Td></tr>
            <tr><Td>Scope 2 (LB)</Td><Td>Elettricità rete — ISPRA {en.ispra || 0.211} kgCO₂/kWh</Td><Td bold>{g.s2LB.toFixed(2)}</Td></tr>
            <tr className="bg-muted/30"><Td bold>Totale Scope 1+2</Td><Td></Td><Td bold>{g.tot.toFixed(2)} tCO₂eq</Td></tr>
            <tr><Td>GHG Intensity</Td><Td>Scope1+2 / Fatturato</Td><Td bold>{g.intensity.toFixed(2)} tCO₂eq/M€</Td></tr>
            {g.avoided > 0 && <tr><Td className="text-green-600">☀️ CO₂ evitata FV (info)</Td><Td></Td><Td bold className="text-green-600">{g.avoided.toFixed(2)} tCO₂eq</Td></tr>}
          </tbody>
        </Table>
        <NarrativeBox text={en.noteEn} placeholder="Nota narrativa B3 non ancora inserita. Torna alla sezione Energia per aggiungere il testo." />
      </Card>
    </div>
  );
}

// ── B4 ──────────────────────────────────────────────────────────────────────
export function SectionB4({ data }) {
  const inq = data?.inq || {};
  const aspetti = data?.b4asp?.aspetti || [];
  const inquinanti = data?.b4asp?.inquinanti || [];
  return (
    <div>
      <SectionHeader id="B4" title="Inquinamento" ref="VSME B4 | D.Lgs. 152/2006 | AIA/AUA" badge={<AutoBadge />} />
      <Card>
        <Table>
          <thead><tr><Th>Parametro</Th><Th>Valore</Th></tr></thead>
          <tbody>
            <tr><Td>Monitoraggio attivo (AIA/AUA)</Td><Td bold>{inq.regol === 'si' ? '✅ Sì' : '— Non applicabile'}</Td></tr>
            <tr><Td>Inquinanti censiti</Td><Td bold>{inquinanti.filter(r => r.inquinante).length}</Td></tr>
          </tbody>
        </Table>
        {aspetti.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Matrice aspetti ambientali</p>
            <Table>
              <thead><tr><Th>Processo</Th><Th>Aspetto</Th><Th>Matrice impattata</Th><Th>Presidio</Th></tr></thead>
              <tbody>
                {aspetti.map((r, i) => <tr key={i}><Td>{r.processo || '—'}</Td><Td>{r.aspetto || '—'}</Td><Td>{r.impatto || '—'}</Td><Td>{r.presidio || '—'}</Td></tr>)}
              </tbody>
            </Table>
          </div>
        )}
        <NarrativeBox text={inq.noteInq} placeholder="La disclosure B4 non è pertinente: l'impresa non è soggetta ad AIA/AUA e non adotta sistemi EMS con monitoraggio emissioni inquinanti." />
      </Card>
    </div>
  );
}

// ── B5 ──────────────────────────────────────────────────────────────────────
export function SectionB5({ data }) {
  const biod = data?.biod || {};
  const siti = data?.b5siti?.siti || [];
  const tot = parseFloat(biod.supTot) || 0;
  const imp = parseFloat(biod.supImp) || 0;
  const nat = parseFloat(biod.natM2) || 0;
  return (
    <div>
      <SectionHeader id="B5" title="Biodiversità" ref="VSME B5 | Natura 2000 | WDPA | D.Lgs. 152/2006" badge={<AutoBadge />} />
      <Card>
        {siti.length > 0 && (
          <Table>
            <thead><tr><Th>Sito</Th><Th>Paese</Th><Th>Sup. (m²)</Th><Th>Area sensibile?</Th><Th>Regione</Th></tr></thead>
            <tbody>
              {siti.map((s, i) => (
                <tr key={i}>
                  <Td bold>{s.sito || '—'}</Td><Td>{s.paese || '—'}</Td><Td>{s.superficie || '—'}</Td>
                  <Td><span className={s.sensibile === 'Si' ? 'text-red-600 font-bold' : ''}>{s.sensibile === 'Si' ? '⚠️ Sì' : s.sensibile || '—'}</span></Td>
                  <Td>{s.regione || '—'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {tot > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">% impermeabilizzata</p>
              <p className="font-heading font-bold text-lg">{(imp / tot * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">% nature-oriented</p>
              <p className="font-heading font-bold text-lg">{(nat / tot * 100).toFixed(1)}%</p>
            </div>
          </div>
        )}
        <NarrativeBox text={biod.noteBiod} placeholder="La disclosure B5 non è pertinente: nessun sito operativo è ubicato in prossimità di aree protette Natura 2000 o IBA." />
      </Card>
    </div>
  );
}

// ── B6 ──────────────────────────────────────────────────────────────────────
export function SectionB6({ data }) {
  const w = calcWater(data);
  const fonti = data?.acfonti?.fonti || [];
  return (
    <div>
      <SectionHeader id="B6" title="Acqua" ref="VSME B6 | Prelievo, stress idrico, consumo" badge={<AutoBadge />} />
      <Card>
        <Table>
          <thead><tr><Th>Indicatore</Th><Th>Anno N</Th></tr></thead>
          <tbody>
            <tr><Td>Prelievo idrico totale</Td><Td bold>{w.tot.toFixed(0)} m³</Td></tr>
            <tr><Td>di cui in aree ad alto stress idrico</Td><Td bold>{w.high.toFixed(0)} m³</Td></tr>
            <tr><Td>Scarico idrico</Td><Td bold>{w.scarico.toFixed(0)} m³</Td></tr>
            <tr><Td>Consumo netto</Td><Td bold>{w.consumo.toFixed(0)} m³</Td></tr>
            <tr><Td>Prelievo per dipendente</Td><Td bold>{w.prelievoDip.toFixed(1)} m³/dip.</Td></tr>
            <tr><Td>Consumo per dipendente</Td><Td bold>{w.consumoDip.toFixed(1)} m³/dip.</Td></tr>
          </tbody>
        </Table>
        {fonti.length > 0 && (
          <div className="mt-4">
            <Table>
              <thead><tr><Th>Fonte</Th><Th>Prelievo N (m³)</Th><Th>Alto stress</Th><Th>Fonte dato</Th></tr></thead>
              <tbody>
                {fonti.map((r, i) => <tr key={i}><Td>{r.fonte || '—'}</Td><Td bold>{fmtN(r.prelievo)}</Td><Td>{r.stress || 'No'}</Td><Td>{r.evidenza || '—'}</Td></tr>)}
              </tbody>
            </Table>
          </div>
        )}
        <NarrativeBox text={data?.ac?.noteAc} placeholder="Nota narrativa B6: fonti, misure di efficienza, stress idrico della zona, andamento N/N-1." />
      </Card>
    </div>
  );
}

// ── B7 ──────────────────────────────────────────────────────────────────────
export function SectionB7({ data }) {
  const w = calcWaste(data);
  const righe = (() => { try { return JSON.parse(data?.ri?.righe || '[]'); } catch { return []; } })();
  return (
    <div>
      <SectionHeader id="B7" title="Rifiuti e Economia Circolare" ref="VSME B7 | ESRS E5 | D.Lgs. 152/2006 | RENTRI" badge={<AutoBadge />} />
      <Card>
        <Table>
          <thead><tr><Th>Categoria</Th><Th>Anno N (t)</Th></tr></thead>
          <tbody>
            <tr><Td>Rifiuti totali</Td><Td bold>{w.tot.toFixed(2)} t</Td></tr>
            <tr><Td>di cui Pericolosi (CER *)</Td><Td bold>{w.per.toFixed(2)} t</Td></tr>
            <tr><Td>di cui Non Pericolosi</Td><Td bold>{w.nPer.toFixed(2)} t</Td></tr>
            <tr><Td>Avviati a Recupero/Riciclo</Td><Td bold>{w.rec.toFixed(2)} t</Td></tr>
            <tr><Td>Avviati a Smaltimento</Td><Td bold>{w.smal.toFixed(2)} t</Td></tr>
            <tr className="bg-green-50 dark:bg-green-950/20"><Td bold>% a Recupero</Td><Td bold className="text-green-700">{w.pRec.toFixed(1)}%</Td></tr>
          </tbody>
        </Table>
        {righe.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Dettaglio per codice CER</p>
            <Table>
              <thead><tr><Th>CER</Th><Th>Descrizione</Th><Th>kg Anno N</Th><Th>Pericoloso</Th><Th>Destino</Th></tr></thead>
              <tbody>
                {righe.map((r, i) => (
                  <tr key={i}><Td bold>{r.cer || '—'}</Td><Td>{r.desc || '—'}</Td><Td>{r.qty || '—'}</Td><Td>{r.peri === 'si' ? '⚠️ Sì' : 'No'}</Td><Td>{r.dest === 'R' ? '✅ Recupero R' : '🗑️ Smaltimento D'}</Td></tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
        <NarrativeBox text={data?.ri?.noteRi} placeholder="Nota narrativa B7: tipologie principali, gestori autorizzati (FIR), iniziative di riduzione, confronto anno precedente." />
      </Card>
    </div>
  );
}

// ── B8 ──────────────────────────────────────────────────────────────────────
export function SectionB8({ data }) {
  const pe = data?.pe || {};
  const hc = parseInt(pe.hc) || 0;
  const donne = parseFloat(pe.donne) || 0;
  return (
    <div>
      <SectionHeader id="B8" title="Caratteristiche Forza Lavoro" ref="VSME B8 | ESRS S1 reference" badge={<AutoBadge />} />
      <Card>
        <Table>
          <thead><tr><Th>Indicatore</Th><Th>Anno N</Th></tr></thead>
          <tbody>
            <tr><Td>Dipendenti totali (headcount)</Td><Td bold>{pe.hc || '—'}</Td></tr>
            <tr><Td>Dipendenti totali (FTE)</Td><Td bold>{pe.fte || '—'}</Td></tr>
            <tr><Td>di cui Donne</Td><Td bold>{pe.donne || '—'}{hc && donne ? ` (${(donne / hc * 100).toFixed(1)}%)` : ''}</Td></tr>
            <tr><Td>di cui Uomini</Td><Td bold>{pe.uomini || '—'}</Td></tr>
            <tr><Td>Contratto indeterminato</Td><Td bold>{pe.indet || '—'}</Td></tr>
            <tr><Td>Contratto determinato</Td><Td bold>{pe.det || '—'}</Td></tr>
            <tr><Td>Part-time</Td><Td bold>{pe.pt || '—'}</Td></tr>
            <tr><Td>Lavoratori non dipendenti</Td><Td bold>{pe.nd || '—'}</Td></tr>
            <tr><Td>Con disabilità (L. 68/1999)</Td><Td bold>{pe.disab || '—'}</Td></tr>
            <tr><Td>In congedo maternità/paternità</Td><Td bold>{pe.matN || '—'}</Td></tr>
            <tr><Td>Promozioni interne</Td><Td bold>{pe.promN || '—'}</Td></tr>
          </tbody>
        </Table>
        <NarrativeBox text={pe.notePe} placeholder="Nota narrativa B8: struttura della forza lavoro, politiche di assunzione, lavoratori stagionali." />
      </Card>
    </div>
  );
}

// ── B9 ──────────────────────────────────────────────────────────────────────
export function SectionB9({ data }) {
  const pe = data?.pe || {};
  const calc = calcPersonnel(data);
  return (
    <div>
      <SectionHeader id="B9" title="Salute e Sicurezza" ref="VSME B9 | D.Lgs. 81/2008 | ESRS S1-14" badge={<AutoBadge />} />
      <Card>
        <Table>
          <thead><tr><Th>Indicatore</Th><Th>Anno N</Th><Th>Note</Th></tr></thead>
          <tbody>
            <tr><Td>Infortuni (assenza &gt; 0 gg)</Td><Td bold>{pe.infort || '0'}</Td><Td>Fonte INAIL</Td></tr>
            <tr><Td>Giorni persi per infortuni</Td><Td bold>{pe.ggPersi || '0'}</Td><Td></Td></tr>
            <tr><Td>Malattie professionali riconosciute</Td><Td bold>{pe.malProf || '0'}</Td><Td></Td></tr>
            <tr><Td>Ore lavorate totali</Td><Td bold>{fmtN(pe.oreLav)}</Td><Td>Da LUL</Td></tr>
            <tr><Td>Giorni assenteismo</Td><Td bold>{pe.assentGg || '—'}</Td><Td>Esclusi congedi obbligatori</Td></tr>
            <tr className="bg-muted/30"><Td bold>Tasso Frequenza Infortuni (IF)</Td><Td bold>{calc.IF}</Td><Td>(n.inf × 1.000.000) / ore lavorate</Td></tr>
            <tr className="bg-muted/30"><Td bold>Tasso di Assenteismo</Td><Td bold>{calc.tassoAss}%</Td><Td>Gg ass. / (hc × 220 gg teorici)</Td></tr>
          </tbody>
        </Table>
        <NarrativeBox text={pe.notePe} placeholder="Nota narrativa B9: DVR, RSPP, RLS, iniziative di prevenzione, ISO 45001, cause infortuni e misure correttive." />
      </Card>
    </div>
  );
}

// ── B10 ─────────────────────────────────────────────────────────────────────
export function SectionB10({ data }) {
  const pe = data?.pe || {};
  const calc = calcPersonnel(data);
  return (
    <div>
      <SectionHeader id="B10" title="Retribuzione, CCNL e Formazione" ref="VSME B10 | ESRS S1-15/16" badge={<AutoBadge />} />
      <Card>
        <Table>
          <thead><tr><Th>Indicatore</Th><Th>Anno N</Th></tr></thead>
          <tbody>
            <tr><Td>CCNL applicato</Td><Td bold>{pe.ccnl || '—'}</Td></tr>
            <tr><Td>% Dipendenti coperti da CCNL</Td><Td bold>{pe.percCCNL ? pe.percCCNL + '%' : '—'}</Td></tr>
            <tr><Td>Retribuzione lorda media annua</Td><Td bold>{fmtE(pe.retMedia)}</Td></tr>
            <tr><Td>di cui Uomini</Td><Td bold>{fmtE(pe.retUom)}</Td></tr>
            <tr><Td>di cui Donne</Td><Td bold>{fmtE(pe.retDon)}</Td></tr>
            <tr className="bg-muted/30"><Td bold>Gender Pay Gap</Td><Td bold>{calc.gpg}%</Td></tr>
            <tr><Td>Ore medie formazione / dip. / anno</Td><Td bold>{pe.oreForm ? pe.oreForm + ' h' : '—'}</Td></tr>
            <tr><Td>% con valutazione performance</Td><Td bold>{pe.percVal ? pe.percVal + '%' : '—'}</Td></tr>
            <tr><Td>Promozioni interne</Td><Td bold>{pe.promN || '—'}</Td></tr>
          </tbody>
        </Table>
        <NarrativeBox text={pe.notePe} placeholder="Nota narrativa B10: politica retributiva, benefit, formazione, parità di genere, valutazione performance." />
      </Card>
    </div>
  );
}

// ── B11 ─────────────────────────────────────────────────────────────────────
export function SectionB11({ data, onUpdate }) {
  const b11 = data?.b11 || {};
  const gov = data?.gov || {};
  const cond = b11.cond ?? gov.cond ?? '0';
  const san = b11.san ?? gov.san ?? '0';

  return (
    <div>
      <SectionHeader id="B11" title="Corruzione e Sanzioni" ref="VSME B11 | D.Lgs. 231/2001 | ESRS G1" />
      <Card>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">N. Condanne corruzione (ultimi 3 anni)</label>
            <input
              type="number" min="0" value={cond}
              onChange={e => onUpdate('b11', 'cond', e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Importo sanzioni (€)</label>
            <input
              type="number" min="0" value={san}
              onChange={e => onUpdate('b11', 'san', e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Testo narrativo B11</label>
          <textarea
            rows={5}
            value={b11.noteB11 || ''}
            onChange={e => onUpdate('b11', 'noteB11', e.target.value)}
            placeholder={`Se zero: "Nel triennio [N-2/N] la società non ha ricevuto condanne né sanzioni per reati di corruzione. Adotta [Codice Etico / Modello 231] per la prevenzione."`}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y"
          />
        </div>
        <div className="mt-4">
          <Table>
            <thead><tr><Th>Strumento di compliance</Th><Th>Stato</Th></tr></thead>
            <tbody>
              {[
                ['Codice Etico', gov.codEtico],
                ['Modello Org. 231/2001', gov.mog231],
                ['Policy Anti-Corruzione', gov.policy],
                ['Whistleblowing (D.Lgs. 24/2023)', gov.wb],
              ].map(([label, v]) => (
                <tr key={label}><Td>{label}</Td><Td bold><span className={v === 'si' ? 'text-green-600' : 'text-muted-foreground'}>{v === 'si' ? '✅ Sì' : '— No'}</span></Td></tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}