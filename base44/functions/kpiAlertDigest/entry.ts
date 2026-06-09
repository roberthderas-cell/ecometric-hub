import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Invia un'email digest giornaliera degli alert KPI critici a tutti gli utenti admin.
 * Chiamato dallo scheduler giornaliero.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Recupera tutti i report attivi (non completati)
    const reports = await base44.asServiceRole.entities.Report.list();
    if (!reports || reports.length === 0) {
      return Response.json({ sent: 0, message: 'Nessun report trovato' });
    }

    // Recupera gli utenti admin
    const users = await base44.asServiceRole.entities.User.list();
    const admins = users.filter(u => u.role === 'admin');
    if (admins.length === 0) {
      return Response.json({ sent: 0, message: 'Nessun admin trovato' });
    }

    // Calcola alert per ogni report
    const criticalReports = [];
    for (const report of reports) {
      const data = report.data || {};
      const esgScore = report.esg_score || {};
      const alerts = computeAlerts(data, esgScore);
      const criticals = alerts.filter(a => a.severity === 'critical');
      if (criticals.length > 0) {
        criticalReports.push({
          name: report.name,
          year: report.year,
          criticals,
        });
      }
    }

    if (criticalReports.length === 0) {
      return Response.json({ sent: 0, message: 'Nessun alert critico rilevato' });
    }

    // Costruisce il corpo email
    const emailBody = buildEmailBody(criticalReports);
    const subject = `⚠️ VSME Builder — ${criticalReports.reduce((n, r) => n + r.criticals.length, 0)} alert critici rilevati`;

    let sent = 0;
    for (const admin of admins) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject,
        body: emailBody,
        from_name: 'VSME Builder — Notifiche KPI',
      });
      sent++;
    }

    return Response.json({ sent, reports: criticalReports.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ─── Calcolo alert inline (replica leggera di lib/kpiAlerts.js) ──────────────

function computeAlerts(data, esgScore) {
  const alerts = [];

  // Intensità GHG
  const en = data?.en || {};
  const ana = data?.ana || {};
  const fatturato = parseFloat(ana.fatturato) || 0;
  const scope1 = parseFloat(en.scope1Tot) || 0;
  const scope2 = parseFloat(en.scope2Tot) || 0;
  if (fatturato > 0) {
    const intensity = ((scope1 + scope2) / (fatturato / 1_000_000));
    if (intensity >= 500) alerts.push({ severity: 'critical', label: 'Intensità GHG', description: `${intensity.toFixed(0)} tCO₂/M€ — soglia critica 500` });
    else if (intensity >= 250) alerts.push({ severity: 'warning', label: 'Intensità GHG', description: `${intensity.toFixed(0)} tCO₂/M€ — soglia warning 250` });
  }

  // Energia rinnovabile
  const elRin = parseFloat(en.elRin) || 0;
  const elReteN = parseFloat(en.elReteN) || 0;
  if (elReteN > 0) {
    const pRen = (elRin / elReteN) * 100;
    if (pRen <= 5) alerts.push({ severity: 'critical', label: '% Energia Rinnovabile', description: `${pRen.toFixed(1)}% — soglia critica 5%` });
    else if (pRen <= 15) alerts.push({ severity: 'warning', label: '% Energia Rinnovabile', description: `${pRen.toFixed(1)}% — soglia warning 15%` });
  }

  // Recovery rifiuti
  const ri = data?.ri || {};
  const totN = parseFloat(ri.totN) || 0;
  const recN = parseFloat(ri.recN) || 0;
  if (totN > 0) {
    const pRec = (recN / totN) * 100;
    if (pRec <= 25) alerts.push({ severity: 'critical', label: '% Rifiuti Recuperati', description: `${pRec.toFixed(1)}% — soglia critica 25%` });
    else if (pRec <= 50) alerts.push({ severity: 'warning', label: '% Rifiuti Recuperati', description: `${pRec.toFixed(1)}% — soglia warning 50%` });
  }

  // Indice infortuni
  const pe = data?.pe || {};
  const infort = parseFloat(pe.infort) || 0;
  const oreLav = parseFloat(pe.oreLav) || 0;
  if (oreLav > 0) {
    const IF = (infort / oreLav) * 1_000_000;
    if (IF >= 40) alerts.push({ severity: 'critical', label: 'Indice Infortuni (IF)', description: `${IF.toFixed(0)}/Mh — soglia critica 40` });
    else if (IF >= 20) alerts.push({ severity: 'warning', label: 'Indice Infortuni (IF)', description: `${IF.toFixed(0)}/Mh — soglia warning 20` });
  }

  // Target ESG
  const targets = data?.targets;
  if (targets) {
    const pillars = [
      { key: 'E', label: 'Score Ambiente (E)', current: esgScore?.E },
      { key: 'S', label: 'Score Sociale (S)', current: esgScore?.S },
      { key: 'G', label: 'Score Governance (G)', current: esgScore?.G },
      { key: 'tot', label: 'Score ESG Totale', current: esgScore?.tot },
    ];
    for (const { key, label, current } of pillars) {
      const target = targets[key];
      if (target == null || current == null) continue;
      const gap = target - current;
      if (gap >= 25) alerts.push({ severity: 'critical', label, description: `Distanza dal target: ${gap.toFixed(0)} punti` });
      else if (gap >= 12) alerts.push({ severity: 'warning', label, description: `Distanza dal target: ${gap.toFixed(0)} punti` });
    }
  }

  return alerts;
}

function buildEmailBody(criticalReports) {
  const rows = criticalReports.map(r => {
    const lines = r.criticals.map(a => `  • [CRITICO] ${a.label}: ${a.description}`).join('\n');
    return `📋 ${r.name} (${r.year})\n${lines}`;
  }).join('\n\n');

  return `Buongiorno,

Il sistema VSME Builder ha rilevato i seguenti alert critici nei tuoi report ESG:

${rows}

---
Accedi a VSME Builder per visualizzare i dettagli e prendere provvedimenti.
Gli alert vengono calcolati in tempo reale in base ai dati inseriti.

Questo è un messaggio automatico. Non rispondere a questa email.`;
}