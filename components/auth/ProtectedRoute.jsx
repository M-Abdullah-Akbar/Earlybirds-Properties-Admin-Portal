"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowUnauthorized(true);
      setTimeout(() => {
        router.push('/f8e7d6c5b4a398765432109876543210/login');
      }, 2000);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show enhanced loading screen while checking authentication
  if (isLoading) {
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
            <p>Securing your access...</p>
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

  // Show unauthorized message before redirecting
  if (showUnauthorized) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-content unauthorized">
          <div className="auth-loading-logo">
            <Image
              src="/images/logo/logo.png"
              alt="EarlyBirds Properties"
              width={140}
              height={50}
              priority
            />
          </div>
          
          <div className="auth-unauthorized-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className="auth-loading-text">
            <h3>Access Restricted</h3>
            <p>Please log in to access the admin portal.</p>
            <p className="redirect-text">Redirecting to login page...</p>
          </div>
          
          <div className="auth-loading-progress">
            <div className="progress-bar">
              <div className="progress-fill error"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return children;
} 