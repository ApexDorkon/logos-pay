import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const amountStr = searchParams.get('amount');

        if (!amountStr) {
            return NextResponse.json({ error: 'Amount required' }, { status: 400 });
        }

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount < 5 || amount > 10000) {
            return NextResponse.json({ error: 'Amount must be between $5 and $10,000' }, { status: 400 });
        }

        const apiKey = process.env.STARPAY_API_KEY;

        if (!apiKey) {
            // Mock Response for Demo
            const feePercent = 2.5; // Starpay Fee
            const fee = amount * (feePercent / 100);
            const markupPercent = 5; // Reseller Markup
            const markup = amount * (markupPercent / 100);
            const total = amount + fee + markup;

            const mockResponse = {
                pricing: {
                    cardValue: amount,
                    starpayFeePercent: feePercent,
                    starpayFee: fee,
                    resellerMarkup: markup,
                    total: total
                }
            };
            console.log("[API] Mock Response:", JSON.stringify(mockResponse, null, 2));
            return NextResponse.json(mockResponse);
        }

        const res = await fetch(`https://www.starpay.cards/api/v1/cards/price?amount=${amount}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch price' }, { status: res.status });
        }

        const data = await res.json();
        console.log("[API] Starpay Raw Response:", JSON.stringify(data, null, 2));

        let result = data;

        // Map snake_case from Starpay to our internal camelCase format
        if (data.pricing && data.pricing.card_value) {
            result = {
                pricing: {
                    cardValue: data.pricing.card_value,
                    starpayFeePercent: data.pricing.starpay_fee_percent,
                    starpayFee: data.pricing.starpay_fee_usd,
                    resellerMarkup: data.pricing.reseller_markup_usd,
                    total: data.pricing.customer_price
                }
            };
        }
        // Fallback or Normalization for other potential formats
        else if (!data.pricing && typeof data.total === "number") {
            result = {
                pricing: {
                    cardValue: result.cardValue,
                    starpayFeePercent: result.starpayFeePercent,
                    starpayFee: result.starpayFee,
                    resellerMarkup: result.resellerMarkup,
                    total: result.total
                }
            };
        }

        // Add Manual Markup ONLY if Starpay didn't return it (e.g. if markup is 0/undefined)
        // The logs showed Starpay IS returning markup, so we trust it.
        if (result.pricing && (result.pricing.resellerMarkup === undefined || result.pricing.resellerMarkup === 0)) {
            // Only force markup if missing
            const baseAmount = result.pricing.cardValue;
            const myMarkup = baseAmount * 0.05;
            result.pricing.resellerMarkup = myMarkup;
            result.pricing.total = result.pricing.cardValue + result.pricing.starpayFee + myMarkup;
        }

        console.log("[API] /starpay/price Final Response:", JSON.stringify(result, null, 2));
        return NextResponse.json(result);

    } catch (error) {
        console.error("Starpay Price Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
