"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Admin = {
  _id: string;
  email: string;
  name: string;
  departmentId: string; // This actually stores the department slug, not the ID
  role: "super_admin" | "department_admin";
};

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (admin: Admin, token: string) => void;
  logout: () => void;
}

// Create a custom storage object that safely checks for browser environment
const createBrowserStorage = () => {
  const isBrowser = typeof window !== "undefined";

  return {
    getItem: (name: string) => {
      if (!isBrowser) return null;
      try {
        const str = localStorage.getItem(name);
        return str ? JSON.parse(str) : null;
      } catch (error) {
        console.error("Error reading from localStorage", error);
        return null;
      }
    },
    setItem: (name: string, value: unknown) => {
      if (!isBrowser) return;
      try {
        localStorage.setItem(name, JSON.stringify(value));
      } catch (error) {
        console.error("Error writing to localStorage", error);
      }
    },
    removeItem: (name: string) => {
      if (!isBrowser) return;
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.error("Error removing from localStorage", error);
      }
    },
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      token: null,
      login: (admin, token) => set({ admin, isAuthenticated: true, token }),
      logout: () => set({ admin: null, isAuthenticated: false, token: null }),
    }),
    {
      name: "auth-storage",
      // Use our safe browser storage implementation
      storage: createBrowserStorage(),
      // Add version for future compatibility
      version: 1,
    }
  )
);
