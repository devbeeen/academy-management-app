import { create } from 'zustand';

type UIState = {
  isSidebarOpen: boolean;
  toggleSidebar: (data: Partial<UIState>) => void;
};

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
export const useUIStore = create<UIState>(set => ({
  isSidebarOpen: false,
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
