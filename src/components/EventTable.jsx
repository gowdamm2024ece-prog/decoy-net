const EVENT_STYLES = {
  'cowrie.login.failed':    { label: 'LOGIN FAILED',    cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
  'cowrie.login.success':   { label: 'LOGIN SUCCESS',   cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  'cowrie.command.input':   { label: 'COMMAND',         cls: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  'cowrie.session.connect': { label: 'CONNECT',         cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  'cowrie.session.closed':  { label: 'CLOSED',          cls: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  'cowrie.client.version':  { label: 'CLIENT VERSION',  cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
};

export function EventBadge({ eventid }) {
  const cfg = EVENT_STYLES[eventid] ?? { label: eventid?.split('.').pop()?.toUpperCase() ?? 'EVENT', cls: 'bg-slate-700/50 text-slate-300 border-slate-600/30' };
  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-mono font-medium whitespace-nowrap ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function fmt(ts) {
  if (!ts) return '-';
  const d = new Date(ts);
  return isNaN(d) ? ts : d.toLocaleTimeString();
}

export default function EventTable({ events, searchQuery, eventFilter, timeFilter }) {
  const now = Date.now();
  const timeMs = { '5m': 5*60000, '15m': 15*60000, '1h': 3600000 };

  const filtered = events.filter(e => {
    if (eventFilter && eventFilter !== 'all') {
      const map = { login: ['cowrie.login.failed','cowrie.login.success'], command: ['cowrie.command.input'], connection: ['cowrie.session.connect'], session: ['cowrie.session.closed'] };
      const allowed = map[eventFilter];
      if (allowed && !allowed.includes(e.eventid)) return false;
      if (eventFilter === 'other' && Object.values(map).flat().includes(e.eventid)) return false;
    }
    if (timeFilter && timeFilter !== 'all' && timeMs[timeFilter]) {
      const t = new Date(e.timestamp).getTime();
      if (isNaN(t) || now - t > timeMs[timeFilter]) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (e.src_ip ?? '').includes(q) || (e.username ?? '').toLowerCase().includes(q) || (e.input ?? '').toLowerCase().includes(q) || (e.eventid ?? '').toLowerCase().includes(q);
    }
    return true;
  }).slice(0, 100);

  if (!filtered.length) return (
    <div className="text-center py-12 text-slate-500">No events match the current filters.</div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
            {['Time','Event','Source IP','Port','Username','Command','Session'].map(h => (
              <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((e, i) => (
            <tr key={e._id ?? i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
              <td className="px-3 py-2 font-mono text-xs text-slate-400 whitespace-nowrap">{fmt(e.timestamp)}</td>
              <td className="px-3 py-2"><EventBadge eventid={e.eventid} /></td>
              <td className="px-3 py-2 font-mono text-xs text-slate-300">{e.src_ip ?? '-'}</td>
              <td className="px-3 py-2 font-mono text-xs text-slate-500">{e.src_port ?? '-'}</td>
              <td className="px-3 py-2 text-xs text-amber-300/80">{e.username ?? '-'}</td>
              <td className="px-3 py-2 font-mono text-xs text-cyan-300/80 max-w-[180px] truncate">{e.input ?? '-'}</td>
              <td className="px-3 py-2 font-mono text-xs text-slate-600">{e.session ? e.session.slice(0,8) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
