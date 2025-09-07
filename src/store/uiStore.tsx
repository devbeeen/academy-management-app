import { create } from 'zustand';

// type UIState = {
//   isSidebarOpen: boolean;
//   toggleSidebar: (data: Partial<UIState>) => void;
//   isLoading: boolean;
//   handleLoading: (data: Partial<UIState>) => void;
// };

interface UIState {
  // 사이드바 상태
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // 로딩 상태
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>(set => ({
  isSidebarOpen: false,
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
  isLoading: false,
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

/*
type UIState = {
  isSidebarOpen: boolean;
  toggleSidebar: (data: Partial<UIState>) => void;
};
*/

//1.
/*
export const useUIStore = create<UIState>(
    set => ({
      isSidebarOpen: false,
      toggleSidebar: () =>
        set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
    })
);
*/

// 2.
/*
export const useUIStore = create<UIState>(set => ({
  isSidebarOpen: false,
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
*/
