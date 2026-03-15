import { useState, useEffect } from 'react';
import { Users as UsersIcon, UserCheck, UserX, ShieldCheck, UserCircle } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';

const ROLE_BADGE = {
  admin: 'bg-brand-900/50 text-brand-400 border border-brand-700/50',
  sales: 'bg-slate-700 text-slate-300',
};

export default function Users() {
  const { user: self } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch { setError('Failed to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleRole = async (user) => {
    if (user._id === self._id) { setError("You can't change your own role."); return; }
    setActionLoading(user._id + 'role');
    try {
      await api.put(`/admin/users/${user._id}`, { role: user.role === 'admin' ? 'sales' : 'admin' });
      await load();
    } catch (e) { setError(e.response?.data?.message || 'Failed.'); }
    finally { setActionLoading(''); }
  };

  const toggleActive = async (user) => {
    if (user._id === self._id) { setError("You can't deactivate yourself."); return; }
    setActionLoading(user._id + 'active');
    try {
      await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
      await load();
    } catch (e) { setError(e.response?.data?.message || 'Failed.'); }
    finally { setActionLoading(''); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {error && (
        <div className="flex items-center justify-between p-3 bg-rose-900/30 border border-rose-700/50 rounded-lg text-sm text-rose-400">
          {error}
          <button onClick={() => setError('')} className="text-rose-600">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{users.length} user(s) registered</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users found" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-surface-border bg-surface">
              <tr>
                <th className="table-th">User</th>
                <th className="table-th">Role</th>
                <th className="table-th">Status</th>
                <th className="table-th">Joined</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-surface-card/50 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200 flex items-center gap-1">
                          {u.name}
                          {u._id === self._id && <span className="text-[10px] text-brand-400">(you)</span>}
                        </p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                    <span className={`badge capitalize ${ROLE_BADGE[u.role] || 'bg-slate-700 text-slate-300'}`}>
                      {u.role === 'admin' ? '🔐' : '💼'} {u.role}
                    </span>
                  </td>
                  <td className="table-td">
                    <span className={`badge ${u.isActive ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50' : 'bg-rose-900/50 text-rose-400 border border-rose-700/50'}`}>
                      {u.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td className="table-td text-slate-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-1.5">
                      {/* Toggle Role */}
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={u._id === self._id || !!actionLoading}
                        title={u.role === 'admin' ? 'Make Sales' : 'Make Admin'}
                        className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-900/30 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {actionLoading === u._id + 'role' ? <Spinner size="sm" /> : <ShieldCheck size={14} />}
                      </button>

                      {/* Toggle Active */}
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={u._id === self._id || !!actionLoading}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          u.isActive
                            ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-900/30'
                            : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-900/30'
                        }`}
                      >
                        {actionLoading === u._id + 'active' ? (
                          <Spinner size="sm" />
                        ) : u.isActive ? (
                          <UserX size={14} />
                        ) : (
                          <UserCheck size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
