"use client";

// import Link from 'next/link';
import { useState } from 'react';
import { LoginModal } from './LoginModal';
import { useRouter } from 'next/navigation';
import { CreditCard } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

export function Navbar() {
    const { authenticated, logout } = usePrivy();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const router = useRouter();

    const handleCardsClick = () => {
        if (authenticated) {
            router.push('/dashboard');
        } else {
            setIsLoginOpen(true);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-16 border-b border-neutral-100 bg-white/80 backdrop-blur-md z-40 flex items-center justify-between px-6">
                <img src="/LogosPayNamePNG.png" alt="Logos Pay" className="h-8" />

                <div className="flex items-center gap-4">
                    {authenticated && (
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-neutral-500 hover:text-black transition"
                        >
                            Sign Out
                        </button>
                    )}

                    <button
                        onClick={handleCardsClick}
                        className="flex items-center gap-2 bg-black text-[#C9A24D] px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-900 transition shadow-sm"
                    >
                        <CreditCard size={16} />
                        Your Cards
                    </button>
                </div>
            </header>

            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    );
}
