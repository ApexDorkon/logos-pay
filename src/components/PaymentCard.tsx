// import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PaymentCardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tier: { name: string; color: string; };
    last4: string;
    name?: string;
    email?: string;
    balance?: number;
    redemptionUrl?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PaymentCard({ tier, last4, name, email, balance, redemptionUrl, cashback, cardType }: PaymentCardProps & { cashback?: number, cardType?: string }) {
    const [showDetails, setShowDetails] = useState(false);

    const displayEmail = email || "user@example.com";
    const brand = cardType?.toLowerCase().includes('master') ? 'mastercard' : 'visa';

    const BrandLogo = () => {
        if (brand === 'mastercard') {
            return (
                <div className="flex -space-x-3 opacity-90 mix-blend-screen">
                    <div className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-sm"></div>
                    <div className="w-8 h-8 rounded-full bg-yellow-500/80 backdrop-blur-sm"></div>
                </div>
            )
        }
        // Visa
        return (
            <div className="h-8 flex items-center">
                <span className="text-white font-bold italic tracking-wider text-xl mix-blend-overlay opacity-90">VISA</span>
            </div>
        );
    }

    return (
        <div
            className="relative group perspective-1000 cursor-pointer text-left"
            onClick={() => setShowDetails(!showDetails)}
        >
            <div className={`relative w-full aspect-[1.586] shadow-2xl transition-all duration-700 transform-style-3d ${showDetails ? 'rotate-y-180' : ''}`}>

                {/* Front */}
                <div
                    className="absolute inset-0 p-5 flex flex-col justify-between backface-hidden rounded-xl overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${tier.color} 0%, #1a1a1a 100%)` }}
                >
                    <div className="flex justify-between items-start relative z-10">
                        <div className="space-y-0.5">
                            <h3 className="font-bold tracking-widest text-base text-white">LOGOS</h3>
                            <p className="text-[9px] opacity-70 tracking-wider text-white">REASON OVER IMPULSE</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-white/10 text-white">
                            {tier.name}
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10">
                        {/* Chip & Logo Row */}
                        <div className="flex justify-between items-center px-1">
                            <div className="w-10 h-8 bg-yellow-400/80 rounded-md flex relative overflow-hidden shadow-inner">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-600 opacity-50"></div>
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                                <div className="absolute top-0 left-1/2 h-full w-[1px] bg-black/20"></div>
                                <div className="absolute top-1/2 left-1/4 w-1/2 h-1/2 border border-black/20 rounded-sm -translate-y-1/2 translate-x-1/4"></div>
                            </div>
                            <BrandLogo />
                        </div>

                        <div className="flex justify-between items-end pt-1 text-white">
                            <div>
                                <p className="text-[8px] uppercase tracking-widest opacity-60 mb-0.5">Cardholder</p>
                                <p className="font-medium tracking-wide truncate max-w-[140px] text-xs">{displayEmail}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] uppercase tracking-widest opacity-60 mb-0.5">Expires</p>
                                <p className="font-medium tracking-wide text-xs">xx/29</p>
                            </div>
                        </div>
                    </div>

                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none mix-blend-overlay z-0"></div>
                    <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none"></div>
                </div>

                {/* Back (Details) */}
                <div
                    className="absolute inset-0 flex flex-col justify-between backface-hidden rotate-y-180 text-center backdrop-blur-2xl rounded-xl overflow-hidden shadow-2xl bg-neutral-900"
                >
                    {/* Magnetic Strip Visual */}
                    <div className="absolute top-3 left-0 w-full h-5 bg-black/60 z-0"></div>

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col h-full p-4 pt-10 justify-between">

                        {/* Main Value Display */}
                        <div className="flex flex-col items-center justify-center flex-grow">
                            <div className="text-center">
                                <p className="text-[7px] text-white/40 uppercase tracking-[0.2em] mb-0.5">Total Balance</p>
                                <p className="text-lg font-mono text-white tracking-tighter drop-shadow-lg leading-tight">
                                    ${balance?.toFixed(2) || '0.00'}
                                </p>
                            </div>

                            {/* Cashback Badge */}
                            <div className="mt-1.5 flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-md">
                                <div className="w-1 h-1 rounded-full bg-[var(--gold)] animate-pulse"></div>
                                <p className="text-[9px] text-white/80 font-medium">
                                    <span className="text-[var(--gold)]">{cashback || 0}%</span> Cashback
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-1.5">
                            {/* Fake CVC/Security Visual */}
                            <div className="flex justify-between items-center px-1 opacity-40">
                                <p className="text-[7px] text-white/30 uppercase tracking-widest">CVC ***</p>
                                <p className="text-[7px] text-white/30 uppercase tracking-widest">SECURE</p>
                            </div>

                            <a
                                href="https://dashboard.swype.cards"
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-white text-black h-7 rounded-md font-semibold text-[10px] hover:bg-neutral-200 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 group/btn shadow-lg"
                            >
                                <span>Manage Card</span>
                                <span className="group-hover/btn:translate-x-0.5 transition-transform">→</span>
                            </a>
                        </div>
                    </div>

                    {/* Noise/Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                    <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
}
