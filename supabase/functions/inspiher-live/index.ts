// inspiher-live: relays a teacher-typed prompt to an AI model and streams the answer back.
// Used only from the teacher view of inspiher-class.html. No student text is stored.
// Secrets (set in Supabase, never in this file): ANTHROPIC_API_KEY, INSPIHER_PASSPHRASE
// Optional: INSPIHER_MODEL (default claude-haiku-5-5), INSPIHER_DAILY_CAP (default 250)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED = new Set([
  "https://raevenbrown.github.io",
  "http://localhost:8765",
  "http://127.0.0.1:8765",
]);

const SYSTEM = `You are the AI in a live classroom demo called "AI & Me" at a school event for girls in grades 5 to 12. A teacher types the prompts and shows your answers on a projector. Some students are only 10 years old.

How to answer:
- Use plain, friendly words at about a 5th to 6th grade reading level, unless the prompt asks for something else.
- Keep answers short: usually under 150 words, never over 250.
- Follow the format the prompt asks for exactly (number of items, number of sentences, a table-free list, and so on). The point of the demo is that clear prompts get better answers than vague ones, so do not ask questions back. Make a good attempt with what you are given.
- Write plain text. You may use short numbered lists or lines that start with a dash. Do not use markdown headings, tables, or asterisks for bold.
- If you are not sure about a fact, say so. Students are learning to check what AI says.
- Keep everything school-appropriate. If a prompt asks for something unsafe, mature, hateful, or about dating, weapons, drugs, or hurting someone, say "Let's pick a different topic for class." and suggest a safe topic.
- If someone seems to be hurting or in danger, answer kindly and tell them to talk to a trusted adult right now.
- Never ask for or repeat personal information such as full names, schools, addresses, phone numbers, or emails.
- You are an AI. If asked, say so plainly. Do not pretend to be a person.`;

const PERSONA_RULES = `

The teacher has given you a pretend character for a classroom game. Stay in character and follow ONLY the rules the teacher lists. Reply in one or two short sentences, with an action in brackets like [wags tail]. If none of the rules fit the situation, do something confused or silly instead of inventing a smart answer. That shows the class why a robot needs more rules. Character details from the teacher:
`;

const enc = new TextEncoder();

function corsHeaders(origin: string | null) {
  const h: Record<string, string> = {
    "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  if (origin && ALLOWED.has(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "content-type": "application/json", "cache-control": "no-store" },
  });
}

async function sha256(s: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}

async function safeEqual(a: string, b: string): Promise<boolean> {
  const x = await sha256(a);
  const y = await sha256(b);
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}

async function hmacHex(key: string, msg: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(msg)));
  return Array.from(sig).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Same idea as the page's own filter: no emails, links, phone numbers, or "my name is".
function looksPrivate(t: string): boolean {
  return /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(t)
    || /(https?:\/\/|www\.)\S+/i.test(t)
    || /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(t)
    || /\b\d{6,}\b/.test(t)
    || /\bmy (full |last )?name is\b/i.test(t)
    || /\bi (live|go to school) (at|on)\b/i.test(t);
}

// Counters live in a small table when it exists (inspiher_ai_usage). If it does not,
// fall back to memory on this server instance, which is weaker but still works.
const mem = new Map<string, number>();
async function peek(sb: any, day: string, kind: string, key: string): Promise<number> {
  try {
    const r = await sb.rpc("inspiher_peek", { p_day: day, p_kind: kind, p_key: key });
    if (!r.error && typeof r.data === "number") return r.data;
  } catch (_) { /* fall through */ }
  return mem.get(`${day}|${kind}|${key}`) || 0;
}
async function bump(sb: any, day: string, kind: string, key: string): Promise<number> {
  try {
    const r = await sb.rpc("inspiher_bump", { p_day: day, p_kind: kind, p_key: key });
    if (!r.error && typeof r.data === "number") return r.data;
  } catch (_) { /* fall through */ }
  const k = `${day}|${kind}|${key}`;
  const n = (mem.get(k) || 0) + 1;
  mem.set(k, n);
  if (mem.size > 500) mem.clear();
  return n;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ error: "method" }, 405, origin);
  if (origin && !ALLOWED.has(origin)) return json({ error: "origin" }, 403, origin);

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  const passphrase = Deno.env.get("INSPIHER_PASSPHRASE");
  if (!apiKey || !passphrase) return json({ error: "not_configured" }, 503, origin);

  const raw = await req.text();
  if (raw.length > 16000) return json({ error: "too_big" }, 413, origin);
  let body: any;
  try { body = JSON.parse(raw); } catch { return json({ error: "bad_json" }, 400, origin); }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const now = new Date();
  const day = now.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const hour = now.toLocaleTimeString("en-GB", { timeZone: "America/New_York", hour: "2-digit", hour12: false });
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const ipKey = (await hmacHex(passphrase, ip)).slice(0, 16) + ":" + hour;
  const cap = Math.max(1, parseInt(Deno.env.get("INSPIHER_DAILY_CAP") || "250", 10) || 250);

  // Lock out an address that keeps guessing the passphrase.
  if ((await peek(sb, day, "fail", ipKey)) >= 8) return json({ error: "locked" }, 429, origin);

  if (typeof body.pass !== "string" || !(await safeEqual(body.pass, passphrase))) {
    await bump(sb, day, "fail", ipKey);
    await new Promise((r) => setTimeout(r, 700));
    return json({ error: "bad_passphrase" }, 401, origin);
  }

  const usedN = await peek(sb, day, "ok", "all");

  // Passphrase check only (used by the Unlock button): costs nothing.
  if (body.ping === true) return json({ ok: true, cap, used: usedN }, 200, origin);

  if (usedN >= cap) return json({ error: "daily_cap", cap }, 429, origin);

  // Validate the conversation.
  const msgs = body.messages;
  if (!Array.isArray(msgs) || msgs.length < 1 || msgs.length > 8) return json({ error: "bad_messages" }, 400, origin);
  let total = 0;
  const clean: { role: string; content: string }[] = [];
  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i];
    const role = m && m.role;
    const content = m && typeof m.content === "string" ? m.content.trim() : "";
    if ((role !== "user" && role !== "assistant") || content.length < 1 || content.length > (role === "assistant" ? 3000 : 1200)) {
      return json({ error: "bad_messages" }, 400, origin);
    }
    if (i === 0 && role !== "user") return json({ error: "bad_messages" }, 400, origin);
    if (i > 0 && role === msgs[i - 1].role) return json({ error: "bad_messages" }, 400, origin);
    if (role === "user" && looksPrivate(content)) return json({ error: "private" }, 400, origin);
    total += content.length;
    clean.push({ role, content });
  }
  if (clean[clean.length - 1].role !== "user" || total > 9000) return json({ error: "bad_messages" }, 400, origin);

  let system = SYSTEM;
  if (body.persona !== undefined) {
    const p = typeof body.persona === "string" ? body.persona.trim() : "";
    if (p.length < 1 || p.length > 700 || looksPrivate(p)) return json({ error: "bad_persona" }, 400, origin);
    system += PERSONA_RULES + p;
  }

  await bump(sb, day, "ok", "all");

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("INSPIHER_MODEL") || "claude-haiku-5-5",
      max_tokens: 450,
      system,
      messages: clean,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    console.log("provider status", upstream.status); // status only, never content
    return json({ error: "ai_unavailable", status: upstream.status }, 502, origin);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: { ...corsHeaders(origin), "content-type": "text/event-stream", "cache-control": "no-store" },
  });
});
