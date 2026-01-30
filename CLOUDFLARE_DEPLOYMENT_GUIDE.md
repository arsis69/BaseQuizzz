# Cloudflare Workers Deployment Guide (OpenNext)

Your app is now configured with **OpenNext** - the official Cloudflare adapter for Next.js full-stack applications.

## ✅ What Was Updated

1. **Migrated from deprecated `@cloudflare/next-on-pages` to `@opennextjs/cloudflare`**
2. **Created `wrangler.jsonc`** - Worker configuration with Node.js compatibility
3. **Created `open-next.config.ts`** - OpenNext adapter configuration
4. **Updated `package.json`** - New deployment scripts
5. **Removed `wrangler.toml`** - Replaced with wrangler.jsonc
6. **Updated `next.config.ts`** - Removed unoptimized images (OpenNext handles this)

---

## 🚀 Deploy to Cloudflare (Dashboard Method - Recommended)

### Step 1: Connect Your Repository

1. Go to https://dash.cloudflare.com/
2. Click **Workers & Pages** in the left sidebar
3. Click **Create application** button
4. Click **Pages** tab
5. Click **Connect to Git**
6. Select your repository: **arsis69/BaseQuizzz**

### Step 2: Configure Build Settings

You'll see a page with build configuration. Fill in these fields:

```
Project name: base-quizzz (or your preferred name)
Production branch: main (or master)
Build command: npm run build
Build output directory: .open-next/worker
Root directory: (leave empty)
```

**IMPORTANT:** The build output directory is `.open-next/worker` (NOT `.next`)

### Step 3: Add Environment Variables

Click **"Environment variables (advanced)"** and add these:

**Required:**
```
NODE_VERSION = 18
NEXT_PUBLIC_SUPABASE_URL = your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
NEXT_PUBLIC_ONCHAINKIT_API_KEY = your-coinbase-developer-api-key
NEXT_PUBLIC_PROJECT_NAME = Base Quizzz
```

**Optional (update after first deploy):**
```
NEXT_PUBLIC_URL = (leave blank initially - update after you get your Cloudflare URL)
```

### Step 4: Deploy

1. Click **"Save and Deploy"**
2. Wait 2-3 minutes for the build to complete
3. You'll get a URL like: `https://base-quizzz.pages.dev`

### Step 5: Update Environment Variables (After First Deploy)

1. Go to **Settings** > **Environment variables**
2. Add or update:
   ```
   NEXT_PUBLIC_URL = https://base-quizzz.pages.dev
   ```
3. Go to **Deployments** tab
4. Click **"Retry deployment"** to rebuild with the new URL

---

## 📋 Alternative: Deploy via CLI

If you prefer command-line deployment:

### First-Time Setup

```bash
# Login to Cloudflare
npx wrangler login
```

### Deploy

```bash
# Build and deploy in one command
npm run deploy
```

### Test Locally (Simulates Workers Runtime)

```bash
# Run in Workers runtime locally
npm run preview
```

---

## ⚙️ What Changed in Cloudflare Dashboard Settings

Based on your previous error, here's what you need to change in your **existing** Cloudflare project:

### Go to Settings → Builds & deployments

**BEFORE (Wrong):**
```
Build command: npm run build ✅
Build output directory: .next ❌ WRONG!
Deploy command: npx wrangler deploy ❌ WRONG!
```

**AFTER (Correct):**
```
Build command: npm run build ✅
Build output directory: .open-next/worker ✅ CORRECT!
Deploy command: (leave empty or remove) ✅
```

**The key changes:**
1. **Build output directory**: `.next` → `.open-next/worker`
2. **Deploy command**: Remove `npx wrangler deploy` (leave empty)

---

## 🔧 Troubleshooting

### Build Fails with "Missing entry-point to Worker script"

**Cause:** Build output directory is set to `.next` instead of `.open-next/worker`

**Fix:** Update build output directory to `.open-next/worker` in Cloudflare dashboard

### Module Not Found Errors

**Cause:** Node.js APIs not available

**Fix:** Ensure `wrangler.jsonc` has `"nodejs_compat"` in compatibility flags (already configured)

### Environment Variables Not Working

- Variables starting with `NEXT_PUBLIC_` are client-side accessible
- Non-public variables are server-side only
- Always redeploy after changing environment variables

### Image Optimization Issues

OpenNext uses Cloudflare Images for optimization. If you have custom image domains, configure them in `next.config.ts` under `images.remotePatterns`.

---

## 📚 Key Differences: Old vs New Setup

| Feature | Old (@cloudflare/next-on-pages) | New (OpenNext) |
|---------|--------------------------------|----------------|
| **Status** | Deprecated ⚠️ | Official ✅ |
| **Runtime** | Edge Runtime | Node.js Runtime |
| **Build Output** | `.next` | `.open-next/worker` |
| **Image Optimization** | Disabled | Cloudflare Images ✅ |
| **Node.js APIs** | Limited | Full Support ✅ |
| **Deploy Command** | Pages deploy | Workers deploy |

---

## 📝 Next Steps

1. ✅ Migration complete
2. ⏳ Update Cloudflare dashboard settings (build output: `.open-next/worker`)
3. ⏳ Remove deploy command in dashboard
4. ⏳ Add environment variables
5. ⏳ Deploy and test
6. ⏳ Update `NEXT_PUBLIC_URL` after first deployment

---

## 🔗 Resources

- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs/)
