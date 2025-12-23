'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          const { token, data: user } = response;
          
          Cookies.set('token', token, { expires: 7 });
          Cookies.set('user', JSON.stringify(user), { expires: 7 });
          
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true, user };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, message: error.message };
        }
      },

      // Logout
      logout: async () => {
        try {
          await authApi.logout();
        } catch (e) {
          // Ignore logout errors
        }
        Cookies.remove('token');
        Cookies.remove('user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      // Get current user
      getMe: async () => {
        const token = Cookies.get('token');
        if (!token) {
          set({ isAuthenticated: false });
          return null;
        }
        
        try {
          const response = await authApi.getMe();
          set({ user: response.data, isAuthenticated: true });
          return response.data;
        } catch (error) {
          Cookies.remove('token');
          Cookies.remove('user');
          set({ user: null, token: null, isAuthenticated: false });
          return null;
        }
      },

      // Initialize auth from cookies
      initAuth: () => {
        const token = Cookies.get('token');
        const userStr = Cookies.get('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({ user, token, isAuthenticated: true });
          } catch (e) {
            Cookies.remove('token');
            Cookies.remove('user');
          }
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Check if user has role
      hasRole: (roles) => {
        const user = get().user;
        if (!user) return false;
        if (!Array.isArray(roles)) roles = [roles];
        return roles.includes(user.role);
      },

      // Check if user is admin
      isAdmin: () => {
        const user = get().user;
        return ['super_admin', 'main_branch_admin', 'branch_admin'].includes(user?.role);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;

