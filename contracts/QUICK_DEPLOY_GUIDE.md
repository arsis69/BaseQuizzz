# Quick Deploy Guide - DidYouKnow Contract

## 🚀 Deploy in 5 Minutes

### Step 1: Open Remix
Go to https://remix.ethereum.org/

### Step 2: Create Contract File
1. Click "contracts" folder
2. Create new file: `DidYouKnow.sol`
3. Copy-paste the entire contract code from `contracts/DidYouKnow.sol`

### Step 3: Compile
1. Click "Solidity Compiler" icon (left sidebar)
2. Select compiler version: `0.8.20` or higher
3. Click "Compile DidYouKnow.sol" button
4. ✅ Should see green checkmark

### Step 4: Deploy to Base
1. Click "Deploy & Run Transactions" icon (left sidebar)
2. **Environment**: Select "Injected Provider - MetaMask"
3. **MetaMask will pop up**:
   - Switch network to **Base Mainnet**
   - If you don't have Base, add it:
     - Network Name: Base Mainnet
     - RPC URL: https://mainnet.base.org
     - Chain ID: 8453
     - Currency: ETH
     - Block Explorer: https://basescan.org
4. Make sure you have some ETH on Base (~$2 for deployment)
5. Click **"Deploy"** button (orange button)
6. **Confirm in MetaMask**
7. Wait ~5 seconds
8. ✅ Contract deployed!

### Step 5: Copy Contract Address
1. Look at "Deployed Contracts" section in Remix
2. Copy the address (starts with 0x...)
3. **SAVE THIS ADDRESS** - you'll need it!

### Step 6: Verify on BaseScan (Optional but Recommended)
1. Go to https://basescan.org/
2. Paste your contract address in search
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Fill in:
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.20 (match what you used in Remix)
   - License: MIT
6. Paste the contract code
7. Click "Verify and Publish"

### Step 7: Update Frontend
1. Open `app/contracts/didYouKnowContract.ts`
2. Find this line:
   ```typescript
   export const DID_YOU_KNOW_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';
   ```
3. Replace with your deployed address:
   ```typescript
   export const DID_YOU_KNOW_CONTRACT_ADDRESS = '0xYourAddressHere';
   ```

### Step 8: Deploy to Cloudflare
```bash
cd C:\Users\PC\Desktop\base\base-demos
npm run deploy
```

## ✅ Done!

Your "Did You Know" feature is now live on Base mainnet!

## 🧪 Test It
1. Open your app: https://basequiz.arsssn85.workers.dev
2. Connect your wallet
3. See the blue "Did You Know?" card
4. Click "Acknowledge (FREE!)"
5. Check BaseScan to see your transaction!

## 📊 Monitor Your Contract
View all acknowledgments on BaseScan:
https://basescan.org/address/YOUR_CONTRACT_ADDRESS

## 💡 Tips
- Each fact can only be acknowledged once per user
- All transactions are gasless (sponsored by paymasters)
- Users can acknowledge facts in any order
- The contract shows 20 total facts
- Each acknowledgment costs ~50,000 gas (~$0.001 on Base!)
