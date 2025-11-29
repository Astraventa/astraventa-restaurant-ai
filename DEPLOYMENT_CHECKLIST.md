# 🚀 Deployment Checklist - Chat AI Function

## Issue: Chat function returning fallback messages

The `ERR_NAME_NOT_RESOLVED` error means the `chat-ai` Edge Function is not accessible.

## ✅ Fix Steps

### 1. Deploy the Chat-AI Function

Run this command locally (you need to be logged in to Supabase):

```bash
npx supabase login
npx supabase link --project-ref avgtalosrfygkekqfatp
npx supabase functions deploy chat-ai
```

### 2. Verify Function is Deployed

Check in Supabase Dashboard:
- Go to: https://supabase.com/dashboard/project/avgtalosrfygkekqfatp/functions
- You should see `chat-ai` in the list

### 3. Verify Environment Variables in Vercel

In Vercel Dashboard → Your Project → Settings → Environment Variables:

**Required:**
- ✅ `VITE_SUPABASE_URL` = `https://avgtalosrfygkekqfatp.supabase.co`
- ✅ `VITE_SUPABASE_ANON_KEY` = (your anon key)

**Important:** Make sure these are set for **Production**, **Preview**, AND **Development** environments.

### 4. Verify Supabase Secrets

The function needs these secrets (set via CLI):

```bash
npx supabase secrets set GROQ_API_KEY=your_groq_api_key_here
npx supabase secrets set OPENROUTER_API_KEY=your_openrouter_api_key_here
npx supabase secrets set RESEND_API_KEY=your_resend_api_key_here
npx supabase secrets set RESEND_FROM=notifications@cavexa.online
npx supabase secrets set RESEND_TO=astraventaai@gmail.com
npx supabase secrets set CORS_ORIGIN=https://astraventa-restaurant-ai.vercel.app
```

### 5. Test the Function Directly

After deployment, test the endpoint:

```bash
curl -X POST https://avgtalosrfygkekqfatp.supabase.co/functions/v1/chat-ai \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is your signature dish?"}]}'
```

### 6. Clear Browser Cache

After fixing, hard refresh the site:
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- This clears cached JavaScript that might have old error states

## 🔍 Troubleshooting

**If function still doesn't work:**

1. Check Supabase Dashboard → Functions → chat-ai → Logs
   - Look for errors or missing API keys
   
2. Verify the function URL in browser console:
   - Should be: `https://avgtalosrfygkekqfatp.supabase.co/functions/v1/chat-ai`
   - If you see a different URL, the env var is wrong

3. Check CORS:
   - Make sure `CORS_ORIGIN` secret matches your Vercel domain exactly
   - Should be: `https://astraventa-restaurant-ai.vercel.app` (no trailing slash)

4. Test with a simple message:
   - "What's your signature dish?"
   - Should get a restaurant-specific response, not the fallback

## ✅ Success Indicators

- No `ERR_NAME_NOT_RESOLVED` errors in console
- AI responds with different messages (not the same fallback)
- Console shows successful function calls
- Messages are saved to Supabase `messages` table

