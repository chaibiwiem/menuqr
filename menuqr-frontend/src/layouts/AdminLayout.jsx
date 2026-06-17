import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Building2, LogOut, CreditCard, Users, QrCode, DollarSign, ShieldCheck, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

const NAV = [
  { to: '/admin',                    label: 'Dashboard',      icon: LayoutDashboard, exact: true },
  { to: '/admin/restaurants',        label: 'Restaurants',    icon: Building2 },
  { to: '/admin/users',              label: 'Utilisateurs',   icon: Users },
  { to: '/admin/register-super-admin', label: 'Créer Admin',  icon: ShieldCheck },
  { to: '/admin/qr-manager',         label: 'QR Manager',     icon: QrCode },
  { to: '/admin/currencies',         label: 'Devise DT',      icon: DollarSign },
  { to: '/admin/billing',            label: 'Facturation',    icon: CreditCard },
  { to: '/admin/settings',           label: 'Paramètres',     icon: Settings },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="text-lg font-bold text-orange-500">MenuHAS</div>
          <div className="text-xs text-gray-400 mt-0.5">Super Admin</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-3 border-t border-gray-100">
          <div className="px-3 py-2 mb-1">
            <div className="text-sm font-medium text-gray-700 truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
