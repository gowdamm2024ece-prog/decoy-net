/**
 * Parse cowrie.json (one JSON object per line / NDJSON)
 * Returns array of event objects with safe field access.
 */
export function parseCowrieJson(text) {
  const events = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed);
      events.push(normalizeEvent(obj));
    } catch {
      // skip malformed lines
    }
  }
  return events;
}

function normalizeEvent(obj) {
  return {
    timestamp: obj.timestamp ?? obj.time ?? null,
    eventid: obj.eventid ?? '',
    src_ip: obj.src_ip ?? obj.peerIP ?? null,
    src_port: obj.src_port ?? null,
    dst_ip: obj.dst_ip ?? null,
    dst_port: obj.dst_port ?? null,
    username: obj.username ?? null,
    password: obj.password ?? null,
    session: obj.session ?? null,
    input: obj.input ?? null,
    message: obj.message ?? null,
    sensor: obj.sensor ?? null,
    // unique key for dedup
    _id: `${obj.session ?? ''}-${obj.timestamp ?? ''}-${obj.eventid ?? ''}-${obj.src_ip ?? ''}`,
  };
}

/**
 * Parse raw cowrie.log lines, return last N lines.
 */
export function parseCowrieLog(text, maxLines = 200) {
  const lines = text.split('\n').filter(l => l.trim());
  return lines.slice(-maxLines);
}
