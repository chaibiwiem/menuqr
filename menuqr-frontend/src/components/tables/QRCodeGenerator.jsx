import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useTranslation } from 'react-i18next';
import { Download, RefreshCw, X, Loader2 } from 'lucide-react';

export default function QRCodeGenerator({ table, restaurantSlug, restaurantLogoUrl, onClose, onRegenerate }) {
  const { t } = useTranslation();
  const [dataUrl, setDataUrl] = useState(null);
  const [generating, setGenerating] = useState(true);

  const qrUrl = `${window.location.origin}/${restaurantSlug}/table/${table.qr_token}`;

  useEffect(() => {
    setGenerating(true);
    const SIZE = 512;

    QRCode.toDataURL(qrUrl, {
      width: SIZE,
      margin: 3,
      color: { dark: '#111827', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
      .then((qrDataUrl) => {
        if (!restaurantLogoUrl) {
          setDataUrl(qrDataUrl);
          setGenerating(false);
          return;
        }

        // Canvas-based logo overlay (no sharp needed)
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');

        const qrImg = new Image();
        qrImg.onload = () => {
          ctx.drawImage(qrImg, 0, 0, SIZE, SIZE);

          const logo = new Image();
          logo.crossOrigin = 'anonymous';
          logo.onload = () => {
            const logoSize = Math.round(SIZE * 0.20);
            const logoX = (SIZE - logoSize) / 2;
            const logoY = (SIZE - logoSize) / 2;
            const pad = 8;

            // White square background behind logo
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(logoX - pad, logoY - pad, logoSize + pad * 2, logoSize + pad * 2);

            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
            setDataUrl(canvas.toDataURL('image/png'));
            setGenerating(false);
          };
          logo.onerror = () => {
            // Fallback: QR without logo
            setDataUrl(qrDataUrl);
            setGenerating(false);
          };
          logo.src = restaurantLogoUrl;
        };
        qrImg.src = qrDataUrl;
      })
      .catch(() => setGenerating(false));
  }, [qrUrl, restaurantLogoUrl]);

  function downloadPNG() {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qr-${table.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  }

  function downloadPDF() {
    if (!dataUrl) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>QR — ${table.name}</title>
      <style>
        body { margin:0; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; }
        img { width:300px; height:300px; }
        h2 { margin-top:16px; font-size:20px; }
        p { font-size:13px; color:#666; margin:4px 0; }
      </style></head>
      <body>
        <img src="${dataUrl}" />
        <h2>${table.name}</h2>
        <p>Capacité : ${table.capacity} couverts</p>
        <p style="font-size:11px;color:#aaa">${qrUrl}</p>
        <script>window.onload = () => { window.print(); }<\/script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={onClose} />
      <div
        className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-white rounded-3xl shadow-2xl p-6 w-full max-w-xs flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="text-base font-bold text-gray-900">QR — {table.name}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="w-52 h-52 flex items-center justify-center bg-white rounded-2xl border border-gray-200 p-2">
          {generating ? (
            <Loader2 size={28} className="animate-spin text-orange-400" />
          ) : dataUrl ? (
            <img src={dataUrl} alt={`QR ${table.name}`} className="w-full h-full" />
          ) : (
            <p className="text-xs text-gray-400">{t('common.error')}</p>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center break-all px-2">{qrUrl}</p>

        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={downloadPNG}
            disabled={generating || !dataUrl}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            <Download size={13} /> PNG
          </button>
          <button
            type="button"
            onClick={downloadPDF}
            disabled={generating || !dataUrl}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={13} /> PDF
          </button>
          {onRegenerate && (
            <button
              type="button"
              onClick={() => { onRegenerate(); onClose(); }}
              className="px-3 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50"
              title={t('tables.regenerate_qr')}
            >
              <RefreshCw size={13} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
