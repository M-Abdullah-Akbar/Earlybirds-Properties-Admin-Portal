"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to token-prefixed dashboard
    router.replace('/f8e7d6c5b4a398765432109876543210/dashboard');
  }, [router]);

  return (
    <div className="auth-loading-container">
      <div className="auth-loading-content">
        <div className="auth-loading-spinner">
          <div className="spinner-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        
        <div className="auth-loading-text">
          <h3>Redirecting to Dashboard</h3>
          <p>Please wait...</p>
        </div>
      </div>
    </div>
  );
} 