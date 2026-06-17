import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QrCode, Search, Download, Loader2, Smartphone } from 'lucide-react';
import api from '../../api/axios';
import { cn } from '../../lib/utils';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function QRManagerPage() {
  const [search, setSearch] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');

  // Load restaurants for the filter dropdown
  const { data: restaurantsData } = useQuery({
    queryKey: ['admin-restaurants-list'],
    queryFn: () => api.get('/admin/restaurants?limit=200').then((r) => r.data.data),
    staleTime: 5 * 60_000,
  });

  // Load QR tables — always fires, filtered by restaurant when selected
  const { data: tablesData, isLoading } = useQuery({
    queryKey: ['admin-qr-tables', selectedRestaurant],
    queryFn: () => {
      const params = selectedRestaurant ? `?restaurant_id=${selectedRestaurant}` : '';
      return api.get(`/admin/qr-tables${params}`).then((r) => r.data);
    },
    staleTime: 30_000,
  });

  const restaurants = restaurantsData?.restaurants || [];

  // Client-side search filter on table name / number
  const allTables = tablesData?.data || [];
  const tables = allTables.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(t.number).includes(q) ||
      t.name?.toLowerCase().includes(q) ||
      t.Restaurant?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <QrCode size={24} className="text-orange-500" />
            QR Manager
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Vue d'ensemble des QR codes —{' '}
            <span className="font-medium text-gray-700">{tablesData?.total ?? 0}</span> tables
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une table..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <select
          value={selectedRestaurant}
          onChange={(e) => { setSelectedRestaurant(e.target.value); setSearch(''); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none min-w-[200px] bg-white"
        >
          <option value="">Tous les restaurants</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={28} className="animate-spin text-orange-400" />
          </div>
        ) : tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <QrCode size={30} className="text-gray-300" />
            <p className="text-sm text-gray-400">
              {allTables.length === 0 ? 'Aucune table configurée' : 'Aucun résultat pour cette recherche'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs text-gray-500 font-medium">
                <th className="px-5 py-3">Table</th>
                <th className="px-5 py-3">Restaurant</th>
                <th className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <Smartphone size={12} /> Scans
                  </div>
                </th>
                <th className="px-5 py-3">Créé le</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">QR Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tables.map((table) => (
                <tr key={table.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-800">Table {table.number}</div>
                    {table.name && table.name !== String(table.number) && (
                      <div className="text-xs text-gray-400">{table.name}</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-xs">
                    {table.Restaurant?.name || '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-medium text-gray-700">{table.scan_count ?? 0}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{fmtDate(table.created_at)}</td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                      table.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {table.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {table.qr_url ? (
                      <a
                        href={table.qr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-indigo-800 font-medium"
                      >
                        <Download size={12} /> PNG
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300">Non généré</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
