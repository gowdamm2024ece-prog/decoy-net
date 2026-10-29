export default function StatCard({ icon: Icon, label, value, color = 'cyan', sub }) {
  const colors = {
    cyan:   'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
    red:    'border-red-500/20 bg-red-500/5 text-red-400',
    amber:  'border-amber-500/20 bg-amber-500/5 text-amber-400',
    purple: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
    emerald:'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
  };
  const cls = colors[color] ?? colors.cyan;

  return (
    <div className={`rounded-xl border p-4 flex items-center gap-4 ${cls}`}>
      <div className={`p-2.5 rounded-lg bg-current/10`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
