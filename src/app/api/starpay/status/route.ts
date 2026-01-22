import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }

        const apiKey = process.env.STARPAY_API_KEY;

        // Mock Handling
        if (!apiKey || orderId.startsWith('mock_')) {
            // Simulate flow: pending -> processing -> completed
            // We use query param ?mockState=... to let frontend control simulation state if needed, 
            // OR simpler: random chance.
            // Let's implement a deterministic mock based on time or random chance is fine for now.
            // Actually, better for the frontend to handle the "wait" time, backend just returns what it sees.
            // For Mock: 
            // 0-10s: pending
            // 10-20s: processing
            // >20s: completed

            // We can't easily track state serverless without DB. 
            // So we might return 'completed' immediately or randomly.
            // Let's do random to allow "polling" effect.
            const rand = Math.random();
            let status = 'pending';
            if (rand > 0.7) status = 'completed';
            else if (rand > 0.4) status = 'processing';

            return NextResponse.json({
                orderId,
                status,
                // In real app, 'completed' usually returns card details? 
                // Docs say: "Card issued, markup credited". Check email.
                // So we don't necessarily get the PAN here in response body always, depends on API.
                // Docs say "Response Statuses", doesn't explicitly show completed response body.
                // We assume it's just { status: 'completed' } mostly.
            });
        }

        const res = await fetch(`https://www.starpay.cards/api/v1/cards/order/status?orderId=${orderId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!res.ok) {
            // Starpay might return 404 if not found
            if (res.status === 404) return NextResponse.json({ status: 'failed', error: 'Order not found' });
            return NextResponse.json({ status: 'pending' }); // Fallback
        }

        const data = await res.json();
        console.log(`[API] Status for ${orderId}:`, JSON.stringify(data, null, 2));
        return NextResponse.json(data);

    } catch (error) {
        console.error("Starpay Status Error:", error);
        return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
    }
}
