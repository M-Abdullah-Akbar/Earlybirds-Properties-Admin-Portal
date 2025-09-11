"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/utlis/api";
import { safeLocalStorage } from "@/utlis/clientUtils";
import { useClientMount } from "@/utlis/useClientMount";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const hasMounted = useClientMount();

  // Check if user is logged in on mount
  useEffect(() => {
    if (!hasMounted) return; // Wait for client-side mount to prevent hydration mismatch

    const checkAuth = async () => {
      const token = safeLocalStorage.getItem("admin_token");
      const userData = safeLocalStorage.getItem("admin_user");

      if (token && userData) {
        try {
          // Instead of calling a non-existent verify endpoint,
          // we'll just check if the token exists and user data is valid
          // The API response interceptor will handle invalid tokens automatically
          const user = JSON.parse(userData);
          setUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [hasMounted]);

  const login = async (credentials) => {
    try {
      // Handle token-based authentication
      if (credentials.token) {
        // Validate the hex token
        const validToken = "f8e7d6c5b4a398765432109876543210";
        if (credentials.token === validToken) {
          // For now, use mock user data for token auth
          // In production, this should call a backend endpoint
          const mockUser = {
            id: 1,
            username: "admin",
            email: "admin@earlybirds.com",
            role: "admin",
            name: "Admin User",
            loginMethod: "token",
          };

          const mockToken = "mock-jwt-token-" + Date.now();
          safeLocalStorage.setItem("admin_token", mockToken);
          safeLocalStorage.setItem("admin_user", JSON.stringify(mockUser));

          setUser(mockUser);
          setIsAuthenticated(true);

          return { success: true };
        } else {
          return { success: false, error: "Invalid or expired access token" };
        }
      }

      // Handle regular username/password authentication with real backend
      // Clear any existing authentication state before attempting login
      // This prevents 401 errors from stale tokens
      safeLocalStorage.removeItem("admin_token");
      safeLocalStorage.removeItem("admin_user");
      setUser(null);
      setIsAuthenticated(false);

      try {
        const response = await authAPI.login(credentials);

        if (response.success) {
          // Store user data and token from backend
          // Note: Backend returns data.user and data.token, not response.user and response.token
          const userData = response.data.user;
          const token = response.data.token;

          safeLocalStorage.setItem("admin_token", token);
          safeLocalStorage.setItem("admin_user", JSON.stringify(userData));

          setUser(userData);
          setIsAuthenticated(true);

          return { success: true };
        } else {
          // Check if backend returned field-specific validation errors
          if (response.fieldErrors) {
            return { success: false, fieldErrors: response.fieldErrors };
          }
          // Check for validation errors in different formats
          if (response.errors && typeof response.errors === "object") {
            return { success: false, fieldErrors: response.errors };
          }
          // Check for validation details array format
          if (response.details && Array.isArray(response.details)) {
            const fieldErrors = {};
            response.details.forEach((detail) => {
              if (detail.field && detail.message) {
                fieldErrors[detail.field] = detail.message;
              }
            });
            if (Object.keys(fieldErrors).length > 0) {
              return { success: false, fieldErrors };
            }
          }
          return {
            success: false,
            error: response.error || response.message || "Login failed",
          };
        }
      } catch (error) {
        // Handle validation errors from error response
        if (error.response?.data) {
          const errorData = error.response.data;

          // Check for field-specific validation errors in various formats
          if (
            errorData.fieldErrors &&
            typeof errorData.fieldErrors === "object"
          ) {
            return { success: false, fieldErrors: errorData.fieldErrors };
          }
          if (errorData.errors && typeof errorData.errors === "object") {
            return { success: false, fieldErrors: errorData.errors };
          }
          if (errorData.details && Array.isArray(errorData.details)) {
            const fieldErrors = {};
            errorData.details.forEach((detail) => {
              if (detail.field && detail.message) {
                fieldErrors[detail.field] = detail.message;
              }
            });
            if (Object.keys(fieldErrors).length > 0) {
              return { success: false, fieldErrors };
            }
          }

          // Handle 401 and other API errors gracefully
          if (error.response?.status === 401) {
            // Invalid credentials - return user-friendly error
            return {
              success: false,
              error:
                errorData.error ||
                errorData.message ||
                "Invalid username or password",
            };
          } else if (errorData.error || errorData.message) {
            // Other backend errors
            return {
              success: false,
              error: errorData.error || errorData.message,
            };
          }
        }

        // Network or other errors
        return {
          success: false,
          error: "Unable to connect to server. Please try again.",
        };
      }
    } catch (error) {
      console.error("Login error:", error);

      // Check if the error response contains validation errors
      if (error.response?.data?.details) {
        // Convert backend validation format to fieldErrors format
        const fieldErrors = {};
        error.response.data.details.forEach((detail) => {
          fieldErrors[detail.field] = detail.message;
        });
        return { success: false, fieldErrors };
      }

      // Check for specific error messages from backend
      if (error.response?.data?.error) {
        return { success: false, error: error.response.data.error };
      }

      return { success: false, error: "Login failed - network error" };
    }
  };

  const register = async (userData) => {
    try {
      // Sim
      // ulate registration API call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          // Mock successful registration
          if (userData.username && userData.password && userData.email) {
            resolve({
              success: true,
              user: {
                id: Date.now(),
                username: userData.username,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: "admin",
                name: `${userData.firstName} ${userData.lastName}`,
              },
              token: "mock-jwt-token-" + Date.now(),
            });
          } else {
            resolve({
              success: false,
              error: "Registration failed - missing required fields",
            });
          }
        }, 1500);
      });

      if (response.success) {
        // Store user data and token
        safeLocalStorage.setItem("admin_token", response.token);
        safeLocalStorage.setItem("admin_user", JSON.stringify(response.user));

        setUser(response.user);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Registration failed" };
    }
  };

  const logout = () => {
    // Clear stored data
    safeLocalStorage.removeItem("admin_token");
    safeLocalStorage.removeItem("admin_user");

    // Reset state
    setUser(null);
    setIsAuthenticated(false);

    // Redirect to token-prefixed login
    router.push("/admin/login");
  };

  const checkAuth = () => {
    const token = safeLocalStorage.getItem("admin_token");
    return !!token;
  };

  const updateUser = (updatedUserData) => {
    if (user) {
      const newUserData = { ...user, ...updatedUserData };
      setUser(newUserData);
      safeLocalStorage.setItem("admin_user", JSON.stringify(newUserData));
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
