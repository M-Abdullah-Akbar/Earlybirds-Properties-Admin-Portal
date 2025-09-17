"use client";
import { useEffect } from "react";
import "../public/main.scss";
import "odometer/themes/odometer-theme-default.css"; // Import theme
import "photoswipe/style.css";
import "rc-slider/assets/index.css";
import { usePathname } from "next/navigation";
import BackToTop from "@/components/common/BackToTop";
import MobileMenu from "@/components/headers/MobileMenu";
import SettingsHandler from "@/components/common/SettingsHandler";
import Login from "@/components/modals/Login";
import { AuthProvider } from "@/contexts/AuthContext";
import Header1 from "@/components/headers/Header1";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/dashboard/Sidebar";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Check if current route is a dashboard route
  {
    /*const isDashboardRoute = pathname?.startsWith('/dashboard') || 
                          pathname?.startsWith('/my-profile') || 
                          pathname?.startsWith('/add-property') ||
                          pathname?.startsWith('/user-management') ||
                          pathname?.startsWith('/add-user') ||
                          pathname?.startsWith('/user-profile') ||
                          pathname?.startsWith('/property-management') ||
                          pathname?.startsWith('/edit-property');*/
  }

  // Check if current route is a token-prefixed route
  const isTokenRoute = pathname?.includes("/admin/");

  // Extract the path after the token for dashboard route checking
  const pathAfterToken = pathname?.split("/admin/")[1];
  const isTokenDashboardRoute =
    pathAfterToken &&
    (pathAfterToken.startsWith("dashboard") ||
      pathAfterToken.startsWith("my-profile") ||
      pathAfterToken.startsWith("add-property") ||
      pathAfterToken.startsWith("user-management") ||
      pathAfterToken.startsWith("add-user") ||
      pathAfterToken.startsWith("user-profile") ||
      pathAfterToken.startsWith("property-management") ||
      pathAfterToken.startsWith("property-approval") ||
      pathAfterToken.startsWith("categories-approval") ||
      pathAfterToken.startsWith("edit-property") ||
      pathAfterToken.startsWith("change-password") ||
      pathAfterToken.startsWith("blog-management") ||
      pathAfterToken.startsWith("add-blog") ||
      pathAfterToken.startsWith("edit-blog") ||
      pathAfterToken.startsWith("blog-categories"));

  // Remove conditional bootstrap import to prevent hydration mismatch
  // Bootstrap will be imported via useEffect instead

  useEffect(() => {
    // Import bootstrap and handle modal/offcanvas cleanup
    const initializeBootstrap = async () => {
      try {
        // Dynamically import bootstrap
        await import("bootstrap/dist/js/bootstrap.esm");
        const bootstrap = require("bootstrap");

        // Close any open modal
        const modalElements = document.querySelectorAll(".modal.show");
        modalElements.forEach((modal) => {
          const modalInstance = bootstrap.Modal.getInstance(modal);
          if (modalInstance) {
            modalInstance.hide();
          }
        });

        // Close any open offcanvas
        const offcanvasElements = document.querySelectorAll(".offcanvas.show");
        offcanvasElements.forEach((offcanvas) => {
          const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvas);
          if (offcanvasInstance) {
            offcanvasInstance.hide();
          }
        });
      } catch (error) {
        console.error("Error initializing bootstrap:", error);
      }
    };

    initializeBootstrap();
  }, [pathname]); // Runs every time the route changes

  useEffect(() => {
    const WOW = require("@/utils/wow");
    const wow = new WOW.default({
      animateClass: "animated",
      offset: 100,
      mobile: true,
      live: false,
    });
    wow.init();
  }, [pathname]);

  useEffect(() => {
    const handleSticky = () => {
      const navbar = document.querySelector(".header");
      if (navbar) {
        if (window.scrollY > 120) {
          navbar.classList.add("fixed");
          navbar.classList.add("header-sticky");
        } else {
          navbar.classList.remove("fixed");
          navbar.classList.remove("header-sticky");
        }
        if (window.scrollY > 300) {
          navbar.classList.add("is-sticky");
        } else {
          navbar.classList.remove("is-sticky");
        }
      }
    };

    window.addEventListener("scroll", handleSticky);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("scroll", handleSticky);
    };
  }, []);

  // Dashboard layout for token-prefixed routes
  if (isTokenRoute && isTokenDashboardRoute) {
    return (
      <html lang="en" suppressHydrationWarning={true}>
        <body className="popup-loader">
          <AuthProvider>
            <ProtectedRoute>
              <div className="bg-dashboard">
                <div id="wrapper" className="bg-4">
                  <Header1 parentClass="header dashboard" />
                  <div className="page-layout">
                    <Sidebar />
                    {children}
                  </div>
                </div>
              </div>
              <MobileMenu />
              <BackToTop />
              {/*<SettingsHandler />*/}
              <Login />
            </ProtectedRoute>
          </AuthProvider>
        </body>
      </html>
    );
  }

  // Dashboard layout for regular routes (fallback)
  {
    /*if (isDashboardRoute) {
    return (
      <html lang="en">
        <body className="popup-loader">
          <AuthProvider>
            <ProtectedRoute>
              <div className="bg-dashboard">
                <div id="wrapper" className="bg-4">
                  <Header1 parentClass="header dashboard" />
                  <div className="page-layout">
                    <Sidebar />
                    {children}
                  </div>
                </div>
              </div>
              <MobileMenu />
              <BackToTop />
              <SettingsHandler />
              <Login />
            </ProtectedRoute>
          </AuthProvider>
        </body>
      </html>
    );
  }*/
  }

  // Regular layout for non-dashboard routes
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="popup-loader">
        <AuthProvider>
          {children}
          <MobileMenu />
          <BackToTop />
          <SettingsHandler />
          <Login />
        </AuthProvider>
      </body>
    </html>
  );
}
