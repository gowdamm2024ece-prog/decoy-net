# Cowrie Honeypot Monitor

A real-time cybersecurity dashboard built with React + Vite that monitors a remotely hosted Cowrie SSH honeypot.

---

## Features

- Real-time polling of `cowrie.json` and `cowrie.log` every 5 seconds (configurable)
- Incremental event detection — only new events are processed each cycle
- Statistics cards: total events, SSH attempts, unique IPs, commands executed
- Events over time area chart
- Event type distribution donut chart
- Top attacking IPs bar chart
- Live event feed with newest events at top
- Filterable/searchable events table (by IP, username, command, event type, time range)
- Attacker IP statistics table with activity bars
- Raw log viewer with auto-scroll (terminal style)
- Graceful handling of CORS errors, network failures, and malformed JSON
- Dark SOC-style UI

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP | Fetch API |

---

## Project Structure

```
cowrie-dashboard/
├── .env                        # Local environment config (gitignored)
├── .env.example                # Template for environment config
├── vite.config.js
├── index.html
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── components/
    │   ├── Header.jsx          # Status bar with LIVE/OFFLINE indicator
    │   ├── StatCard.jsx        # Metric cards
    │   ├── EventTable.jsx      # Filterable events table
    │   ├── EventFeed.jsx       # Live activity feed
    │   ├── IpTable.jsx         # Attacker IP statistics
    │   ├── RawLogs.jsx         # Terminal-style raw log viewer
    │   └── charts/
    │       ├── EventsChart.jsx       # Area chart: events over time
    │       ├── EventDistribution.jsx # Donut chart: event types
    │       └── TopIpsChart.jsx       # Bar chart: top IPs
    ├── services/
    │   └── cowrieApi.js        # HTTP fetch functions
    ├── hooks/
    │   └── useCowrieLogs.js    # Polling logic + state management
    ├── utils/
    │   ├── logParser.js        # NDJSON + raw log parsing
    │   └── statistics.js       # Stats computation
    └── pages/
        └── Dashboard.jsx       # Main dashboard layout
```

---

## Installation

```bash
cd cowrie-dashboard
npm install
```

---

## Environment Configuration

Copy `.env.example` to `.env` and set your Cowrie server URL:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_COWRIE_BASE_URL=http://172.17.12.240:8080
VITE_POLLING_INTERVAL=5000
```

- `VITE_COWRIE_BASE_URL` — Base URL of the Cowrie HTTP server serving log files
- `VITE_POLLING_INTERVAL` — Polling interval in milliseconds (default: 5000)

The `.env` file is gitignored. Never commit it with real server addresses.

---

## Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Production Build

```bash
npm run build
npm run preview
```

---

## How Polling Works

```
Initial load
    ↓
Fetch cowrie.json + cowrie.log in parallel
    ↓
Parse NDJSON line-by-line
    ↓
Store events in React state (max 1000)
    ↓
Wait VITE_POLLING_INTERVAL ms
    ↓
Fetch again
    ↓
Detect new events (by _id = session+timestamp+eventid+src_ip)
    ↓
Append only new events → recalculate stats/charts
    ↓
Repeat
```

The browser page never reloads. Only React state updates.

---

## Expected Cowrie Files

The server at `VITE_COWRIE_BASE_URL` must serve:

| File | Format | Description |
|------|--------|-------------|
| `/cowrie.json` | NDJSON (one JSON object per line) | Structured event log |
| `/cowrie.log` | Plain text | Raw Cowrie log output |

Cowrie writes `cowrie.json` in NDJSON format by default when the `output_json` plugin is enabled in `cowrie.cfg`:

```ini
[output_jsonlog]
enabled = true
logfile = ${honeypot:log_path}/cowrie.json
```

---

## Cowrie CORS Requirements

Because the React app runs on a different origin (e.g. `http://localhost:5173`) than the Cowrie HTTP server (`http://172.17.12.240:8080`), the browser will block requests unless the server sends CORS headers.

### Option 1 — nginx reverse proxy (recommended)

Add to your nginx config serving the Cowrie log directory:

```nginx
location / {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type';
}
```

### Option 2 — Python simple HTTP server with CORS

Replace the default `python3 -m http.server` with a CORS-enabled server:

```python
# cors_server.py
from http.server import SimpleHTTPRequestHandler, HTTPServer

class CORSHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

HTTPServer(('0.0.0.0', 8080), CORSHandler).serve_forever()
```

Run from the Cowrie log directory:

```bash
python3 cors_server.py
```

### Option 3 — Vite dev proxy (development only)

Add to `vite.config.js`:

```js
server: {
  proxy: {
    '/cowrie': {
      target: 'http://172.17.12.240:8080',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/cowrie/, ''),
    }
  }
}
```

Then update `VITE_COWRIE_BASE_URL=/cowrie` in `.env`.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Dashboard shows `OFFLINE` | Server unreachable | Check network/firewall to `172.17.12.240:8080` |
| Dashboard shows `CONNECTION ERROR` | HTTP error (4xx/5xx) | Check the HTTP server is running and files exist |
| No events appear but status is `LIVE` | CORS blocked silently | Open browser DevTools → Network tab, look for CORS errors |
| `Unable to parse cowrie.json` | File is not valid NDJSON | Verify Cowrie JSON output plugin is enabled |
| Charts empty | No timestamped events | Ensure `cowrie.json` events contain a `timestamp` field |

---

## Performance Limits

| Limit | Value |
|-------|-------|
| Max events in state | 1000 |
| Max events in table | 100 |
| Max raw log lines | 200 |
| Max live feed entries | 50 |
| Max IPs in table | 50 |
| Max IPs in chart | 10 |
