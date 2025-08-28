"use client";

import { useState, useEffect } from 'react';
import { safeLocalStorage } from "@/utlis/clientUtils";
import { useClientMount } from "@/utlis/useClientMount";

/**
 * Custom hook to access and manage theme state
 * This hook integrates with the existing theme implementation in SettingsHandler
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const hasMounted = useClientMount();

  // Initialize theme state from localStorage on component mount
  useEffect(() => {
    if (!hasMounted) return; // Wait for client-side mount to prevent hydration mismatch

    const savedTheme = safeLocalStorage.getItem("isDark");
    if (savedTheme) {
      setIsDark(JSON.parse(savedTheme));
    } else {
      // Check for system preference if no saved theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      safeLocalStorage.setItem("isDark", JSON.stringify(prefersDark));
    }
  }, [hasMounted]);

  // Toggle theme function
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    safeLocalStorage.setItem("isDark", JSON.stringify(newIsDark));
    
    // Apply theme class to body
    if (newIsDark) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }

    // Handle data-dark and data-light attributes for images
    const elements = document.querySelectorAll("[data-dark]");
    elements.forEach((element) => {
      const srcValueDark = element.getAttribute("data-dark");
      const srcValueLight = element.getAttribute("data-light");

      if (newIsDark) {
        element.src = srcValueDark;
      } else {
        element.src = srcValueLight;
      }
    });
  };

  return {
    isDark,
    theme: isDark ? 'dark' : 'light',
    toggleTheme
  };
}