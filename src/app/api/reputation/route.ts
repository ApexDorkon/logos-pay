import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://api.ethos.network/api/v2/user/by/address/${address}`,
            {
                headers: {
                    'X-Ethos-Client': 'logos-pay',
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                // User not found in Ethos, return null score or specific error
                return NextResponse.json({ score: null, source: 'ethos', error: 'User not found' }, { status: 404 });
            }
            throw new Error(`Ethos API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Validate we got a score
        if (typeof data.score !== 'number') {
            throw new Error('Invalid response format from Ethos API');
        }

        return NextResponse.json({
            score: data.score,
            source: 'ethos',
            updatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Reputation fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reputation score' },
            { status: 500 }
        );
    }
}
