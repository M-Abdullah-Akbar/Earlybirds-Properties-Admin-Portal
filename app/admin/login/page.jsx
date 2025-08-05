"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams, useParams } from "next/navigation";

export default function AdminLoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const token = params.token;
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenAuth, setTokenAuth] = useState(false);

  // Check for token authentication
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      handleTokenAuthentication(urlToken);
    }
  }, [searchParams]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(`/admin/dashboard`);
    }
  }, [isAuthenticated, isLoading, router, token]);

  const handleTokenAuthentication = async (authToken) => {
    setTokenAuth(true);
    setError('');
    
    try {
      // Validate the hex token
      const isValidToken = validateHexToken(authToken);
      
      if (isValidToken) {
        // Auto-login with token
        const result = await login({ token: authToken });
        if (result.success) {
          router.push(`/admin/dashboard`);
        } else {
          setError('Invalid or expired access token');
        }
      } else {
        setError('Invalid or expired access token');
      }
    } catch (error) {
      setError('Error validating access token');
    } finally {
      setTokenAuth(false);
    }
  };

  const validateHexToken = (authToken) => {
    // Validate the specific hex token
    const validToken = 'f8e7d6c5b4a398765432109876543210';
    return authToken === validToken;
  };

  // Show enhanced loading screen while checking authentication
  if (isLoading || tokenAuth) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-content">
          <div className="auth-loading-logo">
            <Image
              src="/images/logo/logo.png"
              alt="EarlyBirds Properties"
              width={140}
              height={50}
              priority
            />
          </div>
          
          <div className="auth-loading-spinner">
            <div className="spinner-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          
          <div className="auth-loading-text">
            <h3>Welcome to EarlyBirds Properties</h3>
            <p>{tokenAuth ? 'Validating access token...' : 'Checking your session...'}</p>
          </div>
          
          <div className="auth-loading-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        // Login successful - redirect will be handled by AuthContext
        console.log("Login successful");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <div className="auth-page-container">
        <div className="auth-page-content">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <div className="auth-logo">
                <Image
                  src="/images/logo/logo.png"
                  alt="EarlyBirds Properties"
                  width={140}
                  height={50}
                  priority
                />
              </div>
              <div className="auth-form-title">
                <h3>Admin Login</h3>
                <p>Welcome back! Please login to your account.</p>
              </div>
            </div>
            
            <form className="auth-form" onSubmit={handleSubmit}>
              {error && (
                <div className="auth-error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              
              <div className="auth-form-group">
                <label htmlFor="username">Username</label>
                <div className="auth-input-wrapper">
                  <svg
                    className="auth-input-icon"
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.4869 14.0435C12.9628 13.3497 12.2848 12.787 11.5063 12.3998C10.7277 12.0126 9.86989 11.8115 9.00038 11.8123C8.13086 11.8115 7.27304 12.0126 6.49449 12.3998C5.71594 12.787 5.03793 13.3497 4.51388 14.0435M13.4869 14.0435C14.5095 13.1339 15.2307 11.9349 15.5563 10.6056C15.8818 9.27625 15.7956 7.87934 15.309 6.60014C14.8224 5.32093 13.9584 4.21986 12.8317 3.44295C11.7049 2.66604 10.3686 2.25 9 2.25C7.63137 2.25 6.29508 2.66604 5.16833 3.44295C4.04158 4.21986 3.17762 5.32093 2.69103 6.60014C2.20443 7.87934 2.11819 9.27625 2.44374 10.6056C2.76929 11.9349 3.49125 13.1339 4.51388 14.0435M13.4869 14.0435C12.2524 15.1447 10.6546 15.7521 9.00038 15.7498C7.3459 15.7523 5.74855 15.1448 4.51388 14.0435M11.2504 7.31228C11.2504 7.90902 11.0133 8.48131 10.5914 8.90327C10.1694 9.32523 9.59711 9.56228 9.00038 9.56228C8.40364 9.56228 7.83134 9.32523 7.40939 8.90327C6.98743 8.48131 6.75038 7.90902 6.75038 7.31228C6.75038 6.71554 6.98743 6.14325 7.40939 5.72129C7.83134 5.29933 8.40364 5.06228 9.00038 5.06228C9.59711 5.06228 10.1694 5.29933 10.5914 5.72129C11.0133 6.14325 11.2504 6.71554 11.2504 7.31228Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="text"
                    className="auth-input"
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>
              
              <div className="auth-form-group">
                <label htmlFor="password">Password</label>
                <div className="auth-input-wrapper">
                  <svg
                    className="auth-input-icon"
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.375 7.875V5.0625C12.375 4.16739 12.0194 3.30895 11.3865 2.67601C10.7535 2.04308 9.89511 1.6875 9 1.6875C8.10489 1.6875 7.24645 2.04308 6.61351 2.67601C5.98058 3.16739 5.625 4.16739 5.625 5.0625V7.875M5.0625 16.3125H12.9375C13.3851 16.3125 13.8143 16.1347 14.1307 15.8182C14.4472 15.5018 14.625 15.0726 14.625 14.625V9.5625C14.625 9.11495 14.4472 8.68573 14.1307 8.36926C13.8143 8.05279 13.3851 7.875 12.9375 7.875H5.0625C4.61495 7.875 4.18573 8.05279 3.86926 8.36926C3.55279 8.68573 3.375 9.11495 3.375 9.5625V14.625C3.375 15.0726 3.55279 15.5018 3.86926 15.8182C4.18573 16.1347 4.61495 16.3125 5.0625 16.3125Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="password"
                    className="auth-input"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={formLoading}
                  />
                </div>
                <div className="auth-forgot-password">
                  <Link href="/forgot-password" className="auth-link">
                    Forgot password?
                  </Link>
                </div>
              </div>
              
              <div className="auth-form-actions">
                <button
                  type="submit"
                  className={`auth-submit-btn ${formLoading ? 'loading' : ''}`}
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <div className="auth-spinner">
                        <div className="spinner-ring">
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>
                      </div>
                      <span>Logging in...</span>
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 