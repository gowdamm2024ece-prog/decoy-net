import { Shield, Wifi, WifiOff, AlertTriangle, Clock, Server } from 'lucide-react';

const COWRIE_BASE_URL = import.meta.env.VITE_COWRIE_BASE_URL;

const statusConfig = {
  live:        { icon: Wifi,          color: 'text-emerald-400', bg: 'bg-emerald-400', label: 'LIVE' },
  offline:     { icon: WifiOff,       color: 'text-red-400',     bg: 'bg-red-400',     label: 'OFFLINE' },
  error:       { icon: AlertTriangle, color: 'text-amber-400',   bg: 'bg-amber-400',   label: 'CONNECTION ERROR' },
  connecting:  { icon: Wifi,          color: 'text-slate-400',   bg: 'bg-slate-400',   label: 'CONNECTING' },
};

export default function Header({ status, lastUpdated, pollingInterval }) {
  const cfg = statusConfig[status] ?? statusConfig.connecting;
  const Icon = cfg.icon;

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Cowrie Honeypot Monitor</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Server className="w-3 h-3" />
              <span>{COWRIE_BASE_URL}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3 h-3" />
            <span>Every {pollingInterval / 1000}s</span>
          </div>
          {lastUpdated && (
            <div className="text-slate-400">
              Updated: <span className="text-slate-300">{lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
          <div className={`flex items-center gap-1.5 font-semibold ${cfg.color}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.bg} animate-pulse-dot`} />
            <Icon className="w-3.5 h-3.5" />
            <span>{cfg.label}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
