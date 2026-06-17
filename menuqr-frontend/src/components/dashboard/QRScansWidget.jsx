import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Loader2, QrCode } from 'lucide-react';
import api from '../../api/axios';

const PERIODS = [
  { key: 'day',   label: 'Jour'    },
  { key: 'week',  label: 'Semaine' },
  { key: 'month', label: 'Mois'    },
];

// Hidden SVG patterns (outside Recharts SVG so url() references work globally)
function GlobalPatterns() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <pattern id="qr-stripe" x="0" y="0" width="10" height="10"
          patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="10" fill="#14b8a6" />
          <rect x="6" width="4" height="10" fill="#ccfbf1" />
        </pattern>
      </defs>
    </svg>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold mb-1 text-gray-300">{label}</div>
      <div className="font-bold">{payload[0]?.value} scan{payload[0]?.value !== 1 ? 's' : ''}</div>
    </div>
  );
}

export default function QRScansWidget({ restaurantId }) {
  const [period, setPeriod] = useState('day');
  const [activeIndex, setActiveIndex] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['qr-scans', restaurantId, period],
    queryFn: () => api.get(`/dashboard/qr-scans?period=${period}`).then((r) => r.data.data),
    refetchInterval: 60_000,
    enabled: !!restaurantId,
  });

  const total   = data?.total   || 0;
  const chart   = data?.chart   || [];
  const byTable = data?.byTable || [];

  // For month view, only show days with data to avoid 31 tiny bars
  const chartData = period === 'month'
    ? chart.filter((d) => d.scans > 0)
    : chart;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative">
      <GlobalPatterns />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <QrCode size={15} className="text-teal-500" />
          Scans QR
        </h2>

        {/* 3-way toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                period === key
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="text-2xl font-black text-gray-900 mb-4">
        {total} <span className="text-sm font-medium text-gray-400">scans</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={20} className="animate-spin text-teal-400" />
        </div>
      ) : total === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-xs text-gray-400 italic">
            Aucun scan {period === 'day' ? "aujourd'hui" : period === 'week' ? 'cette semaine' : 'ce mois'}
          </p>
        </div>
      ) : (
        <>
          {/* Bar chart */}
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={chartData}
              margin={{ top: 2, right: 4, bottom: 0, left: 0 }}
              barCategoryGap="30%"
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="label"
                tick={({ x, y, payload, index }) => (
                  <text x={x} y={y + 12} textAnchor="middle" fontSize={10}
                    fill={index === activeIndex ? '#14b8a6' : '#9ca3af'}
                    fontWeight={index === activeIndex ? 700 : 400}>
                    {payload.value}
                  </text>
                )}
                axisLine={false} tickLine={false}
                interval={period === 'month' ? 'preserveStartEnd' : 0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#d1d5db' }}
                axisLine={false} tickLine={false}
                allowDecimals={false} width={24}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="scans" radius={[4, 4, 0, 0]} maxBarSize={22}
                onMouseEnter={(_, index) => setActiveIndex(index)}>
                {chartData.map((_, index) => (
                  <Cell key={index}
                    fill={index === activeIndex ? '#14b8a6' : 'url(#qr-stripe)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Top tables */}
          {byTable.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Top tables</div>
              {byTable.map((row, i) => {
                const pct = total > 0 ? Math.round((row.scans / total) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16 shrink-0 truncate">{row.tableName}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 shrink-0 w-8 text-right">{row.scans}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
