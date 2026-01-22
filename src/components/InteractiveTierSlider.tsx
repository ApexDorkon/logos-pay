
"use client";

import { useState, useMemo } from "react";
import { TIERS } from "@/config/tiers";
import { TrendingUp } from "lucide-react";

export function InteractiveTierSlider() {
    // Start with a score that lands on "Known" or "Established"
    const [score, setScore] = useState(1500);

    const activeTier = useMemo(() => {
        return TIERS.find(t => score >= t.minScore && score <= t.maxScore) || TIERS[TIERS.length - 1];
    }, [score]);

    const percentage = Math.min((score / 3000) * 100, 100);

    return (
        <section className="py-24 bg-white text-neutral-900 relative overflow-hidden">
            {/* Background Effects (Subtle for light mode) */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9A24D]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Calculate Your Rewards</h2>
                    <p className="text-neutral-500 text-lg">
                        Slide to see how your <span className="text-black font-semibold">Ethos Score</span> boosts your potential.
                    </p>
                </div>

                {/* Card Display */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-8 md:p-12 mb-10 shadow-xl relative animate-fade-in-up delay-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                        {/* Left: Score Input */}
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <label className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Estimated Ethos Score</label>
                                    <span className="text-4xl font-mono font-bold text-neutral-900">{score}</span>
                                </div>

                                <div className="relative h-6 flex items-center">
                                    {/* Track */}
                                    <div className="absolute w-full h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#C9A24D] to-yellow-400 transition-all duration-100 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    {/* Slider Input */}
                                    <input
                                        type="range"
                                        min="0"
                                        max="3000"
                                        step="10"
                                        value={score}
                                        onChange={(e) => setScore(Number(e.target.value))}
                                        className="absolute w-full h-6 opacity-0 cursor-pointer z-20"
                                    />
                                    {/* Thumb Indicator */}
                                    <div
                                        className="absolute h-6 w-6 bg-white rounded-full shadow-md border-2 border-[#C9A24D] pointer-events-none transition-all duration-100 ease-out z-10"
                                        style={{ left: `calc(${percentage}% - 12px)` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-neutral-400 mt-2 font-mono">
                                    <span>0</span>
                                    <span>3000+</span>
                                </div>
                            </div>

                            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                                <p className="text-sm text-neutral-500 mb-1">Current Status</p>
                                <div className="text-2xl font-bold" style={{ color: activeTier.color }}>
                                    {activeTier.name}
                                </div>
                                <div className="text-xs text-neutral-500 mt-1">
                                    {activeTier.cardEligible ? "✅ Card Eligible" : "❌ Not Eligible for Card"}
                                </div>
                            </div>
                        </div>

                        {/* Right: Rewards Output */}
                        <div className="space-y-6 flex flex-col justify-center">
                            <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 rounded-2xl border border-neutral-100 text-center transform transition-transform hover:scale-105 duration-300">
                                <div className="p-3 bg-[#C9A24D]/10 rounded-full text-[#C9A24D] mb-4">
                                    <TrendingUp size={32} />
                                </div>
                                <span className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-2">Cashback Reward</span>
                                <span className="text-6xl font-black text-[#C9A24D] tracking-tighter">
                                    {activeTier.cashback}%
                                </span>
                                <p className="text-neutral-400 text-sm mt-4">
                                    on every order
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
