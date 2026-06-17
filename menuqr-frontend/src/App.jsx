import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './store/authStore';

// Auth pages
const LoginPage          = React.lazy(() => import('./pages/auth/LoginPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage  = React.lazy(() => import('./pages/auth/ResetPasswordPage'));
const ChangePasswordPage = React.lazy(() => import('./pages/auth/ChangePasswordPage'));
const SetupPage          = React.lazy(() => import('./pages/auth/SetupPage'));

// Client public pages
const ClientMenuPage          = React.lazy(() => import('./pages/client/ClientMenuPage'));
const OrderTrackerPage        = React.lazy(() => import('./pages/client/OrderTrackerPage'));
const ReservationFormPage     = React.lazy(() => import('./pages/client/ReservationFormPage'));
const RestaurantLandingPage   = React.lazy(() => import('./pages/client/RestaurantLandingPage'));

// Dashboard pages
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));

// Admin pages
const AdminLayout        = React.lazy(() => import('./layouts/AdminLayout'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const RestaurantsPage    = React.lazy(() => import('./pages/admin/RestaurantsPage'));
const NewRestaurantPage       = React.lazy(() => import('./pages/admin/NewRestaurantPage'));
const RestaurantDetailPage    = React.lazy(() => import('./pages/admin/RestaurantDetailPage'));
const AdminBillingPage        = React.lazy(() => import('./pages/admin/AdminBillingPage'));
const AdminUsersPage          = React.lazy(() => import('./pages/admin/AdminUsersPage'));
const QRManagerPage              = React.lazy(() => import('./pages/admin/QRManagerPage'));
const CurrenciesPage             = React.lazy(() => import('./pages/admin/CurrenciesPage'));
const RegisterSuperAdminPage     = React.lazy(() => import('./pages/admin/RegisterSuperAdminPage'));
const AdminSettingsPage          = React.lazy(() => import('./pages/admin/AdminSettingsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children, roles = [] }) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.is_first_login) {
    return <Navigate to="/change-password" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Auth — public */}
        <Route path="/setup"                   element={<SetupPage />} />
        <Route path="/login"                   element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Dashboard — protégé */}
        {/* /dashboard/menu needs an explicit route (score 80) to beat /:slug/menu (score 70) */}
        <Route
          path="/dashboard/menu"
          element={
            <ProtectedRoute roles={['OWNER', 'MANAGER', 'STAFF', 'CASHIER']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute roles={['OWNER', 'MANAGER', 'STAFF', 'CASHIER']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Client QR — public (aucune auth) */}
        <Route path="/:slug/table/:qrToken" element={<ClientMenuPage />} />
        <Route path="/:slug/menu"           element={<ClientMenuPage />} />
        <Route path="/:slug/order/:orderId" element={<OrderTrackerPage />} />
        <Route path="/:slug/reservation"    element={<ReservationFormPage />} />
        <Route path="/:slug"                element={<RestaurantLandingPage />} />

        {/* Admin — protégé Super Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="restaurants/new" element={<NewRestaurantPage />} />
          <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="billing"         element={<AdminBillingPage />} />
          <Route path="users"           element={<AdminUsersPage />} />
          <Route path="qr-manager"      element={<QRManagerPage />} />
          <Route path="currencies"      element={<CurrenciesPage />} />
          <Route path="settings"        element={<AdminSettingsPage />} />
          <Route path="register-super-admin" element={<RegisterSuperAdminPage />} />
        </Route>

        <Route path="/"   element={<Navigate to="/login" replace />} />
        <Route path="*"   element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: '14px' },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
