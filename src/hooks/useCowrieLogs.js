import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCowrieJson, fetchCowrieLog } from '../services/cowrieApi';
import { parseCowrieJson, parseCowrieLog } from '../utils/logParser';
import { computeStats, computeIpStats, computeEventDistribution, computeEventsOverTime } from '../utils/statistics';

const POLLING_INTERVAL = Number(import.meta.env.VITE_POLLING_INTERVAL) || 5000;
const MAX_EVENTS = 1000;

export function useCowrieLogs() {
  const [events, setEvents] = useState([]);
  const [rawLines, setRawLines] = useState([]);
  const [stats, setStats] = useState({ total: 0, loginAttempts: 0, uniqueIps: 0, commands: 0 });
  const [ipStats, setIpStats] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [eventsOverTime, setEventsOverTime] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const [status, setStatus] = useState('connecting'); // 'live' | 'offline' | 'error' | 'connecting'
  const [lastUpdated, setLastUpdated] = useState(null);
  const [parseError, setParseError] = useState(null);

  const seenIds = useRef(new Set());
  const allEvents = useRef([]);

  const poll = useCallback(async () => {
    try {
      const [jsonText, logText] = await Promise.all([fetchCowrieJson(), fetchCowrieLog()]);

      setParseError(null);

      let parsed = [];
      try {
        parsed = parseCowrieJson(jsonText);
      } catch {
        setParseError('Unable to parse cowrie.json');
      }

      // detect new events
      const newEvents = parsed.filter(e => !seenIds.current.has(e._id));
      newEvents.forEach(e => seenIds.current.add(e._id));

      if (newEvents.length > 0) {
        allEvents.current = [...allEvents.current, ...newEvents].slice(-MAX_EVENTS);
        const sorted = [...allEvents.current].reverse();

        setEvents(sorted);
        setStats(computeStats(allEvents.current));
        setIpStats(computeIpStats(allEvents.current));
        setDistribution(computeEventDistribution(allEvents.current));
        setEventsOverTime(computeEventsOverTime(allEvents.current));
        setLiveEvents(prev => [...newEvents.reverse(), ...prev].slice(0, 50));
      }

      setRawLines(parseCowrieLog(logText));
      setStatus('live');
      setLastUpdated(new Date());
    } catch (err) {
      const msg = err.message ?? '';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS')) {
        setStatus('offline');
      } else {
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    poll();
    const id = setInterval(poll, POLLING_INTERVAL);
    return () => clearInterval(id);
  }, [poll]);

  return { events, rawLines, stats, ipStats, distribution, eventsOverTime, liveEvents, status, lastUpdated, parseError, pollingInterval: POLLING_INTERVAL };
}
