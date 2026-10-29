import { useState, useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

export default function RawLogs({ lines }) {
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines, autoScroll]);

  if (!lines.length) return (
    <div className="text-center py-8 text-slate-500 text-sm font-mono">No raw log data available.</div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Terminal className="w-3.5 h-3.5" />
          <span>{lines.length} lines</span>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
          <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} className="accent-cyan-500" />
          Auto-scroll
        </label>
      </div>
      <div className="bg-black/60 rounded-lg border border-slate-800 p-3 h-64 overflow-y-auto font-mono text-xs leading-5">
        {lines.map((line, i) => (
          <div key={i} className="text-green-400/80 hover:text-green-300 whitespace-pre-wrap break-all">{line}</div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
