export function computeStats(events) {
  const uniqueIps = new Set();
  let loginAttempts = 0;
  let commands = 0;

  for (const e of events) {
    if (e.src_ip) uniqueIps.add(e.src_ip);
    if (e.eventid === 'cowrie.login.failed' || e.eventid === 'cowrie.login.success') loginAttempts++;
    if (e.eventid === 'cowrie.command.input') commands++;
  }

  return {
    total: events.length,
    loginAttempts,
    uniqueIps: uniqueIps.size,
    commands,
  };
}

export function computeIpStats(events) {
  const map = {};
  for (const e of events) {
    if (!e.src_ip) continue;
    if (!map[e.src_ip]) map[e.src_ip] = { ip: e.src_ip, total: 0, logins: 0, commands: 0, lastSeen: null };
    const s = map[e.src_ip];
    s.total++;
    if (e.eventid === 'cowrie.login.failed' || e.eventid === 'cowrie.login.success') s.logins++;
    if (e.eventid === 'cowrie.command.input') s.commands++;
    if (!s.lastSeen || e.timestamp > s.lastSeen) s.lastSeen = e.timestamp;
  }
  return Object.values(map).sort((a, b) => b.total - a.total);
}

export function computeEventDistribution(events) {
  const counts = { 'Login Failed': 0, 'Login Success': 0, 'Command': 0, 'Connection': 0, 'Other': 0 };
  for (const e of events) {
    if (e.eventid === 'cowrie.login.failed') counts['Login Failed']++;
    else if (e.eventid === 'cowrie.login.success') counts['Login Success']++;
    else if (e.eventid === 'cowrie.command.input') counts['Command']++;
    else if (e.eventid === 'cowrie.session.connect') counts['Connection']++;
    else counts['Other']++;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
}

export function computeEventsOverTime(events) {
  const buckets = {};
  for (const e of events) {
    if (!e.timestamp) continue;
    const d = new Date(e.timestamp);
    if (isNaN(d)) continue;
    const key = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    buckets[key] = (buckets[key] ?? 0) + 1;
  }
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, count]) => ({ time, count }));
}
