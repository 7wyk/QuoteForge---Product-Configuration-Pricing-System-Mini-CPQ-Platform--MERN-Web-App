const STATUS_CONFIG = {
  draft: { label: 'Draft', cls: 'bg-slate-700 text-slate-300' },
  pending: { label: 'Pending Approval', cls: 'bg-amber-900/50 text-amber-400 border border-amber-700/50' },
  approved: { label: 'Approved', cls: 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50' },
  rejected: { label: 'Rejected', cls: 'bg-rose-900/50 text-rose-400 border border-rose-700/50' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, cls: 'bg-slate-700 text-slate-300' };
  return (
    <span className={`badge ${config.cls}`}>
      <span className="mr-1.5 text-[10px]">
        {status === 'approved' ? '✓' : status === 'rejected' ? '✕' : status === 'pending' ? '⏳' : '○'}
      </span>
      {config.label}
    </span>
  );
}
