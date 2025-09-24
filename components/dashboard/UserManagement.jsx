"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { userAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { userNotifications } from "../../utils/notifications";

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "All" && { isActive: statusFilter }),
      };

      const response = await userAPI.getUsers(params);

      if (response.success) {
        // Show all users including SuperAdmin accounts
        const fetchedUsers = response.data.users || [];
        setUsers(fetchedUsers);
        setTotalPages(response.data.pagination.pages);

        // Calculate statistics from FILTERED users
        const totalUsers = fetchedUsers.length;
        const activeUsers = fetchedUsers.filter(
          (user) => user.isActive === true
        ).length;

        setStats({
          totalUsers,
          activeUsers,
        });
      } else {
        setError(response.error || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to fetch users"
      );
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Handle user deletion - show modal
  const handleDeleteUser = (user) => {
    // Prevent deletion of SuperAdmin accounts
    if (user.role === "SuperAdmin") {
      userNotifications.deleteError("SuperAdmin accounts cannot be deleted.");
      return;
    }

    // Prevent users from deleting themselves
    if (currentUser && user._id === currentUser._id) {
      userNotifications.deleteError("You cannot delete your own account.");
      return;
    }

    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Confirm user deletion
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await userAPI.deleteUser(userToDelete._id);
      if (response.success) {
        // Refresh the user list and stats
        fetchUsers();
        userNotifications.deleteSuccess(userToDelete.name);
      } else {
        userNotifications.deleteError(response.error || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      userNotifications.deleteError(err.response?.data?.error || "Failed to delete user");
    } finally {
      // Always close the modal and reset state, regardless of success/failure
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Cancel user deletion
  const cancelDeleteUser = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Effect to fetch data on component mount and when filters change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const getStatusClass = (isActive) => {
    return isActive ? "btn-status active" : "btn-status inactive";
  };

  const getStatusStyle = (isActive) => {
    return {
      padding: "6px 16px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      backgroundColor: isActive ? "#28a745" : "#dc3545",
      color: "white",
      border: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      lineHeight: "1",
      minHeight: "24px",
      whiteSpace: "nowrap",
    };
  };

  const getStatusText = (isActive) => {
    return isActive ? "Active" : "Inactive";
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "SuperAdmin":
        return "role-admin";
      case "admin":
        return "role-agent";
      default:
        return "role-user";
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case "SuperAdmin":
        return "Super Admin";
      case "admin":
        return "Admin";
      default:
        return "User";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  if (initialLoad && loading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner wrap-dashboard-content">
          <div className="widget-box-2 wd-listing">
            <div className="text-center py-50">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-20">Loading Users...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content w-100">
      <div className="main-content-inner wrap-dashboard-content">
        <div className="widget-box-2 wd-listing mb-20">
          <div className="d-flex justify-content-between align-items-center mb-20">
            <h3 className="title">User Management</h3>
            <Link
              href="/admin/add-user"
              className="tf-btn bg-color-primary pd-13"
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: "8px" }}
              >
                <path
                  d="M8 3.33334V12.6667"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.6667 8H3.33333"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Add New User
            </Link>
          </div>

          {error && (
            <div className="alert alert-danger mb-20">
              {error}
              <button
                className="btn btn-sm btn-outline-danger ms-2"
                onClick={() => {
                  setError(null);
                  fetchUsers();
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="row mb-20">
            <div className="col-md-6">
              <fieldset className="box-fieldset">
                <label style={{ color: "var(--text-color, #333)" }}>
                  Search Users:
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    color: "var(--text-color, #333)",
                    backgroundColor: "var(--input-bg, #fff)",
                    border: "1px solid var(--border-color, #ddd)",
                  }}
                />
              </fieldset>
            </div>
            <div className="col-md-6">
              <fieldset className="box-fieldset">
                <label style={{ color: "var(--text-color, #333)" }}>
                  Filter by Status:
                </label>
                <select
                  className="form-control"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    color: "var(--text-color, #333)",
                    backgroundColor: "var(--input-bg, #fff)",
                    border: "1px solid var(--border-color, #ddd)",
                  }}
                >
                  <option
                    value="All"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    All Status
                  </option>
                  <option
                    value="true"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Active
                  </option>
                  <option
                    value="false"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Inactive
                  </option>
                </select>
              </fieldset>
            </div>
          </div>

          {/* Stats */}
          <div className="row mb-20">
            <div className="col-md-6 d-flex justify-content-center">
              <div className="flat-counter-v2 tf-counter">
                <div className="counter-box">
                  <div
                    className="box-icon"
                    style={{
                      width: "50px",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="icon"
                      style={{
                        fontSize: "28px",
                        width: "28px",
                        height: "28px",
                        display: "block",
                      }}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          width: "28px",
                          height: "28px",
                          display: "block",
                        }}
                      >
                        <path
                          d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21"
                          stroke="#F1913D"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                          stroke="#F1913D"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 21V19C22 18.1137 21.7311 17.2528 21.2312 16.5159C20.7313 15.7789 20.0218 15.1999 19.1899 14.8501C18.358 14.5003 17.4375 14.3944 16.5228 14.5466C15.6081 14.6988 14.7337 15.1039 14 15.72"
                          stroke="#F1913D"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
                          stroke="#F1913D"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <div className="content-box">
                    <div
                      className="title-count text-variant-1"
                      style={{ fontSize: "16px" }}
                    >
                      Total Users
                    </div>
                    <div className="box-count d-flex align-items-end">
                      <div
                        className="number"
                        style={{
                          fontSize: "32px",
                          fontWeight: "bold",
                          color: "#F1913D",
                        }}
                      >
                        {stats.totalUsers}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 d-flex justify-content-center">
              <div className="flat-counter-v2 tf-counter">
                <div className="counter-box">
                  <div
                    className="box-icon"
                    style={{
                      width: "50px",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="icon"
                      style={{
                        fontSize: "28px",
                        width: "28px",
                        height: "28px",
                        display: "block",
                      }}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          width: "28px",
                          height: "28px",
                          display: "block",
                        }}
                      >
                        <path
                          d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                          stroke="#22C55E"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <div className="content-box">
                    <div
                      className="title-count text-variant-1"
                      style={{ fontSize: "16px" }}
                    >
                      Active Users
                    </div>
                    <div className="box-count d-flex align-items-end">
                      <div
                        className="number"
                        style={{
                          fontSize: "32px",
                          fontWeight: "bold",
                          color: "#22C55E",
                        }}
                      >
                        {stats.activeUsers}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="wrap-table">
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Last Login</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <p className="mb-0">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="listing-box">
                            <div className="images">
                              <Image
                                alt="avatar"
                                src="/images/avatar/account.jpg" // Default avatar since backend doesn't store avatars
                                width={50}
                                height={50}
                                style={{ borderRadius: "50%" }}
                              />
                            </div>
                            <div className="content">
                              <div className="title">
                                <Link
                                  href={`/admin/user-profile/${user._id}`}
                                  className="link"
                                >
                                  {user.name}
                                </Link>
                              </div>
                              <div className="text-date">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`role-badge ${getRoleClass(user.role)}`}
                          >
                            {getRoleText(user.role)}
                          </span>
                        </td>
                        <td>
                          <div className="status-wrap">
                            <span
                              className={getStatusClass(user.isActive)}
                              style={getStatusStyle(user.isActive)}
                            >
                              {getStatusText(user.isActive)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span>{formatDate(user.createdAt)}</span>
                        </td>
                        <td>
                          <span>{formatDate(user.lastLogin)}</span>
                        </td>
                        <td>
                          <ul className="list-action">
                            {/* Only show delete button for non-SuperAdmin accounts and not for current user */}
                            {user.role !== "SuperAdmin" &&
                              user._id !== currentUser?._id && (
                                <li>
                                  <button
                                    className="remove-file item"
                                    onClick={() => handleDeleteUser(user)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <svg
                                      width={16}
                                      height={16}
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9.82667 6.00035L9.596 12.0003M6.404 12.0003L6.17333 6.00035M12.8187 3.86035C13.0467 3.89501 13.2733 3.93168 13.5 3.97101M12.8187 3.86035L12.1067 13.1157C12.0776 13.4925 11.9074 13.8445 11.63 14.1012C11.3527 14.3579 10.9886 14.5005 10.6107 14.5003H5.38933C5.0114 14.5005 4.64735 14.3579 4.36999 14.1012C4.09262 13.8445 3.92239 13.4925 3.89333 13.1157L3.18133 3.86035M12.8187 3.86035C12.0492 3.74403 11.2758 3.65574 10.5 3.59568M3.18133 3.86035C2.95333 3.89435 2.72667 3.93101 2.5 3.97035M3.18133 3.86035C3.95076 3.74403 4.72416 3.65575 5.5 3.59568M10.5 3.59568V2.98501C10.5 2.19835 9.89333 1.54235 9.10667 1.51768C8.36908 1.49411 7.63092 1.49411 6.89333 1.51768C6.10667 1.54235 5.5 2.19901 5.5 2.98501V3.59568M10.5 3.59568C8.83581 3.46707 7.16419 3.46707 5.5 3.59568"
                                        stroke="#A3ABB0"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    Delete
                                  </button>
                                </li>
                              )}
                            {/* Show a message if no actions are available */}
                            {(user.role === "SuperAdmin" ||
                              user._id === currentUser?._id) && (
                              <li>
                                <span
                                  style={{ color: "#999", fontSize: "12px" }}
                                >
                                  {user.role === "SuperAdmin"
                                    ? "Protected"
                                    : "Current User"}
                                </span>
                              </li>
                            )}
                          </ul>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {totalPages > 1 && (
            <ul className="wg-pagination">
              <li className={`arrow ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <i className="icon-arrow-left" />
                </button>
              </li>

              {/* Generate page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <li
                    key={pageNum}
                    className={currentPage === pageNum ? "active" : ""}
                  >
                    <button
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}

              <li
                className={`arrow ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    background: "none",
                    border: "none",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  <i className="icon-arrow-right" />
                </button>
              </li>
            </ul>
          )}
        </div>

        {/* .footer-dashboard */}
        <div className="footer-dashboard">
          <p>Copyright © {new Date().getFullYear()} Popty</p>
          <ul className="list">
            <li>
              <a href="#">Privacy</a>
            </li>
            <li>
              <a href="#">Terms</a>
            </li>
            <li>
              <a href="#">Support</a>
            </li>
          </ul>
        </div>
        {/* /.footer-dashboard */}
      </div>
      <div className="overlay-dashboard" />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div className="modal-header" style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: 0, color: "#333" }}>Confirm Delete User</h4>
            </div>
            <div className="modal-body" style={{ marginBottom: "30px" }}>
              <p style={{ margin: 0, color: "#666", lineHeight: "1.5" }}>
                Are you sure you want to delete the user{" "}
                <strong>{userToDelete?.name}</strong>?
              </p>
              <p
                style={{
                  margin: "15px 0 0 0",
                  color: "#666",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                <strong>Note:</strong> Properties created by this user that have
                approval status "approved" or "rejected" will be transferred to
                you.
              </p>
              <p style={{ margin: "10px 0 0 0" }}>
                <small style={{ color: "#999" }}>
                  This action cannot be undone.
                </small>
              </p>
            </div>
            <div
              className="modal-footer"
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={cancelDeleteUser}
                disabled={deleteLoading}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  color: "#666",
                  borderRadius: "4px",
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                  opacity: deleteLoading ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={deleteLoading}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  backgroundColor: "#dc3545",
                  color: "white",
                  borderRadius: "4px",
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                  opacity: deleteLoading ? 0.6 : 1,
                }}
              >
                {deleteLoading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
