import crypto from "crypto";

export function signBodyHmacSHA256(body, secret) {
  const h = crypto.createHmac("sha256", secret);
  h.update(typeof body === "string" ? body : JSON.stringify(body));
  return `sha256=${h.digest("hex")}`;
}

/**
 * If callback_url is provided, POST the payload with an HMAC signature header.
 * Uses Node 18+ global fetch.
 */
export async function postCallback(callback_url, payload, secret) {
  const body = JSON.stringify(payload);
  const sig = secret ? signBodyHmacSHA256(body, secret) : null;
  const headers = { "Content-Type": "application/json" };
  if (sig) headers["X-WX-Signature"] = sig;
  const resp = await fetch(callback_url, { method: "POST", headers, body });
  return { status: resp.status, ok: resp.ok };
}
