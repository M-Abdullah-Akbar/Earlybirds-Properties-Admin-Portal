"use client";
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function TokenRootPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token;

  useEffect(() => {
    // Validate token and redirect to dashboard
    if (token === 'f8e7d6c5b4a398765432109876543210') {
      router.replace(`/${token}/dashboard`);
    } else {
      // Invalid token, redirect to login
      router.replace('/login');
    }
  }, [token, router]);

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
          <h3>Validating Access Token</h3>
          <p>Please wait...</p>
        </div>
      </div>
    </div>
  );
} 