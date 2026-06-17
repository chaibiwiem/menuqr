import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Loader2, TrendingUp, ChevronDown, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatDT } from '../../utils/currency';
import { useTranslation } from 'react-i18next';

const PERIOD_LABELS = { week: 'Cette semaine', month: 'Ce mois' };

// Hidden SVG that defines patterns globally — referenced by url(#id) from Recharts bars
function GlobalPatterns() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <pattern id="rev-stripe-current" x="0" y="0" width="10" height="10"
          patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="10" fill="#f97316" />
          <rect x="6" width="4" height="10" fill="#ffedd5" />
        </pattern>
        <pattern id="rev-stripe-last" x="0" y="0" width="10" height="10"
          patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="10" fill="#fed7aa" />
          <rect x="6" width="4" height="10" fill="#fff7ed" />
        </pattern>
      </defs>
    </svg>
  );
}

function CustomTooltip({ active, payload, label, lang }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-3 py-2.5 text-xs shadow-xl min-w-[130px]">
      <div className="font-semibold mb-2 text-gray-300 text-[11px]">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: i === 1 ? '#f97316' : '#fed7aa', border: `1.5px solid ${i === 1 ? '#ea580c' : '#f97316'}` }} />
          <span className="font-bold">{formatDT(p.value, lang)}</span>
        </div>
      ))}
    </div>
  );
}

function fmtYAxis(val) {
  if (val >= 1000) return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
  return val;
}

export default function RevenueChartWidget({ restaurantId }) {
  const { i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const [period, setPeriod] = useState('week');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['revenue-chart', restaurantId, period],
    queryFn: () => api.get(`/dashboard/revenue-chart?period=${period}`).then((r) => r.data.data),
    refetchInterval: 120_000,
    enabled: !!restaurantId,
  });

  const chart = data || [];
  const totalThisWeek = chart.reduce((s, d) => s + d.thisWeek, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative">
      <GlobalPatterns />

      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-base font-bold text-gray-900">Chiffre d'affaires</h2>
          <p className="text-xs text-gray-400 mt-0.5">Aperçu des ventes</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <TrendingUp size={12} className="text-gray-400" />
              {PERIOD_LABELS[period]}
              <ChevronDown size={12} className="text-gray-400" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
                {Object.entries(PERIOD_LABELS).map(([key, label]) => (
                  <button key={key}
                    onClick={() => { setPeriod(key); setDropdownOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-xs font-medium transition-colors ${period === key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => navigate('/dashboard/analytics')}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Maximize2 size={13} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="text-2xl font-black text-gray-900 mb-4">{formatDT(totalThisWeek, lang)}</div>

      {isLoading ? (
        <div className="flex items-center justify-center h-52">
          <Loader2 size={22} className="animate-spin text-orange-400" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={230}>
          <BarChart
            data={chart}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            barCategoryGap="35%"
            barGap={3}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="day"
              tick={({ x, y, payload, index }) => (
                <text x={x} y={y + 12} textAnchor="middle" fontSize={11}
                  fill={index === activeIndex ? '#f97316' : '#9ca3af'}
                  fontWeight={index === activeIndex ? 700 : 400}>
                  {payload.value}
                </text>
              )}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#d1d5db' }}
              axisLine={false} tickLine={false}
              tickFormatter={fmtYAxis} width={36}
            />
            <Tooltip content={(props) => <CustomTooltip {...props} lang={lang} />} cursor={false} />

            <Bar dataKey="lastWeek" name="Sem. passée"
              radius={[5, 5, 0, 0]} maxBarSize={26}
              onMouseEnter={(_, index) => setActiveIndex(index)}>
              {chart.map((_, index) => (
                <Cell key={index} fill={index === activeIndex ? '#fed7aa' : 'url(#rev-stripe-last)'} />
              ))}
            </Bar>

            <Bar dataKey="thisWeek" name="Cette sem."
              radius={[5, 5, 0, 0]} maxBarSize={26}
              onMouseEnter={(_, index) => setActiveIndex(index)}>
              {chart.map((_, index) => (
                <Cell key={index} fill={index === activeIndex ? '#f97316' : 'url(#rev-stripe-current)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{
            background: 'repeating-linear-gradient(45deg,#f97316 0px,#f97316 3px,#ffedd5 3px,#ffedd5 6px)'
          }} />
          <span className="text-xs text-gray-500">{period === 'week' ? 'Cette semaine' : 'Ce mois'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{
            background: 'repeating-linear-gradient(45deg,#fed7aa 0px,#fed7aa 3px,#fff7ed 3px,#fff7ed 6px)'
          }} />
          <span className="text-xs text-gray-500">{period === 'week' ? 'Semaine passée' : 'Mois passé'}</span>
        </div>
      </div>
    </div>
  );
}
