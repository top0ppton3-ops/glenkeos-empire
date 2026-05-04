# ⚡ QUICK DEPLOY REFERENCE

## 📋 WHAT YOU NEED

| Item | Value |
|------|-------|
| **Project ID** | `beswluhdxaphtitaovly` |
| **Function Name** | `make-server-89a553ba` |
| **Dashboard URL** | https://supabase.com/dashboard/project/beswluhdxaphtitaovly |
| **Code File** | `/EDGE_FUNCTION_CODE_TO_PASTE.ts` |

---

## 🎯 DEPLOYMENT CHECKLIST

- [ ] Open Supabase Dashboard
- [ ] Click "New Function"
- [ ] Name it: `make-server-89a553ba`
- [ ] Copy code from `/EDGE_FUNCTION_CODE_TO_PASTE.ts`
- [ ] Paste into function editor
- [ ] Deploy
- [ ] Set `SUPABASE_URL` env var
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` env var
- [ ] Test: https://beswluhdxaphtitaovly.supabase.co/functions/v1/make-server-89a553ba/health
- [ ] Change `USE_MOCK = false` in `/src/app/services/api/index.ts`
- [ ] Test app at `/test-backend`

---

## 🔑 ENVIRONMENT VARIABLES

```
SUPABASE_URL=https://beswluhdxaphtitaovly.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from Project Settings > API > service_role key>
```

---

## ✅ VERIFICATION

### Test URL:
```
https://beswluhdxaphtitaovly.supabase.co/functions/v1/make-server-89a553ba/health
```

### Expected Response:
```json
{"status":"ok","timestamp":"...","mode":"production"}
```

### In App:
1. Go to `/test-backend`
2. Click "Run Tests"
3. All green ✅

---

## 🔧 SWITCH TO PRODUCTION

**File**: `/src/app/services/api/index.ts`

**Line 10**: Change from:
```typescript
const USE_MOCK = true;
```

To:
```typescript
const USE_MOCK = false;
```

---

## 📚 FULL GUIDES

- **3-Step Guide**: `/DEPLOY_IN_3_STEPS.md`
- **Detailed Guide**: `/SUPABASE_EDGE_FUNCTION_DEPLOY.md`
- **API Usage**: `/HOW_TO_USE_THE_API.md`

---

## 🆘 TROUBLESHOOTING

**404**: Function not deployed → Check name is exactly `make-server-89a553ba`

**500**: Missing env vars → Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

**CORS Error**: Check function code has CORS middleware

**Check Logs**: Dashboard > Edge Functions > make-server-89a553ba > Logs

---

## 📞 NEED HELP?

Check the `/DEPLOY_IN_3_STEPS.md` file for detailed instructions!
