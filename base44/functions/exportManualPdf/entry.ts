import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const doc = new jsPDF();
    
    // Page constraints
    const margin = 18;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxW = pageWidth - margin * 2;
    let y = 20;

    const checkPage = (height) => {
      if (y + height > 280) {
        doc.addPage();
        y = 20;
      }
    };

    // Typography helpers
    const addH1 = (text) => {
      checkPage(18);
      y += 6;
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 163, 74); // green-600
      doc.text(text, margin, y);
      y += 12;
    };

    const addH2 = (text) => {
      checkPage(14);
      y += 4;
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(text, margin, y);
      y += 10;
    };

    const addP = (text) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105); // slate-600
      const lines = doc.splitTextToSize(text, maxW);
      checkPage(lines.length * 6 + 6);
      doc.text(lines, margin, y);
      y += lines.length * 6 + 4;
    };

    const addBullet = (title, text) => {
      doc.setFontSize(11);
      checkPage(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("• " + title + ": ", margin + 4, y);
      
      const titleWidth = doc.getTextWidth("• " + title + ": ");
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105); // slate-600
      
      const lines = doc.splitTextToSize(text, maxW - 8 - titleWidth);
      checkPage(lines.length * 6 + 2);
      
      // first line next to title, others wrapped
      if(lines.length > 0) {
         doc.text(lines[0], margin + 4 + titleWidth, y);
         if(lines.length > 1) {
             const remLines = lines.slice(1);
             doc.text(remLines, margin + 4 + titleWidth, y + 6);
             y += (lines.length - 1) * 6;
         }
      }
      y += 8;
    };

    const fetchImageB64 = async (url) => {
        try {
            const res = await fetch(url);
            const arr = await res.arrayBuffer();
            const uint8 = new Uint8Array(arr);
            let binary = '';
            for (let i = 0; i < uint8.byteLength; i++) {
                binary += String.fromCharCode(uint8[i]);
            }
            return btoa(binary);
        } catch(e) { return null; }
    };

    // Content Building
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Manuale Dettagliato", margin, y);
    y += 10;
    doc.setFontSize(20);
    doc.setTextColor(22, 163, 74);
    doc.text("VSME ESG Builder", margin, y);
    y += 16;

    const coverB64 = await fetchImageB64("https://media.base44.com/images/public/6a207a6e28a8f0aa0202cca9/28af46590_generated_image.png");
    if (coverB64) {
        doc.addImage(coverB64, 'PNG', margin, y, maxW, 60);
        y += 70;
    }

    addH1("1. Il Framework EFRAG e lo Standard VSME");
    addP("L'applicazione è la piattaforma definitiva per il reporting ESG dedicata alle PMI italiane, costruita nativamente sullo standard VSME (Voluntary Standard for SMEs) redatto dall'EFRAG (European Financial Reporting Advisory Group).");
    addP("Il suo scopo è semplificare e automatizzare la raccolta dati, garantendo la conformità alle direttive europee (CSRD) e supportando le aziende nella transizione sostenibile attraverso un'interfaccia guidata, algoritmi di validazione e output pronti per banche e stakeholder.");

    addH1("2. Destinatari e Casi d'Uso");
    addP("Il sistema è progettato per un ecosistema interconnesso di attori del panorama sostenibile italiano:");
    addBullet("PMI (Micro, Piccole, Medie)", "Per auto-valutare le proprie performance ESG, accedere a linee di credito agevolate e qualificarsi come fornitori sostenibili.");
    addBullet("Consulenti e Commercialisti", "Per gestire portafogli di clienti tramite la multi-site dashboard, redigere bilanci in conformità e ridurre i tempi di validazione.");
    addBullet("Banche e Istituti Finanziari", "Fruitori finali dei dati tramite la Relazione PMI-Banche, essenziale per l'erogazione di finanza green in conformità alle direttive EBA.");

    addH1("3. I Moduli di Rendicontazione VSME");
    addP("Il sistema guida l'utente attraverso il Modulo Base e le estensioni avanzate, garantendo la copertura totale degli indicatori ESG:");
    addBullet("B1/C1 (Anagrafica)", "Classificazione dimensionale (FTE, fatturato) e allineamento alla Tassonomia UE.");
    addBullet("B3 (Energia e GHG)", "Calcolo automatico GHG Scope 1, 2 (Location/Market based) e Scope 3, mix rinnovabile.");
    addBullet("B6 (Acqua)", "Prelievi, scarichi e stress idrico localizzato tramite integrazione API geografiche.");
    addBullet("B7 (Rifiuti)", "Mappatura CER, rifiuti pericolosi, e percentuali di riciclo vs smaltimento.");
    addBullet("B4/B5 (Inquinamento/Natura)", "Inventario inquinanti e prossimità a siti protetti (Natura 2000).");
    addBullet("B8-B10 (Sociale)", "Diversità, pay-gap, infortuni, sicurezza, ore di formazione.");
    addBullet("C (Governance)", "Composizione CdA, indipendenza, policy anticorruzione, e certificazioni.");

    const archB64 = await fetchImageB64("https://media.base44.com/images/public/6a207a6e28a8f0aa0202cca9/37718efe0_generated_image.png");
    if (archB64) {
        checkPage(70);
        doc.addImage(archB64, 'PNG', margin, y, maxW, 60);
        y += 70;
    }

    addH1("4. Fonti Dati, AI e Architettura");
    addH2("Integrazione API e Visure");
    addP("L'app azzera il data-entry manuale permettendo l'upload della Visura Camerale: l'Intelligenza Artificiale estrae ATECO, ragione sociale e dipendenti. Le API territoriali arricchiscono il profilo aziendale con dati su clima, qualità dell'aria (PM2.5) e stress idrico.");
    addH2("Data Quality e Anomalie");
    addP("Il motore interno esegue controlli di congruenza in background: verifica salti anno-su-anno, controlla la coerenza matematica (es. dipendenti vs ore) e valida l'intensità energetica per evitare greenwashing involontario.");

    addH1("5. Score ESG ed Esportazione");
    addP("Il punteggio ESG (0-100) viene ricalcolato live ad ogni input, aggregando i pilastri Ambiente, Sociale e Governance. L'algoritmo genera un Rating formale e fornisce raccomandazioni 'AI Coach'.");
    
    addH2("Gli Output Ufficiali:");
    addBullet("Relazione PMI-Banche (PDF)", "Formattata secondo il questionario ABI/MEF per agevolare l'accesso ai finanziamenti.");
    addBullet("Tracciato EFRAG (Excel)", "Export grezzo con named-ranges predisposto per la conversione ufficiale in iXBRL richiesta dalla CSRD.");

    const dashB64 = await fetchImageB64("https://media.base44.com/images/public/6a207a6e28a8f0aa0202cca9/172864a38_generated_image.png");
    if (dashB64) {
        checkPage(70);
        doc.addImage(dashB64, 'PNG', margin, y, maxW, 60);
        y += 70;
    }

    // Convert to base64 carefully
    const pdfBytes = doc.output('arraybuffer');
    const uint8 = new Uint8Array(pdfBytes);
    let binary = '';
    for (let i = 0; i < uint8.byteLength; i++) {
        binary += String.fromCharCode(uint8[i]);
    }
    const b64 = btoa(binary);

    return Response.json({ base64: b64 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});