const PDFDocument = require('pdfkit');

function fmt(amount) {
  return (Number(amount) || 0).toFixed(3) + ' DT';
}

function fmtDate(date) {
  try {
    return new Date(date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return String(date);
  }
}

// Write a two-column row: label on the left, value right-aligned
function row(doc, label, value, { x = 50, width = 146, y, fontSize = 8, bold = false, lineGap = 4 } = {}) {
  const ry = y !== undefined ? y : doc.y;
  doc.fontSize(fontSize).font('Helvetica').text(label, x, ry, { width: width * 0.6, lineBreak: false });
  doc.fontSize(fontSize).font(bold ? 'Helvetica-Bold' : 'Helvetica').text(value, x, ry, { width, align: 'right', lineBreak: false });
  doc.y = ry + fontSize * 1.35 + lineGap;
  doc.x = x;
}

// ─── Receipt (80mm thermal width) ────────────────────────────────────────────

exports.generateReceipt = (payment, order, restaurant) => {
  return new Promise((resolve, reject) => {
    const W = 226; // 80mm in pts
    const M = 20;  // margin
    const cw = W - 2 * M;

    const doc = new PDFDocument({ size: [W, 842], margin: M, autoFirstPage: true });
    const bufs = [];
    doc.on('data', (d) => bufs.push(d));
    doc.on('end',  () => resolve(Buffer.concat(bufs)));
    doc.on('error', reject);

    // Header
    doc.font('Helvetica-Bold').fontSize(13).text(restaurant.name || 'Restaurant', { align: 'center', width: cw });
    if (restaurant.address) doc.font('Helvetica').fontSize(7).text(restaurant.address, { align: 'center', width: cw });
    if (restaurant.phone)   doc.font('Helvetica').fontSize(7).text(restaurant.phone, { align: 'center', width: cw });
    doc.moveDown(0.4);

    doc.moveTo(M, doc.y).lineTo(W - M, doc.y).stroke();
    doc.moveDown(0.3);

    // Receipt meta
    doc.font('Helvetica').fontSize(7).text(`N ${String(order.id || '').slice(-8).toUpperCase()}   ${fmtDate(payment.processed_at || new Date())}`, { width: cw });
    if (order.table) doc.text(`Table N${String.fromCharCode(176)}${order.table.number ?? order.table.name}`, { width: cw });
    doc.moveDown(0.3);

    doc.moveTo(M, doc.y).lineTo(W - M, doc.y).stroke();
    doc.moveDown(0.3);

    // Items table — Qte / Produit / Total columns
    const colQty   = 26;
    const colTotal = 48;
    const colName  = cw - colQty - colTotal;

    doc.font('Helvetica-Bold').fontSize(7);
    const hy = doc.y;
    doc.text('Qte',     M,          hy, { width: colQty,  lineBreak: false });
    doc.text('Produit', M + colQty, hy, { width: colName, lineBreak: false });
    doc.text('Total',   M,          hy, { width: cw,      align: 'right', lineBreak: false });
    doc.y = hy + 10;
    doc.x = M;
    doc.moveDown(0.2);
    doc.moveTo(M, doc.y).lineTo(W - M, doc.y).stroke();
    doc.moveDown(0.3);

    const items = order.items || [];
    items.forEach((item) => {
      const name = String(item.name_snapshot || '');
      const qty  = Number(item.quantity) || 0;
      const lineTotal = Number(item.unit_price) * qty;

      const iy = doc.y;
      doc.font('Helvetica').fontSize(7.5);
      const nameHeight = doc.heightOfString(name, { width: colName });

      doc.text(String(qty),          M,          iy, { width: colQty,  lineBreak: false });
      doc.text(name,                 M + colQty, iy, { width: colName });
      doc.text(lineTotal.toFixed(3), M,          iy, { width: cw,      align: 'right', lineBreak: false });

      doc.y = iy + Math.max(nameHeight, 9) + 3;
      doc.x = M;

      const sups = item.supplements || [];
      sups.forEach((s) => {
        if (Number(s.extra_price) > 0) {
          const sName = `  + ${String(s.option_name_snapshot || '')}`;
          const sy = doc.y;
          doc.fontSize(7);
          const sHeight = doc.heightOfString(sName, { width: colQty + colName });
          doc.text(sName,                            M, sy, { width: colQty + colName });
          doc.text(Number(s.extra_price).toFixed(3), M, sy, { width: cw, align: 'right', lineBreak: false });
          doc.y = sy + Math.max(sHeight, 8) + 2;
          doc.x = M;
        }
      });
    });

    doc.moveDown(0.3);
    doc.moveTo(M, doc.y).lineTo(W - M, doc.y).stroke();
    doc.moveDown(0.3);

    // Totals
    const ttp = Number(order.total);
    if (Number(payment.discount_amount) > 0) {
      row(doc, 'Remise', `- ${fmt(payment.discount_amount)}`, { x: M, width: cw, fontSize: 7 });
    }
    row(doc, 'TOTAL', fmt(ttp), { x: M, width: cw, fontSize: 10, bold: true });

    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(7).text(`Mode: ${payment.method === 'CASH' ? 'Especes' : 'Carte bancaire'}`, { width: cw });
    if (payment.method === 'CASH' && Number(payment.change_given) > 0) {
      doc.text(`Monnaie rendue: ${fmt(payment.change_given)}`, { width: cw });
    }
    if (payment.processedBy?.name) {
      doc.text(`Servi par: ${payment.processedBy.name}`, { width: cw });
    }

    doc.moveDown(0.4);
    doc.moveTo(M, doc.y).lineTo(W - M, doc.y).stroke();
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(8).text('Merci pour votre visite !', { align: 'center', width: cw });

    doc.end();
  });
};

// ─── Invoice (A4) ─────────────────────────────────────────────────────────────

exports.generateInvoice = (invoice, restaurant, subscription) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const bufs = [];
    doc.on('data', (d) => bufs.push(d));
    doc.on('end',  () => resolve(Buffer.concat(bufs)));
    doc.on('error', reject);

    const cw = 495;

    // Header
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#1E40AF').text('FACTURE', { align: 'right', width: cw });
    doc.font('Helvetica').fontSize(9).fillColor('#555').text('Hannibal Advanced Solutions', { align: 'right', width: cw });
    doc.text('www.hannibaladvanced.com', { align: 'right', width: cw });
    doc.fillColor('#000').moveDown(1.2);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ddd').lineWidth(1).stroke();
    doc.moveDown(0.8);

    // Two-column: recipient (left) + invoice details (right)
    const topY = doc.y;

    // Left: recipient
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#888').text('FACTURE A', 50, topY);
    doc.font('Helvetica').fontSize(10).fillColor('#000');
    doc.text(restaurant.fiscal_company || restaurant.name || '', 50, topY + 14);
    if (restaurant.fiscal_address || restaurant.address) {
      doc.text(restaurant.fiscal_address || restaurant.address, 50, doc.y, { width: 220 });
    }
    if (restaurant.fiscal_matricule) doc.text(`Matricule fiscal : ${restaurant.fiscal_matricule}`, 50);
    if (restaurant.phone) doc.text(`Tel : ${restaurant.phone}`, 50);

    // Right: invoice meta
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#888').text('INFORMATIONS FACTURE', 330, topY);
    doc.font('Helvetica').fontSize(10).fillColor('#000');
    doc.text(`N : ${invoice.invoice_number || String(invoice.id).slice(-8).toUpperCase()}`, 330, topY + 14);
    const issuedFmt = invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const dueFmt    = invoice.due_at    ? new Date(invoice.due_at).toLocaleDateString('fr-FR')    : '';
    doc.text(`Date : ${issuedFmt}`, 330);
    if (dueFmt) doc.text(`Echeance : ${dueFmt}`, 330);
    const statusLabel = { PAID: 'PAYEE', PENDING: 'EN ATTENTE', CANCELLED: 'ANNULEE' }[invoice.status] || invoice.status;
    doc.text(`Statut : ${statusLabel}`, 330);
    if (subscription?.plan) {
      doc.font('Helvetica-Bold').fillColor('#1E40AF').text(`Plan : ${subscription.plan}`, 330);
      doc.font('Helvetica').fillColor('#000');
    }

    doc.y = topY + 100;
    doc.x = 50;
    doc.moveDown(0.5);

    // Table header
    const th = doc.y;
    doc.fillColor('#1E40AF').rect(50, th, cw, 22).fill();
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(9);
    doc.text('Description', 58, th + 7, { width: 220, lineBreak: false });
    doc.text('Periode', 285, th + 7, { width: 130, lineBreak: false });
    doc.text('Montant HT', 415, th + 7, { width: 125, align: 'right', lineBreak: false });
    doc.fillColor('#000');
    doc.y = th + 30;
    doc.x = 50;

    // Single line item
    const planName  = subscription?.plan || '';
    const planLabel = planName ? `Plan ${planName}` : 'Abonnement MenuQR';
    const periodStr = subscription?.starts_at && subscription?.ends_at
      ? `${new Date(subscription.starts_at).toLocaleDateString('fr-FR')} - ${new Date(subscription.ends_at).toLocaleDateString('fr-FR')}`
      : (subscription?.starts_at ? new Date(subscription.starts_at).toLocaleDateString('fr-FR') : '');
    const totalTTC = Number(invoice.amount) || 0;
    const TVA      = 0.19;
    const ht       = totalTTC / (1 + TVA);
    const tva      = totalTTC - ht;

    doc.font('Helvetica').fontSize(10);
    const lY = doc.y;
    doc.text(`Abonnement MenuQR - ${planLabel}`, 58, lY, { width: 220, lineBreak: false });
    doc.text(periodStr, 285, lY, { width: 130, lineBreak: false });
    doc.text(fmt(ht), 415, lY, { width: 125, align: 'right', lineBreak: false });
    doc.y = lY + 18;
    doc.x = 50;

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#eee').stroke();
    doc.moveDown(1);

    // Totals block (right-aligned)
    const tx = 350;
    const tw = 190;
    row(doc, 'Sous-total HT', fmt(ht),       { x: tx, width: tw, fontSize: 10 });
    row(doc, 'TVA 19 %',      fmt(tva),       { x: tx, width: tw, fontSize: 10 });
    doc.moveTo(tx, doc.y).lineTo(545, doc.y).strokeColor('#333').lineWidth(1).stroke();
    doc.moveDown(0.3);
    row(doc, 'TOTAL TTC', fmt(totalTTC), { x: tx, width: tw, fontSize: 12, bold: true });
    doc.font('Helvetica').fontSize(8).fillColor('#666').text(`Devise : ${invoice.currency || 'DT'}`, tx, doc.y, { width: tw, align: 'right' });
    doc.fillColor('#000');

    // Footer
    doc.y = 750;
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ddd').stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(8).fillColor('#888').text('Merci de votre confiance  -  Hannibal Advanced Solutions', { align: 'center', width: cw });
    doc.text(`Genere le ${new Date().toLocaleString('fr-FR')}`, { align: 'center', width: cw });

    doc.end();
  });
};

// ─── Service Report (A4) ──────────────────────────────────────────────────────

exports.generateServiceReport = (serviceClose, restaurant) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const bufs = [];
    doc.on('data', (d) => bufs.push(d));
    doc.on('end',  () => resolve(Buffer.concat(bufs)));
    doc.on('error', reject);

    const cw = 495; // 595 - 2*50

    doc.font('Helvetica-Bold').fontSize(22).text('Rapport de Cloture de Service', { align: 'center', width: cw });
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(14).text(restaurant.name || 'Restaurant', { align: 'center', width: cw });
    doc.fontSize(11).text(`Date: ${serviceClose.date}`, { align: 'center', width: cw });
    doc.moveDown(1.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    const dataRows = [
      ['Nombre de commandes', String(serviceClose.total_orders), false],
      ['Chiffre d\'affaires Especes', fmt(serviceClose.total_cash), false],
      ['Chiffre d\'affaires Carte', fmt(serviceClose.total_card), false],
      ['Chiffre d\'affaires Total', fmt(serviceClose.total_revenue), true],
    ];

    dataRows.forEach(([label, value, bold]) => {
      row(doc, label, value, { x: 50, width: cw, fontSize: 13, bold, lineGap: 8 });
      doc.moveDown(0.2);
    });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    if (serviceClose.notes) {
      doc.font('Helvetica').fontSize(11).text(`Notes: ${serviceClose.notes}`, { width: cw });
      doc.moveDown(0.5);
    }

    doc.font('Helvetica').fontSize(9).fillColor('#888888').text(`Genere le ${new Date().toLocaleString('fr-FR')}`, { align: 'right', width: cw });
    doc.end();
  });
};
