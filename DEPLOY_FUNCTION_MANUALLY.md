# 🚀 Manual Function Deployment Guide

Since CLI deployment requires project owner permissions, deploy via Supabase Dashboard:

## Step 1: Access Supabase Dashboard

1. Go to: **https://supabase.com/dashboard/project/avgtalosrfygkekqfatp/functions**
2. Log in with the account that owns the project

## Step 2: Edit or Create Function

- If `chat-ai` function exists: Click on it → Click "Edit"
- If it doesn't exist: Click "Create a new function" → Name it `chat-ai`

## Step 3: Copy Function Code

Copy the entire contents of `supabase/functions/chat-ai/index.ts` and paste it into the editor.

## Step 4: Deploy

Click **"Deploy"** button in the Supabase Dashboard.

## Step 5: Verify Secrets Are Set

Make sure these secrets are configured (via Dashboard → Settings → Edge Functions → Secrets):

- ✅ `GROQ_API_KEY`
- ✅ `OPENROUTER_API_KEY`  
- ✅ `HF_TOKEN` (optional)
- ✅ `HUGGINGFACE_API_KEY` (optional)
- ✅ `RESEND_API_KEY`
- ✅ `RESEND_FROM`
- ✅ `RESEND_TO`
- ✅ `CORS_ORIGIN`

## Alternative: Get CLI Access

If you want to use CLI, ask the project owner to:
1. Go to: https://supabase.com/dashboard/project/avgtalosrfygkekqfatp/settings/team
2. Add you as a **Collaborator** with **Admin** or **Developer** role
3. Then you can use: `npx supabase functions deploy chat-ai`

---

**Note:** The function code is already updated with Urdu/Hindi language support and empty content handling. Just copy-paste from `supabase/functions/chat-ai/index.ts` into the dashboard.

