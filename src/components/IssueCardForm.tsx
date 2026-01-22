import { useState, useEffect } from "react";
import { CreditCard, Mail, Loader2, DollarSign, Info } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";

export interface StarpayFormData {
    amount: number;
    cardType: string;
    email: string;
}

interface IssueCardFormProps {
    isLoading: boolean;
    onSubmit: (data: StarpayFormData) => void;
    onCancel: () => void;
    defaultEmail?: string;
}

interface PricingBreakdown {
    card_value: number;
    starpay_fee_percent: number;
    starpay_fee_usd: number;
    reseller_markup_usd: number;
    customer_price: number;
}

export function IssueCardForm({ isLoading, onSubmit, onCancel, defaultEmail }: IssueCardFormProps) {
    const [formData, setFormData] = useState<StarpayFormData>({
        amount: 50,
        cardType: "visa",
        email: defaultEmail || ""
    });

    const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
    const [fetchingPrice, setFetchingPrice] = useState(false);

    useEffect(() => {
        if (defaultEmail && !formData.email) {
            setFormData(prev => ({ ...prev, email: defaultEmail }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultEmail]);


    // Debounce Price Fetch
    useEffect(() => {
        const fetchPrice = async () => {
            if (formData.amount < 5 || formData.amount > 10000) {
                setPricing(null);
                return;
            }
            setFetchingPrice(true);
            try {
                const res = await fetch(`${BACKEND_URL}/orders/price?amount=${formData.amount}`);
                const data = await res.json();
                if (res.ok && data.pricing) {
                    setPricing(data.pricing);
                }
            } catch (e) {
                console.error("Failed to fetch price", e);
            } finally {
                setFetchingPrice(false);
            }
        };

        const timer = setTimeout(fetchPrice, 500);
        return () => clearTimeout(timer);
    }, [formData.amount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                    <CreditCard size={24} />
                </div>
                <h2 className="text-xl font-semibold">Issue Virtual Card</h2>
                <p className="text-sm text-neutral-500">Instant issuance via Starpay</p>
            </div>

            <div className="space-y-4">
                {/* Amount */}
                <div>
                    <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-1.5">Load Amount (USD)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                            type="number"
                            min="5"
                            max="10000"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                            className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[var(--ink)] focus:border-transparent transition outline-none"
                            required
                        />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1 flex justify-between">
                        <span>Min: $5.00</span>
                        <span>Max: $10,000.00</span>
                    </p>
                </div>

                {/* Price Breakdown */}
                <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 text-sm space-y-2">
                    {fetchingPrice ? (
                        <div className="flex items-center justify-center py-2 text-neutral-400 gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            <span>Calculating Fees...</span>
                        </div>
                    ) : pricing ? (
                        <>
                            <div className="flex justify-between text-neutral-500">
                                <span>Card Value</span>
                                <span>${pricing.card_value.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-neutral-500 text-xs">
                                <span className="flex items-center gap-1">Starpay Fee <Info size={10} /></span>
                                <span>${pricing.starpay_fee_usd.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-neutral-500 text-xs">
                                <span>Platform Fee</span>
                                <span>${pricing.reseller_markup_usd.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-neutral-800">
                                <span>Total to Pay</span>
                                <span>${pricing.customer_price.toFixed(2)}</span>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-xs text-neutral-400">Enter amount to see breakdown</p>
                    )}
                </div>


                {/* Card Type */}
                <div>
                    <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-1.5">Network</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, cardType: 'visa' })}
                            className={`py-3 px-4 rounded-lg border flex items-center justify-center gap-2 transition ${formData.cardType === 'visa' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-neutral-200 hover:border-neutral-300'}`}
                        >
                            <span className="font-bold italic">VISA</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, cardType: 'mastercard' })}
                            className={`py-3 px-4 rounded-lg border flex items-center justify-center gap-2 transition ${formData.cardType === 'mastercard' ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500' : 'border-neutral-200 hover:border-neutral-300'}`}
                        >
                            <div className="flex -space-x-1">
                                <div className="w-4 h-4 rounded-full bg-red-500 opacity-80"></div>
                                <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-80"></div>
                            </div>
                            <span className="font-medium">Mastercard</span>
                        </button>
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-1.5">Delivery Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[var(--ink)] focus:border-transparent transition outline-none"
                            placeholder="card@logos.io"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 px-4 bg-white border border-neutral-200 text-neutral-600 rounded-xl font-medium hover:bg-neutral-50 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading || fetchingPrice || !pricing}
                    className="flex-1 py-3 px-4 bg-[var(--ink)] text-[var(--gold)] rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> :
                        (pricing ? `Pay $${pricing.customer_price.toFixed(2)}` : "Continue")
                    }
                </button>
            </div>
        </form>
    );
}
