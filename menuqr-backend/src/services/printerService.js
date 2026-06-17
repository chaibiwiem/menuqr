/**
 * ESC/POS thermal printer service.
 * Requires a physical printer connected via USB/LAN/Bluetooth.
 * PRINTER_INTERFACE not set in .env => simulation (ticket logged to console instead of printing).
 */

const { printer: Printer, types: PrinterTypes } = require('node-thermal-printer');

const formatDT = (amount) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('fr-TN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value) + ' DT';
};

function getPrinterInterface() {
  return process.env.PRINTER_INTERFACE || null;
}

function buildPrinter(iface) {
  return new Printer({
    type: PrinterTypes.EPSON,
    interface: iface || 'tcp://127.0.0.1',
    width: 42,
    removeSpecialCharacters: false,
  });
}

async function dispatch(p, label) {
  const iface = getPrinterInterface();
  if (!iface) {
    console.log(`\n[PRINTER — ${label}] (simulation, PRINTER_INTERFACE non configure)\n` + p.getText());
    p.clear();
    return;
  }
  try {
    const isConnected = await p.isPrinterConnected();
    if (!isConnected) throw new Error('Imprimante non connectee');
    await p.execute();
  } catch (err) {
    console.error('[PRINTER]', err.message);
    throw new Error('Imprimante non disponible : ' + err.message);
  } finally {
    p.clear();
  }
}

// ─── Kitchen order ticket ───────────────────────────────────────────────────

exports.printOrder = async (order, restaurant) => {
  const p = buildPrinter(getPrinterInterface());

  p.alignCenter();
  p.bold(true);
  p.println(`COMMANDE #${String(order.id).slice(-6).toUpperCase()}`);
  p.bold(false);
  p.println(`Table: ${order.table?.name || '-'}`);
  p.println(new Date(order.created_at).toLocaleString('fr-TN'));
  p.drawLine();

  p.alignLeft();
  for (const item of order.items || []) {
    p.println(`${item.quantity}x ${item.name_snapshot}`);
    for (const sup of item.supplements || []) {
      p.println(`   + ${sup.option_name_snapshot}${sup.extra_price > 0 ? ' ' + formatDT(sup.extra_price) : ''}`);
    }
  }
  p.drawLine();
  p.bold(true);
  p.leftRight('TOTAL', formatDT(order.total));
  p.bold(false);
  if (order.notes) p.println(`Note: ${order.notes}`);
  p.cut();

  await dispatch(p, 'ORDER TICKET');
};

// ─── Customer payment receipt ────────────────────────────────────────────────

exports.printReceipt = async (payment, order, restaurant) => {
  const p = buildPrinter(getPrinterInterface());

  p.alignCenter();
  p.bold(true);
  p.println(restaurant.name || 'Restaurant');
  p.bold(false);
  if (restaurant.address) p.println(restaurant.address);
  if (restaurant.phone)   p.println(restaurant.phone);
  p.drawLine();

  p.alignLeft();
  p.println(`N ${String(order.id || '').slice(-8).toUpperCase()}   ${new Date(payment.processed_at || Date.now()).toLocaleString('fr-FR')}`);
  if (order.table) p.println(`Table N${String.fromCharCode(176)}${order.table.number ?? order.table.name}`);
  p.drawLine();

  p.tableCustom([
    { text: 'Qte',     align: 'LEFT',  width: 0.18, bold: true },
    { text: 'Produit', align: 'LEFT',  width: 0.52, bold: true },
    { text: 'Total',   align: 'RIGHT', width: 0.30, bold: true },
  ]);
  p.drawLine();

  for (const item of order.items || []) {
    const qty = Number(item.quantity) || 0;
    const lineTotal = Number(item.unit_price) * qty;
    p.tableCustom([
      { text: String(qty),                      align: 'LEFT',  width: 0.18 },
      { text: String(item.name_snapshot || ''), align: 'LEFT',  width: 0.52 },
      { text: lineTotal.toFixed(3),              align: 'RIGHT', width: 0.30 },
    ]);
    for (const sup of item.supplements || []) {
      if (Number(sup.extra_price) > 0) {
        p.tableCustom([
          { text: `  + ${sup.option_name_snapshot || ''}`, align: 'LEFT',  width: 0.70 },
          { text: Number(sup.extra_price).toFixed(3),       align: 'RIGHT', width: 0.30 },
        ]);
      }
    }
  }

  p.drawLine();
  if (Number(payment.discount_amount) > 0) {
    p.leftRight('Remise', `- ${formatDT(payment.discount_amount)}`);
  }
  p.bold(true);
  p.setTextDoubleHeight();
  p.leftRight('TOTAL', formatDT(order.total));
  p.setTextNormal();
  p.bold(false);

  p.println(`Mode: ${payment.method === 'CASH' ? 'Especes' : 'Carte bancaire'}`);
  if (payment.method === 'CASH' && Number(payment.change_given) > 0) {
    p.println(`Monnaie rendue: ${formatDT(payment.change_given)}`);
  }
  if (payment.processedBy?.name) {
    p.println(`Servi par: ${payment.processedBy.name}`);
  }

  p.drawLine();
  p.alignCenter();
  p.println('Merci pour votre visite !');
  p.cut();

  await dispatch(p, 'RECEIPT');
};
