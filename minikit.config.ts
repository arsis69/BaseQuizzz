const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "Crypto Quiz",
    subtitle: "Test Your Blockchain Knowledge",
    description: "A fun 5-question quiz to test your crypto and blockchain basics",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["quiz", "crypto", "blockchain", "education", "game"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`,
    tagline: "Learn blockchain basics while having fun!",
    ogTitle: "Crypto Quiz - Test Your Blockchain Knowledge",
    ogDescription: "Take this fun 5-question quiz to test your crypto and blockchain knowledge!",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;

