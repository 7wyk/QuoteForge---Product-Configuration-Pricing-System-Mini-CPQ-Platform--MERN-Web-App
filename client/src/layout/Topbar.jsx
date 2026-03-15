import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title }) {
  const { user, isAdmin } = useAuth();

  return (
    <header className="h-14 bg-surface-card/80 backdrop-blur border-b border-surface-border flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-base font-semibold text-slate-100">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-surface rounded-lg transition-colors">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-200">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{isAdmin ? '🔐 Admin' : '💼 Sales'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
