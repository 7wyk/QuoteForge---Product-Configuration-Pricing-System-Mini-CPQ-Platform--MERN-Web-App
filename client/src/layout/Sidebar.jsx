import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings2,
  FileText,
  Package,
  Users,
  ShieldCheck,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `sidebar-link ${isActive ? 'active' : ''}`
    }
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const { isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-surface-card border-r border-surface-border flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-surface-border">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-wide">QuoteForge</p>
          <p className="text-xs text-slate-500">CPQ Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-widest">Main</p>
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/configure" icon={Settings2} label="Configurator" />
        <NavItem to="/quotes" icon={FileText} label="Quotes" />

        {isAdmin && (
          <>
            <p className="px-3 mt-4 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-widest">Admin</p>
            <NavItem to="/admin/products" icon={Package} label="Products" />
            <NavItem to="/admin/rules" icon={ShieldCheck} label="Pricing Rules" />
            <NavItem to="/admin/users" icon={Users} label="Users" />
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-surface-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-sm font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-secondary w-full justify-center text-xs">
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
