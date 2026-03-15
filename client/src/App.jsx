import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Configurator from './pages/Configurator';
import Quotes from './pages/Quotes';
import QuoteDetail from './pages/QuoteDetail';
import Products from './pages/admin/Products';
import PricingRules from './pages/admin/PricingRules';
import Users from './pages/admin/Users';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="configure" element={<Configurator />} />
        <Route path="quotes" element={<Quotes />} />
        <Route path="quotes/:id" element={<QuoteDetail />} />
        <Route
          path="admin/products"
          element={
            <ProtectedRoute adminOnly>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/rules"
          element={
            <ProtectedRoute adminOnly>
              <PricingRules />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute adminOnly>
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
