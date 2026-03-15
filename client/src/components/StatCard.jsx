export default function StatCard({ title, value, icon: Icon, color = 'brand', trend, subtitle }) {
  const colors = {
    brand: 'from-brand-600/20 to-brand-800/10 border-brand-600/30 text-brand-400',
    emerald: 'from-emerald-600/20 to-emerald-800/10 border-emerald-600/30 text-emerald-400',
    amber: 'from-amber-600/20 to-amber-800/10 border-amber-600/30 text-amber-400',
    rose: 'from-rose-600/20 to-rose-800/10 border-rose-600/30 text-rose-400',
    violet: 'from-violet-600/20 to-violet-800/10 border-violet-600/30 text-violet-400',
  };

  return (
    <div className={`card p-5 bg-gradient-to-br ${colors[color]} border relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} border`}>
            <Icon size={22} />
          </div>
        )}
      </div>
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-white group-hover:opacity-20 transition-opacity duration-300" />
    </div>
  );
}
