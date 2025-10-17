"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { blogAPI, blogCategoryAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { blogNotifications } from "@/utils/notifications";

export default function BlogManagement() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch blogs from API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "All" && { status: statusFilter.toLowerCase() }),
        ...(categoryFilter !== "All" && { category: categoryFilter }),
      };

      const response = await blogAPI.getBlogs(params);

      if (response.success) {
        setBlogs(response.data?.blogs || []);
        setTotalPages(response.data?.pagination?.totalPages || 1);
      } else {
        blogNotifications.fetchError(response.error || "Failed to fetch blogs");
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to fetch blogs";
      blogNotifications.fetchError(errorMessage);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Fetch blog statistics
  const fetchStats = async () => {
    try {
      const response = await blogAPI.getBlogStats();
      if (response.success) {
        setStats({
          total: response.data.total || 0,
          published: response.data.published || 0,
          draft: response.data.draft || 0,
          archived: response.data.archived || 0,
        });
      } else {
        blogNotifications.fetchError("Failed to load blog statistics");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      blogNotifications.fetchError("Failed to load blog statistics");
    }
  };

  // Fetch categories - only active and approved categories
  const fetchCategories = async () => {
    try {
      const params = {
        isActive: true,
        approvalStatus: "approved",
      };
      const response = await blogCategoryAPI.getCategories(params);
      if (response.success) {
        setCategories(response.data?.categories || []);
      } else {
        blogNotifications.fetchError("Failed to load blog categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      blogNotifications.fetchError("Failed to load blog categories");
    }
  };

  // Handle blog deletion - show modal
  const handleDeleteBlog = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  // Confirm blog deletion
  const confirmDeleteBlog = async () => {
    if (!blogToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await blogAPI.deleteBlog(blogToDelete._id);
      if (response.success) {
        blogNotifications.deleteSuccess(blogToDelete.title || "Blog");
        fetchBlogs();
        fetchStats();
      } else {
        blogNotifications.deleteError(response.error || "Failed to delete blog");
      }
    } catch (err) {
      console.error("Error deleting blog:", err);
      const errorMessage = err.response?.data?.error || "Failed to delete blog";
      blogNotifications.deleteError(errorMessage);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setBlogToDelete(null);
    }
  };

  // Cancel blog deletion
  const cancelDeleteBlog = () => {
    setShowDeleteModal(false);
    setBlogToDelete(null);
  };

  // Effect to fetch data on component mount and when filters change
  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchTerm, statusFilter, categoryFilter]);

  // Effect to fetch stats and categories on component mount
  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "status-item active";
      case "draft":
        return "status-item pending";
      case "archived":
        return "status-item sold";
      default:
        return "status-item pending";
    }
  };

  const getStatusText = (status) => {
    if (!status) return "Draft";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return "No content";
    const textContent = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + "...";
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
              <p className="mt-20">Loading Blogs...</p>
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
            <h3 className="title">Blog Management</h3>
            <Link
              href="/admin/add-blog"
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
              Add New Blog
            </Link>
          </div>

          {error && (
            <div className="alert alert-danger mb-20">
              {error}
              <button
                className="btn btn-sm btn-outline-danger ms-2"
                onClick={() => {
                  setError(null);
                  fetchBlogs();
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
                  Search Blogs:
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title, content, or author"
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
                    value="published"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Published
                  </option>
                  <option
                    value="draft"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Draft
                  </option>
                  <option
                    value="archived"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Archived
                  </option>
                </select>
              </fieldset>
            </div>
            <div className="col-md-4">
              <fieldset className="box-fieldset">
                <label style={{ color: "var(--text-color, #333)" }}>
                  Filter by Category:
                </label>
                <select
                  className="form-control"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
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
                    All Categories
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                      style={{ color: "#333", backgroundColor: "#fff" }}
                    >
                      {category.name}
                    </option>
                  ))}
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
                      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="#F1913D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2V8H20"
                      stroke="#F1913D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 13H8"
                      stroke="#F1913D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 17H8"
                      stroke="#F1913D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 9H9H8"
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
                  Total Blogs
                </div>
                <div className="box-count d-flex align-items-end">
                  <div
                    className="number"
                    style={{ fontSize: "32px", fontWeight: "bold" }}
                  >
                    {stats.total}
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
                  Published
                </div>
                <div className="box-count d-flex align-items-end">
                  <div
                    className="number"
                    style={{ fontSize: "32px", fontWeight: "bold" }}
                  >
                    {stats.published}
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
                      d="M17 3C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17Z"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 9H15"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 13H15"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 17H13"
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
                  Draft
                </div>
                <div className="box-count d-flex align-items-end">
                  <div
                    className="number"
                    style={{ fontSize: "32px", fontWeight: "bold" }}
                  >
                    {stats.draft}
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
                      d="M21 8V16C21 16.5304 20.7893 17.0391 20.4142 17.4142C20.0391 17.7893 19.5304 18 19 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V8"
                      stroke="#6B7280"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 8L12 13L3 8"
                      stroke="#6B7280"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 8L12 3L21 8"
                      stroke="#6B7280"
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
                  Archived
                </div>
                <div className="box-count d-flex align-items-end">
                  <div
                    className="number"
                    style={{ fontSize: "32px", fontWeight: "bold" }}
                  >
                    {stats.archived}
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
                    <th>Blog</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Author</th>
                    <th>Created Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div
                          className="spinner-border"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : blogs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <p className="mb-0">No blogs found</p>
                      </td>
                    </tr>
                  ) : (
                    blogs.map((blog) => (
                      <tr key={blog._id}>
                        <td>
                          <div className="listing-box">
                            <div className="images">
                              <Image
                                alt="blog"
                                src={
                                  blog.featuredImage ||
                                  blog.images?.[0]?.url ||
                                  "/images/blog/blog-default.jpg"
                                }
                                width={50}
                                height={50}
                                style={{ borderRadius: "8px" }}
                              />
                            </div>
                            <div className="content">
                              <div className="title">
                                <Link
                                  href={`/admin/edit-blog/${blog._id}`}
                                  className="link"
                                >
                                  {blog.title || "Untitled Blog"}
                                </Link>
                              </div>
                              {/*<div className="text-date">
                                {truncateContent(blog.content, 60)}
                              </div>*/}
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span
                            className="role-badge role-user"
                            style={{
                              whiteSpace: "nowrap",
                              padding: "6px 12px",
                              minWidth: "fit-content",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {blog.category?.name || "Uncategorized"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={getStatusClass(blog.status)}>
                            {getStatusText(blog.status)}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="text-variant-1">
                            {blog.author?.name ||
                              blog.createdBy?.name ||
                              "Unknown"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="text-variant-1">
                            {formatDate(blog.createdAt)}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <ul className="list-action">
                            <li>
                              <Link
                                href={`/admin/edit-blog/${blog._id}`}
                                className="item-action-2"
                                title="Edit Blog"
                              >
                                <i className="icon-edit-3" />
                              </Link>
                            </li>
                            <li>
                              <button
                                className="remove-file item"
                                onClick={() => handleDeleteBlog(blog)}
                                title="Delete Blog"
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
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                Delete
                              </button>
                            </li>
                          </ul>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
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
      </div>

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
              <h4 style={{ margin: 0, color: "#333" }}>
                Confirm Delete Blog
              </h4>
            </div>
            <div className="modal-body" style={{ marginBottom: "30px" }}>
              <p style={{ margin: 0, color: "#666", lineHeight: "1.5" }}>
                Are you sure you want to delete the blog{" "}
                <strong>{blogToDelete?.title}</strong>?
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
                onClick={cancelDeleteBlog}
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
                onClick={confirmDeleteBlog}
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
                {deleteLoading ? "Deleting..." : "Delete Blog"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
