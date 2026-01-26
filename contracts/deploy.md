# QuizCheckIn Contract Deployment Guide

## Option 1: Deploy with Remix (Easiest)

1. **Go to Remix IDE**: https://remix.ethereum.org

2. **Create new file**: `QuizCheckIn.sol`

3. **Copy the contract code** from `QuizCheckIn.sol`

4. **Compile**:
   - Select compiler version: 0.8.20 or higher
   - Click "Compile QuizCheckIn.sol"

5. **Deploy to Base**:
   - Go to "Deploy & Run Transactions"
   - Environment: "Injected Provider - MetaMask"
   - **Connect to Base Network**:
     - Network: Base Mainnet
     - RPC: https://mainnet.base.org
     - Chain ID: 8453
   - Click "Deploy"
   - Confirm transaction in MetaMask

6. **Copy the deployed contract address**

## Option 2: Deploy with Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

Create deployment script `scripts/deploy.js`:
```javascript
async function main() {
  const QuizCheckIn = await ethers.getContractFactory("QuizCheckIn");
  const contract = await QuizCheckIn.deploy();
  await contract.deployed();
  console.log("QuizCheckIn deployed to:", contract.address);
}

main();
```

Deploy:
```bash
npx hardhat run scripts/deploy.js --network base
```

## After Deployment

1. **Verify on BaseScan**: https://basescan.org/address/YOUR_CONTRACT_ADDRESS

2. **Update `.env.local`**:
   ```
   NEXT_PUBLIC_CHECKIN_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
   ```

3. **Test the contract**:
   - Call `checkIn()` function
   - Verify `getUserStats()` returns correct data

## Contract Address Storage

Once deployed, save the address in:
- `.env.local` (for local development)
- Netlify environment variables (for production)
