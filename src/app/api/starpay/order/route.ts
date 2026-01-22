import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, cardType, email } = body;

        // Validate inputs
        if (!amount || amount < 5 || amount > 10000) {
            return NextResponse.json({ error: 'Amount must be between $5 and $10,000' }, { status: 400 });
        }
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }
        if (cardType !== 'visa' && cardType !== 'mastercard') {
            return NextResponse.json({ error: 'Invalid card type' }, { status: 400 });
        }

        const apiKey = process.env.STARPAY_API_KEY;
        if (!apiKey) {
            // Fallback for demo/development if key missing
            // Emulate realistic response
            console.warn("STARPAY_API_KEY missing, returning Mock Response");
            const feePercent = 2.5;
            const fee = amount * (feePercent / 100);
            const markupPercent = 5;
            const resellerMarkup = amount * (markupPercent / 100);
            const total = amount + fee + resellerMarkup;

            return NextResponse.json({
                orderId: `mock_order_${Date.now()}`,
                status: 'pending',
                payment: {
                    address: "BuCpZ4Sv3g4X4A5j5y5z5A5b5C5d5E5F5G5H5I5J5K5L",
                    amountSol: total / 150,
                    solPrice: 150.0
                },
                pricing: {
                    cardValue: amount,
                    starpayFeePercent: feePercent,
                    starpayFee: fee,
                    resellerMarkup,
                    total
                },
                expiresAt: new Date(Date.now() + 30 * 60000).toISOString(),
                checkStatusUrl: "https://mock.starpay.cards/status"
            });

        }

        const res = await fetch('https://www.starpay.cards/api/v1/cards/order', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount, cardType, email }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            // Pass through specific error message if available
            return NextResponse.json(errorData, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Starpay Order Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
