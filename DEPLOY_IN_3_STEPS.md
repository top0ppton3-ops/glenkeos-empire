# 🚀 DEPLOY YOUR BACKEND IN 3 EASY STEPS

## Step 1: Open Supabase Dashboard

Go to: **https://supabase.com/dashboard/project/beswluhdxaphtitaovly/functions**

Click **"New function"** or **"Deploy new function"**

---

## Step 2: Copy & Paste The Code

1. **Function name**: `make-server-89a553ba`

2. **Open this file**: `/EDGE_FUNCTION_CODE_TO_PASTE.ts`

3. **Select ALL** (Ctrl+A / Cmd+A)

4. **Copy** (Ctrl+C / Cmd+C)

5. **Paste** into the Supabase function editor

6. Click **"Deploy"**

---

## Step 3: Set Environment Variables

In the function settings (or Project Settings > Edge Functions), add these two variables:

### Variable 1:
- **Name**: `SUPABASE_URL`
- **Value**: `https://beswluhdxaphtitaovly.supabase.co`

### Variable 2:
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Get from **Project Settings > API > service_role key** (secret key)

Click **"Save"**

---

## ✅ VERIFY IT WORKS

Open this URL in your browser:

```
https://beswluhdxaphtitaovly.supabase.co/functions/v1/make-server-89a553ba/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-04-21T...",
  "mode": "production",
  "message": "GlenKeos backend is running!"
}
```

---

## 🔄 SWITCH YOUR APP TO USE REAL BACKEND

1. Open: `/src/app/services/api/index.ts`

2. Find line 10:
   ```typescript
   const USE_MOCK = true;
   ```

3. Change to:
   ```typescript
   const USE_MOCK = false;
   ```

4. Save!

---

## 🎉 YOU'RE DONE!

Your GlenKeos backend is now live on Supabase!

Test it:
- Go to `/test-backend` in your app
- Click "Run Tests"
- All should be ✅ green

Your app now uses the real production backend! 🚀
