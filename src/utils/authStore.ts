

import { create } from 'zustand';

interface AuthState {
  loading: boolean;
  error: string;
}

interface AuthActions {
  setLoading: (value: boolean) => void;
  setError: (message: string) => void;
  clearAuthState: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  loading: false,
  error: '',
  setLoading: (value: boolean) => set({ loading: value }),
  setError: (message: string) => set({ error: message }),
  clearAuthState: () => set({ loading: false, error: '' }),
}));
