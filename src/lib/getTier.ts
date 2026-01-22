import { TIERS, Tier } from "@/config/tiers";

export interface TierResult extends Tier {
    nextTier?: Tier;
    pointsToNextTier?: number;
}

export function getTier(score: number): TierResult {
    const currentTierIndex = TIERS.findIndex(
        (t) => score >= t.minScore && score <= t.maxScore
    );

    // Fallback if score is somehow out of bounds (e.g. negative)
    // Assuming 0 is min, so index 0 is fallback
    const tierIndex = currentTierIndex === -1 ? 0 : currentTierIndex;
    const currentTier = TIERS[tierIndex];

    const nextTier = TIERS[tierIndex + 1];
    let pointsToNextTier = 0;

    if (nextTier) {
        pointsToNextTier = nextTier.minScore - score;
    }

    return {
        ...currentTier,
        nextTier,
        pointsToNextTier: Math.max(0, pointsToNextTier),
    };
}
