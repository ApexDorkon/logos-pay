// Deprecated: Auth is now handled by Privy
// Keeping this file to prevent import errors if there are lingering references
// but it should not be used.

import { create } from 'zustand';

interface AuthState {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>(() => ({
    isAuthenticated: false,
    login: () => console.warn('useAuthStore is deprecated. Use usePrivy() instead.'),
    logout: () => console.warn('useAuthStore is deprecated. Use usePrivy() instead.'),
}));
