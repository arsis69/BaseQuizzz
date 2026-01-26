# Complete Deployment Guide - Crypto Quiz App

## Prerequisites
- Wallet with some ETH on Base Mainnet (for contract deployment only)
- OnchainKit API Key from https://portal.cdp.coinbase.com/
- Netlify account (or deployment platform)

---

## Step 1: Deploy Check-In Contract

### Using Remix (Recommended for beginners)

1. **Open Remix IDE**: https://remix.ethereum.org

2. **Create new file**: `QuizCheckIn.sol`

3. **Copy contract code** from `contracts/QuizCheckIn.sol`

4. **Compile**:
   - Click "Solidity Compiler" tab
   - Select compiler: `0.8.20` or higher
   - Click "Compile QuizCheckIn.sol"

5. **Deploy to Base**:
   - Click "Deploy & Run Transactions" tab
   - Environment: Select "Injected Provider - MetaMask"
   - **Connect MetaMask to Base Mainnet**:
     - Network Name: Base Mainnet
     - RPC URL: https://mainnet.base.org
     - Chain ID: 8453
     - Currency Symbol: ETH
   - Click "Deploy"
   - **Confirm transaction** in MetaMask (~$0.50-$1.00 gas fee)

6. **Copy the deployed contract address** (starts with 0x...)

7. **Verify contract on BaseScan** (optional but recommended):
   - Go to https://basescan.org/address/YOUR_CONTRACT_ADDRESS
   - Click "Contract" → "Verify and Publish"
   - Follow verification steps

---

## Step 2: Configure Environment Variables

### Local Development

Update `.env.local`:
```env
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
NEXT_PUBLIC_CHECKIN_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Production (Netlify)

Add environment variables in Netlify:
1. Go to Site Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_URL`: `https://basequizzz.netlify.app`
   - `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: Your OnchainKit API key
   - `NEXT_PUBLIC_CHECKIN_CONTRACT_ADDRESS`: Your deployed contract address
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

---

## Step 3: Test Locally

```bash
npm run dev
```

Navigate to http://localhost:3000 and:
1. Complete a quiz
2. Click "🔥 DAILY CHECK-IN (FREE)"
3. Approve the transaction in wallet
4. Verify transaction is sponsored (no gas cost)

---

## Step 4: Deploy to Production

### Commit Changes

```bash
git add .
git commit -m "Add check-in contract integration with sponsored transactions"
git push origin master
```

### Netlify Auto-Deploy

Netlify will automatically deploy your changes.

---

## Step 5: Verify Contract Integration

1. **Test the check-in**:
   - Complete quiz on production site
   - Click check-in button
   - Confirm transaction (should be FREE)

2. **Verify on BaseScan**:
   - Go to https://basescan.org/address/YOUR_CONTRACT_ADDRESS
   - Check "Events" tab for CheckIn events
   - Verify your builder code appears in transaction data

3. **Check Base.dev Analytics**:
   - Go to base.dev → Settings → Analytics
   - Verify activity is being attributed to `bc_7tz4s96h`

---

## Step 6: Submit for Featured Placement

### Prerequisites Checklist

- [x] Authentication: In-app, no redirects
- [x] Wallet auto-connects
- [x] Onboarding: Clear purpose on dashboard
- [x] Shows user avatar/username
- [x] **Transactions are sponsored** (FREE for users)
- [x] Client-agnostic (works in Base app)
- [x] CTAs visible and centered
- [x] App loads quickly
- [x] Light/dark mode support
- [x] 44px touch targets
- [x] Clear app metadata

### Submission

1. **Verify app on Base Build**:
   - Go to https://base.dev/preview
   - Enter your URL
   - Verify all tabs pass validation

2. **Fill out submission form**:
   - Visit Base featured app submission form
   - Provide:
     - App URL: `https://basequizzz.netlify.app`
     - Description: Clear, user-focused
     - Screenshots: 3x portrait (1284x2778px)
     - Icon: 1024x1024px PNG
     - Cover photo: 1200x630px

---

## Features Summary

### ✅ What Users Get

- **Daily quiz** with blockchain questions
- **Onchain streak tracking** via smart contract
- **FREE transactions** (sponsored by paymaster)
- **Provable achievements** on Base blockchain
- **Badge system** for milestones
- **Leaderboard potential** (data queryable from contract)

### ✅ What You Get

- **Builder code attribution** (`bc_7tz4s96h`) on all transactions
- **Analytics tracking** via Base.dev
- **Potential rewards** from Base builder program
- **Featured placement eligibility**
- **Growing user base** via Base app discovery

---

## Troubleshooting

### Contract Not Working

- Verify `NEXT_PUBLIC_CHECKIN_CONTRACT_ADDRESS` is set correctly
- Check contract is deployed on Base Mainnet (not testnet)
- Verify wallet is connected to Base network

### Transactions Not Sponsored

- Verify `NEXT_PUBLIC_ONCHAINKIT_API_KEY` is set
- Check OnchainKit API key is valid
- Ensure paymaster URL is correct

### App Not Searchable

- Wait 10 minutes after posting
- Re-post URL to Base app feed
- Verify manifest is valid at `/.well-known/farcaster.json`

---

## Support

If you encounter issues:
1. Check BaseScan for contract/transaction status
2. Review browser console for errors
3. Test in Base app (not just web browser)
4. Verify all environment variables are set

---

## Next Steps

After successful deployment:

1. **Promote your app**:
   - Share on Farcaster/Base
   - Encourage daily check-ins
   - Build community

2. **Monitor analytics**:
   - Track user engagement on Base.dev
   - Watch for builder rewards

3. **Iterate**:
   - Add more questions
   - Create seasonal events
   - Build leaderboards from contract data

Congratulations! Your quiz app is live with onchain check-ins! 🎉
