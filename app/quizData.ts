export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

// Large pool of questions - rotates daily
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is Base?",
    options: [
      "A cryptocurrency exchange",
      "An Ethereum Layer 2 blockchain",
      "A Bitcoin wallet",
      "A mining pool"
    ],
    correctAnswer: 1,
    explanation: "Base is an Ethereum Layer 2 blockchain, built by Coinbase for fast and low-cost transactions."
  },
  {
    question: "What does 'Layer 2' mean in blockchain?",
    options: [
      "The second version of a blockchain",
      "A solution built on top of another blockchain to improve speed and reduce costs",
      "The second layer of security",
      "A backup blockchain"
    ],
    correctAnswer: 1,
    explanation: "Layer 2 solutions are built on top of existing blockchains (like Ethereum) to process transactions faster and cheaper."
  },
  {
    question: "What is a blockchain wallet used for?",
    options: [
      "Only storing Bitcoin",
      "Mining cryptocurrency",
      "Storing, sending, and receiving crypto assets",
      "Trading stocks"
    ],
    correctAnswer: 2,
    explanation: "Wallets let you store, send, and receive cryptocurrency and interact with blockchain applications."
  },
  {
    question: "What is a 'smart contract'?",
    options: [
      "A legal document for crypto trading",
      "Self-executing code on the blockchain",
      "A contract with a crypto exchange",
      "An AI-powered trading bot"
    ],
    correctAnswer: 1,
    explanation: "Smart contracts are self-executing programs on the blockchain that automatically run when conditions are met."
  },
  {
    question: "What makes blockchain transactions secure?",
    options: [
      "They require a password",
      "Banks verify them",
      "Cryptography and distributed network consensus",
      "Government oversight"
    ],
    correctAnswer: 2,
    explanation: "Blockchain uses cryptography and many computers (nodes) working together to verify and secure transactions."
  },
  {
    question: "What is Ethereum?",
    options: [
      "A type of Bitcoin",
      "A blockchain platform for smart contracts and dApps",
      "A crypto wallet",
      "A mining company"
    ],
    correctAnswer: 1,
    explanation: "Ethereum is a blockchain platform that enables smart contracts and decentralized applications (dApps)."
  },
  {
    question: "What does 'gas fee' mean in crypto?",
    options: [
      "The cost of electricity for mining",
      "Transaction fee paid to process operations on a blockchain",
      "Monthly subscription fee",
      "Exchange trading fee"
    ],
    correctAnswer: 1,
    explanation: "Gas fees are transaction fees users pay to have their operations processed on the blockchain network."
  },
  {
    question: "What is a 'private key' in cryptocurrency?",
    options: [
      "Your wallet password",
      "A secret code that gives you access to your crypto",
      "Your username",
      "A security question answer"
    ],
    correctAnswer: 1,
    explanation: "A private key is a secret cryptographic code that proves ownership and allows you to access your cryptocurrency."
  },
  {
    question: "What is 'decentralization' in blockchain?",
    options: [
      "Spreading servers across different countries",
      "No single entity controls the network",
      "Using multiple cryptocurrencies",
      "Having backup systems"
    ],
    correctAnswer: 1,
    explanation: "Decentralization means the blockchain is maintained by many independent participants rather than one central authority."
  },
  {
    question: "What is an NFT?",
    options: [
      "A new type of Bitcoin",
      "A unique digital asset stored on the blockchain",
      "A crypto exchange",
      "A mining algorithm"
    ],
    correctAnswer: 1,
    explanation: "NFT (Non-Fungible Token) is a unique digital asset that represents ownership of specific items on the blockchain."
  },
  {
    question: "What is a blockchain 'node'?",
    options: [
      "A type of cryptocurrency",
      "A computer that maintains a copy of the blockchain",
      "A trading platform",
      "A wallet application"
    ],
    correctAnswer: 1,
    explanation: "A node is a computer in the network that stores and validates a copy of the entire blockchain."
  },
  {
    question: "What is 'DeFi'?",
    options: [
      "A crypto coin",
      "Decentralized Finance - financial services without traditional banks",
      "A blockchain protocol",
      "A mining technique"
    ],
    correctAnswer: 1,
    explanation: "DeFi (Decentralized Finance) refers to financial services built on blockchain that operate without traditional intermediaries."
  },
  {
    question: "What does 'HODL' mean in crypto?",
    options: [
      "Hold On for Dear Life - keeping crypto long-term",
      "A trading strategy",
      "A type of wallet",
      "A blockchain protocol"
    ],
    correctAnswer: 0,
    explanation: "HODL is a term meaning to hold cryptocurrency long-term despite market volatility, originated from a misspelling of 'hold'."
  },
  {
    question: "What is a 'dApp'?",
    options: [
      "A mobile app",
      "A decentralized application running on blockchain",
      "A desktop program",
      "A web browser"
    ],
    correctAnswer: 1,
    explanation: "A dApp (decentralized application) is an application that runs on a blockchain network rather than centralized servers."
  },
  {
    question: "What is 'staking' in cryptocurrency?",
    options: [
      "Buying crypto at market price",
      "Locking up crypto to support network operations and earn rewards",
      "Selling crypto for profit",
      "Transferring crypto between wallets"
    ],
    correctAnswer: 1,
    explanation: "Staking involves locking cryptocurrency to help secure the network and validate transactions, earning rewards in return."
  },
  // -------------------- MODERN WEB3 / ADVANCED CONCEPTS --------------------

{
  question: "Why do many Layer 2 networks post compressed transaction data back to Ethereum?",
  options: [
    "To increase gas fees",
    "To inherit Ethereum's security and data availability",
    "To hide transactions",
    "To mint new tokens"
  ],
  correctAnswer: 1,
  explanation: "By publishing transaction data or proofs to Ethereum, L2s leverage Ethereum as a settlement and data availability layer, inheriting its security while executing transactions elsewhere."
},
{
  question: "What practical problem does account abstraction primarily aim to solve for everyday users?",
  options: [
    "Increase token prices",
    "Remove the need to hold native gas tokens",
    "Replace blockchains",
    "Enable anonymous trading"
  ],
  correctAnswer: 1,
  explanation: "Account abstraction enables features like gas sponsorship, social recovery, session keys, and paying fees in tokens other than the native coin, greatly improving wallet UX."
},
{
  question: "In rollup architectures, what is the main difference between optimistic rollups and zero-knowledge rollups?",
  options: [
    "Optimistic rollups are faster",
    "ZK rollups use validity proofs, optimistic rely on fraud proofs",
    "Optimistic rollups use mining",
    "ZK rollups cannot run smart contracts"
  ],
  correctAnswer: 1,
  explanation: "ZK rollups submit cryptographic validity proofs, while optimistic rollups assume correctness by default and allow challenges during a dispute window."
},
{
  question: "Why are sequencers considered a centralization risk in many Layer 2 systems today?",
  options: [
    "They control NFT royalties",
    "They order and include transactions",
    "They store private keys",
    "They mint tokens"
  ],
  correctAnswer: 1,
  explanation: "If a single entity controls transaction ordering, they can censor, reorder, or extract MEV, which reduces decentralization."
},
{
  question: "What does MEV (Maximal Extractable Value) refer to in modern blockchains?",
  options: [
    "Mining rewards only",
    "Extra profit from controlling transaction ordering",
    "Token inflation",
    "Bridge fees"
  ],
  correctAnswer: 1,
  explanation: "MEV is profit extracted by manipulating transaction ordering, inclusion, or exclusion within a block."
},
{
  question: "Why are intent-based trading systems becoming popular in DeFi?",
  options: [
    "They increase gas costs",
    "They remove the need for wallets",
    "Users express goals instead of execution steps",
    "They prevent smart contracts"
  ],
  correctAnswer: 2,
  explanation: "Users declare what they want (e.g., swap ETH to USDC at best price), and solvers compete to execute it efficiently."
},
{
  question: "What risk is introduced when protocols depend heavily on off-chain oracles?",
  options: [
    "Higher staking yields",
    "Oracle manipulation or downtime",
    "Free gas",
    "Faster blocks"
  ],
  correctAnswer: 1,
  explanation: "If oracle data is incorrect or unavailable, smart contracts may behave incorrectly, leading to losses."
},
{
  question: "Why do many projects distribute tokens via airdrops instead of direct sales?",
  options: [
    "To avoid taxes",
    "To reward early users and bootstrap network effects",
    "To increase gas fees",
    "To hide ownership"
  ],
  correctAnswer: 1,
  explanation: "Airdrops incentivize usage, decentralize ownership, and attract developers and liquidity."
},
{
  question: "What does 'restaking' allow users to do?",
  options: [
    "Stake NFTs",
    "Reuse staked assets to secure multiple protocols",
    "Withdraw early",
    "Avoid slashing"
  ],
  correctAnswer: 1,
  explanation: "Restaking lets staked assets provide security to additional networks, increasing capital efficiency."
},
{
  question: "Why is data availability often considered the main bottleneck for blockchain scalability?",
  options: [
    "Computation is slow",
    "Storing transaction data securely is expensive",
    "Wallets are buggy",
    "Nodes are illegal"
  ],
  correctAnswer: 1,
  explanation: "Ensuring that transaction data is available and verifiable for all users limits how much throughput chains can safely handle."
},

// -------------------- TOKENOMICS / GOVERNANCE --------------------

{
  question: "Why can high token inflation hurt long-term holders even if price stays stable?",
  options: [
    "It lowers gas fees",
    "It dilutes ownership",
    "It increases liquidity",
    "It improves decentralization"
  ],
  correctAnswer: 1,
  explanation: "Newly issued tokens reduce each holder’s percentage ownership of the network."
},
{
  question: "What is a common weakness of on-chain governance?",
  options: [
    "Too fast decisions",
    "Voter apathy and whale dominance",
    "Free transactions",
    "No smart contracts"
  ],
  correctAnswer: 1,
  explanation: "Large holders often control outcomes, while most users do not participate."
},
{
  question: "Why do some protocols separate governance tokens from fee tokens?",
  options: [
    "To confuse users",
    "To reduce taxes",
    "To isolate speculation from control",
    "To avoid wallets"
  ],
  correctAnswer: 2,
  explanation: "This prevents speculators from easily capturing governance power."
},

// -------------------- SECURITY / REAL RISKS --------------------

{
  question: "Why are token approvals a hidden risk for long-term DeFi users?",
  options: [
    "They expire automatically",
    "Approved contracts can later become malicious",
    "They cost gas",
    "They slow transactions"
  ],
  correctAnswer: 1,
  explanation: "Old unlimited approvals can be exploited if a contract is compromised."
},
{
  question: "What makes cross-chain bridges frequent hacking targets?",
  options: [
    "Low liquidity",
    "Centralized custody or complex validation logic",
    "High gas fees",
    "Open-source code"
  ],
  correctAnswer: 1,
  explanation: "Bridges often hold large pooled funds and rely on fragile verification systems."
},
{
  question: "Why is signing a message sometimes more dangerous than sending a transaction?",
  options: [
    "It costs gas",
    "It can grant sweeping permissions",
    "It fails often",
    "It reveals private key"
  ],
  correctAnswer: 1,
  explanation: "Some signatures authorize spending without an on-chain transaction."
},

// -------------------- LAYER 2 / MODULAR --------------------

{
  question: "What does 'modular blockchain' design mean?",
  options: [
    "One chain does everything",
    "Separate layers handle execution, settlement, and data",
    "No smart contracts",
    "Only NFTs"
  ],
  correctAnswer: 1,
  explanation: "Different layers specialize, improving scalability and flexibility."
},
{
  question: "Why might a rollup choose to use an external data availability layer instead of Ethereum?",
  options: [
    "For censorship",
    "For lower costs",
    "For slower blocks",
    "For anonymity"
  ],
  correctAnswer: 1,
  explanation: "Cheaper DA layers reduce transaction fees."
},

// -------------------- USER EXPERIENCE --------------------

{
  question: "Why are smart contract wallets better suited for mainstream users than EOAs?",
  options: [
    "They mine blocks",
    "They allow recovery and automation",
    "They hide transactions",
    "They increase volatility"
  ],
  correctAnswer: 1,
  explanation: "Features like social recovery and spending limits improve safety."
},
{
  question: "What problem do session keys solve?",
  options: [
    "High inflation",
    "Repeated wallet approvals",
    "Slow blocks",
    "Low liquidity"
  ],
  correctAnswer: 1,
  explanation: "They allow limited temporary permissions for apps."
},

// -------------------- ECONOMICS --------------------

{
  question: "Why can high APY be a warning sign in DeFi?",
  options: [
    "Too many users",
    "Unsustainable token emissions",
    "Low gas fees",
    "High liquidity"
  ],
  correctAnswer: 1,
  explanation: "Rewards often come from inflation rather than real revenue."
},
{
  question: "What does protocol revenue usually represent?",
  options: [
    "Token price",
    "Fees paid by users",
    "Gas refunds",
    "Airdrop size"
  ],
  correctAnswer: 1,
  explanation: "Income generated by protocol activity."
},

// -------------------- EMERGING THEMES --------------------

{
  question: "Why are RWAs (real-world assets) important for crypto adoption?",
  options: [
    "They increase meme coins",
    "They connect blockchain to traditional finance value",
    "They remove wallets",
    "They stop volatility"
  ],
  correctAnswer: 1,
  explanation: "Tokenizing real assets brings real economic activity on-chain."
},
{
  question: "What is the main appeal of on-chain order books returning in some ecosystems?",
  options: [
    "More centralization",
    "Better composability",
    "Higher gas fees",
    "No liquidity"
  ],
  correctAnswer: 1,
  explanation: "On-chain order books integrate deeply with DeFi."
},
{
  question: "Why are app-chains becoming popular?",
  options: [
    "They replace wallets",
    "Apps control their own execution environment",
    "They stop gas",
    "They remove tokens"
  ],
  correctAnswer: 1,
  explanation: "Customization and performance optimization."
},
{
  question: "What does 'credible neutrality' mean in blockchain design?",
  options: [
    "Anonymous founders",
    "No special privileges for any user",
    "High inflation",
    "Closed source"
  ],
  correctAnswer: 1,
  explanation: "Rules apply equally to everyone."
},
{
  question: "What is MEV?",
  options: [
    "Miner Extractable Value",
    "Maximum Ethereum Volume",
    "Minimum Exchange Value",
    "Managed Execution Vault"
  ],
  correctAnswer: 0,
  explanation: "Profit from transaction ordering."
},
{
  question: "What is a rollup?",
  options: [
    "Layer 1 fork",
    "Layer 2 scaling solution",
    "Wallet backup",
    "Mining pool"
  ],
  correctAnswer: 1,
  explanation: "Bundles transactions off-chain."
},
{
  question: "What is account abstraction?",
  options: [
    "Wallet upgrade",
    "Smart contract wallets",
    "Exchange feature",
    "Mining update"
  ],
  correctAnswer: 1,
  explanation: "Makes wallets programmable."
},
{
  question: "What is a flash loan?",
  options: [
    "Instant loan repaid in same tx",
    "Long-term loan",
    "Collateral-free bank loan",
    "Bridge transfer"
  ],
  correctAnswer: 0,
  explanation: "Atomic borrowing."
},
{
  question: "What is reentrancy attack?",
  options: [
    "Wallet hack",
    "Repeated contract call exploit",
    "Bridge exploit",
    "Mining attack"
  ],
  correctAnswer: 1,
  explanation: "Classic smart contract bug."
},
{
  question: "What is a zk-proof?",
  options: [
    "Zero-knowledge proof",
    "Zero key protocol",
    "Zonal key",
    "Zigzag pattern"
  ],
  correctAnswer: 0,
  explanation: "Proves validity without revealing data."
},
{
  question: "What is finality?",
  options: [
    "Transaction cannot be reversed",
    "Pending state",
    "Gas refund",
    "Token burn"
  ],
  correctAnswer: 0,
  explanation: "Permanent confirmation."
},
{
  question: "What is a Merkle tree?",
  options: [
    "Database structure",
    "Hash structure",
    "Wallet",
    "Exchange"
  ],
  correctAnswer: 1,
  explanation: "Efficient verification structure."
},
{
  question: "What is a hard fork?",
  options: [
    "Backward-compatible update",
    "Non-compatible protocol change",
    "Wallet update",
    "Gas increase"
  ],
  correctAnswer: 1,
  explanation: "Creates new chain rules."
},
{
  question: "What is slashing?",
  options: [
    "Reward",
    "Penalty for validators",
    "Burn event",
    "Airdrop"
  ],
  correctAnswer: 1,
  explanation: "Punishes bad validators."
}

];

// Get daily questions (5 questions that change each day)
export function getDailyQuestions(): QuizQuestion[] {
  const today = new Date();
  // Use date as seed for consistent daily selection
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

  // Simple seeded shuffle using day of year
  const shuffled = [...ALL_QUESTIONS];
  let seed = dayOfYear;

  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Return first 5 questions
  return shuffled.slice(0, 5);
}

// For backwards compatibility
export const quizQuestions = getDailyQuestions();
