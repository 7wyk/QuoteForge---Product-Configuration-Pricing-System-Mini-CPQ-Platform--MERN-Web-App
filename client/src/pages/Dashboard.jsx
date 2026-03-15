import { useState, useEffect } from 'react';
import {
  FileText, Clock, CheckCircle, TrendingUp, Package, Users,
  RefreshCw, AlertTriangle
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../services/api';
import { StatCard, SkeletonCard } from '../components';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const PIE_COLORS = { draft: '#64748b', pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="card px-3 py-2 text-sm">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.name === 'Revenue' ? `₹${Number(p.value).toLocaleString('en-IN')}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { isAdmin, isSales, user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [statusPie, setStatusPie] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      if (isAdmin) {
        const [overviewRes, statsRes, quotesRes] = await Promise.all([
          api.get('/admin/overview'),
          api.get('/quotes/stats'),
          api.get('/quotes?limit=5'),
        ]);
        setOverview(overviewRes.data.data);
        const { stats, trend: trendData } = statsRes.data.data;
        setTrend(trendData.map(t => ({ date: t._id, Quotes: t.count, Revenue: t.revenue })));
        setStatusPie([
          { name: 'Draft', value: stats.draft, color: PIE_COLORS.draft },
          { name: 'Pending', value: stats.pending, color: PIE_COLORS.pending },
          { name: 'Approved', value: stats.approved, color: PIE_COLORS.approved },
          { name: 'Rejected', value: stats.rejected, color: PIE_COLORS.rejected },
        ].filter(s => s.value > 0));
        setRecentQuotes(quotesRes.data.data);
      } else {
        const quotesRes = await api.get('/quotes?limit=5');
        setRecentQuotes(quotesRes.data.data);
        const q = quotesRes.data.data;
        setOverview({
          totalQuotes: quotesRes.data.total,
          pendingQuotes: q.filter(x => x.status === 'pending').length,
          estimatedRevenue: q.filter(x => x.status === 'approved').reduce((s, x) => s + x.totalPrice, 0),
        });
      }
    } catch (e) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <SkeletonCard key={i} lines={2} />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SkeletonCard lines={6} />
        <SkeletonCard lines={6} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="text-sm text-slate-400 mt-0.5">Here's what's happening with your quotes today.</p>
        </div>
        <button onClick={load} className="btn-secondary">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg text-sm text-amber-400">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Quotes"
          value={overview?.totalQuotes ?? 0}
          icon={FileText}
          color="brand"
          subtitle="All time"
        />
        <StatCard
          title="Pending Approval"
          value={overview?.pendingQuotes ?? 0}
          icon={Clock}
          color="amber"
          subtitle="Awaiting review"
        />
        <StatCard
          title="Est. Revenue"
          value={`₹${Number(overview?.estimatedRevenue ?? 0).toLocaleString('en-IN')}`}
          icon={TrendingUp}
          color="emerald"
          subtitle="From approved quotes"
        />
        {isAdmin && (
          <StatCard
            title="Active Products"
            value={overview?.totalProducts ?? 0}
            icon={Package}
            color="violet"
            subtitle="In catalogue"
          />
        )}
        {isSales && (
          <StatCard
            title="My Quotes"
            value={overview?.totalQuotes ?? 0}
            icon={Users}
            color="violet"
            subtitle="Created by you"
          />
        )}
      </div>

      {/* Charts (admin only) */}
      {isAdmin && trend.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Quote Trend */}
          <div className="card p-5 xl:col-span-2">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Quote Activity (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Quotes" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Breakdown */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Quotes by Status</h3>
            {statusPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(val, name) => [val, name]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500 text-center py-12">No data yet</p>
            )}
          </div>
        </div>
      )}

      {/* Revenue Bar Chart (admin) */}
      {isAdmin && trend.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Revenue Trend (₹)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Revenue" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Quotes */}
      <div className="card">
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">Recent Quotes</h3>
          <a href="/quotes" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all →</a>
        </div>
        {recentQuotes.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">No quotes yet. Start by configuring a product.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-surface-border">
                <tr>
                  <th className="table-th">Quote #</th>
                  <th className="table-th">Customer</th>
                  <th className="table-th">Product</th>
                  <th className="table-th">Total</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {recentQuotes.map(q => (
                  <tr key={q._id} className="hover:bg-surface-card/50 transition-colors">
                    <td className="table-td font-mono text-brand-400">{q.quoteNumber}</td>
                    <td className="table-td font-medium text-slate-200">{q.customer?.name}</td>
                    <td className="table-td text-slate-400">{q.product?.name}</td>
                    <td className="table-td font-semibold text-emerald-400">₹{Number(q.totalPrice).toLocaleString('en-IN')}</td>
                    <td className="table-td"><StatusBadge status={q.status} /></td>
                    <td className="table-td text-slate-500">{new Date(q.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
