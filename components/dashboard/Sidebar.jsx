"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Helper function to check if a route is active
  const isActiveRoute = (route) => {
    // Check for token-prefixed routes
    if (pathname.includes("/admin/")) {
      return pathname.includes(`/admin/${route}`);
    }
    // Fallback for non-token routes
    return pathname === `/${route}`;
  };

  // Helper function to get the correct href for a route
  const getRouteHref = (route) => {
    // If we're on a token-prefixed route, use token-prefixed href
    if (pathname.includes("/admin/")) {
      return `/admin/${route}`;
    }
    // Fallback for non-token routes
    return `/${route}`;
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <div className="wrap-sidebar">
      <div className="sidebar-menu-dashboard">

        <div className="menu-box">
          <ul className="box-menu-dashboard">
            <li
              className={`nav-menu-item ${
                isActiveRoute("dashboard") ? "active" : ""
              } `}
            >
              <Link className="nav-menu-link" href={getRouteHref("dashboard")}>
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.5 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V9.16667C2.5 9.6269 2.8731 10 3.33333 10H7.5C7.96024 10 8.33333 9.6269 8.33333 9.16667V3.33333C8.33333 2.8731 7.96024 2.5 7.5 2.5Z"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.668 2.5H12.5013C12.0411 2.5 11.668 2.8731 11.668 3.33333V5.83333C11.668 6.29357 12.0411 6.66667 12.5013 6.66667H16.668C17.1282 6.66667 17.5013 6.29357 17.5013 5.83333V3.33333C17.5013 2.8731 17.1282 2.5 16.668 2.5Z"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.668 10H12.5013C12.0411 10 11.668 10.3731 11.668 10.8333V16.6667C11.668 17.1269 12.0411 17.5 12.5013 17.5H16.668C17.1282 17.5 17.5013 17.1269 17.5013 16.6667V10.8333C17.5013 10.3731 17.1282 10 16.668 10Z"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.5 13.3334H3.33333C2.8731 13.3334 2.5 13.7065 2.5 14.1667V16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H7.5C7.96024 17.5 8.33333 17.1269 8.33333 16.6667V14.1667C8.33333 13.7065 7.96024 13.3334 7.5 13.3334Z"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Dashboard
              </Link>
            </li>
            {/*<li
              className={`nav-menu-item ${
                isActiveRoute("my-profile") ? "active" : ""
              } `}
            >
              <Link className="nav-menu-link" href={getRouteHref("my-profile")}>
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.082 18.3333H14.9987C15.4407 18.3333 15.8646 18.1577 16.1772 17.8451C16.4898 17.5326 16.6654 17.1087 16.6654 16.6666V5.83329L12.4987 1.66663H4.9987C4.55667 1.66663 4.13275 1.84222 3.82019 2.15478C3.50763 2.46734 3.33203 2.89127 3.33203 3.33329V6.66663"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.668 1.66663V4.99996C11.668 5.44199 11.8436 5.86591 12.1561 6.17847C12.4687 6.49103 12.8926 6.66663 13.3346 6.66663H16.668"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.49828 10.9167C2.24146 11.0649 2.02884 11.279 1.88235 11.5368C1.73587 11.7946 1.66082 12.0868 1.66494 12.3833V15.0833C1.65529 15.3802 1.72514 15.6742 1.86726 15.935C2.00937 16.1958 2.2186 16.4139 2.47328 16.5667L4.99828 18.0833C5.25385 18.2356 5.5455 18.3166 5.84297 18.3181C6.14044 18.3195 6.43288 18.2414 6.68994 18.0917L9.16494 16.5833C9.42176 16.4351 9.63438 16.221 9.78087 15.9632C9.92735 15.7054 10.0024 15.4132 9.99828 15.1167V12.4167C10.0079 12.1198 9.93808 11.8258 9.79596 11.565C9.65385 11.3042 9.44462 11.0861 9.18994 10.9333L6.66494 9.41666C6.40937 9.26442 6.11771 9.18337 5.82025 9.1819C5.52278 9.18044 5.23033 9.25862 4.97328 9.40832L2.49828 10.9167Z"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.83203 14.1666V18.3333"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.7513 11.8334L5.83464 14.1667L1.91797 11.8334"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Profile
              </Link>
            </li>*/}
            <li
              className={`nav-menu-item ${
                isActiveRoute("user-management") ? "active" : ""
              } `}
            >
              <Link
                className="nav-menu-link"
                href={getRouteHref("user-management")}
              >
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 21V19C22 18.1137 21.7311 17.2528 21.2312 16.5159C20.7313 15.7789 20.0218 15.1999 19.1899 14.8501C18.358 14.5003 17.4375 14.3944 16.5228 14.5466C15.6081 14.6988 14.7337 15.1039 14 15.72"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Users
              </Link>
            </li>
            <li
              className={`nav-menu-item ${
                isActiveRoute("property-management") ? "active" : ""
              } `}
            >
              <Link
                className="nav-menu-link"
                href={getRouteHref("property-management")}
              >
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 22V12H15V22"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Properties
              </Link>
            </li>
            <li
              className={`nav-menu-item ${
                isActiveRoute("change-password") ? "active" : ""
              } `}
            >
              <Link
                className="nav-menu-link"
                href={getRouteHref("change-password")}
              >
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.8346 9.16663V6.66663C15.8346 5.34054 15.3079 4.06877 14.3702 3.13109C13.4325 2.19341 12.1607 1.66663 10.8346 1.66663C9.50854 1.66663 8.23677 2.19341 7.29909 3.13109C6.36141 4.06877 5.83464 5.34054 5.83464 6.66663V9.16663"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.16797 9.16663H17.5013C18.1913 9.16663 18.7513 9.72663 18.7513 10.4166V16.25C18.7513 16.94 18.1913 17.5 17.5013 17.5H4.16797C3.47797 17.5 2.91797 16.94 2.91797 16.25V10.4166C2.91797 9.72663 3.47797 9.16663 4.16797 9.16663Z"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.832 12.5V14.1666"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Change Password
              </Link>
            </li>
            {/*<li
              className={`nav-menu-item ${
                isActiveRoute("add-user") ? "active" : ""
              } `}
            >
              <Link className="nav-menu-link" href={getRouteHref("add-user")}>
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 2.5V17.5"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.5 10H2.5"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add User
              </Link>
            </li>
            <li
              className={`nav-menu-item ${
                isActiveRoute("add-property") ? "active" : ""
              } `}
            >
              <Link className="nav-menu-link" href={getRouteHref("add-property")}>
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.9987 4.16663L12.987 2.15496C12.6745 1.84238 12.2507 1.66672 11.8087 1.66663H4.9987C4.55667 1.66663 4.13275 1.84222 3.82019 2.15478C3.50763 2.46734 3.33203 2.89127 3.33203 3.33329V16.6666C3.33203 17.1087 3.50763 17.5326 3.82019 17.8451C4.13275 18.1577 4.55667 18.3333 4.9987 18.3333H14.9987C15.4407 18.3333 15.8646 18.1577 16.1772 17.8451C16.4898 17.5326 16.6654 17.1087 16.6654 16.6666"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.8168 10.5217C18.1487 10.1897 18.3352 9.73947 18.3352 9.27C18.3352 8.80054 18.1487 8.3503 17.8168 8.01834C17.4848 7.68637 17.0346 7.49988 16.5651 7.49988C16.0956 7.49988 15.6454 7.68637 15.3134 8.01834L11.9718 11.3617C11.7736 11.5597 11.6286 11.8044 11.5501 12.0733L10.8526 14.465C10.8317 14.5367 10.8304 14.6127 10.849 14.6851C10.8675 14.7574 10.9052 14.8235 10.958 14.8763C11.0108 14.9291 11.0768 14.9668 11.1492 14.9853C11.2216 15.0038 11.2976 15.0026 11.3693 14.9817L13.7609 14.2842C14.0298 14.2057 14.2746 14.0606 14.4726 13.8625L17.8168 10.5217Z"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.66797 15H7.5013"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add Property
              </Link>
            </li>
            <li className={`nav-menu-item `}>
              <button 
                className="nav-menu-link logout-btn" 
                onClick={handleLogout}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  width: '100%', 
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.332 14.1667L17.4987 10L13.332 5.83337"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.5 10H7.5"
                    stroke="#A8ABAE"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Logout
              </button>
            </li>*/}
          </ul>
        </div>
      </div>
    </div>
  );
}
