import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Download, Send, Eye, CheckCircle, XCircle,
  Search, Filter, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

const STATUS_TABS = ['all', 'draft', 'pending', 'approved', 'rejected'];
const INR = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

export default function Quotes() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? `?status=${activeTab}` : '';
      const res = await api.get(`/quotes${params}`);
      setQuotes(res.data.data);
    } catch {
      setError('Failed to load quotes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeTab]);

  const filtered = quotes.filter(q =>
    search === '' ||
    q.quoteNumber?.toLowerCase().includes(search.toLowerCase()) ||
    q.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    q.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id, status, reason = '') => {
    setActionLoading(id + status);
    try {
      await api.put(`/quotes/${id}/status`, { status, rejectionReason: reason });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading('');
      setRejectModal(null);
      setRejectReason('');
    }
  };

  const downloadPDF = async (quote) => {
    setActionLoading(quote._id + 'pdf');
    try {
      const res = await api.get(`/quotes/${quote._id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quote.quoteNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('PDF download failed.');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {error && (
        <div className="p-3 bg-rose-900/30 border border-rose-700/50 rounded-lg text-sm text-rose-400 flex justify-between">
          {error}
          <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-400">✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-field pl-9 w-64"
            placeholder="Search quotes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={load} className="btn-secondary">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-surface-card border border-surface-border rounded-lg p-1 w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all duration-150 ${
              activeTab === tab
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'all' ? 'All' : tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No quotes found"
            description="Create a quote from the Product Configurator page."
            action={<a href="/configure" className="btn-primary text-xs">Go to Configurator</a>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-surface-border bg-surface">
                <tr>
                  <th className="table-th">Quote #</th>
                  <th className="table-th">Customer</th>
                  <th className="table-th">Product</th>
                  <th className="table-th">Total</th>
                  <th className="table-th">Status</th>
                  {isAdmin && <th className="table-th">Sales Rep</th>}
                  <th className="table-th">Date</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filtered.map(q => (
                  <tr key={q._id} className="hover:bg-surface-card/50 transition-colors group">
                    <td className="table-td font-mono text-brand-400 font-medium">{q.quoteNumber}</td>
                    <td className="table-td">
                      <p className="font-medium text-slate-200">{q.customer?.name}</p>
                      <p className="text-xs text-slate-500">{q.customer?.company}</p>
                    </td>
                    <td className="table-td text-slate-400">{q.product?.name}</td>
                    <td className="table-td font-bold text-emerald-400">{INR(q.totalPrice)}</td>
                    <td className="table-td"><StatusBadge status={q.status} /></td>
                    {isAdmin && <td className="table-td text-slate-400 text-xs">{q.salesRep?.name}</td>}
                    <td className="table-td text-slate-500 text-xs">{new Date(q.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        {/* View */}
                        <button
                          onClick={() => navigate(`/quotes/${q._id}`)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-900/30 rounded-lg transition-colors"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Download PDF */}
                        <button
                          onClick={() => downloadPDF(q)}
                          disabled={actionLoading === q._id + 'pdf'}
                          title="Download PDF"
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-900/30 rounded-lg transition-colors"
                        >
                          {actionLoading === q._id + 'pdf' ? <Spinner size="sm" /> : <Download size={14} />}
                        </button>

                        {/* Submit for approval (sales, draft only) */}
                        {q.status === 'draft' && (
                          <button
                            onClick={() => updateStatus(q._id, 'pending')}
                            disabled={!!actionLoading}
                            title="Submit for Approval"
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-900/30 rounded-lg transition-colors"
                          >
                            {actionLoading === q._id + 'pending' ? <Spinner size="sm" /> : <Send size={14} />}
                          </button>
                        )}

                        {/* Admin: Approve/Reject pending quotes */}
                        {isAdmin && q.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(q._id, 'approved')}
                              disabled={!!actionLoading}
                              title="Approve"
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-900/30 rounded-lg transition-colors"
                            >
                              {actionLoading === q._id + 'approved' ? <Spinner size="sm" /> : <CheckCircle size={14} />}
                            </button>
                            <button
                              onClick={() => setRejectModal(q._id)}
                              title="Reject"
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-900/30 rounded-lg transition-colors"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Quote" maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Please provide a reason for rejection:</p>
          <textarea
            className="input-field h-24 resize-none"
            placeholder="e.g. Price does not meet budget requirements..."
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
          />
          <div className="flex gap-3">
            <button onClick={() => setRejectModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button
              onClick={() => updateStatus(rejectModal, 'rejected', rejectReason)}
              className="btn-danger flex-1 justify-center"
            >
              <XCircle size={14} /> Reject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
