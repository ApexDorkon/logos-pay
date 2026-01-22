export interface Tier {
    name: string;
    minScore: number;
    maxScore: number;
    cashback: number; // percentage (e.g., 5 for 5%)
    fee: number;      // percentage
    cardEligible: boolean;
    color: string;    // purely for UI decoration if needed
}

export const TIERS: Tier[] = [
    {
        name: "Untrusted",
        minScore: 0,
        maxScore: 799,
        cashback: 0,
        fee: 5,
        cardEligible: false,
        color: "#EF4444" // red
    },
    {
        name: "Questionable",
        minScore: 800,
        maxScore: 1199,
        cashback: 0,
        fee: 4,
        cardEligible: false, // Maybe questionable can't get a card yet?
        color: "#F97316" // orange
    },
    {
        name: "Neutral", // "Natural" in user prompt, assuming "Neutral" or keeping "Natural"
        minScore: 1200,
        maxScore: 1399,
        cashback: 1,
        fee: 3.5,
        cardEligible: true,
        color: "#EAB308" // yellow
    },
    {
        name: "Known",
        minScore: 1400,
        maxScore: 1599,
        cashback: 2,
        fee: 3,
        cardEligible: true,
        color: "#84CC16" // lime
    },
    {
        name: "Established",
        minScore: 1600,
        maxScore: 1799,
        cashback: 3,
        fee: 2.5,
        cardEligible: true,
        color: "#22C55E" // green
    },
    {
        name: "Reputable",
        minScore: 1800,
        maxScore: 1999,
        cashback: 4,
        fee: 2,
        cardEligible: true,
        color: "#14B8A6" // teal
    },
    {
        name: "Exemplary",
        minScore: 2000,
        maxScore: 2199,
        cashback: 5,
        fee: 1.5,
        cardEligible: true,
        color: "#06B6D4" // cyan
    },
    {
        name: "Distinguished",
        minScore: 2200,
        maxScore: 2399,
        cashback: 6,
        fee: 1,
        cardEligible: true,
        color: "#3B82F6" // blue
    },
    {
        name: "Revered",
        minScore: 2400,
        maxScore: 2599,
        cashback: 8,
        fee: 0.5,
        cardEligible: true,
        color: "#8B5CF6" // violet
    },
    {
        name: "Renowned",
        minScore: 2600,
        maxScore: 10000, // Cap at something high
        cashback: 10,
        fee: 0,
        cardEligible: true,
        color: "#C9A24D" // Gold
    }
];
