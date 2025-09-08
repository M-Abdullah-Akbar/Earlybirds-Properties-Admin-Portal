"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { dashboardAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessRoute } from "@/utils/permissions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    pendingProperties: 0,
    soldProperties: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data when user is available
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboardStats(user);

      if (response.success) {
        setStats(response.data);
        setRecentProperties(response.data.recentProperties || []);
        setRecentUsers(response.data.recentUsers || []);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "btn-status active";
      case "pending":
        return "btn-status pending";
      case "sold":
        return "btn-status sold";
      case "rented":
        return "btn-status rented";
      case "draft":
        return "btn-status draft";
      case "archived":
        return "btn-status archived";
      default:
        return "btn-status";
    }
  };

  const getRoleClass = (role) => {
    switch (role?.toLowerCase()) {
      case "superadmin":
        return "role-superadmin";
      case "admin":
        return "role-admin";
      default:
        return "role-user";
    }
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner wrap-dashboard-content">
          <div className="widget-box-2 wd-listing">
            <div className="text-center py-50">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-20">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content w-100">
      <div className="main-content-inner wrap-dashboard-content">
        {/* Welcome Section */}
        <div className="widget-box-2 wd-listing mb-20">
          <div className="welcome-section">
            <h2 className="welcome-title">
              Welcome to EarlyBirds Properties Admin Dashboard
            </h2>
            <p className="welcome-subtitle">
              Manage your properties and users efficiently
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-section mb-30">
          <div className="row">
            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="icon icon-home"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalProperties}</h3>
                  <p className="stat-label">Total Properties</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="icon icon-check-circle"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.availableProperties}</h3>
                  <p className="stat-label">Available Properties</p>
                </div>
              </div>
            </div>
            {canAccessRoute(user, "user-management") && (
              <div className="col-md-3">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="icon icon-users"></i>
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-number">{stats.totalUsers}</h3>
                    <p className="stat-label">Total Users</p>
                  </div>
                </div>
              </div>
            )}
            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="icon icon-star"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.pendingProperties}</h3>
                  <p className="stat-label">Pending Properties</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Properties */}
        <div className="widget-box-2 wd-listing mb-20">
          <div className="d-flex justify-content-between align-items-center mb-20">
            <h3 className="title">Recent Properties</h3>
            <Link
              href="/admin/property-management"
              className="tf-btn bg-color-primary pd-13"
            >
              View All Properties
            </Link>
          </div>

          {recentProperties.length === 0 ? (
            <div className="text-center py-30">
              <p className="text-muted">No properties found.</p>
              <Link
                href="/admin/add-property"
                className="tf-btn bg-color-primary pd-13 mt-20"
              >
                Add Your First Property
              </Link>
            </div>
          ) : (
            <div className="properties-grid">
              {recentProperties.map((property) => (
                <div
                  key={property._id || property.id}
                  className="property-card"
                >
                  <div className="property-image">
                    <Image
                      src={
                        property.mainImage ||
                        property.imageSrc ||
                        "/images/home/house-db-1.jpg"
                      }
                      alt={property.title}
                      width={250}
                      height={180}
                      className="img-fluid"
                    />
                    <div
                      className={`status-badge ${getStatusClass(
                        property.status
                      )}`}
                    >
                      {property.status?.charAt(0).toUpperCase() +
                        property.status?.slice(1)}
                    </div>
                  </div>

                  <div className="property-content">
                    <h4 className="property-title">{property.title}</h4>
                    <p className="property-location">
                      <i className="icon icon-location"></i>
                      {property.location?.address ||
                        property.location ||
                        "Location not specified"}
                    </p>

                    <div className="property-details">
                      <div className="detail-item">
                        <span className="label">Price:</span>
                        <span className="value">
                          {formatPrice(property.price)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Type:</span>
                        <span className="value">
                          {property.propertyType ||
                            property.listingType ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Bedrooms:</span>
                        <span className="value">
                          {property.details?.bedrooms ||
                            property.bedrooms ||
                            property.beds ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Area:</span>
                        <span className="value">
                          {property.details?.area ||
                            property.area ||
                            property.sqft ||
                            "N/A"}
                          {property.details?.areaUnit || "sqft"}
                        </span>
                      </div>
                    </div>

                    <div className="property-meta">
                      <span className="posting-date">
                        Posted: {formatDate(property.createdAt)}
                      </span>
                    </div>

                    <div className="property-actions">
                      <Link
                        href={`/admin/edit-property/${
                          property._id || property.id
                        }`}
                        className="tf-btn bg-color-primary pd-10"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/property-management`}
                        className="tf-btn style-border pd-10"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users - Only show for SuperAdmin */}
        {canAccessRoute(user, "user-management") && (
          <div className="widget-box-2 wd-listing mb-20">
            <div className="d-flex justify-content-between align-items-center mb-20">
              <h3 className="title">Recent Users</h3>
              <Link
                href="/admin/user-management"
                className="tf-btn bg-color-primary pd-13"
              >
                View All Users
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <div className="text-center py-30">
                <p className="text-muted">No users found.</p>
              </div>
            ) : (
              <div className="users-grid">
                {recentUsers.map((user) => (
                  <div key={user._id || user.id} className="user-card">
                    <div className="user-avatar">
                      <Image
                        src={user.avatar || "/images/avatar/account.jpg"}
                        alt={user.name}
                        width={60}
                        height={60}
                        className="img-fluid rounded-circle"
                      />
                    </div>

                    <div className="user-content">
                      <h4 className="user-name">{user.name}</h4>
                      <p className="user-email">{user.email}</p>

                      <div className="user-details">
                        <span
                          className={`role-badge ${getRoleClass(user.role)}`}
                        >
                          {user.role?.charAt(0).toUpperCase() +
                            user.role?.slice(1)}
                        </span>
                        <span
                          className={`status-badge ${
                            user.isActive ? "active" : "inactive"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="user-meta">
                        <span className="join-date">
                          Joined: {formatDate(user.createdAt)}
                        </span>
                      </div>

                      <div className="user-actions">
                        <Link
                          href={`/admin/user-profile/${user._id || user.id}`}
                          className="tf-btn bg-color-primary pd-10"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="widget-box-2 wd-listing">
          <h3 className="title mb-20">Quick Actions</h3>
          <div className="quick-actions-grid">
            <Link href="/admin/add-property" className="quick-action-card">
              <div className="action-icon">
                <i className="icon icon-plus"></i>
              </div>
              <h4>Add New Property</h4>
              <p>Create a new property listing</p>
            </Link>

            {canAccessRoute(user, "add-user") && (
              <Link href="/admin/add-user" className="quick-action-card">
                <div className="action-icon">
                  <i className="icon icon-user-plus"></i>
                </div>
                <h4>Add New User</h4>
                <p>Create a new admin user</p>
              </Link>
            )}

            <Link
              href="/admin/property-management"
              className="quick-action-card"
            >
              <div className="action-icon">
                <i className="icon icon-home"></i>
              </div>
              <h4>Manage Properties</h4>
              <p>View and edit all properties</p>
            </Link>

            {canAccessRoute(user, "user-management") && (
              <Link href="/admin/user-management" className="quick-action-card">
                <div className="action-icon">
                  <i className="icon icon-users"></i>
                </div>
                <h4>Manage Users</h4>
                <p>View and edit all users</p>
              </Link>
            )}

            <Link href="/admin/change-password" className="quick-action-card">
              <div className="action-icon">
                <i className="icon icon-lock"></i>
              </div>
              <h4>Change Password</h4>
              <p>Update your account password</p>
            </Link>
          </div>
        </div>

        {/* .footer-dashboard */}
        <div className="footer-dashboard">
          <p>Copyright © {new Date().getFullYear()} EarlyBirds Properties</p>
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
        {/* .footer-dashboard */}
      </div>
      <div className="overlay-dashboard" />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
