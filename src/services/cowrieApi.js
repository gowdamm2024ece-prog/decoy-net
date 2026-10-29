const COWRIE_BASE_URL = import.meta.env.VITE_COWRIE_BASE_URL;

export async function fetchCowrieJson() {
  const res = await fetch(`${COWRIE_BASE_URL}/cowrie.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return text;
}

export async function fetchCowrieLog() {
  const res = await fetch(`${COWRIE_BASE_URL}/cowrie.log`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}
