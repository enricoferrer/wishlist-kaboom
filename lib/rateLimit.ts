const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

const hits = new Map<string, number[]>();

/**
 * Rate limit em memória por chave (ex: user id). Best-effort: em ambientes
 * serverless com múltiplas instâncias o limite não é global, mas já evita
 * abuso trivial do endpoint de scraping como proxy.
 */
export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    hits.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return true;
}
