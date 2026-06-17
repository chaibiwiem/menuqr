const QRCode = require('qrcode');
const { uploadBuffer, isConfigured } = require('../config/cloudinary');

/**
 * Generate a QR code PNG buffer for a table.
 * Uploads to Cloudinary if configured, otherwise returns a base64 data URL.
 * sharp logo overlay skipped (Node 18.14 incompatibility).
 */
async function generateQRCode(table, restaurant) {
  const url = `${process.env.APP_URL || 'http://localhost:5173'}/${restaurant.slug}/table/${table.qr_token}`;

  const buffer = await QRCode.toBuffer(url, {
    type: 'png',
    width: 512,
    margin: 2,
    color: { dark: '#111827', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  });

  if (isConfigured) {
    const result = await uploadBuffer(
      buffer,
      `menuqr/${restaurant.slug}/qr`,
      `table-${table.id}`
    );
    if (result?.secure_url) {
      await table.update({ qr_url: result.secure_url });
      return result.secure_url;
    }
  }

  // Fallback: store as data URL
  const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
  await table.update({ qr_url: dataUrl });
  return dataUrl;
}

/**
 * Return the QR URL for a table, (re)generating if missing.
 */
async function getOrGenerateQR(table, restaurant) {
  if (table.qr_url) return table.qr_url;
  return generateQRCode(table, restaurant);
}

/**
 * Generate QR PNG buffers for a list of tables.
 * Returns [{ buffer, name }] — caller handles ZIP packaging.
 */
async function exportQRBatch(tables, restaurant) {
  const files = [];
  for (const table of tables) {
    const url = `${process.env.APP_URL || 'http://localhost:5173'}/${restaurant.slug}/table/${table.qr_token}`;
    const buffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: 512,
      margin: 2,
      color: { dark: '#111827', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    });
    const safeName = (table.name || `table-${table.id}`)
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    const folder = table.room?.name
      ? `${table.room.name.replace(/\s+/g, '-').toLowerCase()}/`
      : '';
    files.push({ buffer, name: `${folder}${safeName}-${table.qr_token.slice(0, 8)}.png` });
  }
  return files;
}

module.exports = { generateQRCode, getOrGenerateQR, exportQRBatch };
