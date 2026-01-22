"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface BridgeWidgetProps {
    destinationAddress: string;
    amountSol: number;
    onPaymentComplete: () => void; // Callback when user says "I sent it"
}

export function BridgeWidget({ destinationAddress, amountSol, onPaymentComplete }: BridgeWidgetProps) {
    // We use DeBridge's DeSwap widget in an iframe.
    // Documentation suggests we can pass parameters via URL or use their SDK.
    // For a quick integration, we constructs a URL to pre-fill the swap.
    // Base Chain ID: 8453
    // Solana Chain ID: 7565164 (DeBridge internal ID for Solana) usually 'Solana' string works in URL params for widgets.
    // Actually, DeBridge widget URL builder: https://app.debridge.finance/widget

    // Constructing a DeSwap URL (best effort without SDK)
    // dstChain=solana
    // dstToken=11111111111111111111111111111111 (SOL)
    // dstAddress={destinationAddress}
    // srcChain=8453 (Base)
    // srcToken=0x0000000000000000000000000000000000000000 (ETH)
    // amount={amountSol} - Note: might need exact units, but widget usually handles UI input.

    const widgetUrl = `https://app.debridge.finance/deswap?inputChain=8453&outputChain=7565164&inputCurrency=0x0000000000000000000000000000000000000000&outputCurrency=11111111111111111111111111111111&address=${destinationAddress}&outputAmount=${amountSol}`;

    const [copiedAmount, setCopiedAmount] = useState(false);

    const copyAmount = () => {
        navigator.clipboard.writeText(amountSol.toString());
        setCopiedAmount(true);
        setTimeout(() => setCopiedAmount(false), 2000);
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            <div className="bg-neutral-900 text-[var(--gold)] p-4 rounded-xl text-center">
                <p className="text-xs uppercase tracking-widest text-neutral-400">Payment Required</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-2xl font-bold">{amountSol.toFixed(4)} SOL</span>
                    <button
                        onClick={copyAmount}
                        className="text-neutral-400 hover:text-white transition p-1"
                        title="Copy Amount"
                    >
                        {copiedAmount ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    {copiedAmount && <span className="text-[10px] text-green-500 font-medium">Copied!</span>}
                </div>
                <div className="flex items-center justify-center gap-2 mt-2 bg-white/10 p-2 rounded-lg cursor-pointer hover:bg-white/20 transition" onClick={() => navigator.clipboard.writeText(destinationAddress)}>
                    <span className="text-xs font-mono truncate max-w-[200px]" title="Destination Address">{destinationAddress}</span>
                    <Copy size={12} />
                </div>
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden h-[500px] relative">
                <iframe
                    src={widgetUrl}
                    title="DeBridge Widget"
                    className="w-full h-full border-0"
                />
                {/* 
                   Since we can't easily detect success from an iframe without postMessage listeners that match the widget's spec,
                   we add a manual "I have paid" button for the user to trigger the polling/status check loop.
                 */}
            </div>

            <button
                onClick={onPaymentComplete}
                className="w-full rounded-xl border border-[var(--ink)] bg-[var(--ink)] py-3 text-sm font-bold text-[var(--gold)] hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg"
            >
                I have sent the payment
            </button>

            <p className="text-xs text-center text-neutral-500">
                After bridging, click &quot;I have sent the payment&quot; to start tracking your card issuance.
            </p>
        </div>
    );
}
