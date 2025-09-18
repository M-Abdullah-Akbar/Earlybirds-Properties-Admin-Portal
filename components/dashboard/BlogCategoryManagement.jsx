"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { blogCategoryAPI } from "@/utils/api";
import { blogCategoryNotifications } from "@/utils/notifications";
import { useAuth } from "@/contexts/AuthContext";

export default function BlogCategoryManagement() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    approvedCategories: 0,
    pendingCategories: 0,
    rejectedCategories: 0,
  });
  const [loading, setLoading] = useState(true); // For initial page load
  const [listLoading, setListLoading] = useState(false); // For listing area only
  const [initialLoad, setInitialLoad] = useState(true); // Track if it's the first load
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [approvalFilter, setApprovalFilter] = useState("All");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState("");

  // Fetch categories with filters and update both listing and stats
  const fetchCategories = async () => {
    try {
      // Use full page loading only on initial load
      if (initialLoad) {
        setLoading(true);
      } else {
        setListLoading(true);
      }
      setError(null);

      // Build query parameters for filtered categories
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "All") params.isActive = statusFilter === "active";
      if (approvalFilter !== "All") params.approvalStatus = approvalFilter;

      // For admins (not SuperAdmins), only show categories they created
      if (user && user.role === "admin") {
        params.createdBy = user._id;
      }

      console.log("🔍 Blog Category API params:", params);
      console.log("👤 Current user:", user);

      const response = await blogCategoryAPI.getCategories(params);

      if (response.success) {
        let fetchedCategories = response.data?.categories || [];
        console.log(
          "📋 Fetched categories (before filtering):",
          fetchedCategories
        );
        console.log(
          "📋 Categories count (before filtering):",
          fetchedCategories.length
        );

        // Debug rejected categories specifically
        const debugRejectedCategories = fetchedCategories.filter(
          (cat) => cat.approvalStatus === "rejected"
        );
        if (debugRejectedCategories.length > 0) {
          console.log(
            "🔍 Debug - Rejected categories:",
            debugRejectedCategories.map((cat) => ({
              name: cat.name,
              approvalStatus: cat.approvalStatus,
              rejectionReason: cat.rejectionReason,
              hasRejectionReason: !!cat.rejectionReason,
            }))
          );
        }

        // Frontend filtering for admins if backend doesn't support it
        if (user && user.role === "admin") {
          console.log("🔍 Admin filtering - user object:", user);
          console.log("🔍 Admin filtering - user._id:", user._id);
          console.log("🔍 Admin filtering - user.id:", user.id);

          fetchedCategories = fetchedCategories.filter((category) => {
            const categoryCreatedBy =
              category.createdBy?._id || category.createdBy;

            // Try multiple comparison methods to handle different data types
            const userId = user._id || user.id;
            const userIdMatch =
              categoryCreatedBy === userId ||
              categoryCreatedBy === user._id ||
              categoryCreatedBy === user.id ||
              (categoryCreatedBy &&
                categoryCreatedBy.toString() === userId?.toString()) ||
              (categoryCreatedBy &&
                categoryCreatedBy.toString() === user._id?.toString()) ||
              (categoryCreatedBy &&
                categoryCreatedBy.toString() === user.id?.toString());

            console.log(
              `📋 Category "${category.name}":`,
              `\n  - createdBy: ${categoryCreatedBy} (type: ${typeof categoryCreatedBy})`,
              `\n  - user._id: ${user._id} (type: ${typeof user._id})`,
              `\n  - user.id: ${user.id} (type: ${typeof user.id})`,
              `\n  - match: ${userIdMatch}`
            );
            return userIdMatch;
          });
          console.log(
            "📋 Categories after admin filtering:",
            fetchedCategories.length
          );
        }

        setCategories(fetchedCategories);

        // Calculate statistics from FILTERED categories
        const totalCategories = fetchedCategories.length;
        const activeCategories = fetchedCategories.filter(
          (cat) => cat.isActive === true
        ).length;
        const approvedCategories = fetchedCategories.filter(
          (cat) => cat.approvalStatus === "approved"
        ).length;
        const pendingCategories = fetchedCategories.filter(
          (cat) => cat.approvalStatus === "pending"
        ).length;
        const rejectedCategories = fetchedCategories.filter(
          (cat) => cat.approvalStatus === "rejected"
        ).length;

        setStats({
          totalCategories,
          activeCategories,
          approvedCategories,
          pendingCategories,
          rejectedCategories,
        });
      } else {
        blogCategoryNotifications.fetchError(response.error || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to fetch categories";
      blogCategoryNotifications.fetchError(errorMessage);
    } finally {
      if (initialLoad) {
        setLoading(false);
        setInitialLoad(false);
      } else {
        setListLoading(false);
      }
    }
  };

  // Check if category can be deleted by current user
  const canDeleteCategory = (category) => {
    // SuperAdmins can delete any category
    if (user && user.role === "SuperAdmin") {
      return true;
    }

    // Admins can only delete their own categories that are NOT approved or pending
    if (user && user.role === "admin") {
      const isOwner =
        category.createdBy?._id === user._id ||
        category.createdBy?._id === user.id ||
        category.createdBy === user._id ||
        category.createdBy === user.id;

      if (!isOwner) {
        return false;
      }

      // Admin can only delete rejected categories or categories without approval status
      return category.approvalStatus === "rejected" || !category.approvalStatus;
    }

    return false;
  };

  // Show delete modal
  const showDeleteCategoryModal = (category) => {
    // Check if user can delete this category
    if (!canDeleteCategory(category)) {
      if (user && user.role === "admin") {
        if (category.approvalStatus === "approved") {
          blogCategoryNotifications.deleteError(
            "You cannot delete an approved category. Please contact a Super Admin if you need to remove this category."
          );
        } else if (category.approvalStatus === "pending") {
          blogCategoryNotifications.deleteError(
            "You cannot delete a category that is pending approval. Please wait for approval or contact a Super Admin."
          );
        } else {
          blogCategoryNotifications.deleteError("You can only delete your own rejected categories.");
        }
      } else {
        blogCategoryNotifications.deleteError("You don't have permission to delete this category.");
      }
      return;
    }

    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    // Double-check permissions before deleting
    if (!canDeleteCategory(selectedCategory)) {
      blogCategoryNotifications.deleteError("You don't have permission to delete this category.");
      setShowDeleteModal(false);
      setSelectedCategory(null);
      return;
    }

    setFormLoading(true);

    try {
      const response = await blogCategoryAPI.deleteCategory(
        selectedCategory._id
      );

      if (response.success) {
        blogCategoryNotifications.deleteSuccess(selectedCategory.name || "Category");
        fetchCategories(); // Refresh both the filtered list and statistics
        setShowDeleteModal(false);
        setSelectedCategory(null);
      } else {
        blogCategoryNotifications.deleteError(response.error || "Failed to delete category");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      const errorMessage = err.response?.data?.error || "Failed to delete category";
      blogCategoryNotifications.deleteError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Show rejection reason modal
  const showRejectionReason = (reason) => {
    setSelectedRejectionReason(reason);
    setShowRejectionModal(true);
  };

  // Close rejection reason modal
  const closeRejectionModal = () => {
    setShowRejectionModal(false);
    setSelectedRejectionReason("");
  };

  // Close modals
  const closeModals = () => {
    setShowDeleteModal(false);
    setSelectedCategory(null);
  };

  // Effect to fetch categories when filters change (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        fetchCategories();
      },
      searchTerm ? 300 : 0
    ); // 300ms debounce for search, immediate for filters

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, approvalFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to truncate description
  const truncateDescription = (description, maxLength = 50) => {
    if (!description) return "No description";
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  // Helper function to truncate category name
  const truncateName = (name, maxLength = 30) => {
    if (!name) return "Unnamed Category";
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  // Helper functions for approval status styling
  const getApprovalStatusClass = (approvalStatus) => {
    switch (approvalStatus?.toLowerCase()) {
      case "pending":
        return "btn-status pending";
      case "approved":
        return "btn-status active";
      case "rejected":
        return "btn-status archived";
      default:
        return "btn-status pending";
    }
  };

  const getApprovalStatusText = (approvalStatus) => {
    if (!approvalStatus) return "Pending";
    return approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1);
  };

  // Helper functions for active status styling
  const getActiveStatusClass = (isActive) => {
    return isActive ? "btn-status active" : "btn-status archived";
  };

  const getActiveStatusText = (isActive) => {
    return isActive ? "Active" : "Inactive";
  };

  // Helper function to get user role
  const getUserRole = (createdByData) => {
    if (!createdByData || !createdByData.role) return "Unknown";

    const role = createdByData.role.toLowerCase();
    switch (role) {
      case "superadmin":
        return "Super Admin";
      case "admin":
        return "Admin";
      default:
        return createdByData.role || "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner wrap-dashboard-content">
          <div className="widget-box-2 wd-listing mb-20">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-3">Loading categories...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to check if any category has available actions
  const hasAnyActions = () => {
    return categories.some((category) => canDeleteCategory(category));
  };

  // Check if we should show the Action column
  const showActionColumn = hasAnyActions();

  return (
    <div className="main-content w-100">
      <div className="main-content-inner wrap-dashboard-content">
        {/* Header */}
        <div className="widget-box-2 wd-listing mb-20">
          <div className="d-flex justify-content-between align-items-center mb-20">
            <h3 className="title">Blog Category Management</h3>
            <Link
              href="/admin/add-blog-category"
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
              Add New Category
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger mb-20">
              {error}
              <button
                className="btn btn-sm btn-outline-danger ms-2"
                onClick={() => {
                  setError(null);
                  fetchCategories();
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="row mb-20">
            <div className="col-md-4">
              <fieldset className="box-fieldset">
                <label style={{ color: "var(--text-color, #333)" }}>
                  Search Categories:
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, creator name, or role"
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
            <div className="col-md-4">
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
                    value="active"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Active
                  </option>
                  <option
                    value="inactive"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Inactive
                  </option>
                </select>
              </fieldset>
            </div>
            <div className="col-md-4">
              <fieldset className="box-fieldset">
                <label style={{ color: "var(--text-color, #333)" }}>
                  Filter by Approval:
                </label>
                <select
                  className="form-control"
                  value={approvalFilter}
                  onChange={(e) => setApprovalFilter(e.target.value)}
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
                    All Approval Status
                  </option>
                  <option
                    value="approved"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    ✅ Approved
                  </option>
                  <option
                    value="pending"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    ⏳ Pending
                  </option>
                  <option
                    value="rejected"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    ❌ Rejected
                  </option>
                </select>
              </fieldset>
            </div>
          </div>

          {/* Stats */}
          <div className="flat-counter-v2 tf-counter mb-20">
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
                    style={{ width: "28px", height: "28px", display: "block" }}
                  >
                    <path
                      d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                      stroke="#F1913D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 9H15"
                      stroke="#F1913D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 15H15"
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
                  Total Categories
                </div>
                <div className="box-count d-flex align-items-end">
                  <div
                    className="number"
                    style={{ fontSize: "32px", fontWeight: "bold" }}
                  >
                    {stats.totalCategories}
                  </div>
                </div>
              </div>
            </div>
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
                    style={{ width: "28px", height: "28px", display: "block" }}
                  >
                    <path
                      d="M9 12L11 14L15 10"
                      stroke="#22C55E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
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
                  Active
                </div>
                <div className="box-count d-flex align-items-end">
                  <div
                    className="number"
                    style={{ fontSize: "32px", fontWeight: "bold" }}
                  >
                    {stats.activeCategories}
                  </div>
                </div>
              </div>
            </div>
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
                    style={{ width: "28px", height: "28px", display: "block" }}
                  >
                    <path
                      d="M12 8V12L15 15"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="#F59E0B"
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
                  Pending
                </div>
                <div className="box-count d-flex align-items-end">
                  <div
                    className="number"
                    style={{ fontSize: "32px", fontWeight: "bold" }}
                  >
                    {stats.pendingCategories}
                  </div>
                </div>
              </div>
            </div>
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
                    style={{ width: "28px", height: "28px", display: "block" }}
                  >
                    <path
                      d="M18 6L6 18"
                      stroke="#EF4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="#EF4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="#EF4444"
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
                  Rejected
                </div>
                <div className="box-count d-flex align-items-end">
                  <div
                    className="number"
                    style={{ fontSize: "32px", fontWeight: "bold" }}
                  >
                    {stats.rejectedCategories}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="wrap-table">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Blogs</th>
                    <th>Status</th>
                    <th>Approval</th>
                    <th>Creation Date</th>
                    {user?.role === "SuperAdmin" && <th>Created By</th>}
                    {showActionColumn && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {listLoading ? (
                    <tr>
                      <td
                        colSpan={
                          6 +
                          (user?.role === "SuperAdmin" ? 1 : 0) +
                          (showActionColumn ? 1 : 0)
                        }
                        className="text-center py-4"
                      >
                        <div className="d-flex justify-content-center align-items-center">
                          <div
                            className="spinner-border spinner-border-sm text-primary me-2"
                            role="status"
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                          Loading categories...
                        </div>
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          6 +
                          (user?.role === "SuperAdmin" ? 1 : 0) +
                          (showActionColumn ? 1 : 0)
                        }
                        className="text-center py-4"
                      >
                        No categories found
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category._id}>
                        <td>
                          <div className="listing-box">
                            <div className="content">
                              <div className="title">
                                <Link
                                  href={`/admin/edit-blog-category/${category._id}`}
                                  className="link"
                                  title={category.name || "Unnamed Category"}
                                  style={{
                                    cursor:
                                      category.name && category.name.length > 30
                                        ? "help"
                                        : "pointer",
                                  }}
                                >
                                  <strong>{truncateName(category.name)}</strong>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            title={category.description || "No description"}
                            style={{
                              cursor:
                                category.description &&
                                category.description.length > 50
                                  ? "help"
                                  : "default",
                            }}
                          >
                            {truncateDescription(category.description)}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            {category.blogCount || 0}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div className="status-wrap">
                            <span
                              className={getActiveStatusClass(
                                category.isActive
                              )}
                              style={{
                                whiteSpace: "nowrap",
                                padding: "6px 12px",
                                minWidth: "fit-content",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                fontSize: "12px",
                                fontWeight: "500",
                                borderRadius: "12px",
                                lineHeight: "1",
                                height: "24px",
                              }}
                            >
                              {getActiveStatusText(category.isActive)}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div className="status-wrap">
                            <span
                              className={getApprovalStatusClass(
                                category.approvalStatus
                              )}
                              style={{
                                whiteSpace: "nowrap",
                                padding: "6px 12px",
                                minWidth: "fit-content",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                fontSize: "12px",
                                fontWeight: "500",
                                borderRadius: "12px",
                                lineHeight: "1",
                                height: "24px",
                              }}
                            >
                              {getApprovalStatusText(category.approvalStatus)}
                            </span>
                            {category.approvalStatus === "rejected" && (
                              <div
                                style={{
                                  marginLeft: "8px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                }}
                              >
                                {category.rejectionReason ? (
                                  <div
                                    style={{
                                      position: "relative",
                                      display: "inline-block",
                                    }}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        showRejectionReason(
                                          category.rejectionReason
                                        );
                                      }}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        color: "#dc3545",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        padding: "4px 6px",
                                        borderRadius: "4px",
                                        transition: "background-color 0.2s",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minWidth: "24px",
                                        minHeight: "24px",
                                        position: "relative",
                                        zIndex: 10,
                                        flexShrink: 0,
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.backgroundColor =
                                          "#f8d7da";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.backgroundColor =
                                          "transparent";
                                      }}
                                      title="Click to view rejection reason"
                                    >
                                      ℹ️
                                    </button>
                                  </div>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      color: "#dc3545",
                                      fontStyle: "italic",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    (No reason provided)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span>{formatDate(category.createdAt)}</span>
                        </td>
                        {user?.role === "SuperAdmin" && (
                          <td>
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#666",
                                fontWeight: "500",
                              }}
                            >
                              {category.createdBy?.name || "Unknown User"}
                            </span>
                            <br />
                            <small
                              style={{
                                fontSize: "11px",
                                color: "#999",
                              }}
                            >
                              {getUserRole(category.createdBy)}
                            </small>
                          </td>
                        )}
                        {showActionColumn && (
                          <td>
                            <ul className="list-action">
                              {canDeleteCategory(category) && (
                                <li>
                                  <button
                                    className="remove-file item"
                                    onClick={() =>
                                      showDeleteCategoryModal(category)
                                    }
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      color: "#dc3545",
                                    }}
                                    title="Delete category"
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
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    Delete
                                  </button>
                                </li>
                              )}
                            </ul>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Category Modal */}
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
              <h4 style={{ margin: 0, color: "#333" }}>
                Confirm Delete Category
              </h4>
            </div>
            <div className="modal-body" style={{ marginBottom: "30px" }}>
              <p style={{ margin: 0, color: "#666", lineHeight: "1.5" }}>
                Are you sure you want to delete the category{" "}
                <strong>{selectedCategory?.name}</strong>?
                <br />
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
                onClick={closeModals}
                disabled={formLoading}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  color: "#666",
                  borderRadius: "4px",
                  cursor: formLoading ? "not-allowed" : "pointer",
                  opacity: formLoading ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={formLoading}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  backgroundColor: "#dc3545",
                  color: "white",
                  borderRadius: "4px",
                  cursor: formLoading ? "not-allowed" : "pointer",
                  opacity: formLoading ? 0.6 : 1,
                }}
              >
                {formLoading ? "Deleting..." : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectionModal && (
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
          onClick={closeRejectionModal}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ marginBottom: "20px" }}>
              <h4
                style={{
                  margin: 0,
                  color: "#dc3545",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: "10px" }}>❌</span>
                Category Rejection Reason
              </h4>
            </div>
            <div className="modal-body" style={{ marginBottom: "30px" }}>
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  color: "#495057",
                  lineHeight: "1.6",
                  fontSize: "14px",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
              >
                {selectedRejectionReason}
              </div>
              <small
                style={{
                  color: "#6c757d",
                  marginTop: "10px",
                  display: "block",
                }}
              >
                Please address the above concerns and resubmit your category for
                approval.
              </small>
            </div>
            <div
              className="modal-footer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={closeRejectionModal}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  backgroundColor: "#007bff",
                  color: "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
