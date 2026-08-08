import dns from "node:dns/promises";
import net from "node:net";
import { isPrivateOrReservedIp } from "./ssrf";

const FETCH_TIMEOUT_MS = 5000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_REDIRECTS = 5;
const USER_AGENT =
  "Mozilla/5.0 (compatible; WishlistKaboomBot/1.0; +https://wishlist-kaboom.vercel.app)";

export class UnsafeUrlError extends Error {}

async function assertPublicHost(hostname: string) {
  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      throw new UnsafeUrlError(`Blocked IP: ${hostname}`);
    }
    return;
  }

  const addresses = await dns.lookup(hostname, { all: true });
  if (addresses.length === 0) {
    throw new UnsafeUrlError(`Could not resolve host: ${hostname}`);
  }
  for (const { address } of addresses) {
    if (isPrivateOrReservedIp(address)) {
      throw new UnsafeUrlError(`Blocked private/internal IP for host: ${hostname}`);
    }
  }
}

function assertHttpUrl(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("Only http/https URLs are allowed");
  }
}

/**
 * Busca HTML de uma URL arbitrária fornecida pelo usuário, com proteções contra SSRF:
 * bloqueia IPs privados/loopback/link-local (incluindo em redirects), timeout curto e
 * limite de tamanho de resposta. Segue redirects manualmente para revalidar cada hop.
 */
export async function safeFetchHtml(inputUrl: string): Promise<string> {
  let current = new URL(inputUrl);

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    assertHttpUrl(current);
    await assertPublicHost(current.hostname);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new UnsafeUrlError("Redirect without location header");
      }
      current = new URL(location, current);
      continue;
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    if (!response.body) {
      return "";
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new Error("Response too large");
      }
      chunks.push(value);
    }

    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf-8");
  }

  throw new UnsafeUrlError("Too many redirects");
}
