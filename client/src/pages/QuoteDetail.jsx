import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Send, CheckCircle, XCircle, Printer } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const INR = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/quotes/${id}`)
      .then(r => setQuote(r.data.data))
      .catch(() => setError('Quote not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status, reason = '') => {
    setActionLoading(status);
    try {
      const r = await api.put(`/quotes/${id}/status`, { status, rejectionReason: reason });
      setQuote(r.data.data);
      setRejectModal(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed.');
    } finally {
      setActionLoading('');
    }
  };

  const downloadPDF = async () => {
    setActionLoading('pdf');
    try {
      const res = await api.get(`/quotes/${id}/pdf`, { responseType: 'blob' });
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

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!quote) return <div className="text-center text-rose-400 py-20">{error || 'Quote not found.'}</div>;

  const configEntries = Object.entries(quote.configuration || {});

  return (
    <div className="space-y-5 max-w-4xl animate-fade-in">
      {/* Back + Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button onClick={() => navigate('/quotes')} className="btn-secondary">
          <ArrowLeft size={14} /> Back to Quotes
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          {quote.status === 'draft' && (
            <button onClick={() => updateStatus('pending')} disabled={!!actionLoading} className="btn-secondary">
              {actionLoading === 'pending' ? <Spinner size="sm" /> : <Send size={14} />} Submit for Approval
            </button>
          )}
          {isAdmin && quote.status === 'pending' && (
            <>
              <button onClick={() => updateStatus('approved')} disabled={!!actionLoading} className="btn-success">
                {actionLoading === 'approved' ? <Spinner size="sm" /> : <CheckCircle size={14} />} Approve
              </button>
              <button onClick={() => setRejectModal(true)} className="btn-danger">
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
          <button onClick={downloadPDF} disabled={actionLoading === 'pdf'} className="btn-primary">
            {actionLoading === 'pdf' ? <Spinner size="sm" /> : <Download size={14} />} Download PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-900/30 border border-rose-700/50 rounded-lg text-sm text-rose-400">{error}</div>
      )}

      {/* Header Card */}
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Quote Number</p>
            <h2 className="text-2xl font-bold text-brand-400 font-mono">{quote.quoteNumber}</h2>
            <p className="text-sm text-slate-400 mt-1">
              Created {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              {quote.salesRep?.name && ` · by ${quote.salesRep.name}`}
            </p>
          </div>
          <StatusBadge status={quote.status} />
        </div>

        {quote.status === 'rejected' && quote.rejectionReason && (
          <div className="mt-4 p-3 bg-rose-900/20 border border-rose-800/50 rounded-lg text-sm text-rose-300">
            <span className="font-semibold">Rejection Reason: </span>{quote.rejectionReason}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Info */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Customer Details</h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-xs text-slate-500">Name</dt><dd className="text-slate-200 font-medium">{quote.customer?.name}</dd></div>
            <div><dt className="text-xs text-slate-500">Email</dt><dd className="text-slate-300">{quote.customer?.email}</dd></div>
            {quote.customer?.company && <div><dt className="text-xs text-slate-500">Company</dt><dd className="text-slate-300">{quote.customer.company}</dd></div>}
            {quote.customer?.phone && <div><dt className="text-xs text-slate-500">Phone</dt><dd className="text-slate-300">{quote.customer.phone}</dd></div>}
          </dl>
        </div>

        {/* Product Info */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Product Configuration</h3>
          <p className="text-sm font-semibold text-brand-300 mb-3">{quote.product?.name}</p>
          <dl className="space-y-1.5">
            {configEntries.map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <dt className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</dt>
                <dd className="text-slate-300 font-medium capitalize">{v === 'true' ? 'Yes' : v === 'false' ? 'No' : v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h3 className="text-sm font-semibold text-slate-300">Pricing Breakdown</h3>
        </div>
        <table className="w-full">
          <thead className="bg-surface border-b border-surface-border">
            <tr>
              <th className="table-th">#</th>
              <th className="table-th">Description</th>
              <th className="table-th text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            <tr>
              <td className="table-td text-slate-500">1</td>
              <td className="table-td">Base Product Price</td>
              <td className="table-td text-right font-medium text-slate-200">{INR(quote.basePrice)}</td>
            </tr>
            {(quote.lineItems || []).map((item, i) => (
              <tr key={i} className="bg-surface-card/30">
                <td className="table-td text-slate-500">{i + 2}</td>
                <td className="table-td text-slate-400">{item.description}</td>
                <td className="table-td text-right font-medium text-amber-400">{INR(item.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-emerald-900/20 border-t-2 border-emerald-800/50">
              <td className="table-td" colSpan={2}>
                <span className="font-bold text-slate-200">Total Price</span>
              </td>
              <td className="table-td text-right">
                <span className="text-xl font-bold text-emerald-400">{INR(quote.totalPrice)}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Reject Quote" maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Provide a reason for rejection:</p>
          <textarea
            className="input-field h-24 resize-none"
            placeholder="Reason..."
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
          />
          <div className="flex gap-3">
            <button onClick={() => setRejectModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={() => updateStatus('rejected', rejectReason)} className="btn-danger flex-1 justify-center">
              <XCircle size={14} /> Reject Quote
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
