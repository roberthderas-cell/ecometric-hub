import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'npm:docx@8.5.0';

Deno.serve(async (req) => {
  try {
    // Helper to fetch and buffer images for Word document
    const fetchImage = async (url: string) => {
        const res = await fetch(url);
        return await res.arrayBuffer();
    };

    const coverBuffer = await fetchImage("https://media.base44.com/images/public/6a207a6e28a8f0aa0202cca9/28af46590_generated_image.png");
    const archBuffer = await fetchImage("https://media.base44.com/images/public/6a207a6e28a8f0aa0202cca9/37718efe0_generated_image.png");
    const dashBuffer = await fetchImage("https://media.base44.com/images/public/6a207a6e28a8f0aa0202cca9/172864a38_generated_image.png");

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                // Cover Image
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: coverBuffer,
                            transformation: { width: 600, height: 200 },
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    text: "Manuale Utente — VSME ESG Builder",
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400, after: 400 }
                }),

                // Intro
                new Paragraph({
                    text: "Introduzione alla piattaforma",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 300, after: 200 }
                }),
                new Paragraph({
                    text: "La piattaforma definitiva per il reporting ESG dedicata alle PMI italiane. Basata sullo standard VSME (Voluntary Standard for SMEs) di EFRAG, integra le linee guida EFRAG 2026 e il framework di dialogo PMI-Banche sulla sostenibilità."
                }),
                
                // Users
                new Paragraph({
                    text: "Destinatari e Utenti",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 300, after: 200 }
                }),
                new Paragraph({ text: "• PMI e Imprese: Aziende che devono o desiderano rendicontare la propria sostenibilità." }),
                new Paragraph({ text: "• Consulenti e Commercialisti: Professionisti che compilano e validano report per conto dei propri clienti." }),
                new Paragraph({ text: "• Banche e Istituti: Destinatari finali dei report (tramite la 'Relazione per la Banca' ottimizzata)." }),
                new Paragraph({ text: "• Amministratori: Management aziendale che monitora storici, KPI e benchmark di settore." }),

                // Architecture
                new Paragraph({
                    text: "Fonti Dati e Architettura",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 300, after: 200 }
                }),
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: archBuffer,
                            transformation: { width: 500, height: 250 },
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: "Moduli Dati", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "L'app struttura i dati in moduli specifici: Anagrafica e Taxonomy UE (B1/C1), Energia e GHG (B3), Acqua (B6), Rifiuti (B7), Inquinamento (B4), Biodiversità (B5), Personale (B8-B10) e Governance (C)." }),
                
                new Paragraph({ text: "Integrazione Automatica", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "I dati provengono da input manuali (guidati da tooltip EFRAG), import massivo Excel/CSV, estrazione AI da visura camerale, e API territoriali (clima, aria, rischio idrico)." }),

                new Paragraph({ text: "Riferimenti Normativi", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "Standard EFRAG VSME/ESRS, framework Dialogo PMI-Banche (MEF), e D.Lgs. 152/2006 (gestione rifiuti ambientali)." }),

                // Flow
                new Paragraph({
                    text: "Flusso d'Utilizzo e Score",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 300, after: 200 }
                }),
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: dashBuffer,
                            transformation: { width: 500, height: 250 },
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),
                new Paragraph({ text: "1. Onboarding: Inserisci i dati anagrafici e la visura." }),
                new Paragraph({ text: "2. Compilazione: Naviga le sezioni Ambiente, Sociale, Governance. I dati vengono validati live." }),
                new Paragraph({ text: "3. Dashboard: Analizza lo score ESG, gli alert e i benchmark in tempo reale." }),
                new Paragraph({ text: "4. Export: Genera la relazione in PDF per la banca o il tracciato XBRL." }),

                new Paragraph({ text: "Calcolo dello Score ESG", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "L'algoritmo calcola in locale un punteggio da 0 a 100 suddiviso per pilastri (E, S, G), generando un rating da 'Base' a 'Leader' aggiornato ad ogni input." }),
            ],
        }],
    });

    const b64 = await Packer.toBase64String(doc);
    return Response.json({ base64: b64 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});