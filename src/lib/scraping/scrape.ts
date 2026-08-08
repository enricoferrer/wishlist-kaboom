import * as cheerio from "cheerio";

export interface ScrapedProduct {
  title: string | null;
  image: string | null;
  price: number | null;
  currency: string;
}

function parsePrice(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;

  let normalized = cleaned;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    // Decide o separador decimal pelo que aparece por último (1.234,56 vs 1,234.56).
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    normalized =
      lastComma > lastDot
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  } else if (cleaned.includes(",")) {
    normalized = cleaned.replace(",", ".");
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/**
 * Extrai título, imagem, preço e moeda de HTML via meta tags Open Graph,
 * com fallbacks best-effort. Nunca lança erro — campos ausentes viram null.
 */
export function parseOpenGraph(html: string): ScrapedProduct {
  const $ = cheerio.load(html);

  const meta = (property: string): string | null =>
    $(`meta[property="${property}"]`).attr("content") ??
    $(`meta[name="${property}"]`).attr("content") ??
    null;

  const title =
    meta("og:title") ??
    meta("twitter:title") ??
    (($("title").first().text() || "").trim() || null);

  const image = meta("og:image") ?? meta("twitter:image") ?? null;

  const priceRaw =
    meta("og:price:amount") ??
    meta("product:price:amount") ??
    $('[itemprop="price"]').attr("content") ??
    $('[itemprop="price"]').first().text() ??
    null;

  let price = parsePrice(priceRaw);

  if (price === null) {
    const bodyText = $("body").text();
    const match = bodyText.match(/(?:R\$|US\$|\$)\s*([\d.,]+)/);
    if (match) {
      price = parsePrice(match[1]);
    }
  }

  const currency = meta("og:price:currency") ?? meta("product:price:currency") ?? "BRL";

  return { title, image, price, currency };
}
