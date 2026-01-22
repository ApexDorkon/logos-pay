"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCrossAppAccounts } from '@privy-io/react-auth';
interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { ready, authenticated } = usePrivy();
const { loginWithCrossAppAccount } = useCrossAppAccounts();

    const router = useRouter();

    // If user becomes authenticated while modal is open, close and redirect
    useEffect(() => {
        if (ready && authenticated && isOpen) {
            onClose();
            router.push('/dashboard');
        }
    }, [ready, authenticated, isOpen, onClose, router]);

    const handleLogin = () => {
  // Ethos provider app id (the one you already have: cm5l76en107pt1lpl2ve2ocfy)
  loginWithCrossAppAccount({ appId: 'cm5l76en107pt1lpl2ve2ocfy' });
};

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative w-full max-w-md bg-white border border-black rounded-xl p-6 shadow-2xl z-10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-black transition"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-4 pt-4">
                            <div className="mx-auto w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-black mb-4">
                                <ShieldCheck size={24} />
                            </div>

                            <h2 className="text-xl font-semibold">Connect with Ethos</h2>
                            <p className="text-sm text-neutral-500 max-w-[80%] mx-auto">
                                Log in to verify your reputation and access your virtual cards.
                            </p>

                            <button
                                onClick={handleLogin}
                                className="w-full mt-6 bg-black text-[#C9A24D] font-medium py-3 rounded-lg hover:bg-neutral-900 transition"
                            >
                                Log in / Sign up
                            </button>

                            <p className="text-xs text-neutral-400 mt-4">
                                Powered by Privy & Ethos
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
