import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportId } = await req.json();

    if (!reportId) {
      return Response.json({ error: 'Report ID required' }, { status: 400 });
    }

    const report = await base44.entities.Report.get(reportId);
    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    const data = report.data || {};
    const esg = report.esg_score || {};
    const ana = data.ana || {};
    const en = data.en || {};
    const ri = data.ri || {};
    const pe = data.pe || {};
    const gov = data.gov || {};

    const recommendations = {
      ambiente: [],
      governance: [],
      priorita: 'bassa'
    };

    // === ANALISI AMBIENTE (E) ===
    const E = esg.E || 0;
    
    if (E < 50) {
      recommendations.priorita = 'alta';
    } else if (E < 70) {
      recommendations.priorita = 'media';
    }

    // Energia rinnovabile
    const elRete = parseFloat(en.elReteN) || 0;
    const elFV = parseFloat(en.elFVN) || 0;
    const totKwh = elRete + elFV;
    const pRen = totKwh > 0 ? (elFV / totKwh) * 100 : 0;

    if (pRen < 15) {
      recommendations.ambiente.push({
        area: 'Energia Rinnovabile',
        punteggio: Math.round(pRen),
        target: '≥35%',
        azione: 'Installare impianto fotovoltaico o acquistare energia da fonti rinnovabili (GO)',
        impatto: 'Riduzione Scope 2 e miglioramento score E',
        priorita: pRen < 5 ? 'alta' : 'media'
      });
    }

    // Efficienza energetica
    const fatturato = parseFloat(ana.fatturato) || 0;
    const intensity = fatturato > 0 ? ((parseFloat(en.ispra) || 0.211) * elRete / fatturato) * 1000000 : 0;

    if (intensity > 250) {
      recommendations.ambiente.push({
        area: 'Efficienza Energetica',
        punteggio: Math.round(intensity),
        target: '<100 kWh/€M',
        azione: 'Audit energetico e sostituzione impianti obsoleti (illuminazione LED, motori efficienti)',
        impatto: 'Riduzione costi e emissioni Scope 2',
        priorita: intensity > 400 ? 'alta' : 'media'
      });
    }

    // Riciclo rifiuti
    const totRifiuti = parseFloat(ri.totN) || 0;
    const riciclo = parseFloat(ri.recN) || 0;
    const pRec = totRifiuti > 0 ? (riciclo / totRifiuti) * 100 : 0;

    if (pRec < 65) {
      recommendations.ambiente.push({
        area: 'Economia Circolare',
        punteggio: Math.round(pRec),
        target: '≥85%',
        azione: 'Implementare raccolta differenziata avanzata e partnership con fornitori per recupero materiali',
        impatto: 'Riduzione costi smaltimento e miglioramento score E',
        priorita: pRec < 40 ? 'alta' : 'media'
      });
    }

    // === ANALISI GOVERNANCE (G) ===
    const G = esg.G || 0;

    let gPts = 0;
    if (gov.mog231 === 'si') gPts += 1.5;
    if (gov.codEtico === 'si') gPts += 1.0;
    if (gov.iso45001 === 'si') gPts += 1.5;
    if (gov.pariGen === 'si') gPts += 1.0;
    if (gov.wb === 'si') gPts += 0.5;
    if ((parseInt(gov.cond) || 0) === 0) gPts += 0.5;

    if (G < 50) {
      recommendations.priorita = recommendations.priorita === 'alta' ? 'alta' : 'media';
    }

    // Modello 231
    if (gov.mog231 !== 'si') {
      recommendations.governance.push({
        area: 'Modello Organizzativo 231',
        punteggio: 0,
        target: 'Adozione',
        azione: 'Implementare Modello 231 con sistema sanzionatorio e organismo di vigilanza',
        impatto: 'Riduzione rischi legali e miglioramento score G (+1.5 pts)',
        priorita: 'alta'
      });
    }

    // Codice etico
    if (gov.codEtico !== 'si') {
      recommendations.governance.push({
        area: 'Codice Etico',
        punteggio: 0,
        target: 'Adozione',
        azione: 'Redigere e approvare codice etico aziendale con formazione obbligatoria',
        impatto: 'Miglioramento compliance e score G (+1.0 pts)',
        priorita: 'media'
      });
    }

    // Certificazioni
    if (gov.iso45001 !== 'si') {
      recommendations.governance.push({
        area: 'Certificazione Sicurezza',
        punteggio: 0,
        target: 'ISO 45001',
        azione: 'Certificare il sistema di gestione per la salute e sicurezza sul lavoro',
        impatto: 'Riduzione infortuni e score G (+1.5 pts)',
        priorita: 'media'
      });
    }

    // Pari opportunità
    if (gov.pariGen !== 'si') {
      recommendations.governance.push({
        area: 'Certificazione Pari Opportunità',
        punteggio: 0,
        target: 'Certificazione UNI/PdR 125:2022',
        azione: 'Implementare policy di parità di genere e richiedere certificazione',
        impatto: 'Miglioramento reputazione e score G (+1.0 pts)',
        priorita: 'bassa'
      });
    }

    // Whistleblowing
    if (gov.wb !== 'si') {
      recommendations.governance.push({
        area: 'Sistema Whistleblowing',
        punteggio: 0,
        target: 'Attivazione',
        azione: 'Implementare canale segnalazioni conforme DL 24/2023',
        impatto: 'Compliance normativa e score G (+0.5 pts)',
        priorita: 'media'
      });
    }

    // Ordina per priorità
    const prioritaOrder = { alta: 0, media: 1, bassa: 2 };
    recommendations.ambiente.sort((a, b) => prioritaOrder[a.priorita] - prioritaOrder[b.priorita]);
    recommendations.governance.sort((a, b) => prioritaOrder[a.priorita] - prioritaOrder[b.priorita]);

    return Response.json({
      reportId,
      esg: { E, G },
      recommendations,
      generated: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});