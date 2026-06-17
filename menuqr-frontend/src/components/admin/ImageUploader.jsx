import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ImageUploader({ label, hint, accept = 'image/*', value, onChange, aspectRatio }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onChange({ file, preview: url });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleChange(e) {
    handleFile(e.target.files[0]);
  }

  function remove() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  const preview = value?.preview;

  return (
    <div>
      {label && <p className="text-sm font-medium text-gray-700 mb-1.5">{label}</p>}
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-colors cursor-pointer',
          dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300',
          aspectRatio === 'banner' ? 'h-32' : 'h-40'
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(); }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
            <Upload size={24} />
            <span className="text-xs">Glisser ou cliquer pour choisir</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
    </div>
  );
}
