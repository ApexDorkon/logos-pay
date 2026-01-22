"use client";

import { useEffect, useState, useCallback } from "react";
import { Shell } from "@/components/Shell";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { TierResult } from "@/lib/getTier";
import { PaymentCard } from "@/components/PaymentCard";
import { IssueCardForm, StarpayFormData } from "@/components/IssueCardForm";
import { BridgeWidget } from "@/components/BridgeWidget";
import { DeleteCardModal } from "@/components/DeleteCardModal";
import { TierTable } from "@/components/TierTable";
import { Plus, X, Zap, Loader2, Clock, AlertTriangle, Wallet, CreditCard as CreditCardIcon } from "lucide-react";
import {
  Transaction,
  fetchCashbackSummary,
  claimCashback,
  MERCHANTS
} from "@/lib/rewards";
import { TransactionHistory } from "@/components/TransactionHistory";
import { RewardsStats } from "@/components/RewardsStats";
import { StarpayOrderResponse } from "@/lib/starpay";
import { TIERS } from "@/config/tiers";

// Backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";

interface CardDetails {
  id: string;
  last4: string;
  name: string;
  email?: string;
  value?: number;
  type?: string;
  redemptionCode?: string;
  redemptionUrl?: string;
}

function getEthosAddress(user: { linkedAccounts?: unknown[]; linked_accounts?: unknown[] } | null): string | null {
  if (!user) return null;

  const linked =
    user.linkedAccounts ??
    user.linked_accounts ??
    [];

  const crossApp = linked.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any) => a.type === "cross_app"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;

  if (!crossApp) return null;

  // Prefer smart wallet (stable identity)
  const smart =
    crossApp.smart_wallets?.[0]?.address ??
    crossApp.smartWallets?.[0]?.address;

  // Fallback to embedded
  const embedded =
    crossApp.embedded_wallets?.[0]?.address ??
    crossApp.embeddedWallets?.[0]?.address;

  return smart ?? embedded ?? null;
}

export default function Dashboard() {
  const [score, setScore] = useState<number | null>(null);
  const [tier, setTier] = useState<TierResult | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);

  // Card State
  const [cards, setCards] = useState<CardDetails[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Starpay Flow State
  const [currentOrder, setCurrentOrder] = useState<StarpayOrderResponse | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<"pending" | "processing" | "completed" | "failed" | "expired">("pending");

  // Delete State
  const [cardToDeleteIndex, setCardToDeleteIndex] = useState<number | null>(null);

  // Rewards State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [rewardWallet, setRewardWallet] = useState<string | undefined>(undefined);
  const [showRewardWalletWarning, setShowRewardWalletWarning] = useState(false);

  const { authenticated, ready, user } = usePrivy();

  const router = useRouter();

  // Redirect if not auth
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const targetAddress = getEthosAddress(user);

  // Debug to console
  useEffect(() => {
    console.log("🔐 Privy user:", user);
    console.log("🧠 Ethos wallet (identity):", targetAddress);
  }, [user, targetAddress]);

  const showContent = ready && authenticated;

  // FETCH DATA FROM BACKEND
  const refreshData = useCallback(async () => {
    if (!targetAddress) return;
    setLoadingScore(true);
    try {
      // 1. Auth/Login (Gets User & Tier)
      const authRes = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { "X-Wallet-Address": targetAddress }
      });
      const userData = await authRes.json();

      // 2. Map Backend User to Frontend Tier State
      setScore(userData.ethos_score);
      setRewardWallet(userData.reward_wallet_address);

      const tierConfig = TIERS.find(t => t.name.toLowerCase() === userData.tier_name.toLowerCase()) || TIERS[0];

      // 3. Get Cards
      const cardsRes = await fetch(`${BACKEND_URL}/cards/`, {
        headers: { "X-Wallet-Address": targetAddress }
      });
      const cardsData = await cardsRes.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedCards = cardsData.map((c: any) => ({
        // Map API response to Frontend Card Details
        id: c.id,
        // Remove last4 usage if desired, or keep as fallback
        last4: c.last4 || (c.card_type === 'mastercard' ? '5100' : '4242'),
        name: c.label || "LOGOS MEMBER",
        type: c.card_type || "visa", // generic type mapped to brand
        status: c.status,
        value: c.balance,
        email: c.owner_email || userData.email || user?.email?.address,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })).filter((c: any) => c.status === 'active');
      setCards(mappedCards);

      // 4. Get Cashback Summary
      const { summary, transactions: txs } = await fetchCashbackSummary(targetAddress);
      setTotalEarned(summary.total_earned_usd);
      setTransactions(txs);

      setTier({
        ...tierConfig,
        cashback: summary.current_cashback_percent || tierConfig.cashback,
        nextTier: undefined,
        pointsToNextTier: 0
      });

    } catch (e) {
      console.error("Backend Sync Failed:", e);
    } finally {
      setLoadingScore(false);
    }
  }, [targetAddress, user?.email?.address]);

  // Initial Load
  useEffect(() => {
    if (showContent && targetAddress) {
      refreshData();
    }
  }, [showContent, targetAddress, refreshData]);

  // ---- Starpay Logic ----
  const handleCreateOrder = async (formData: StarpayFormData) => {
    if (!targetAddress) return;
    setIsProcessingOrder(true);
    setPendingEmail(formData.email);
    try {
      // Direct call to Backend for Order Creation
      const res = await fetch(`${BACKEND_URL}/orders/`, {
        method: 'POST',
        headers: {
          "X-Wallet-Address": targetAddress,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: formData.amount,
          card_type: formData.cardType,
          email: formData.email
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to create order");

      // Adapt Backend Response to Frontend Shape
      const adaptedOrder = {
        orderId: data.id,
        payment: {
          address: data.payment_data?.payment_address,
          amountSol: data.payment_data?.payment_amount
        },
        pricing: data.payment_data?.pricing
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCurrentOrder(adaptedOrder as any);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error creating order";
      alert(msg);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handlePaymentSent = () => {
    if (!currentOrder || !targetAddress) return;
    setIsPolling(true);
    setPollingStatus("pending");

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/orders/${currentOrder.orderId}/status`, {
          headers: { "X-Wallet-Address": targetAddress }
        });
        const data = await res.json();

        if (data.status) {
          setPollingStatus(data.status);
        }

        if (data.status === 'completed') {
          clearInterval(interval);
          completeIssuance(data.details);
        } else if (data.status === 'failed' || data.status === 'expired') {
          clearInterval(interval);
          setPollingStatus(data.status as "failed" | "expired");
          setIsPolling(false);
        }
      } catch {
        // ignore errors
      }
    }, 5000);

    setTimeout(() => {
      clearInterval(interval);
      if (isPolling) {
        setPollingStatus("expired");
        setIsPolling(false);
      }
    }, 300000);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completeIssuance = async (finalData?: any) => {
    setTimeout(async () => {
      setIsPolling(false);
      setCurrentOrder(null);
      setShowForm(false);
      console.log("Issuance Complete:", finalData, pendingEmail);
      await refreshData();
      // NO ALERT
    }, 8000); // 8 seconds to allow reading the success screen
  };

  // ---- End Starpay Logic ----

  const confirmDeleteCard = async () => {
    if (cardToDeleteIndex === null) return;
    alert("Card deletion is not yet supported on the backend. This change will revert on refresh.");
    setCardToDeleteIndex(null);
  };

  const handleNewCardClick = () => {
    if (!rewardWallet) {
      setShowRewardWalletWarning(true);
      return;
    }
    setShowForm(true);
  };

  const handleSimulateTransaction = async () => {
    if (!targetAddress) return;
    const amount = 50 + Math.floor(Math.random() * 100);
    const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
    console.log("Simulating spend at:", merchant);

    // Call Backend Claim
    await claimCashback(targetAddress, amount);

    // Refresh History
    await refreshData();
  };

  if (!showContent) return null;

  return (
    <Shell>
      {/* Header Profile Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight mb-1">Welcome back</h1>
            <div className="flex items-center gap-2 text-sm text-neutral-500 font-mono bg-neutral-50 px-3 py-1 rounded-full w-fit">
              <Wallet size={14} />
              {targetAddress?.slice(0, 6)}...{targetAddress?.slice(-4)}
            </div>
          </div>
          {tier && (
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 bg-gradient-to-l from-[#C9A24D] to-transparent pointer-events-none" />
          )}
          <div className="flex flex-col items-end relative z-10">
            <p className="text-xs uppercase tracking-wider text-neutral-400 mb-1">Ethos Score</p>
            {loadingScore ? (
              <Loader2 className="animate-spin text-neutral-300" />
            ) : (
              <div className="text-4xl font-bold text-black">{score || 0}</div>
            )}
          </div>
        </div>

        <div className="col-span-1 bg-black text-[#C9A24D] rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-wider opacity-80 mb-2">Current Tier</p>
            <h2 className="text-3xl font-bold">{tier?.name || "Loading..."}</h2>
          </div>
          <div className="relative z-10 mt-4">
            <p className="text-sm opacity-90">{tier?.cashback}% Cashback</p>
          </div>
          {/* Decorative */}
          <div className="absolute -bottom-4 -right-4 text-white opacity-5 transform rotate-12">
            <CreditCardIcon size={120} />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Column: Cards & Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CreditCardIcon size={20} className="text-neutral-400" />
              Your Cards
            </h2>

          </div>

          {/* Creation Form Area */}
          {showForm ? (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-neutral-200 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Issue Virtual Card</h3>
                {!currentOrder && (
                  <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-black">
                    <X size={20} />
                  </button>
                )}
              </div>

              {!currentOrder ? (
                <IssueCardForm
                  isLoading={isProcessingOrder}
                  onSubmit={handleCreateOrder}
                  onCancel={() => setShowForm(false)}
                  defaultEmail={user?.email?.address}
                />
              ) : (
                <div className="space-y-6">
                  {isPolling ? (
                    <div className="text-center py-12 space-y-4">
                      {pollingStatus === 'pending' && <Loader2 className="animate-spin h-12 w-12 mx-auto text-neutral-400" />}
                      {pollingStatus === 'processing' && <Clock className="animate-pulse h-12 w-12 mx-auto text-blue-500" />}
                      {pollingStatus === 'completed' && (
                        <div className="flex flex-col items-center animate-fade-in text-center">

                          {/* 1. LogosPay Logo (Top) */}
                          <div className="w-56 h-auto mb-6 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/LogosPayNamePNG.png" alt="Logos Pay" className="w-full h-auto object-contain" />
                          </div>

                          <h3 className="text-xl font-bold text-neutral-900 mb-2">Card Created!</h3>
                          <p className="text-sm text-neutral-500 mb-6 max-w-xs mx-auto">
                            Check your email to activate it. You can access your full card dashboard below.
                          </p>

                          {/* 2. Swype Logo (Above Button) */}
                          <div className="w-12 h-12 mb-4 flex items-center justify-center opacity-80">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/swype-logo.png" alt="Swype Logo" className="w-full h-auto object-contain" />
                          </div>

                          <a
                            href="https://dashboard.swype.cards/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[var(--ink)] text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition-transform hover:scale-105 shadow-lg flex items-center gap-2 mb-4"
                          >
                            Go to Card Dashboard
                            <CreditCardIcon size={16} />
                          </a>

                          <p className="text-[10px] text-neutral-400 animate-pulse">
                            Refreshing dashboard in a few seconds...
                          </p>
                        </div>
                      )}
                      {(pollingStatus === 'failed' || pollingStatus === 'expired') && <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />}

                      <div>
                        {pollingStatus !== 'completed' && (
                          <h3 className="text-xl font-semibold Capitalize">
                            {pollingStatus === 'pending' && "Waiting for Payment"}
                            {pollingStatus === 'processing' && "Order Processing"}
                            {pollingStatus === 'failed' && "Payment Failed"}
                            {pollingStatus === 'expired' && "Order Expired"}
                          </h3>
                        )}
                        <p className="text-sm text-neutral-500 mt-2">
                          {pollingStatus === 'pending' && <span className="animate-pulse">Checking blockchain...</span>}
                          {pollingStatus === 'processing' && "Issuing your virtual card..."}
                        </p>

                        {/* DEV: Skip Button */}
                        {pollingStatus !== 'completed' && (
                          <button
                            onClick={() => {
                              setPollingStatus("completed");
                              completeIssuance({});
                            }}
                            className="mt-4 text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-200"
                          >
                            DEV: Skip to Success
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-2 mt-6 text-xs text-neutral-400">
                        <span className={pollingStatus === 'pending' ? "font-bold text-[var(--ink)]" : ""}>1. Pending</span>
                        <span>→</span>
                        <span className={pollingStatus === 'processing' ? "font-bold text-blue-600" : ""}>2. Issuing</span>
                        <span>→</span>
                        <span className={pollingStatus === 'completed' ? "font-bold text-green-600" : ""}>3. Ready</span>
                      </div>
                    </div>
                  ) : (
                    <BridgeWidget
                      destinationAddress={currentOrder.payment.address}
                      amountSol={currentOrder.payment.amountSol}
                      onPaymentComplete={handlePaymentSent}
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Cards Grid */
            <>
              {cards.length > 0 && tier ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
                  {cards.map((card, index) => (
                    <div key={card.id} className="relative group perspective-1000">
                      <PaymentCard
                        tier={tier}
                        last4={card.last4}
                        name={card.name}
                        email={card.email}
                        balance={card.value}
                        redemptionUrl={card.redemptionUrl}
                        cashback={tier.cashback}
                        cardType={card.type}
                      />
                      <button
                        onClick={() => setCardToDeleteIndex(index)}
                        className="absolute -top-2 -right-2 bg-red-white text-red-500 hover:bg-red-50 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                        title="Delete Card"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  {/* Dotted "Add Card" Slot */}
                  {cards.length < 6 && (
                    <button
                      onClick={handleNewCardClick}
                      className="relative w-full aspect-[1.586] rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#C9A24D] hover:bg-neutral-50 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-neutral-100 group-hover:bg-[#C9A24D]/10 flex items-center justify-center transition-colors">
                        <Plus size={20} className="text-neutral-400 group-hover:text-[#C9A24D]" />
                      </div>
                      <span className="text-sm font-medium text-neutral-400 group-hover:text-[#C9A24D]">New Card</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Check for User Wallet Link Status for Empty State */
                <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                  {tier?.cardEligible ? (
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                        <Plus size={32} className="text-[#C9A24D]" />
                      </div>
                      <h3 className="text-xl font-semibold">No cards yet</h3>
                      <p className="text-neutral-500">Create your first virtual card to start earning rewards based on your reputation.</p>
                      <button onClick={handleNewCardClick} className="px-6 py-3 bg-black text-[#C9A24D] font-medium rounded-full shadow-lg hover:bg-neutral-900 hover:scale-105 transition-all">
                        Issue New Card
                      </button>
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto space-y-4 opacity-50">
                      <h3 className="text-xl font-semibold">Tier Locked</h3>
                      <p className="text-neutral-500">You need a higher Ethos score to issue cards.</p>
                    </div>
                  )}

                  {/* Link Wallet Prompt if needed */}
                  {user?.wallet?.walletClientType === 'privy' && (
                    <div className="mt-8 pt-8 border-t border-neutral-200 max-w-xs mx-auto">
                      <p className="text-xs text-neutral-400 mb-2">Using embedded wallet?</p>
                      <button
                        onClick={() => alert("Please use the Privy Widget to link your external wallet.")}
                        className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1 w-full"
                      >
                        Link MetaMask / External Wallet
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Tier Progress Section */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Tier Progress</h3>
            </div>
            <TierTable currentTierName={tier?.name} />
          </div>


        </div>

        {/* Right Column: Stats & Tier Info */}
        <div className="col-span-1 space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Rewards</h3>
            <RewardsStats
              totalEarned={totalEarned}
              rewardWallet={rewardWallet}
              userAddress={targetAddress || ""}
              onUpdateRewardWallet={refreshData}
            />
          </div>

          {/* History Section (Moved) */}
          {cards.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">History</h2>
                <button
                  onClick={handleSimulateTransaction}
                  className="text-xs font-semibold text-neutral-500 hover:text-black flex items-center gap-1 bg-neutral-100 px-3 py-1.5 rounded-full hover:bg-neutral-200 transition"
                >
                  <Zap size={12} />
                  Simulate
                </button>
              </div>
              <TransactionHistory transactions={transactions} />
            </div>
          )}


          {/* Debug/Link Info for Dev */}
          <div className="text-xs text-neutral-300 font-mono text-center">
            Identity: {targetAddress ? "Linked" : "Local"}
          </div>
        </div>
      </div>

      <DeleteCardModal
        isOpen={cardToDeleteIndex !== null}
        onCancel={() => setCardToDeleteIndex(null)}
        onConfirm={confirmDeleteCard}
      />

      {/* Reward Wallet Warning Modal */}
      {showRewardWalletWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-neutral-200 relative animate-scale-in">
            <button
              onClick={() => setShowRewardWalletWarning(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black transition"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Connect Rewards Wallet</h3>
                <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
                  To issue a new card, you must have a valid Reward Wallet connected to receive your cashback.
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 text-xs text-neutral-600 w-full text-left flex gap-2">
                <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                <p>Please check the &quot;Rewards&quot; box on your dashboard to save a wallet address.</p>
              </div>
              <button
                onClick={() => setShowRewardWalletWarning(false)}
                className="w-full bg-[var(--ink)] text-white font-semibold py-3 rounded-xl hover:bg-black transition shadow-lg mt-2"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}