# Cloudflare Pages Deployment Guide

## Quick Deploy (Recommended for Windows)

### Step 1: Push to GitHub
Your code is already on GitHub at: https://github.com/arsis69/BaseQuizzz

### Step 2: Deploy via Cloudflare Dashboard

1. **Go to Cloudflare Pages**
   - Visit https://dash.cloudflare.com/
   - Navigate to **Workers & Pages** > **Create application** > **Pages**
   - Click **Connect to Git**
   - Select your repository: `arsis69/BaseQuizzz`

2. **Configure Build Settings**
   ```
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: .next
   Root directory: (leave empty - root)
   ```

3. **Add Environment Variables**
   Click on "Environment variables (advanced)" and add:
   ```
   NODE_VERSION = 18
   NEXT_PUBLIC_URL = (leave blank initially, update after first deploy)
   NEXT_PUBLIC_SUPABASE_URL = your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
   NEXT_PUBLIC_ONCHAINKIT_API_KEY = your-cdp-api-key
   NEXT_PUBLIC_PROJECT_NAME = Base Quizzz
   ```

4. **Deploy**
   - Click **Save and Deploy**
   - Wait for build to complete (~2-3 minutes)
   - You'll get a URL like: `https://base-quizzz.pages.dev`

5. **Update Environment Variables**
   - After first deployment, go to **Settings** > **Environment variables**
   - Update `NEXT_PUBLIC_URL` with your actual Cloudflare Pages URL
   - Redeploy for changes to take effect

## Alternative: Deploy via CLI

If you prefer using the command line:

```bash
# 1. Login to Cloudflare
npm run cf:login

# 2. Deploy (builds and deploys in one command)
npm run cf:deploy
```

Note: CLI deployment may have issues on Windows. Dashboard method is recommended.

## Troubleshooting

### Build Fails
- Ensure Node.js version is set to 18 in environment variables
- Check all required environment variables are set
- Review build logs in Cloudflare dashboard

### Environment Variables Not Working
- Variables starting with `NEXT_PUBLIC_` are accessible client-side
- Other variables are only available server-side
- Rebuild and redeploy after changing variables

### Supabase Connection Issues
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Ensure CORS is configured in Supabase dashboard

## Next Steps

1. ✅ Build completes successfully locally
2. ✅ Cloudflare configuration added
3. ⏳ Deploy to Cloudflare Pages (follow steps above)
4. ⏳ Update `NEXT_PUBLIC_URL` after first deploy
5. ⏳ Test app functionality
6. ⏳ Set up custom domain (optional)

## Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Supabase Docs](https://supabase.com/docs)
