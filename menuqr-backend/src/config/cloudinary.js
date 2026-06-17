const cloudinary = require('cloudinary').v2;
const fs   = require('fs');
const path = require('path');
require('dotenv').config();

const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Legacy: buffer-only upload (Cloudinary only)
async function uploadBuffer(buffer, folder, publicId) {
  if (!isConfigured) {
    console.warn('[Cloudinary] Non configuré — upload ignoré');
    return null;
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: 'image', format: 'webp', quality: 80 },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// Preferred: accepts a multer file object { buffer, originalname, mimetype }
// Tries Cloudinary first, always falls back to local disk on any failure
async function uploadImage(file, folder, publicId) {
  if (isConfigured) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, public_id: publicId, resource_type: 'image', format: 'webp', quality: 80 },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(file.buffer);
      });
      if (result?.secure_url) return result;
      console.warn('[Cloudinary] Résultat sans secure_url — bascule stockage local');
    } catch (err) {
      console.warn('[Cloudinary] Échec upload — bascule stockage local:', err.message);
    }
  }

  // Local fallback — always works
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const safeFolder = folder.replace(/^menuqr\//, '');
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads', safeFolder);
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = `${publicId}${ext}`;
  fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
  return { secure_url: `${baseUrl}/uploads/${safeFolder}/${filename}` };
}

module.exports = { cloudinary, uploadBuffer, uploadImage, isConfigured };
