# Deploy New CryptoTips Contract

## Why New Contract?

The new contract allows users to acknowledge the **same tip multiple times**. The old contract blocked re-acknowledging.

## Quick Deploy (5 minutes)

### Step 1: Open Remix
Go to https://remix.ethereum.org/

### Step 2: Create Contract File
1. Click "contracts" folder
2. Create new file: `CryptoTips.sol`
3. Copy-paste the entire contract code from `contracts/CryptoTips.sol`

### Step 3: Compile
1. Click "Solidity Compiler" icon (left sidebar)
2. Select compiler version: `0.8.20` or higher
3. Click "Compile CryptoTips.sol" button
4. ✅ Should see green checkmark

### Step 4: Deploy to Base Mainnet
1. Click "Deploy & Run Transactions" icon (left sidebar)
2. **Environment**: Select "Injected Provider - MetaMask"
3. **MetaMask**: Switch network to **Base Mainnet**
4. Make sure you have some ETH on Base (~$1 for deployment)
5. Click **"Deploy"** button (orange button)
6. **Confirm in MetaMask**
7. Wait ~5 seconds
8. ✅ Contract deployed!

### Step 5: Copy Contract Address
1. Look at "Deployed Contracts" section in Remix
2. Copy the address (starts with 0x...)
3. **SAVE THIS ADDRESS**

### Step 6: Verify on BaseScan (Recommended)
1. Go to https://basescan.org/
2. Paste your contract address in search
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Fill in:
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.20
   - License: MIT
6. Paste the contract code
7. Click "Verify and Publish"

### Step 7: Update Frontend
Open `app/contracts/didYouKnowContract.ts` and update:

```typescript
export const DID_YOU_KNOW_CONTRACT_ADDRESS = '0xYourNewAddressHere';

export const DID_YOU_KNOW_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tipId",
        "type": "uint256"
      }
    ],
    "name": "acknowledgeTip",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tipId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalAcknowledgmentsByUser",
        "type": "uint256"
      }
    ],
    "name": "TipAcknowledged",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "TOTAL_TIPS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "totalAcknowledgments",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
```

### Step 8: Update Dashboard.tsx

Change the function name from `acknowledgeFact` to `acknowledgeTip`:

```typescript
const data = encodeFunctionData({
  abi: DID_YOU_KNOW_CONTRACT_ABI,
  functionName: 'acknowledgeTip',  // Changed from 'acknowledgeFact'
  args: [BigInt(currentFact.id)],
});
```

### Step 9: Deploy to Cloudflare
```bash
cd C:\Users\PC\Desktop\base\base-demos
npm run deploy
```

## ✅ Done!

Now users can acknowledge the same tip multiple times - no errors!

## Key Differences from Old Contract

| Old Contract | New Contract |
|--------------|--------------|
| Blocks re-acknowledging | Allows re-acknowledging |
| Tracks unique facts (0-19) | Just counts total acknowledgments |
| `acknowledgeFact()` | `acknowledgeTip()` |
| `hasAcknowledged` mapping | No "has acknowledged" check |
| Max 20 acknowledgments per user | Unlimited acknowledgments |
