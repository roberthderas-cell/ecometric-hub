/**
 * VSME XBRL Export — genera un Excel con i named ranges EFRAG
 * compatibile con il VSME Digital Template e il convertitore xbrl.efrag.org
 *
 * Named ranges strategy: scriviamo i valori in celle precise e poi
 * definiamo il named range su quella cella tramite workbook.Workbook.Names.
 * L'utente carica il file su https://xbrl.efrag.org/convert/ per ottenere iXBRL.
 *
 * Ref: EFRAG Digital Template 1.3.0 - named ranges XBRL taxonomy
 */
import * as XLSX from 'xlsx';

// ─── Mapping campi app → named range EFRAG ───────────────────────────────────
// Sheet: "General Information"
const GEN_INFO_FIELDS = [
  // [namedRange, getter(data)]
  ['vsme_GeneralInformation_EntityName',          d => d?.ana?.ragioneSociale || ''],
  ['vsme_GeneralInformation_LEI',                 d => d?.ana?.lei || ''],
  ['vsme_GeneralInformation_CountryOfIncorporation', d => 'IT'],
  ['vsme_GeneralInformation_ReportingPeriodStart', d => `${(d?.ana?.annoRif || new Date().getFullYear()) - 1}-01-01`],
  ['vsme_GeneralInformation_ReportingPeriodEnd',  d => `${d?.ana?.annoRif || new Date().getFullYear()}-12-31`],
  ['vsme_GeneralInformation_NACECode',            d => d?.ana?.codiceAteco || ''],
  ['vsme_GeneralInformation_NumberOfEmployees',   d => _num(d?.pe?.hc)],
  ['vsme_GeneralInformation_NetTurnover',         d => _num(d?.ana?.fatturato)],
  ['vsme_GeneralInformation_TotalAssets',         d => _num(d?.ana?.attivo)],
];

// Sheet: "Environmental Disclosures" — B3 Energia & GHG
const ENV_FIELDS = [
  // Energia (B3)
  ['vsme_B3_TotalEnergyConsumption',              d => _num(d?.en?.totaleEnergia)],
  ['vsme_B3_EnergyFromRenewableSources',          d => _num(d?.en?.energiaRinnovabile)],
  ['vsme_B3_EnergyFromFossilFuels',               d => _num(d?.en?.energiaFossile)],
  ['vsme_B3_EnergyIntensityPerEmployee',          d => _num(d?.en?.intensitaEnergetica)],
  // GHG Scope 1
  ['vsme_B3_GHGScope1Emissions',                  d => _num(d?.en?.scope1)],
  // GHG Scope 2
  ['vsme_B3_GHGScope2Emissions',                  d => _num(d?.en?.scope2)],
  // GHG Scope 3
  ['vsme_B3_GHGScope3Emissions',                  d => _num(d?.en?.scope3)],
  // GHG totale
  ['vsme_B3_TotalGHGEmissions',                   d => {
    const s1 = _num(d?.en?.scope1);
    const s2 = _num(d?.en?.scope2);
    const s3 = _num(d?.en?.scope3);
    return (s1 || 0) + (s2 || 0) + (s3 || 0);
  }],
  // Acqua (B6)
  ['vsme_B6_TotalWaterWithdrawal',                d => _waterTot(d)],
  ['vsme_B6_WaterIntensityPerEmployee',           d => _waterInt(d)],
  // Rifiuti (B7)
  ['vsme_B7_TotalWasteGenerated',                 d => _num(d?.ri?.totaleRifiuti)],
  ['vsme_B7_WasteRecoveredAndRecycled',           d => _rifiutiRec(d)],
  ['vsme_B7_HazardousWaste',                      d => _num(d?.ri?.pericolosi)],
];

// Sheet: "Social Disclosures" — B8/B9/B10
const SOC_FIELDS = [
  ['vsme_B8_TotalHeadcount',                      d => _num(d?.pe?.hc)],
  ['vsme_B8_FemaleEmployees',                     d => _num(d?.pe?.donne)],
  ['vsme_B8_MaleEmployees',                       d => _num(d?.pe?.uomini)],
  ['vsme_B8_PermanentEmployees',                  d => _num(d?.pe?.indet)],
  ['vsme_B8_TemporaryEmployees',                  d => _num(d?.pe?.det)],
  ['vsme_B8_PartTimeEmployees',                   d => _num(d?.pe?.pt)],
  ['vsme_B8_EmployeesWithDisabilities',           d => _num(d?.pe?.disab)],
  ['vsme_B9_WorkRelatedInjuries',                 d => _num(d?.pe?.infort)],
  ['vsme_B9_WorkRelatedInjuriesFatalities',       d => _num(d?.pe?.decessi)],
  ['vsme_B9_LostDaysDueToInjuries',               d => _num(d?.pe?.ggPersi)],
  ['vsme_B9_AbsenteeismRate',                     d => _absRate(d)],
  ['vsme_B10_AverageTrainingHoursPerEmployee',    d => _num(d?.pe?.oreForm)],
  ['vsme_B10_GenderPayGap',                       d => _gpg(d)],
];

// Sheet: "Governance Disclosures" — B11
const GOV_FIELDS = [
  ['vsme_B11_BoardSize',                          d => _num(d?.gov?.cdaMembri)],
  ['vsme_B11_FemaleBoardMembers',                 d => _num(d?.gov?.cdaDonnePct)],
  ['vsme_B11_AntiCorruptionPolicyAdopted',        d => d?.gov?.anticorruzione ? 'Yes' : 'No'],
  ['vsme_B11_CodeOfConductAdopted',               d => d?.gov?.codiceEtico ? 'Yes' : 'No'],
  ['vsme_B11_GDPRCompliance',                     d => d?.gov?.gdprConforme ? 'Yes' : 'No'],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function _num(v) {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function _waterTot(data) {
  const fonti = data?.acfonti?.fonti || [];
  const tot = fonti.reduce((s, f) => s + (_num(f.prelievo) || 0), 0);
  return tot || _num(data?.ac?.totaleAcqua) || null;
}

function _waterInt(data) {
  const tot = _waterTot(data) || 0;
  const hc = _num(data?.ac?.dipAcquaN) || _num(data?.pe?.hc) || 1;
  return hc > 0 ? Math.round((tot / hc) * 100) / 100 : null;
}

function _rifiutiRec(data) {
  const tot = _num(data?.ri?.totaleRifiuti) || 0;
  const pctRec = _num(data?.ri?.pctRecupero) || 0;
  return Math.round(tot * pctRec / 100 * 100) / 100;
}

function _absRate(data) {
  const gg = _num(data?.pe?.assentGg) || 0;
  const hc = _num(data?.pe?.hc) || 1;
  return Math.round((gg / (hc * 220)) * 10000) / 100;
}

function _gpg(data) {
  const uom = _num(data?.pe?.retUom) || 0;
  const don = _num(data?.pe?.retDon) || 0;
  if (!uom) return null;
  return Math.round(((uom - don) / uom) * 10000) / 100;
}

// ─── Costruisce il workbook ───────────────────────────────────────────────────
export function generateVsmeXlsx(reportData, reportMeta = {}) {
  const wb = XLSX.utils.book_new();
  wb.Workbook = { Names: [] };

  // ── Helper: crea sheet con dati + registra named ranges ──
  function buildSheet(sheetName, fields, data) {
    const rows = [];
    const namedRanges = [];

    // Header row
    rows.push(['Named Range (EFRAG XBRL)', 'Valore / Value', 'Nota / Note']);

    fields.forEach(([name, getter], idx) => {
      const value = getter(data);
      const row = idx + 2; // 1-indexed, row 1 = header
      rows.push([name, value, '']);
      // named range points to column B (index 1) of this row
      namedRanges.push({
        Name: name,
        Ref: `'${sheetName}'!$B$${row}`,
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Column widths
    ws['!cols'] = [{ wch: 52 }, { wch: 28 }, { wch: 32 }];

    // Style header (bold via z attribute — limited support in xlsx)
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Register named ranges on workbook
    namedRanges.forEach(nr => wb.Workbook.Names.push(nr));
  }

  // ── General Information ──
  buildSheet('General Information', GEN_INFO_FIELDS, reportData);

  // ── Environmental ──
  buildSheet('Environmental Disclosures', ENV_FIELDS, reportData);

  // ── Social ──
  buildSheet('Social Disclosures', SOC_FIELDS, reportData);

  // ── Governance ──
  buildSheet('Governance Disclosures', GOV_FIELDS, reportData);

  // ── README sheet con istruzioni ──
  const readmeRows = [
    ['VSME Digital Template — Export XBRL-ready'],
    [''],
    ['Questo file è stato generato da VSME Builder e contiene i dati del report con i named ranges'],
    ['ufficiali EFRAG per la conversione in formato XBRL (iXBRL).'],
    [''],
    ['PASSO 1: Verifica i valori nelle 4 schede (General Information, Environmental, Social, Governance).'],
    ['PASSO 2: Carica questo file su https://xbrl.efrag.org/convert/'],
    ['PASSO 3: Scarica il report iXBRL ufficiale validato da EFRAG.'],
    [''],
    ['Report:', reportMeta.name || ''],
    ['Anno:', reportMeta.year || ''],
    ['Esportato il:', new Date().toLocaleDateString('it-IT')],
    [''],
    ['Riferimento standard: VSME Digital Template v1.3.0 (EFRAG, giugno 2026)'],
    ['Named ranges conformi alla VSME XBRL Taxonomy pubblicata da EFRAG.'],
  ];
  const readmeWs = XLSX.utils.aoa_to_sheet(readmeRows);
  readmeWs['!cols'] = [{ wch: 90 }];
  XLSX.utils.book_append_sheet(wb, readmeWs, 'Istruzioni');

  return wb;
}

export function downloadVsmeXlsx(reportData, reportMeta = {}) {
  const wb = generateVsmeXlsx(reportData, reportMeta);
  const name = (reportMeta.name || 'vsme-report').replace(/[^a-z0-9_-]/gi, '_');
  const year = reportMeta.year || new Date().getFullYear();
  XLSX.writeFile(wb, `VSME_XBRL_${name}_${year}.xlsx`);
}