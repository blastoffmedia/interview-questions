/**
 * PROBLEM 3, Campaign Eligibility Filter
 *
 * Context:
 *   A creator opens our app and sees a list of campaigns they can apply to.
 *   For each campaign, several rules decide whether THIS creator is eligible:
 *
 *     1. The creator's follower count on the campaign's primary platform must
 *        be >= the campaign's minimum_followers.
 *     2. The creator must have at least one of the campaign's supported_platforms.
 *     3. The campaign requires a specific approval status; the creator must have it.
 *     4. The campaign's view_cap_remaining must be > 0 (null means no cap, eligible).
 *     5. The creator must not already have an active application to this campaign.
 *
 * YOUR TASK:
 *   Implement `filterEligibleCampaigns(creator, campaigns, activeApplications)`
 *   so it returns ONLY campaigns this creator is eligible for, in the original order.
 *
 *   Bonus (if time allows): return both the eligible list AND, for each ineligible
 *   campaign, the FIRST reason it failed, useful for the UI "why am I not eligible?"
 *   tooltip. The shape is up to you; pick what you'd actually want to consume.
 *
 * Run:    npm run eligibility
 * Expect: the demo runs 3 creator scenarios against the same 10 campaigns and
 *         prints the eligible set for each.
 */

// ---------- types ----------

type Platform = "YouTube" | "Instagram" | "TikTok" | "X";
type ApprovalStatus = "pending" | "approved" | "premium";

interface CreatorProfile {
  id: string;
  name: string;
  /** Follower count per platform the creator is active on. */
  followers: Partial<Record<Platform, number>>;
  approval_status: ApprovalStatus;
}

interface Campaign {
  id: string;
  name: string;
  primary_platform: Platform;
  minimum_followers: number;
  supported_platforms: Platform[];
  required_approval: ApprovalStatus;
  /** null = no cap. */
  view_cap_remaining: number | null;
}

interface Application {
  creator_id: string;
  campaign_id: string;
  status: "active" | "withdrawn" | "rejected";
}

// ----------------------------------------------------------------
// YOUR IMPLEMENTATION
// ----------------------------------------------------------------

function filterEligibleCampaigns(
  creator: CreatorProfile,
  campaigns: Campaign[],
  activeApplications: Application[],
): Campaign[] {
  // TODO: implement
  throw new Error("Not implemented");
}

// ----------------------------------------------------------------
// DEMO RUNNER,three creator scenarios, one campaign list
// ----------------------------------------------------------------

const campaigns: Campaign[] = [
  { id: "c1",  name: "Beauty brand, TikTok",          primary_platform: "TikTok",    minimum_followers: 10_000,  supported_platforms: ["TikTok", "Instagram"],         required_approval: "approved", view_cap_remaining: 50_000 },
  { id: "c2",  name: "Music label, IG reels",         primary_platform: "Instagram", minimum_followers: 5_000,   supported_platforms: ["Instagram"],                   required_approval: "approved", view_cap_remaining: 200_000 },
  { id: "c3",  name: "Premium-only YouTube long-form", primary_platform: "YouTube",   minimum_followers: 50_000,  supported_platforms: ["YouTube"],                     required_approval: "premium",  view_cap_remaining: 1_000_000 },
  { id: "c4",  name: "Tech tool, X threads",          primary_platform: "X",         minimum_followers: 1_000,   supported_platforms: ["X"],                           required_approval: "pending",  view_cap_remaining: 10_000 },
  { id: "c5",  name: "Cross-platform fitness brand",   primary_platform: "Instagram", minimum_followers: 8_000,   supported_platforms: ["Instagram", "TikTok", "YouTube"], required_approval: "approved", view_cap_remaining: null }, // no cap
  { id: "c6",  name: "Capped-out cooking sponsor",     primary_platform: "Instagram", minimum_followers: 5_000,   supported_platforms: ["Instagram", "TikTok"],         required_approval: "approved", view_cap_remaining: 0 },     // cap exhausted
  { id: "c7",  name: "Big budget, YouTube",           primary_platform: "YouTube",   minimum_followers: 100_000, supported_platforms: ["YouTube"],                     required_approval: "approved", view_cap_remaining: 500_000 },
  { id: "c8",  name: "Small TikTok campaign",          primary_platform: "TikTok",    minimum_followers: 2_000,   supported_platforms: ["TikTok"],                      required_approval: "approved", view_cap_remaining: 30_000 },
  { id: "c9",  name: "Cross-platform premium",         primary_platform: "YouTube",   minimum_followers: 20_000,  supported_platforms: ["YouTube", "Instagram"],         required_approval: "premium",  view_cap_remaining: 80_000 },
  { id: "c10", name: "Pending-tier intro",             primary_platform: "TikTok",    minimum_followers: 500,     supported_platforms: ["TikTok"],                      required_approval: "pending",  view_cap_remaining: 5_000 },
];

const creatorSarah: CreatorProfile = {
  id: "sarah",
  name: "Sarah Chen",
  followers: { Instagram: 15_000, TikTok: 12_000, YouTube: 4_000 },
  approval_status: "approved",
};

const creatorMike: CreatorProfile = {
  id: "mike",
  name: "Mike Rodriguez",
  followers: { YouTube: 120_000, X: 30_000 },
  approval_status: "premium",
};

const creatorEmma: CreatorProfile = {
  id: "emma",
  name: "Emma Thompson",
  followers: { TikTok: 800 },
  approval_status: "pending",
};

const activeApplications: Application[] = [
  { creator_id: "sarah", campaign_id: "c2", status: "active" }, // sarah already applied to music label
];

function printRun(label: string, creator: CreatorProfile) {
  const result = filterEligibleCampaigns(creator, campaigns, activeApplications);
  console.log(`\n${label} (${creator.name}):`);
  if (result.length === 0) {
    console.log("  (no eligible campaigns)");
  } else {
    for (const c of result) console.log(`  ${c.id}  ${c.name}`);
  }
}

async function runDemo() {
  printRun("Sarah, approved, IG/TT/YT", creatorSarah);
  printRun("Mike, premium, YT/X",       creatorMike);
  printRun("Emma, pending, low-TT",     creatorEmma);
}

runDemo().catch(err => {
  console.error("Demo crashed:", err);
  process.exit(1);
});

export {};
