import { Transaction } from "@/lib/rewards";

export function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 text-neutral-400 text-sm">
                No recent transactions.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col">
                        <span className="font-medium text-sm text-neutral-900">{tx.merchant}</span>
                        <span className="text-[10px] text-neutral-500">{new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="text-right">
                        <div className="text-sm font-semibold text-neutral-900">-${tx.amount.toFixed(2)}</div>
                        <div className="text-[10px] font-medium text-[var(--gold)] bg-[var(--ink)] px-1.5 py-0.5 rounded-full inline-block mt-1">
                            +${tx.cashbackEarned.toFixed(2)} Cashback
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
