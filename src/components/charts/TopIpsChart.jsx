import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function TopIpsChart({ ipStats }) {
  const data = ipStats.slice(0, 10).map(s => ({ ip: s.ip, events: s.total }));

  if (!data.length) return <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No IP data yet.</div>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="ip" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} tickLine={false} axisLine={false} width={110} />
        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }} />
        <Bar dataKey="events" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => <Cell key={i} fill={i === 0 ? '#ef4444' : i === 1 ? '#f97316' : '#06b6d4'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
