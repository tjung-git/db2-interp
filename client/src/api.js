const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5174";

export async function interpolate(body) {
  const r = await fetch(`${BASE}/api/interpolate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}
export async function fetchDb2Series(params) {
  const q = new URLSearchParams(params);
  const r = await fetch(`${BASE}/api/db2/series?${q}`);
  return r.json();
}
export async function counting(n, r) {
  const q = new URLSearchParams({ n, r });
  const resp = await fetch(`${BASE}/api/counting?${q}`);
  return resp.json();
}
