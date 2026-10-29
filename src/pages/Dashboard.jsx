import { useState } from 'react';
import { Activity, ShieldAlert, Globe, Terminal, Zap, List, Map, FileText, Search, Filter } from 'lucide-react';
import { useCowrieLogs } from '../hooks/useCowrieLogs';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import EventTable from '../components/EventTable';
import EventFeed from '../components/EventFeed';
import IpTable from '../components/IpTable';
import RawLogs from '../components/RawLogs';
import EventsChart from '../components/charts/EventsChart';
import EventDistribution from '../components/charts/EventDistribution';
import TopIpsChart from '../components/charts/TopIpsChart';

const COWRIE_BASE_URL = import.meta.env.VITE_COWRIE_BASE_URL;

function Section({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`bg-slate-900/60 border border-slate-800 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-cyan-400" />
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { events, rawLines, stats, ipStats, distribution, eventsOverTime, liveEvents, status, lastUpdated, parseError, pollingInterval } = useCowrieLogs();

  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  const isOffline = status === 'offline';
  const isError = status === 'error';

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Header status={status} lastUpdated={lastUpdated} pollingInterval={pollingInterval} />

      <main className="max-w-screen-2xl mx-auto px-4 py-5 space-y-5">

        {/* Offline / Error banners */}
        {isOffline && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Unable to connect to Cowrie server</p>
              <p className="text-red-400/70 text-xs mt-0.5">Retrying every {pollingInterval / 1000}s — Check that <code className="font-mono">{COWRIE_BASE_URL}</code> is reachable and CORS headers are set.</p>
            </div>
          </div>
        )}
        {isError && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <p>Connection error — retrying…</p>
          </div>
        )}
        {parseError && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-300 text-xs font-mono">
            ⚠ {parseError} — showing previously loaded data.
          </div>
        )}
        {status === 'live' && events.length === 0 && (
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-6 text-center text-slate-500 text-sm">
            No Cowrie events available yet.
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Activity}    label="Total Events"    value={stats.total}        color="cyan"    sub="all parsed events" />
          <StatCard icon={ShieldAlert} label="SSH Attempts"    value={stats.loginAttempts} color="red"    sub="login events" />
          <StatCard icon={Globe}       label="Unique IPs"      value={stats.uniqueIps}    color="purple"  sub="source addresses" />
          <StatCard icon={Terminal}    label="Commands"        value={stats.commands}     color="amber"   sub="executed inputs" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Section title="Events Over Time" icon={Activity} className="lg:col-span-2">
            <EventsChart data={eventsOverTime} />
          </Section>
          <Section title="Event Distribution" icon={Filter}>
            <EventDistribution data={distribution} />
          </Section>
        </div>

        {/* Top IPs chart + Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Section title="Top Attacking IPs" icon={Map}>
            <TopIpsChart ipStats={ipStats} />
          </Section>
          <Section title="Live Event Feed" icon={Zap}>
            <EventFeed liveEvents={liveEvents} />
          </Section>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search IP, username, command…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <select value={eventFilter} onChange={e => setEventFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50">
            <option value="all">All Events</option>
            <option value="login">Login</option>
            <option value="command">Command</option>
            <option value="connection">Connection</option>
            <option value="session">Session</option>
            <option value="other">Other</option>
          </select>
          <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50">
            <option value="all">All Time</option>
            <option value="5m">Last 5 min</option>
            <option value="15m">Last 15 min</option>
            <option value="1h">Last 1 hour</option>
          </select>
        </div>

        {/* Events Table */}
        <Section title="Recent Cowrie Events" icon={List}>
          <EventTable events={events} searchQuery={search} eventFilter={eventFilter} timeFilter={timeFilter} />
        </Section>

        {/* IP Stats Table */}
        <Section title="Attacker IP Statistics" icon={Globe}>
          <IpTable ipStats={ipStats} />
        </Section>

        {/* Raw Logs */}
        <Section title="Raw Logs" icon={FileText}>
          <RawLogs lines={rawLines} />
        </Section>

      </main>
    </div>
  );
}
