// deno-lint-ignore-file no-explicit-any
// @ts-ignore - Deno runtime types
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type ChatRequest = { messages: ChatMessage[]; conversation_id?: string };

// @ts-ignore - Deno runtime
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

const RESTAURANT_SYSTEM_PROMPT = `You are a friendly, professional AI assistant for "La Bella Vista" restaurant. Stay strictly on restaurant-related topics (menu, reservations, hours, location, dietary needs, events, promos). If users ask unrelated questions (e.g., programming, personal matters), politely steer the conversation back to restaurant assistance.

Rules:
- Never reveal internal reasoning, chain-of-thought, or tags like <think> … </think>.
- Keep responses under 150 words unless detailed info is requested.
- Be concise, warm, and helpful.
- If the user speaks Urdu/Hindi, reply in that language; otherwise reply in English.

You help customers with:
- Menu inquiries and recommendations
- Reservation bookings
- Hours and location information
- Special events and promotions
- Dietary restrictions and allergies
- Wine pairings and chef recommendations

Always offer to help with reservations when appropriate. If asked about pricing, mention it's available on request or in the menu.`;

function cleanContent(text: string | undefined): string {
  if (!text) return "";
  try {
    // Remove any leaked chain-of-thought tags
    let out = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
    out = out.replace(/<think>[\s\S]*?<\/redacted_reasoning>/gi, "");
    // Collapse excessive whitespace
    out = out.replace(/\n{3,}/g, "\n\n").trim();
    return out;
  } catch {
    return text || "";
  }
}

async function callGroq(messages: ChatMessage[]): Promise<{ content: string; model: string; latency?: number } | null> {
  // @ts-ignore - Deno runtime
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) return null;

  const start = Date.now();
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("Groq error:", text);
      return null;
    }

    const data = await res.json();
    const latency = Date.now() - start;
    return {
      content: cleanContent(data.choices?.[0]?.message?.content)?.trim() || "",
      model: "llama-3.1-70b",
      latency,
    };
  } catch (e) {
    console.warn("Groq exception:", e);
    return null;
  }
}

async function callOpenRouter(messages: ChatMessage[]): Promise<{ content: string; model: string; latency?: number } | null> {
  // @ts-ignore - Deno runtime
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) return null;

  const start = Date.now();
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://astraventa.ai",
        "X-Title": "Astraventa Restaurant AI",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-8b-instruct:free", // Updated free model
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("OpenRouter error:", text);
      return null;
    }

    const data = await res.json();
    const latency = Date.now() - start;
    return {
      content: cleanContent(data.choices?.[0]?.message?.content)?.trim() || "",
      model: "llama-3.3-8b",
      latency,
    };
  } catch (e) {
    console.warn("OpenRouter exception:", e);
    return null;
  }
}

// Hugging Face Router (OpenAI-compatible endpoint)
async function callHuggingFaceRouter(messages: ChatMessage[]): Promise<{ content: string; model: string; latency?: number } | null> {
  // @ts-ignore - Deno runtime
  const apiKey = Deno.env.get("HF_TOKEN");
  if (!apiKey) return null;

  const start = Date.now();
  try {
    const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "MiniMaxAI/MiniMax-M2:novita",
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("HF Router error:", text);
      return null;
    }

    const data = await res.json();
    const latency = Date.now() - start;
    return {
      content: cleanContent(data.choices?.[0]?.message?.content)?.trim() || "",
      model: "minimax-m2-router",
      latency,
    };
  } catch (e) {
    console.warn("HF Router exception:", e);
    return null;
  }
}

async function callHuggingFace(messages: ChatMessage[]): Promise<{ content: string; model: string; latency?: number } | null> {
  // @ts-ignore - Deno runtime
  const apiKey = Deno.env.get("HUGGINGFACE_API_KEY");
  if (!apiKey) return null;

  const userMessage = messages.filter(m => m.role === "user").pop()?.content || "";
  if (!userMessage) return null;

  const start = Date.now();
  try {
    const res = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${RESTAURANT_SYSTEM_PROMPT}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${userMessage}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
        parameters: { max_new_tokens: 300, temperature: 0.7 },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("HuggingFace error:", text);
      return null;
    }

    const data = await res.json();
    const latency = Date.now() - start;
    let content = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      content = data[0].generated_text.split("<|eot_id|>")[0]?.trim() || "";
    } else if (data[0]?.generated_text) {
      content = data[0].generated_text.trim();
    }
    return content ? { content, model: "llama-3.1-8b-hf", latency } : null;
  } catch (e) {
    console.warn("HuggingFace exception:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method Not Allowed" }, 405);
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { messages = [] } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: "messages array required" }, 400);
  }

  const systemPrompt: ChatMessage = { role: "system", content: RESTAURANT_SYSTEM_PROMPT };
  const fullMessages = [systemPrompt, ...messages];

  let result: { content: string; model: string; latency?: number } | null = null;

  result = await callGroq(fullMessages);
  if (result) return json({ ok: true, ...result }, 200);

  result = await callOpenRouter(fullMessages);
  if (result) return json({ ok: true, ...result }, 200);

  result = await callHuggingFaceRouter(fullMessages);
  if (result) return json({ ok: true, ...result }, 200);

  result = await callHuggingFace(fullMessages);
  if (result) return json({ ok: true, ...result }, 200);

  return json({
    ok: false,
    error: "All AI providers unavailable. Please try again later.",
    fallback: "I'd be happy to help! Our signature dish is the Truffle Risotto with seared scallops. Would you like to reserve a table to try it?",
  }, 503);
});

