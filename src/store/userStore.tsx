import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserState = {
  id: string;
  companyID: string;
  loginID: string;
  name: string;
  companyName: string;
  setUser: (data: Partial<UserState>) => void;
};

const useUserStore = create<UserState>()(
  persist(
    set => ({
      id: '',
      companyID: '',
      loginID: '',
      name: '',
      companyName: '',
      // setUser: data => set(data),
      setUser: data => set(state => ({ ...state, ...data })),
    }),
    {
      name: 'user-storage', // 스토리지 이름
      storage: createJSONStorage(() => sessionStorage), // 디폴트는 localStorage
    },
  ),
);

export default useUserStore;
