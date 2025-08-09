import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    set => ({
      id: '',
      companyID: '',
      loginID: '',
      name: '',
      companyName: '',
      dataFoo: '',
      setUser: data => set(data),
    }),
    {
      name: 'user-storage', // 스토리지 이름
      getStorage: () => sessionStorage, // 디폴트는 localStorage
    },
  ),
);

export default useUserStore;
