import PDFDocument from 'pdfkit';
import fs from 'fs';

export const createItineraryPDF = (itineraryData, outputPath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        // Header Background
        doc.rect(0, 0, 595.28, 120).fill('#1E1B4B'); // Deep Indigo-950

        // Header Text
        doc.fillColor('#FFFFFF');
        doc.fontSize(24).font('Helvetica-Bold').text(itineraryData.title.toUpperCase(), 50, 40, { align: 'left' });
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#818CF8').text(`Destination: ${itineraryData.destination}`, 50, 75);

        // Content layout starts at y=150
        doc.x = 50;
        doc.y = 150;

        // Trip Overview
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#4F46E5').text('Trip Overview');
        doc.moveDown(0.4);
        doc.fontSize(10).font('Helvetica').fillColor('#374151').text(itineraryData.overview, { width: 495, align: 'justify', lineGap: 3 });
        doc.moveDown(1.5);

        // Color coding rules for activity types
        const typeColors = {
            flight: '#EF4444',     // Red
            hotel: '#F59E0B',      // Amber
            dining: '#10B981',     // Emerald
            sightseeing: '#06B6D4',// Cyan
            transit: '#6B7280'     // Gray
        };

        // Days & Activities
        for (const day of itineraryData.days) {
            // Draw Day Header
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#1E1B4B').text(`Day ${day.dayNumber}: ${day.theme}`);
            doc.moveDown(0.2);
            if (day.date) {
                doc.fontSize(10).font('Helvetica-Oblique').fillColor('#6B7280').text(day.date);
                doc.moveDown(0.4);
            } else {
                doc.moveDown(0.4);
            }

            // Loop activities
            for (const act of day.activities) {
                // Determine color for activity type
                const color = typeColors[act.type] || '#6B7280';

                // Activity Title, Time and Type Tag (in same line or stacked)
                doc.fontSize(10).font('Helvetica-Bold').fillColor(color).text(`[${act.time || 'All Day'}] `, { continued: true });
                doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827').text(act.title, { continued: true });
                doc.fontSize(9).font('Helvetica-Bold').fillColor(color).text(`  (${act.type.toUpperCase()})`);
                doc.moveDown(0.3);

                // Description
                doc.fontSize(10).font('Helvetica').fillColor('#4B5563').text(act.description, { width: 480, lineGap: 2 });
                
                if (act.location) {
                    doc.moveDown(0.2);
                    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#9CA3AF').text(`Location: ${act.location}`);
                }

                // Add a small divider/space
                doc.moveDown(1);
            }

            doc.moveDown(1.5);
        }

        // Travel Tips Section
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#4F46E5').text('Travel Tips & Guidelines');
        doc.moveDown(0.5);

        for (const tip of itineraryData.travelTips) {
            doc.fontSize(10).font('Helvetica').fillColor('#374151').text(`•  ${tip}`, { width: 495, lineGap: 3 });
            doc.moveDown(0.4);
        }

        // Add page numbers and headers
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            
            // Header for all pages after the first one
            if (i > 0) {
                doc.rect(0, 0, 595.28, 40).fill('#1E1B4B');
                doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold').text(itineraryData.title, 50, 15);
                doc.fillColor('#818CF8').fontSize(9).text(itineraryData.destination, 345, 15, { align: 'right', width: 200 });
            }

            // Footer (runs on all pages)
            doc.fontSize(8).fillColor('#9CA3AF').font('Helvetica').text(
                `Page ${i + 1} of ${pages.count}`,
                50,
                800,
                { align: 'center', width: 495 }
            );
        }

        doc.end();

        writeStream.on('finish', () => resolve());
        writeStream.on('error', (err) => reject(err));
    });
};
