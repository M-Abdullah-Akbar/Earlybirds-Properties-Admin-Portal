"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('admin_token');
      const userData = localStorage.getItem('admin_user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // Handle token-based authentication
      if (credentials.token) {
        // Validate token and auto-login
        const response = await new Promise((resolve) => {
          setTimeout(() => {
            // Validate the specific hex token
            const validToken = 'admin';
            if (credentials.token === validToken) {
              resolve({
                success: true,
                user: {
                  id: 1,
                  username: 'admin',
                  email: 'admin@earlybirds.com',
                  role: 'admin',
                  name: 'Admin User',
                  loginMethod: 'token'
                },
                token: 'mock-jwt-token-' + Date.now()
              });
            } else {
              resolve({
                success: false,
                error: 'Invalid or expired access token'
              });
            }
          }, 1000);
        });

        if (response.success) {
          localStorage.setItem('admin_token', response.token);
          localStorage.setItem('admin_user', JSON.stringify(response.user));
          
          setUser(response.user);
          setIsAuthenticated(true);
          
          return { success: true };
        } else {
          return { success: false, error: response.error };
        }
      }

      // Handle regular username/password authentication
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          // Mock successful login
          if (credentials.username && credentials.password) {
            resolve({
              success: true,
              user: {
                id: 1,
                username: credentials.username,
                email: `${credentials.username}@admin.com`,
                role: 'admin',
                name: 'Admin User',
                loginMethod: 'credentials'
              },
              token: 'mock-jwt-token-' + Date.now()
            });
          } else {
            resolve({
              success: false,
              error: 'Invalid credentials'
            });
          }
        }, 1000);
      });

      if (response.success) {
        // Store user data and token
        localStorage.setItem('admin_token', response.token);
        localStorage.setItem('admin_user', JSON.stringify(response.user));
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      // Simulate registration API call
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
                role: 'admin',
                name: `${userData.firstName} ${userData.lastName}`
              },
              token: 'mock-jwt-token-' + Date.now()
            });
          } else {
            resolve({
              success: false,
              error: 'Registration failed - missing required fields'
            });
          }
        }, 1500);
      });

      if (response.success) {
        // Store user data and token
        localStorage.setItem('admin_token', response.token);
        localStorage.setItem('admin_user', JSON.stringify(response.user));
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    // Clear stored data
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to token-prefixed login
    router.push('/admin/login');
  };

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    return !!token;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 