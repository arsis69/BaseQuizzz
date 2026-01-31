export interface DidYouKnowFact {
  id: number;
  fact: string;
  category: string;
}

// 20 up-to-date and interesting crypto facts
export const DID_YOU_KNOW_FACTS: DidYouKnowFact[] = [
  {
    id: 0,
    fact: "Base processes over 10 million transactions per day, making it one of the most active Layer 2 networks on Ethereum.",
    category: "Base"
  },
  {
    id: 1,
    fact: "Account Abstraction (ERC-4337) enables gasless transactions, allowing apps to sponsor user fees without requiring ETH in their wallet.",
    category: "Technology"
  },
  {
    id: 2,
    fact: "Layer 2 solutions like Base can reduce transaction costs by over 95% compared to Ethereum mainnet while maintaining security.",
    category: "Scalability"
  },
  {
    id: 3,
    fact: "Smart contract wallets can have social recovery, allowing trusted friends or family to help recover your account if you lose access.",
    category: "Security"
  },
  {
    id: 4,
    fact: "ZK-rollups use zero-knowledge proofs to bundle thousands of transactions into a single proof, drastically improving blockchain scalability.",
    category: "Technology"
  },
  {
    id: 5,
    fact: "In 2024, over $200 billion in value was secured by blockchain networks, more than many traditional financial institutions.",
    category: "Adoption"
  },
  {
    id: 6,
    fact: "MEV (Maximal Extractable Value) represents billions of dollars extracted annually from blockchain transaction ordering.",
    category: "Economics"
  },
  {
    id: 7,
    fact: "Restaking protocols allow you to use the same staked ETH to secure multiple networks simultaneously, increasing capital efficiency.",
    category: "DeFi"
  },
  {
    id: 8,
    fact: "The average Ethereum block time is approximately 12 seconds, while Base can confirm transactions in under 2 seconds.",
    category: "Performance"
  },
  {
    id: 9,
    fact: "Real World Assets (RWAs) like treasury bonds and real estate worth over $10 billion have been tokenized on blockchains in 2024.",
    category: "Adoption"
  },
  {
    id: 10,
    fact: "Blockchain oracle networks process millions of data points daily to feed real-world information into smart contracts.",
    category: "Infrastructure"
  },
  {
    id: 11,
    fact: "Intent-based trading allows users to specify what they want (like 'swap 1 ETH for USDC at best price') and solvers compete to fulfill it.",
    category: "DeFi"
  },
  {
    id: 12,
    fact: "Session keys in smart wallets allow temporary permissions for specific actions, eliminating repetitive transaction approvals.",
    category: "UX"
  },
  {
    id: 13,
    fact: "App-specific blockchains (app-chains) allow developers to customize every aspect of their blockchain environment for optimal performance.",
    category: "Infrastructure"
  },
  {
    id: 14,
    fact: "Data availability layers are crucial for blockchain scalability - Ethereum uses up to 125 KB per block for rollup data.",
    category: "Scalability"
  },
  {
    id: 15,
    fact: "Cross-chain bridges have been major hacking targets, with over $2 billion stolen in bridge exploits since 2021.",
    category: "Security"
  },
  {
    id: 16,
    fact: "Flash loans allow borrowing millions of dollars with zero collateral, as long as the loan is repaid within the same transaction.",
    category: "DeFi"
  },
  {
    id: 17,
    fact: "Modular blockchains separate execution, settlement, consensus, and data availability into different specialized layers.",
    category: "Architecture"
  },
  {
    id: 18,
    fact: "On-chain governance allows token holders to vote on protocol upgrades, but often suffers from low participation rates (typically under 10%).",
    category: "Governance"
  },
  {
    id: 19,
    fact: "Sequencers in Layer 2 networks order transactions, but centralized sequencers pose risks of censorship and MEV extraction.",
    category: "Decentralization"
  }
];

// Get a random unacknowledged fact
export function getRandomFact(acknowledgedFacts: number[]): DidYouKnowFact {
  console.log('[FACTS] Finding random fact, acknowledged:', acknowledgedFacts);

  const unacknowledged = DID_YOU_KNOW_FACTS.filter(
    fact => !acknowledgedFacts.includes(fact.id)
  );

  console.log('[FACTS] Unacknowledged facts:', unacknowledged.map(f => f.id));

  if (unacknowledged.length === 0) {
    // If all facts acknowledged, cycle through them again
    console.log('[FACTS] All facts acknowledged! Showing first fact.');
    return DID_YOU_KNOW_FACTS[0];
  }

  const randomFact = unacknowledged[Math.floor(Math.random() * unacknowledged.length)];
  console.log('[FACTS] Selected fact:', randomFact.id);
  return randomFact;
}
