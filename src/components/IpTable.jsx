function fmt(ts) {
  if (!ts) return '-';
  const d = new Date(ts);
  return isNaN(d) ? ts : d.toLocaleTimeString();
}

export default function IpTable({ ipStats }) {
  if (!ipStats.length) return (
    <div className="text-center py-8 text-slate-500 text-sm">No IP data yet.</div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
            {['IP Address','Events','Logins','Commands','Last Seen'].map(h => (
              <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ipStats.slice(0, 50).map(s => (
            <tr key={s.ip} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
              <td className="px-3 py-2 font-mono text-xs text-cyan-300">{s.ip}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{s.total}</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full max-w-[80px]">
                    <div className="h-1.5 bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, (s.total / (ipStats[0]?.total || 1)) * 100)}%` }} />
                  </div>
                </div>
              </td>
              <td className="px-3 py-2 text-red-400">{s.logins}</td>
              <td className="px-3 py-2 text-cyan-400">{s.commands}</td>
              <td className="px-3 py-2 font-mono text-xs text-slate-500">{fmt(s.lastSeen)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
