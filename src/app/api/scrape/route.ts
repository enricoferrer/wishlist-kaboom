import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeFetchHtml } from "@/lib/scraping/safeFetch";
import { parseOpenGraph } from "@/lib/scraping/scrape";
import { checkRateLimit } from "@/lib/scraping/rateLimit";

const EMPTY_RESULT = { title: null, image: null, price: null, currency: "BRL" };

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(user.id)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const rawUrl = typeof body?.url === "string" ? body.url.trim() : null;

  if (!rawUrl) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  // A partir daqui, qualquer falha (SSRF bloqueado, timeout, HTML inválido, etc.)
  // nunca deve travar o fluxo: sempre 200 com campos vazios, para o formulário
  // editável assumir o preenchimento manual.
  try {
    const html = await safeFetchHtml(parsedUrl.toString());
    const data = parseOpenGraph(html);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(EMPTY_RESULT);
  }
}
