"use client";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessRoute } from "@/utils/permissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Component to protect routes based on user roles and permissions
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if access is allowed
 * @param {string} props.requiredRoute - Route name to check permission for
 * @param {string} props.fallbackRoute - Route to redirect to if access denied (default: "/admin/dashboard")
 * @param {React.ReactNode} props.fallbackComponent - Component to show if access denied (instead of redirect)
 */
export default function RoleProtectedRoute({
  children,
  requiredRoute,
  fallbackRoute = "/admin/dashboard",
  fallbackComponent = null,
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't check permissions while auth is loading
    if (isLoading) return;

    // If no user, redirect to login
    if (!user) {
      router.push("/admin/login");
      return;
    }

    // Check if user has permission for this route
    if (!canAccessRoute(user, requiredRoute)) {
      if (fallbackComponent) {
        // Don't redirect, will show fallback component
        return;
      }
      // Redirect to fallback route
      router.push(fallbackRoute);
      return;
    }
  }, [
    user,
    isLoading,
    requiredRoute,
    fallbackRoute,
    router,
    fallbackComponent,
  ]);

  // Show loading while checking auth
  if (isLoading) {
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
            <p>Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no user, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  // If user doesn't have permission
  if (!canAccessRoute(user, requiredRoute)) {
    // Show fallback component if provided
    if (fallbackComponent) {
      return fallbackComponent;
    }
    // Otherwise don't render anything (redirect will happen)
    return null;
  }

  // User has permission, render children
  return children;
}

/**
 * Higher-order component version for easier use
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {string} requiredRoute - Route name to check permission for
 * @param {string} fallbackRoute - Route to redirect to if access denied
 */
export function withRoleProtection(
  WrappedComponent,
  requiredRoute,
  fallbackRoute
) {
  return function ProtectedComponent(props) {
    return (
      <RoleProtectedRoute
        requiredRoute={requiredRoute}
        fallbackRoute={fallbackRoute}
      >
        <WrappedComponent {...props} />
      </RoleProtectedRoute>
    );
  };
}

/**
 * Component to show access denied message
 */
export function AccessDenied({
  message = "Access Denied",
  description = "You don't have permission to access this page.",
}) {
  return (
    <div className="main-content w-100">
      <div className="main-content-inner">
        <div className="widget-box-2 mb-20">
          <div
            className="access-denied-container"
            style={{ textAlign: "center", padding: "60px 20px" }}
          >
            <div
              className="access-denied-icon"
              style={{ marginBottom: "20px" }}
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: "#dc3545" }}
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 9L9 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 9L15 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 style={{ color: "#dc3545", marginBottom: "10px" }}>
              {message}
            </h3>
            <p style={{ color: "#6c757d", marginBottom: "30px" }}>
              {description}
            </p>
            <a
              href="/admin/dashboard"
              className="tf-btn primary"
              style={{ textDecoration: "none" }}
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
