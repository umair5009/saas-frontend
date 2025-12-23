'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUiStore = create(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Theme
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // Selected branch (for super_admin/main_branch_admin)
      selectedBranch: null,
      setSelectedBranch: (branch) => set({ selectedBranch: branch }),

      // Academic year
      selectedAcademicYear: null,
      setSelectedAcademicYear: (year) => set({ selectedAcademicYear: year }),

      // Loading states
      globalLoading: false,
      setGlobalLoading: (loading) => set({ globalLoading: loading }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        selectedAcademicYear: state.selectedAcademicYear,
        selectedBranch: state.selectedBranch
      }),
    }
  )
);

export default useUiStore;

