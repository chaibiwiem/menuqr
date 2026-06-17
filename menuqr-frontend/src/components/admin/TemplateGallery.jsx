import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

const TEMPLATES = [
  { id: 'classic_theme',   label: 'Classic',       bg: '#ffffff', accent: '#2563eb', text: '#111827' },
  { id: 'dark_sleek',      label: 'Dark Sleek',    bg: '#111827', accent: '#a78bfa', text: '#f3f4f6' },
  { id: 'aurora_glass',    label: 'Aurora Glass',  bg: 'linear-gradient(135deg,#1e1b4b,#312e81)', accent: '#c084fc', text: '#ffffff' },
  { id: 'bento_menu',      label: 'Bento',         bg: '#fafaf9', accent: '#0ea5e9', text: '#1c1917' },
  { id: 'editorial_menu',  label: 'Editorial',     bg: '#f8f8f0', accent: '#b45309', text: '#1c1917' },
  { id: 'modern_theme',    label: 'Modern',        bg: '#0f172a', accent: '#22d3ee', text: '#e2e8f0' },
];

function TemplatePreview({ template, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(template.id)}
      className={cn(
        'relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105',
        active ? 'border-orange-500 ring-2 ring-orange-300' : 'border-transparent'
      )}
    >
      <div
        className="h-28 flex flex-col items-center justify-center gap-2 px-3"
        style={{ background: template.bg }}
      >
        <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: template.accent }} />
        <div className="space-y-1 w-full px-2">
          <div className="h-1.5 rounded" style={{ backgroundColor: template.text, opacity: 0.4 }} />
          <div className="h-1.5 rounded w-3/4" style={{ backgroundColor: template.text, opacity: 0.25 }} />
        </div>
        <div className="w-8 h-5 rounded text-xs font-bold flex items-center justify-center" style={{ backgroundColor: template.accent, color: '#fff', fontSize: '9px' }}>
          Order
        </div>
      </div>
      <div
        className="text-xs font-medium text-center py-1.5"
        style={{ backgroundColor: '#f9fafb', color: '#374151' }}
      >
        {template.label}
      </div>
      {active && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </button>
  );
}

export default function TemplateGallery({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TEMPLATES.map((t) => (
        <TemplatePreview
          key={t.id}
          template={t}
          active={value === t.id}
          onClick={onChange}
        />
      ))}
    </div>
  );
}
