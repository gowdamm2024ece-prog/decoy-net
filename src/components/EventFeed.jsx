import { Zap } from 'lucide-react';

const eventLabel = id => {
  const map = {
    'cowrie.login.failed':    { text: 'Failed login attempt',  color: 'text-red-400',     dot: 'bg-red-400' },
    'cowrie.login.success':   { text: 'Successful login',      color: 'text-emerald-400', dot: 'bg-emerald-400' },
    'cowrie.command.input':   { text: 'Command executed',      color: 'text-cyan-400',    dot: 'bg-cyan-400' },
    'cowrie.session.connect': { text: 'New SSH connection',    color: 'text-blue-400',    dot: 'bg-blue-400' },
    'cowrie.session.closed':  { text: 'Session closed',        color: 'text-slate-400',   dot: 'bg-slate-400' },
  };
  return map[id] ?? { text: id?.split('.').slice(1).join(' ') ?? 'Event', color: 'text-slate-300', dot: 'bg-slate-400' };
};

function fmt(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return isNaN(d) ? ts : d.toLocaleTimeString();
}

export default function EventFeed({ liveEvents }) {
  if (!liveEvents.length) return (
    <div className="text-center py-8 text-slate-500 text-sm">Waiting for events…</div>
  );

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {liveEvents.map((e, i) => {
        const cfg = eventLabel(e.eventid);
        return (
          <div key={e._id ?? i} className="flex gap-3 animate-slide-in p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30">
            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.text}</span>
                <span className="text-xs text-slate-600">{fmt(e.timestamp)}</span>
              </div>
              {e.src_ip && <p className="text-xs text-slate-400 font-mono">{e.src_ip}{e.src_port ? `:${e.src_port}` : ''}</p>}
              {e.username && <p className="text-xs text-slate-500">User: <span className="text-amber-300/70">{e.username}</span></p>}
              {e.input && <p className="text-xs text-slate-500 font-mono truncate">$ {e.input}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
