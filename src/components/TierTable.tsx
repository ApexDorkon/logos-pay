"use client";

import { TIERS } from "@/config/tiers";
import { Check, X, Shield } from "lucide-react";

interface TierTableProps {
    currentTierName?: string;
    className?: string;
}

export function TierTable({ currentTierName, className }: TierTableProps) {
    return (
        <div className={`overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm ${className}`}>
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex items-center gap-2">
                <Shield size={16} className="text-neutral-500" />
                <h3 className="font-semibold text-sm text-neutral-900">Reputation Tiers</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-neutral-500 border-b border-neutral-100">
                        <tr>
                            <th className="px-6 py-3 font-medium">Tier Name</th>
                            <th className="px-6 py-3 font-medium">Score Range</th>
                            <th className="px-6 py-3 font-medium">Cashback</th>
                            <th className="px-6 py-3 font-medium text-center">Card Access</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {TIERS.map((tier) => {
                            const isActive = currentTierName?.toLowerCase() === tier.name.toLowerCase();
                            return (
                                <tr
                                    key={tier.name}
                                    className={`transition-colors ${isActive ? 'bg-amber-50/50' : 'hover:bg-neutral-50'}`}
                                >
                                    <td className="px-6 py-3 font-medium">
                                        <span className="flex items-center gap-2">
                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[var(--ink)] animate-pulse" />}
                                            <span style={{ color: tier.color }}>{tier.name}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-neutral-600 font-mono text-xs">
                                        {tier.maxScore >= 10000 ? `${tier.minScore}+` : `${tier.minScore} – ${tier.maxScore}`}
                                    </td>
                                    <td className="px-6 py-3 text-neutral-900 font-semibold">
                                        {tier.cashback}%
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        {tier.cardEligible ? (
                                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-500">
                                                <X size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
