const PDFDocument = require('pdfkit');

/**
 * Generates a professional quote PDF buffer.
 * @param {object} quote - Mongoose Quote document (populated)
 * @returns {Promise<Buffer>}
 */
const generateQuotePDF = (quote) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const primary = '#1E40AF';
      const gray = '#6B7280';
      const light = '#F3F4F6';
      const pageWidth = doc.page.width - 100;

      // ── Header Background ────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 120).fill(primary);

      // ── Company Name ─────────────────────────────────────────
      doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold').text('QuoteForge', 50, 35);
      doc.fontSize(10).font('Helvetica').text('Product Configuration & Pricing System', 50, 65);
      doc.fontSize(9).text('enterprise.quoteforge.com  |  support@quoteforge.com', 50, 80);

      // ── Quote Title (right aligned) ──────────────────────────
      doc.fillColor('#DBEAFE').fontSize(22).font('Helvetica-Bold').text('QUOTATION', 0, 38, { align: 'right' });
      doc.fillColor('#BFDBFE').fontSize(11).font('Helvetica').text(quote.quoteNumber, 0, 68, { align: 'right' });

      doc.moveDown(5);

      // ── Meta Info ────────────────────────────────────────────
      doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold').text('QUOTE DETAILS', 50, 140);
      doc.moveTo(50, 155).lineTo(doc.page.width - 50, 155).strokeColor(primary).lineWidth(1.5).stroke();

      const metaY = 165;
      const col2 = 320;

      doc.font('Helvetica').fillColor(gray).fontSize(9);
      doc.text('Quote Number:', 50, metaY);
      doc.fillColor('#111827').text(quote.quoteNumber, 150, metaY);

      doc.fillColor(gray).text('Date:', 50, metaY + 16);
      doc.fillColor('#111827').text(new Date(quote.createdAt).toLocaleDateString('en-IN'), 150, metaY + 16);

      doc.fillColor(gray).text('Valid Until:', 50, metaY + 32);
      doc.fillColor('#111827').text(
        quote.validUntil
          ? new Date(quote.validUntil).toLocaleDateString('en-IN')
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
        150,
        metaY + 32
      );

      doc.fillColor(gray).text('Status:', 50, metaY + 48);
      doc.fillColor('#111827').text(quote.status.toUpperCase(), 150, metaY + 48);

      // Customer info (right column)
      doc.fillColor(gray).text('Bill To:', col2, metaY);
      doc.fillColor('#111827').font('Helvetica-Bold').text(quote.customer.name, col2 + 60, metaY);
      doc.font('Helvetica').text(quote.customer.email, col2 + 60, metaY + 16);
      if (quote.customer.company) doc.text(quote.customer.company, col2 + 60, metaY + 32);
      if (quote.customer.phone) doc.text(quote.customer.phone, col2 + 60, metaY + 48);

      // Sales Rep
      doc.fillColor(gray).text('Sales Rep:', col2, metaY + 64);
      doc.fillColor('#111827').text(quote.salesRep?.name || 'N/A', col2 + 60, metaY + 64);

      doc.moveDown(1);

      // ── Product Section ──────────────────────────────────────
      const prodY = metaY + 100;
      doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold').text('PRODUCT CONFIGURATION', 50, prodY);
      doc.moveTo(50, prodY + 15).lineTo(doc.page.width - 50, prodY + 15).strokeColor(primary).lineWidth(1.5).stroke();

      // Product name bar
      doc.rect(50, prodY + 22, pageWidth, 28).fill(light);
      doc.fillColor(primary).fontSize(11).font('Helvetica-Bold')
        .text(quote.product.name, 60, prodY + 30);
      doc.fillColor(gray).fontSize(9).font('Helvetica')
        .text(quote.product.category || 'Industrial', 60, prodY + 44);

      // Configuration table
      const configEntries = Object.entries(quote.configuration || {});
      let configY = prodY + 58;
      doc.fillColor('#111827').fontSize(9).font('Helvetica-Bold');

      if (configEntries.length > 0) {
        configEntries.forEach(([key, val], idx) => {
          if (idx % 2 === 0) {
            doc.rect(50, configY, pageWidth, 18).fill(light);
          }
          doc.fillColor(gray).font('Helvetica').text(
            key.charAt(0).toUpperCase() + key.slice(1),
            60, configY + 4
          );
          doc.fillColor('#111827').font('Helvetica-Bold').text(
            String(val).charAt(0).toUpperCase() + String(val).slice(1),
            300, configY + 4
          );
          configY += 18;
        });
      }

      // ── Pricing Breakdown ────────────────────────────────────
      const priceY = configY + 20;
      doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold').text('PRICING BREAKDOWN', 50, priceY);
      doc.moveTo(50, priceY + 15).lineTo(doc.page.width - 50, priceY + 15).strokeColor(primary).lineWidth(1.5).stroke();

      // Table header
      const tableHeaderY = priceY + 22;
      doc.rect(50, tableHeaderY, pageWidth, 22).fill(primary);
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
      doc.text('#', 60, tableHeaderY + 6);
      doc.text('Description', 80, tableHeaderY + 6);
      doc.text('Amount (₹)', doc.page.width - 130, tableHeaderY + 6);

      let lineY = tableHeaderY + 22;

      // Base price row
      doc.rect(50, lineY, pageWidth, 20).fill(idx => idx % 2 === 0 ? light : '#FFFFFF');
      doc.rect(50, lineY, pageWidth, 20).fill(light);
      doc.fillColor('#111827').font('Helvetica').fontSize(9);
      doc.text('1', 60, lineY + 5);
      doc.text('Base Product Price', 80, lineY + 5);
      doc.text(`₹ ${Number(quote.basePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, doc.page.width - 130, lineY + 5);
      lineY += 20;

      // Line items (rule-based additions)
      (quote.lineItems || []).forEach((item, i) => {
        if (i % 2 !== 0) doc.rect(50, lineY, pageWidth, 20).fill(light);
        doc.fillColor('#111827').font('Helvetica').fontSize(9);
        doc.text(String(i + 2), 60, lineY + 5);
        doc.text(item.description, 80, lineY + 5);
        doc.text(`₹ ${Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, doc.page.width - 130, lineY + 5);
        lineY += 20;
      });

      // Total row
      lineY += 5;
      doc.rect(50, lineY, pageWidth, 28).fill(primary);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11);
      doc.text('TOTAL PRICE', 60, lineY + 8);
      doc.text(
        `₹ ${Number(quote.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        doc.page.width - 160, lineY + 8
      );

      // ── Notes ──────────────────────────────────────────────
      if (quote.notes) {
        lineY += 45;
        doc.fillColor(gray).fontSize(9).font('Helvetica-Bold').text('NOTES', 50, lineY);
        doc.font('Helvetica').fillColor('#374151').text(quote.notes, 50, lineY + 14, { width: pageWidth });
      }

      // ── Footer ────────────────────────────────────────────
      doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(primary);
      doc.fillColor('#BFDBFE').fontSize(8).font('Helvetica')
        .text(
          'This quotation is valid for 30 days from the date of issue. Prices are subject to change without prior notice.',
          50,
          doc.page.height - 38,
          { align: 'center', width: doc.page.width - 100 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateQuotePDF };
