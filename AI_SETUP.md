# AI Chatbot Setup Guide - Free Tier APIs

This guide shows you how to get free API keys for the restaurant AI chatbot demo.

## 🎯 Multi-Provider Fallback System

The chatbot uses **3 providers with automatic fallback**:
1. **Groq** (Primary) - Fastest, free tier, Llama 3.1 70B
2. **OpenRouter** (Fallback 1) - Free Llama 3.1 8B model
3. **Hugging Face** (Fallback 2) - Free inference API

If one fails, it automatically tries the next. This ensures the demo **never fails**.

---

## 📋 Step 1: Get Groq API Key (Recommended - Fastest)

1. Go to: https://console.groq.com/
2. Sign up (free, no credit card)
3. Navigate to: **API Keys** → **Create API Key**
4. Copy your key (starts with `gsk_...`)
5. Set it in Supabase:
   ```bash
   npx supabase secrets set GROQ_API_KEY=your_groq_key_here
   ```

**Free Tier:** 30 requests/minute, very fast responses (~200-500ms)

---

## 📋 Step 2: Get OpenRouter API Key (Free Model)

1. Go to: https://openrouter.ai/
2. Sign up (free, no credit card)
3. Navigate to: **Keys** → **Create Key**
4. Copy your key
5. Set it in Supabase:
   ```bash
   npx supabase secrets set OPENROUTER_API_KEY=your_openrouter_key_here
   ```

**Free Model Used:** `meta-llama/llama-3.1-8b-instruct:free`

**Free Tier:** Generous free tier, slower than Groq but reliable

---

## 📋 Step 3: Get Hugging Face API Key (Optional Backup)

1. Go to: https://huggingface.co/
2. Sign up (free)
3. Navigate to: **Settings** → **Access Tokens** → **New Token**
4. Create token with **Read** permission
5. Copy your token (starts with `hf_...`)
6. Set it in Supabase:
   ```bash
   npx supabase secrets set HUGGINGFACE_API_KEY=your_hf_token_here
   ```

**Free Tier:** 1000 requests/day, slower (may take 5-10s first time)

---

## 🚀 Step 4: Deploy the Chat Function

Once you have at least **one API key** (Groq recommended), deploy:

```bash
npx supabase functions deploy chat-ai
```

---

## ✅ Step 5: Test It

1. Go to your website
2. Scroll to the "Demo" section
3. Ask: "What's your signature dish?" or "What are your hours?"
4. The AI should respond with restaurant-specific answers!

---

## 💡 Tips

- **Minimum:** You need at least **Groq** OR **OpenRouter** for the demo to work
- **Best Performance:** Use **Groq** (fastest, most reliable)
- **Maximum Reliability:** Set all 3 keys for automatic fallback
- **No Credit Card Required:** All providers offer free tiers

---

## 🔧 Troubleshooting

**If chatbot doesn't respond:**
1. Check Supabase Dashboard → Functions → chat-ai → Logs
2. Verify your API keys are set: `npx supabase secrets list`
3. Make sure at least one provider is configured

**If you see "All AI providers unavailable":**
- Check your API keys are valid
- Groq might have rate limits (30 req/min)
- Try OpenRouter or Hugging Face as backup

---

## 📊 Current Setup Status

Check which providers are configured:
```bash
npx supabase secrets list
```

You should see:
- `GROQ_API_KEY` (if set)
- `OPENROUTER_API_KEY` (if set)
- `HUGGINGFACE_API_KEY` (if set)

---

## 🎉 That's It!

Your restaurant AI chatbot is now powered by real AI models with automatic fallback. The demo will work reliably even if one provider is down!

