import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/*
type UIState = {
  isSidebarOpen: boolean;
  setUI: (data: Partial<UIState>) => void;
};

export const useUIStore = create(
  persist<UIState>(
    set => ({
      isSidebarOpen: false,
      setUI: data => set(state => ({ ...state, ...data })),
    }),
    {
      name: 'ui-storage', // 스토리지 이름
      storage: createJSONStorage(() => sessionStorage), // 디폴트는 localStorage
    },
  ),
);
*/

type UIState = {
  isSidebarOpen: boolean;
  toggleSidebar: (data: Partial<UIState>) => void;
};

export const useUIStore = create<UIState>(set => ({
  isSidebarOpen: false,
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

/*
export const useUIStore = create(
  persist<UIState>(
    set => ({
      isSidebarOpen: false,
      toggleSidebar: () =>
        set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      name: 'ui-storage', // 스토리지 이름
      storage: createJSONStorage(() => sessionStorage), // 디폴트는 localStorage
    },
  ),
);
*/
