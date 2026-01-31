# Deploying DidYouKnow Contract

## Contract: DidYouKnow.sol

This contract allows users to acknowledge interesting crypto facts with no time restrictions.

## Features
- 20 unique crypto facts
- No time limit - users can claim facts anytime
- Track which facts each user has acknowledged
- Get stats on total facts acknowledged per user

## How to Deploy

### Option 1: Using Remix IDE (Easiest)

1. Go to [https://remix.ethereum.org/](https://remix.ethereum.org/)

2. Create a new file `DidYouKnow.sol` and paste the contract code

3. Compile the contract:
   - Click "Solidity Compiler" tab
   - Select compiler version `0.8.20` or higher
   - Click "Compile DidYouKnow.sol"

4. Deploy to Base Mainnet:
   - Click "Deploy & Run Transactions" tab
   - Environment: Select "Injected Provider - MetaMask"
   - Make sure MetaMask is connected to **Base Mainnet** (Chain ID: 8453)
   - Click "Deploy"
   - Confirm the transaction in MetaMask

5. Verify the contract on BaseScan:
   - Go to [https://basescan.org/](https://basescan.org/)
   - Find your deployed contract address
   - Click "Contract" → "Verify and Publish"
   - Select "Single File" and paste the contract code
   - Compiler: `0.8.20`
   - Optimization: `Yes` with `200` runs (if you enabled it)
   - Submit

### Option 2: Using Hardhat/Foundry

```bash
# If using Hardhat
npx hardhat run scripts/deploy-didyouknow.js --network base

# If using Foundry
forge create DidYouKnow --rpc-url https://mainnet.base.org --private-key YOUR_PRIVATE_KEY
```

## After Deployment

1. Copy the deployed contract address
2. Update the contract address in `app/contracts/didYouKnowContract.ts`
3. Test the contract by calling `acknowledgeFact(0)` from your wallet
4. Verify transactions appear on BaseScan

## Contract Functions

### Write Functions
- `acknowledgeFact(uint256 factId)` - Acknowledge a fact (0-19)

### Read Functions
- `hasUserAcknowledgedFact(address user, uint256 factId)` - Check if user acknowledged a fact
- `getUserStats(address user)` - Get total facts acknowledged by user
- `getUserAcknowledgedFacts(address user)` - Get all acknowledged fact IDs for user
- `getNextUnacknowledgedFact(address user)` - Get next unacknowledged fact ID

## Constants
- `TOTAL_FACTS` = 20
