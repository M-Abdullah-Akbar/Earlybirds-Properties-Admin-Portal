/**
 * Client-side utilities to prevent hydration mismatches
 */

// Check if we're running on the client side
export const isClient = () => typeof window !== "undefined";

// Safe localStorage operations
export const safeLocalStorage = {
  getItem: (key) => {
    if (!isClient()) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  },

  setItem: (key, value) => {
    if (!isClient()) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
  },

  removeItem: (key) => {
    if (!isClient()) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },
};

// Safe window operations
export const safeWindow = {
  redirect: (url) => {
    if (!isClient()) return;
    window.location.href = url;
  },
};
