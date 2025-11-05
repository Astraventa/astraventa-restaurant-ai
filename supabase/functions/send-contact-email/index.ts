// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "notifications@cavexa.online";
const RESEND_TO = Deno.env.get("RESEND_TO") ?? "astraventaai@gmail.com";
const CORS_ORIGIN = Deno.env.get("CORS_ORIGIN") ?? "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": CORS_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-client-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Expose-Headers": "*",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

if (!RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set. Emails will not be sent.");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  let body: ContactPayload;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { name, email, message } = body || {} as ContactPayload;
  if (!name || !email || !message) {
    return json({ error: "Missing fields" }, 400);
  }

  if (!RESEND_API_KEY) {
    return json({ ok: false, error: "Email is disabled (missing API key)" }, 200);
  }

  const subject = `New contact message from ${name}`;
  const html = `
    <h2>Astraventa AI - New Contact Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${message}</p>
  `;

  async function send(from: string) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from, to: RESEND_TO, subject, html, text: `Name: ${name}\nEmail: ${email}\n\n${message}` }),
    });
    const data = await res.json();
    return { res, data } as const;
  }

  // Try with provided domain first, then fallback to Resend onboarding domain
  const first = await send(RESEND_FROM);
  if (first.res.ok) {
    return json({ ok: true, id: first.data.id ?? null, from: RESEND_FROM }, 200);
  }
  const fallback = await send("onboarding@resend.dev");
  if (fallback.res.ok) {
    return json({ ok: true, id: fallback.data.id ?? null, from: "onboarding@resend.dev" }, 200);
  }
  return json({ ok: false, error: { first: first.data, fallback: fallback.data } }, 500);
});


