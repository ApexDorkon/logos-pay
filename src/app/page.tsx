"use client";

import { Shell } from "@/components/Shell";
import { ArrowRight, ExternalLink, Shield, Coins, TrendingDown } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginModal } from '@/components/LoginModal';
import { InteractiveTierSlider } from "@/components/InteractiveTierSlider";

export default function LandingPage() {
    const { authenticated } = usePrivy();
    const router = useRouter();
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const handleGetStarted = () => {
        if (authenticated) {
            router.push('/dashboard');
        } else {
            setIsLoginOpen(true);
        }
    };

    return (
        <Shell>
            <div className="flex flex-col min-h-screen relative">

                {/* Hero Split Section */}
                <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] pt-4 pb-4">                    {/* Left Block: Content */}
                    <div className="flex-1 flex flex-col justify-start px-8 lg:px-16 py-12 lg:py-0 z-10 bg-white relative pt-8 lg:pt-6">
                        <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0">
                            {/* Logo Mark */}
                            <div className="w-96 h-auto mb-16 animate-fade-in mx-auto lg:mx-0">
                                <img
                                    src="/LogosPayNamePNG.png"
                                    alt="Logos Pay Logo"
                                    className="object-contain w-full h-full drop-shadow-md"
                                />
                            </div>

                            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-black leading-[1.1] mb-6 animate-fade-in-up">
                                Your Reputation <br />is
                                <span className="text-[#C9A24D]"> Currency</span>.
                            </h1>

                            <p className="text-xl text-neutral-600 mb-8 leading-relaxed animate-fade-in-up delay-100">
                                The first financial card powered by your reputation.
                                <br />
                                Your <strong>Ethos Score</strong> unlocks lower fees, higher limits, and instant rewards.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200">
                                <button
                                    onClick={handleGetStarted}
                                    className="group flex items-center justify-center gap-2 px-8 py-4 bg-black text-[#C9A24D] font-medium rounded-full text-lg hover:bg-neutral-900 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                                >
                                    Get Started
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <a
                                    href="https://ethos.network"
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 px-8 py-4 bg-neutral-100 text-black font-medium rounded-full text-lg hover:bg-neutral-200 transition-all hover:-translate-y-0.5"
                                >
                                    Learn More
                                    <ExternalLink size={20} className="text-neutral-500" />
                                </a>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-12 pt-8 border-t border-neutral-100 flex items-center gap-6 text-sm font-medium text-neutral-400 animate-fade-in delay-300">
                                <span className="flex items-center gap-2 text-neutral-500">
                                    <Shield size={16} /> Secure
                                </span>
                                <span className="flex items-center gap-2 text-neutral-500">
                                    <Coins size={16} /> Deflationary
                                </span>
                                <span className="flex items-center gap-2 text-neutral-500">
                                    <TrendingDown size={16} /> Low Fees
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Block: Video Loop */}
                    <div className="flex-1 hidden lg:flex flex-col items-center justify-start bg-white relative overflow-hidden p-12 pt-8 lg:pt-40">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neutral-50 to-transparent opacity-50" />

                        <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mt-12">
                            <h2 className="text-xl md:text-2xl font-medium mb-5 tracking-tight text-black text-center animate-fade-in-up">
                                Instant Crypto <span className="text-[#C9A24D]">Cashback</span> with{" "}
                                <span className="text-[#C9A24D]">Logos</span> Card
                            </h2>

                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white group animate-scale-in delay-100">
                                {/* Video - Zoomed (scale-125) */}
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover transform scale-125"
                                >
                                    <source src="/logos-pay-video.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>

                                {/* Blend Gradients (Left & Right) - Softer blend to reveal more video */}
                                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/20 to-transparent pointer-events-none" />
                                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/20 to-transparent pointer-events-none" />

                                {/* No Shadow, No Inner Shadow */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Slider Section */}
                <InteractiveTierSlider />

                {/* Footer */}
                <footer className="py-8 text-center text-neutral-500 text-sm bg-white border-t border-neutral-100">
                    <p>© 2026 Logos Pay. Powered by Ethos Network.</p>
                </footer>
            </div>
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </Shell>
    );
}
