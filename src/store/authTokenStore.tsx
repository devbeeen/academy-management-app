import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type AuthTokenState = {
  token: string;
  setAuthToken: (data: Partial<AuthTokenState>) => void;
};

const useAuthTokenStore = create<AuthTokenState>()(
  persist(
    set => ({
      token: '',
      setAuthToken: data => set(state => ({ ...state, ...data })),
    }),
    {
      name: 'auth-token-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useAuthTokenStore;
