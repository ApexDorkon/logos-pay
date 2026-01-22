const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";

export interface Transaction {
    id: string;
    tier_name?: string;
    merchant: string;
    amount: number;
    cashbackRate: number;
    cashbackEarned: number;
    date: string;
}

export interface CashbackSummary {
    total_earned_usd: number;
    current_month_earned_usd: number;
    current_tier_name: string;
    current_cashback_percent: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    history: any[];
}

export const MERCHANTS = [
    "Starbucks", "Uber", "Amazon", "Apple", "Netflix", "Whole Foods", "Target", "Shell", "Delta"
];

// Helper to map Backend Entry -> Frontend Transaction
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEntryToTransaction(entry: any): Transaction {
    const rate = entry.cashback_percent || 0;
    const reward = entry.reward_amount_usd || 0;
    const estimatedSpend = rate > 0 ? (reward / (rate / 100)) : 0;

    return {
        id: entry.id,
        tier_name: entry.tier_name,
        merchant: entry.source === 'claim' ? "Simulated Spend" : "Logos Card Activity",
        amount: estimatedSpend,
        cashbackRate: rate,
        cashbackEarned: reward,
        date: entry.created_at
    };
}

export async function fetchCashbackSummary(walletAddress: string): Promise<{ summary: CashbackSummary, transactions: Transaction[] }> {
    try {
        const res = await fetch(`${BACKEND_URL}/cashback/summary`, {
            headers: { "X-Wallet-Address": walletAddress }
        });
        if (!res.ok) throw new Error("Failed to fetch summary");

        const data = await res.json();
        const transactions = (data.history || []).map(mapEntryToTransaction);

        return { summary: data, transactions };
    } catch (e) {
        console.error("Fetch Cashback Error:", e);
        return {
            summary: {
                total_earned_usd: 0,
                current_month_earned_usd: 0,
                current_tier_name: "Unknown",
                current_cashback_percent: 0,
                history: []
            },
            transactions: []
        };
    }
}

export async function claimCashback(walletAddress: string, amount: number): Promise<Transaction | null> {
    try {
        const res = await fetch(`${BACKEND_URL}/cashback/claim`, {
            method: "POST",
            headers: {
                "X-Wallet-Address": walletAddress,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ claimed_amount_usd: amount })
        });

        if (!res.ok) throw new Error("Claim failed");

        const entry = await res.json();
        return mapEntryToTransaction(entry);
    } catch (e) {
        console.error("Claim Error:", e);
        return null;
    }
}

export function calculateCashback(amount: number, feePercent: number): number {
    return Number((amount * (feePercent / 100)).toFixed(2));
}
