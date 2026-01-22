export interface StarpayOrderRequest {
    amount: number; // 5-10000
    cardType: 'visa' | 'mastercard';
    email: string;
}

export interface StarpayOrderResponse {
    orderId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
    payment: {
        address: string; // SOL address
        amountSol: number;
        solPrice: number;
    };
    pricing: {
        cardValue: number;
        starpayFeePercent: number;
        starpayFee: number;
        resellerMarkup: number;
        total: number;
    };
    expiresAt: string;
    checkStatusUrl: string;
}

export interface StarpayStatusResponse {
    orderId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
    // Additional fields may exist but status is key
}
