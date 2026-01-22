import { TrendingUp, Zap, Loader2, Wallet, Check, X } from "lucide-react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"; import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { formatEther } from "viem";
import { useWallets } from "@privy-io/react-auth";
import LogosCashbackVaultUserABI from "@/abi/LogosCashbackVaultUserABI.json";
const CASHBACK_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CASHBACK_CONTRACT_ADDRESS as `0x${string}`;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";

interface RewardsStatsProps {
    totalEarned: number;
    rewardWallet?: string;
    userAddress: string;
    onUpdateRewardWallet?: () => void;
}

export function RewardsStats({ totalEarned, rewardWallet, userAddress, onUpdateRewardWallet }: RewardsStatsProps) {
    const { connectWallet } = usePrivy();
    const [isConnecting, setIsConnecting] = useState(false);
    const { wallets } = useWallets();

    const activeWallet = wallets[0];
    const isWalletConnected = !!activeWallet;
    useEffect(() => {
        if (!activeWallet?.address) return;
        if (!userAddress) return;
        // If reward wallet exists and is different → do nothing
        if (
            rewardWallet &&
            rewardWallet.toLowerCase() !== activeWallet.address.toLowerCase()
        ) {
            return;
        }

        // If reward wallet already saved and matches → do nothing
        if (
            rewardWallet &&
            rewardWallet.toLowerCase() === activeWallet.address.toLowerCase()
        ) {
            return;
        }

        // If reward wallet is empty → save connected wallet
        (async () => {
            try {
                await fetch(`${BACKEND_URL}/users/reward-wallet`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Wallet-Address": userAddress,
                    },
                    body: JSON.stringify({
                        reward_wallet: activeWallet.address,
                    }),
                });

                onUpdateRewardWallet?.();
                console.log("✅ Reward wallet saved:", activeWallet.address);
            } catch (e) {
                console.error("❌ Failed to save reward wallet", e);
            }
        })();
    }, [isWalletConnected, activeWallet?.address, rewardWallet, userAddress]);
    /**
     * 1️⃣ PRIVY SMART WALLET (ON-CHAIN IDENTITY)
     * This is the address cashback is assigned to in the contract
     */

    useEffect(() => {
        console.log("🧾 DB wallet_address (userAddress):", userAddress);
        console.log("👛 Active Privy wallet:", activeWallet?.address);
    }, [activeWallet, userAddress]);

    /**
     * 
     * 2️⃣ CASHBACK OWNER (ALWAYS THIS)
     */
    const cashbackOwner = (rewardWallet || activeWallet?.address) as
        | `0x${string}`
        | undefined;

    const isWrongWallet =
        !!activeWallet &&
        !!rewardWallet &&
        activeWallet.address.toLowerCase() !== rewardWallet.toLowerCase();
    /**
     * 3️⃣ PAYOUT / DISPLAY WALLET (OFF-CHAIN ONLY)
     */
    const payoutWallet = rewardWallet || cashbackOwner;
    // ✅ 1. Try to find a specific Privy embedded wallet

    // ✅ 3. Determine Identity for Logic
    // If a specific Reward Wallet is saved in DB, use that. Otherwise use the Active/Smart Wallet.

    const [mounted, setMounted] = useState(false);

    // Reward Wallet Edit State
    const [isEditingWallet, setIsEditingWallet] = useState(false);
    const [newWalletInput, setNewWalletInput] = useState("");
    const [isSavingWallet, setIsSavingWallet] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (rewardWallet) setNewWalletInput(rewardWallet);
    }, [rewardWallet]);

    // 1. Read Claimable Balance
    const { data: claimableWei, refetch } = useReadContract({
        address: CASHBACK_CONTRACT_ADDRESS,
        abi: LogosCashbackVaultUserABI,
        functionName: "claimable",
        args: cashbackOwner ? [cashbackOwner] : undefined,
        query: {
            enabled: !!cashbackOwner && !!CASHBACK_CONTRACT_ADDRESS,
            refetchInterval: 5000,
        },
    });
    // 2. Claim Action
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isConfirmed) {
            refetch(); // Update balance after successful claim
        }
    }, [isConfirmed, refetch]);
    const handleClaim = async () => {
        if (!activeWallet) {
            await connectWallet();
            return;
        }

        if (!CASHBACK_CONTRACT_ADDRESS) {
            alert("Contract not ready");
            return;
        }

        writeContract({
            address: CASHBACK_CONTRACT_ADDRESS,
            abi: LogosCashbackVaultUserABI,
            functionName: "claim",
            account: activeWallet.address as `0x${string}`,
        });
    };
    const handleSaveWallet = async () => {
        if (!newWalletInput || !newWalletInput.startsWith("0x") || newWalletInput.length !== 42) {
            alert("Please enter a valid Ethereum address.");
            return;
        }
        setIsSavingWallet(true);
        try {
            const res = await fetch(`${BACKEND_URL}/users/reward-wallet`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    // Use Authenticated User Address for Identify
                    "X-Wallet-Address": userAddress || ""
                },
                body: JSON.stringify({ reward_wallet: newWalletInput })
            });

            if (!res.ok) throw new Error("Failed to update wallet");

            // Success Animation
            setIsSaved(true);
            if (onUpdateRewardWallet) onUpdateRewardWallet();

            // Close after delay
            setTimeout(() => {
                setIsSaved(false);
                setIsEditingWallet(false);
            }, 1500);

        } catch (e) {
            console.error(e);
            alert("Failed to update reward wallet.");
        } finally {
            setIsSavingWallet(false);
        }
    };

    const claimableEth = claimableWei ? formatEther(claimableWei as bigint) : "0.0";
    const isClaiming = isWritePending || isConfirming;

    if (!mounted) return <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>;

    const displayRewardWallet = payoutWallet;
    return (
        <div className="grid grid-cols-1 gap-4 mb-4">
            {/* Total Earned (Database) */}
            <div className="rounded-xl bg-gradient-to-br from-[var(--ink)] to-neutral-900 p-5 text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={48} />
                </div>
                <p className="text-xs uppercase tracking-widest text-neutral-400 font-medium">Total Earned (USD)</p>
                <p className="mt-2 text-3xl font-bold text-[var(--gold)]">
                    ${totalEarned.toFixed(2)}
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">Lifetime Cashback</p>
            </div>

            {/* Claimable (On-Chain) */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm relative overflow-hidden group flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-[var(--ink)] group-hover:opacity-20 transition-opacity">
                    <Zap size={48} />
                </div>

                <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Claimable Rewards</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-neutral-900">{parseFloat(claimableEth).toFixed(5)}</p>
                        <span className="text-sm font-medium text-neutral-500">ETH</span>
                    </div>
                </div>
                {activeWallet && isWrongWallet && (
                    <p className="text-[10px] text-red-500 mt-2">
                        Wrong wallet connected. Please connect the rewards wallet ending in{" "}
                        {rewardWallet?.slice(-4)}.
                    </p>
                )}
                <div className="mt-4">
                    {!activeWallet ? (
                        // 1️⃣ ALWAYS show connect if disconnected
                        <button
                            disabled={isConnecting}
                            onClick={async () => {
                                if (isConnecting) return;
                                setIsConnecting(true);
                                await connectWallet();
                                setIsConnecting(false);
                            }}
                            className="w-full bg-[var(--ink)] text-white text-xs font-semibold py-2 rounded-lg hover:bg-black transition disabled:opacity-50"
                        >
                            {isConnecting ? "Connecting..." : "Connect Rewards Wallet"}
                        </button>

                    ) : isWrongWallet ? (
                        // 2️⃣ Wallet connected BUT wrong
                        <button
                            onClick={async () => {
                                await connectWallet();
                            }}
                            className="w-full bg-neutral-100 text-neutral-700 text-xs font-semibold py-2 rounded-lg hover:bg-neutral-200 transition"
                        >
                            Switch to Rewards Wallet
                        </button>

                    ) : Number(claimableEth) > 0 ? (
                        // 3️⃣ Correct wallet → claim
                        <button
                            onClick={handleClaim}
                            disabled={isClaiming}
                            className="w-full bg-[var(--ink)] text-white text-xs font-semibold py-2 rounded-lg hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isClaiming ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                            {isClaiming ? "Claiming..." : "Claim Now"}
                        </button>

                    ) : (
                        // 4️⃣ No rewards
                        <p className="text-[10px] text-neutral-400 mt-1">
                            Nothing to claim yet.
                        </p>
                    )}
                </div>

                {/* Reward Wallet UI */}
                <div className="mt-6 pt-4 border-t border-dashed border-neutral-200">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Reward Wallet</p>

                    </div>

                    {isEditingWallet ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={newWalletInput}
                                onChange={(e) => setNewWalletInput(e.target.value)}
                                className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg font-mono focus:outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)]/10 transition-all placeholder:text-neutral-300 bg-neutral-50/50"
                                placeholder="0x..."
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveWallet}
                                    disabled={isSavingWallet || isSaved}
                                    className={`flex-1 text-white text-xs font-medium py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-70 ${isSaved ? "bg-green-600 hover:bg-green-700" : "bg-[var(--ink)] hover:bg-black"
                                        }`}
                                >
                                    {isSavingWallet ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : isSaved ? (
                                        <>
                                            <Check size={12} /> Saved!
                                        </>
                                    ) : (
                                        <>
                                            <Check size={12} /> Save
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsEditingWallet(false)}
                                    className="flex-1 bg-white border border-neutral-200 text-neutral-600 text-xs font-medium py-1.5 rounded-lg hover:bg-neutral-50 transition flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <X size={12} /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-sm">
                                <Wallet size={12} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] text-neutral-400 uppercase leading-none mb-0.5">Cashback sent to</p>
                                <p className="text-xs font-mono truncate text-neutral-700 font-medium" title={displayRewardWallet}>
                                    {displayRewardWallet?.slice(0, 6)}...{displayRewardWallet?.slice(-4)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
