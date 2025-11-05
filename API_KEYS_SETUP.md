# 🔑 API Keys Setup - Exact Instructions

## ✅ Groq API Key - ALREADY SET!
Your Groq key is configured and ready to use! The chatbot will work immediately.

---

## 📋 OpenRouter Setup (Fallback 1)

### Step 1: Get Free API Key
1. Go to: **https://openrouter.ai/**
2. Click **"Sign In"** → Sign up with Google/GitHub (free, no credit card)
3. Once logged in, go to: **https://openrouter.ai/keys**
4. Click **"Create Key"**
5. Name it: `Astraventa Restaurant AI`
6. Copy the key (looks like: `sk-or-v1-...`)

### Step 2: Set the Key
```bash
npx supabase secrets set OPENROUTER_API_KEY=your_key_here
```

### Step 3: Free Model Used
**Model Name:** `meta-llama/llama-3.1-8b-instruct:free`
- ✅ **100% Free** - No credit card required
- ✅ **Unlimited requests** (within reason)
- ✅ **Good quality** for restaurant chatbot

**Why this model?**
- Free tier with no payment required
- Fast responses (~1-2 seconds)
- Good understanding of restaurant context
- Works perfectly for demo

---

## 🤗 Hugging Face Setup (Fallback 2)

### Recommendation: Use Inference API (NOT Spaces)

**Why Inference API is Better:**
- ✅ **Simpler** - Just HTTP requests, no deployment needed
- ✅ **No cold starts** - Instant responses
- ✅ **Free tier** - 1000 requests/day
- ✅ **No maintenance** - Hugging Face hosts it
- ❌ Spaces requires deployment, has cold starts (5-10s first request), more complex

### Step 1: Get Free API Token
1. Go to: **https://huggingface.co/**
2. Sign up (free, no credit card)
3. Go to: **https://huggingface.co/settings/tokens**
4. Click **"New token"**
5. Name it: `Astraventa AI`
6. **Permission:** Select **"Read"** (not Write)
7. Copy the token (starts with `hf_...`)

### Step 2: Set the Token
```bash
npx supabase secrets set HUGGINGFACE_API_KEY=your_token_here
```

### Step 3: Model Used
**Model:** `meta-llama/Llama-3.1-8B-Instruct`
- ✅ **Free** - 1000 requests/day
- ✅ **High quality** - Same as OpenRouter
- ⚠️ **Slower** - First request may take 5-10s (model loading), then faster

**Why this model?**
- Free tier available
- Good restaurant understanding
- Reliable fallback option

---

## 🎯 Current Status

**Check your setup:**
```bash
npx supabase secrets list
```

You should see:
- ✅ `GROQ_API_KEY` - **SET** (Primary)
- ⏳ `OPENROUTER_API_KEY` - Set if you want fallback 1
- ⏳ `HUGGINGFACE_API_KEY` - Set if you want fallback 2

---

## 🚀 Quick Start (Minimum Setup)

**You only need Groq (which is already set!)**

The chatbot will work perfectly with just Groq. The other providers are optional backups.

**To add fallbacks (recommended for demo):**
1. Set OpenRouter key (takes 2 minutes)
2. Set Hugging Face token (takes 2 minutes)

---

## 📊 Provider Comparison

| Provider | Speed | Free Tier | Quality | Setup Time |
|----------|-------|-----------|---------|------------|
| **Groq** | ⚡⚡⚡ Fastest (200-500ms) | 30 req/min | Excellent | ✅ Already set! |
| **OpenRouter** | ⚡⚡ Fast (1-2s) | Unlimited* | Very Good | 2 minutes |
| **Hugging Face** | ⚡ Slow (5-10s first, then 2-3s) | 1000/day | Very Good | 2 minutes |

*Within reasonable limits

---

## 🎉 That's It!

Once you set the keys, redeploy (optional but recommended):
```bash
npx supabase functions deploy chat-ai
```

The chatbot will automatically:
1. Try Groq first (fastest)
2. If Groq fails → Try OpenRouter
3. If OpenRouter fails → Try Hugging Face
4. If all fail → Show friendly fallback message

**Your demo will never fail!** 🚀

