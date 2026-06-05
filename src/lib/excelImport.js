/**
 * Excel Import / Export helpers for VSME bulk data entry.
 * Uses the `xlsx` package to read/write workbooks.
 */
import * as XLSX from 'xlsx';

/**
 * Field mapping: Excel column name → data path (section.field)
 * Column names are human-readable Italian labels used in the template.
 */
export const FIELD_MAP = [
  // ── ANAGRAFICA ──────────────────────────────────────────────
  { col: 'Ragione sociale',              path: 'ana.ragione' },
  { col: 'Codice ATECO',                 path: 'ana.ateco' },
  { col: 'Fatturato (€)',               path: 'ana.fatturato' },
  { col: 'Dipendenti totali (ana)',       path: 'ana.hc' },

  // ── ENERGIA ─────────────────────────────────────────────────
  { col: 'Elettricità rete Anno N (kWh)',        path: 'en.elReteN' },
  { col: 'Elettricità rete Anno N-1 (kWh)',      path: 'en.elReteN1' },
  { col: 'Energia FV Anno N (kWh)',              path: 'en.elFVN' },
  { col: 'Energia FV Anno N-1 (kWh)',            path: 'en.elFVN1' },
  { col: 'Potenza FV installata (kWp)',           path: 'en.kWpFV' },
  { col: 'Fattore ISPRA (kgCO₂/kWh)',           path: 'en.ispra' },
  { col: 'Gas naturale Anno N (m³)',              path: 'enfuels.rows[0].quantita' },
  { col: 'Gasolio Anno N (L)',                    path: 'enfuels.rows[1].quantita' },
  { col: 'Benzina Anno N (L)',                    path: 'enfuels.rows[2].quantita' },

  // ── ACQUA ────────────────────────────────────────────────────
  { col: 'Prelievo acquedotto Anno N (m³)',       path: 'acfonti.fonti[0].prelievo' },
  { col: 'Prelievo acquedotto Anno N-1 (m³)',     path: 'acfonti.fonti[0].prelievoN1' },
  { col: 'Prelievo pozzo Anno N (m³)',            path: 'acfonti.fonti[1].prelievo' },
  { col: 'Prelievo pozzo Anno N-1 (m³)',          path: 'acfonti.fonti[1].prelievoN1' },
  { col: 'Scarico idrico Anno N (m³)',            path: 'ac.scaricoN' },
  { col: 'Scarico idrico Anno N-1 (m³)',          path: 'ac.scaricoN1' },

  // ── RIFIUTI ──────────────────────────────────────────────────
  { col: 'Rifiuti totali Anno N (kg)',            path: 'ri.totN' },
  { col: 'Rifiuti totali Anno N-1 (kg)',          path: 'ri.totN1' },
  { col: 'Rifiuti pericolosi Anno N (kg)',        path: 'ri.periN' },
  { col: 'Rifiuti pericolosi Anno N-1 (kg)',      path: 'ri.periN1' },
  { col: 'Rifiuti a recupero Anno N (kg)',        path: 'ri.recN' },
  { col: 'Rifiuti a recupero Anno N-1 (kg)',      path: 'ri.recN1' },

  // ── PERSONALE ────────────────────────────────────────────────
  { col: 'Headcount Anno N',                      path: 'pe.hc' },
  { col: 'Headcount Anno N-1',                    path: 'pe.hcN1' },
  { col: 'FTE Anno N',                            path: 'pe.fte' },
  { col: 'Dipendenti donne Anno N',               path: 'pe.donne' },
  { col: 'Dipendenti donne Anno N-1',             path: 'pe.donneN1' },
  { col: 'Dipendenti uomini Anno N',              path: 'pe.uomini' },
  { col: 'Dipendenti uomini Anno N-1',            path: 'pe.uominiN1' },
  { col: 'Contratti indeterminato',               path: 'pe.indet' },
  { col: 'Contratti determinato',                 path: 'pe.det' },
  { col: 'Part-time',                             path: 'pe.pt' },
  { col: 'Infortuni Anno N',                      path: 'pe.infort' },
  { col: 'Giorni persi infortuni',                path: 'pe.ggPersi' },
  { col: 'Ore lavorate totali',                   path: 'pe.oreLav' },
  { col: 'Giorni assenza',                        path: 'pe.assentGg' },
  { col: 'Retribuzione media annua (€)',         path: 'pe.retMedia' },
  { col: 'Retribuzione media uomini (€)',        path: 'pe.retUom' },
  { col: 'Retribuzione media donne (€)',         path: 'pe.retDon' },
  { col: 'Ore formazione per dip.',               path: 'pe.oreForm' },
  { col: 'Lavoratori disabili',                   path: 'pe.disab' },

  // ── GOVERNANCE ───────────────────────────────────────────────
  { col: 'Componenti CdA',                        path: 'gov.compCDA' },
  { col: 'Donne CdA',                             path: 'gov.donneCDA' },
  { col: 'Codice etico (si/no)',                  path: 'gov.codEtico' },
  { col: 'MOG 231 (si/no)',                       path: 'gov.mog231' },
  { col: 'ISO 14001 (si/no)',                     path: 'gov.iso14001' },
  { col: 'ISO 45001 (si/no)',                     path: 'gov.iso45001' },
  { col: 'SA8000 (si/no)',                        path: 'gov.sa8000' },
  { col: 'Parità di genere (si/no)',              path: 'gov.pariGen' },
  { col: 'Whistleblowing (si/no)',                path: 'gov.wb' },
  { col: 'Condanne Anno N',                       path: 'gov.cond' },
  { col: 'Sanzioni Anno N (€)',                  path: 'gov.san' },
  { col: 'Tempi medi pagamento (gg)',             path: 'gov.tempiPag' },
];

/**
 * Set a value at a dotted path, supporting array notation like acfonti.fonti[0].prelievo
 */
function setDeep(obj, path, value) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (cur[key] === undefined || cur[key] === null) {
      cur[key] = isNaN(parts[i + 1]) ? {} : [];
    }
    cur = cur[key];
  }
  const last = parts[parts.length - 1];
  cur[last] = value;
}

/**
 * Parse an uploaded Excel file and return a partial data object
 * that can be merged into the report data.
 * Returns { data, importedFields, warnings }
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        // Look for "Dati VSME" sheet, fallback to first sheet
        const sheetName = wb.SheetNames.includes('Dati VSME') ? 'Dati VSME' : wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        // Convert to array of rows (first row = headers)
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (rows.length < 2) {
          return reject(new Error('Il foglio non contiene dati. Usa il template scaricabile.'));
        }
        const headers = rows[0].map(h => String(h).trim());
        // Support both horizontal layout (1 data row) and vertical (col A = label, col B = value)
        let record = {};
        const isVertical = headers[0].toLowerCase().includes('campo') || headers[0].toLowerCase().includes('label') || rows.length > 5 && headers.length <= 3;

        if (isVertical) {
          // Vertical: row 0 = headers, rows 1+ = label|value pairs
          rows.slice(1).forEach(row => {
            const label = String(row[0] || '').trim();
            const val = row[1] !== undefined ? row[1] : '';
            if (label) record[label] = val;
          });
        } else {
          // Horizontal: row 0 = headers, row 1 = values
          const dataRow = rows[1];
          headers.forEach((h, i) => {
            if (h) record[h] = dataRow[i] !== undefined ? dataRow[i] : '';
          });
        }

        // Map known columns to data paths
        const data = {};
        const importedFields = [];
        const warnings = [];

        for (const mapping of FIELD_MAP) {
          const raw = record[mapping.col];
          if (raw === '' || raw === undefined || raw === null) continue;
          let value = String(raw).trim();
          // Normalise si/no booleans
          if (['si', 'sì', 'yes', '1', 'true'].includes(value.toLowerCase())) value = 'si';
          else if (['no', '0', 'false'].includes(value.toLowerCase())) value = 'no';
          // Validate numerics (non-boolean paths)
          const isBoolean = mapping.col.toLowerCase().includes('si/no');
          if (!isBoolean) {
            const n = parseFloat(String(value).replace(',', '.'));
            if (!isNaN(n)) value = String(n);
            else if (value !== '') {
              warnings.push(`"${mapping.col}": valore "${value}" ignorato (non numerico)`);
              continue;
            }
          }
          setDeep(data, mapping.path, value);
          importedFields.push(mapping.col);
        }

        resolve({ data, importedFields, warnings });
      } catch (err) {
        reject(new Error('Errore di lettura del file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Impossibile leggere il file.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate and download the blank VSME Excel template.
 */
export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Dati VSME (horizontal, 1 row of data) ───────────
  const headers = FIELD_MAP.map(f => f.col);
  const emptyRow = FIELD_MAP.map(() => '');
  const ws = XLSX.utils.aoa_to_sheet([headers, emptyRow]);

  // Column widths
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 18) }));

  // Style header row (bold) — xlsx community edition has limited styling, use comments instead
  headers.forEach((h, i) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
    if (ws[cellRef]) {
      ws[cellRef].s = { font: { bold: true }, fill: { fgColor: { rgb: 'D6F5E3' } } };
    }
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Dati VSME');

  // ── Sheet 2: Istruzioni ──────────────────────────────────────
  const instructions = [
    ['VSME Builder — Template importazione dati in massa'],
    [''],
    ['ISTRUZIONI'],
    ['1. Compila il foglio "Dati VSME": inserisci i valori nella riga 2 (sotto le intestazioni).'],
    ['2. Valori booleani (si/no): scrivi esattamente "si" o "no" (minuscolo).'],
    ['3. Valori numerici: usa il punto come separatore decimale (es. 1234.56). Non usare simboli valuta.'],
    ['4. Lascia vuota la cella se il dato non è disponibile.'],
    ['5. Salva come .xlsx o .xls e carica tramite il pulsante "Importa da Excel" nel report.'],
    [''],
    ['CAMPI DISPONIBILI'],
    ['Campo', 'Sezione', 'Unità / Note'],
    ...FIELD_MAP.map(f => [
      f.col,
      f.path.split('.')[0].toUpperCase(),
      f.col.match(/\(([^)]+)\)/)?.[1] || '',
    ]),
  ];
  const wsInstr = XLSX.utils.aoa_to_sheet(instructions);
  wsInstr['!cols'] = [{ wch: 45 }, { wch: 14 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsInstr, 'Istruzioni');

  XLSX.writeFile(wb, 'template_vsme_import.xlsx');
}