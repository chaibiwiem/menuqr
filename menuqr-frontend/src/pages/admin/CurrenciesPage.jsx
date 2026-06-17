import { useTranslation } from 'react-i18next';
import { DollarSign, Check } from 'lucide-react';
import { formatDT } from '../../utils/currency';

const EXAMPLES = [
  { label: 'Prix menu', raw: 12.5 },
  { label: 'Total commande', raw: 87.25 },
  { label: 'CA journalier', raw: 1234.75 },
  { label: 'Abonnement annuel', raw: 2400 },
];

const CONFIG_ROWS = [
  { prop: 'Symbole', value: 'DT' },
  { prop: 'Position', value: 'Après le montant — ex: 12,500 DT' },
  { prop: 'Décimales', value: '3 (Dinar Tunisien = 1000 millimes)' },
  { prop: 'Séparateur décimal', value: 'Virgule (,) en FR/AR — Point (.) en EN/IT' },
  { prop: 'Séparateur milliers', value: 'Espace (fr), Virgule (en), Punto (it)' },
  { prop: 'Type MySQL', value: 'DECIMAL(10,3) sur toutes les colonnes prix' },
  { prop: 'Fonction frontend', value: 'formatDT(amount, lang) — src/utils/currency.js' },
];

export default function CurrenciesPage() {
  const { i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <DollarSign size={24} className="text-green-500" />
          Gestion de la devise
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Configuration de la devise DT (Dinar Tunisien) pour la plateforme MenuQR
        </p>
      </div>

      {/* Currency config */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Configuration active</h2>
        <div className="space-y-0 divide-y divide-gray-50">
          {CONFIG_ROWS.map(({ prop, value }) => (
            <div key={prop} className="flex items-start gap-4 py-3 text-sm">
              <div className="w-48 shrink-0 text-gray-500 font-medium">{prop}</div>
              <div className="flex items-start gap-2 text-gray-800">
                <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Aperçu en temps réel — langue active : <span className="text-orange-500 uppercase">{lang}</span>
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {EXAMPLES.map(({ label, raw }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">{label}</div>
              <div className="text-lg font-bold text-gray-900">{formatDT(raw, lang)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* All languages preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Rendu par langue</h2>
        <div className="space-y-2">
          {['fr', 'en', 'it', 'ar'].map((l) => (
            <div key={l} className="flex items-center gap-4 text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span className="w-10 uppercase font-bold text-orange-500">{l}</span>
              <span className="text-gray-500 text-xs w-24">
                {l === 'fr' ? 'Français' : l === 'en' ? 'English' : l === 'it' ? 'Italiano' : 'العربية'}
              </span>
              <span
                className="font-semibold text-gray-900"
                dir={l === 'ar' ? 'rtl' : 'ltr'}
              >
                {formatDT(1234.5, l)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-800">
        <strong>Note :</strong> La devise DT est fixe pour toute la plateforme. Pour modifier la devise,
        contactez l'équipe technique Hannibal Advanced Solutions.
      </div>
    </div>
  );
}
