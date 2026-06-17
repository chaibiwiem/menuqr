import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Loader2, ShoppingBag, ChevronDown, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const PERIOD_LABELS = { week: 'Cette semaine', month: 'Ce mois' };

function GlobalPatterns() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <pattern id="ord-stripe-current" x="0" y="0" width="10" height="10"
          patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="10" fill="#6366f1" />
          <rect x="6" width="4" height="10" fill="#e0e7ff" />
        </pattern>
        <pattern id="ord-stripe-last" x="0" y="0" width="10" height="10"
          patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="10" fill="#c7d2fe" />
          <rect x="6" width="4" height="10" fill="#eef2ff" />
        </pattern>
      </defs>
    </svg>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-3 py-2.5 text-xs shadow-xl min-w-[120px]">
      <div className="font-semibold mb-2 text-gray-300 text-[11px]">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: i === 1 ? '#6366f1' : '#c7d2fe', border: `1.5px solid ${i === 1 ? '#F97316' : '#6366f1'}` }} />
          <span className="font-bold">{p.value} cmd</span>
        </div>
      ))}
    </div>
  );
}

export default function OrdersChartWidget({ restaurantId }) {
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
  const totalOrders = chart.reduce((s, d) => s + d.ordersThisWeek, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative">
      <GlobalPatterns />

      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-base font-bold text-gray-900">Commandes</h2>
          <p className="text-xs text-gray-400 mt-0.5">Volume des commandes</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag size={12} className="text-gray-400" />
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
          <button onClick={() => navigate('/dashboard/orders')}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Maximize2 size={13} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="text-2xl font-black text-gray-900 mb-4">
        {totalOrders} <span className="text-sm font-medium text-gray-400">commandes</span>
      </div>

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
                  fill={index === activeIndex ? '#6366f1' : '#9ca3af'}
                  fontWeight={index === activeIndex ? 700 : 400}>
                  {payload.value}
                </text>
              )}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#d1d5db' }}
              axisLine={false} tickLine={false}
              allowDecimals={false} width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />

            <Bar dataKey="ordersLastWeek" name="Sem. passée"
              radius={[5, 5, 0, 0]} maxBarSize={26}
              onMouseEnter={(_, index) => setActiveIndex(index)}>
              {chart.map((_, index) => (
                <Cell key={index} fill={index === activeIndex ? '#c7d2fe' : 'url(#ord-stripe-last)'} />
              ))}
            </Bar>

            <Bar dataKey="ordersThisWeek" name="Cette sem."
              radius={[5, 5, 0, 0]} maxBarSize={26}
              onMouseEnter={(_, index) => setActiveIndex(index)}>
              {chart.map((_, index) => (
                <Cell key={index} fill={index === activeIndex ? '#6366f1' : 'url(#ord-stripe-current)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{
            background: 'repeating-linear-gradient(45deg,#6366f1 0px,#6366f1 3px,#e0e7ff 3px,#e0e7ff 6px)'
          }} />
          <span className="text-xs text-gray-500">{period === 'week' ? 'Cette semaine' : 'Ce mois'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{
            background: 'repeating-linear-gradient(45deg,#c7d2fe 0px,#c7d2fe 3px,#eef2ff 3px,#eef2ff 6px)'
          }} />
          <span className="text-xs text-gray-500">{period === 'week' ? 'Semaine passée' : 'Mois passé'}</span>
        </div>
      </div>
    </div>
  );
}
