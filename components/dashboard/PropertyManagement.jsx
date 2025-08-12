"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { propertyAPI } from "@/utlis/api";

export default function PropertyManagement() {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    pendingProperties: 0,
    soldProperties: 0,
    rentedProperties: 0,
    draftProperties: 0,
    archivedProperties: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch properties from API
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "All" && { status: statusFilter.toLowerCase() }),
        ...(typeFilter !== "All" && { propertyType: typeFilter }),
      };

      const response = await propertyAPI.getProperties(params);
      console.log(response);

      if (response.success) {
        setProperties(response.data?.properties || []);
        setTotalPages(response.data?.pagination?.pages || 1);
      } else {
        setError(response.error || "Failed to fetch properties");
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to fetch properties"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch property statistics
  const fetchStats = async () => {
    try {
      const response = await propertyAPI.getPropertyStats();
      if (response.success) {
        setStats({
          totalProperties: response.data.total || 0,
          availableProperties: response.data.available || 0,
          pendingProperties: response.data.pending || 0,
          soldProperties: response.data.sold || 0,
          rentedProperties: response.data.rented || 0,
          draftProperties: response.data.draft || 0,
          archivedProperties: response.data.archived || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      // Don't set error for stats, just log it
    }
  };

  // Handle property deletion - show modal
  const handleDeleteProperty = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  // Confirm property deletion
  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await propertyAPI.deleteProperty(propertyToDelete._id);
      if (response.success) {
        // Refresh the property list
        fetchProperties();
        fetchStats();
        // Success - no alert needed, user will see the property disappear from list
      } else {
        // Show error message without "Error:" prefix
        setError(response.error || "Failed to delete property");
      }
    } catch (err) {
      console.error("Error deleting property:", err);
      // Show error message without "Error:" prefix
      setError(err.response?.data?.error || "Failed to delete property");
    } finally {
      // Always close the modal and reset state, regardless of success/failure
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    }
  };

  // Cancel property deletion
  const cancelDeleteProperty = () => {
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  };

  // Effect to fetch data on component mount and when filters change
  useEffect(() => {
    fetchProperties();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  // Effect to fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

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
        return "btn-status active";
    }
  };

  const getStatusText = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getTypeClass = (type) => {
    switch (type?.toLowerCase()) {
      case "apartment":
        return "role-admin";
      case "villa":
        return "role-agent";
      case "house":
        return "role-user";
      case "townhouse":
        return "role-admin";
      case "penthouse":
        return "role-agent";
      case "studio":
        return "role-user";
      case "duplex":
        return "role-admin";
      case "commercial":
        return "role-agent";
      case "land":
        return "role-user";
      default:
        return "role-user";
    }
  };

  const getTypeText = (type) => {
    if (!type) return "Unknown";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatPrice = (price) => {
    if (!price) return "Price on request";
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && properties.length === 0) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner wrap-dashboard-content">
          <div className="widget-box-2 wd-listing mb-20">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-3">Loading properties...</p>
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
            <h3 className="title">Property Management</h3>
            <Link
              href="/admin/add-property"
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
              Add New Property
            </Link>
          </div>

          {error && (
            <div className="alert alert-danger mb-20">
              {error}
              <button
                className="btn btn-sm btn-outline-danger ms-2"
                onClick={() => {
                  setError(null);
                  fetchProperties();
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
                  Search Properties:
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title or location"
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
                    value="available"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Available
                  </option>
                  <option
                    value="pending"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Pending
                  </option>
                  <option
                    value="sold"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Sold
                  </option>
                  <option
                    value="rented"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Rented
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
                  Filter by Type:
                </label>
                <select
                  className="form-control"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
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
                    All Types
                  </option>
                  <option
                    value="apartment"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Apartment
                  </option>
                  <option
                    value="villa"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Villa
                  </option>
                  <option
                    value="house"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    House
                  </option>
                  <option
                    value="townhouse"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Townhouse
                  </option>
                  <option
                    value="penthouse"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Penthouse
                  </option>
                  <option
                    value="studio"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Studio
                  </option>
                  <option
                    value="duplex"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Duplex
                  </option>
                  <option
                    value="commercial"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Commercial
                  </option>
                  <option
                    value="land"
                    style={{ color: "#333", backgroundColor: "#fff" }}
                  >
                    Land
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
                      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                      stroke="#F1913D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 22V12H15V22"
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
                  Total Properties
                </div>
                <div className="box-count d-flex align-items-end">
                  <div
                    className="number"
                    style={{ fontSize: "32px", fontWeight: "bold" }}
                  >
                    {stats.totalProperties}
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
                  Available
                </div>
                <div className="box-count d-flex align-items-end">
                  <div
                    className="number"
                    style={{ fontSize: "32px", fontWeight: "bold" }}
                  >
                    {stats.availableProperties}
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
                    {stats.pendingProperties}
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
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="#3B82F6"
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
                  Sold/Rented
                </div>
                <div className="box-count d-flex align-items-end">
                  <div
                    className="number"
                    style={{ fontSize: "32px", fontWeight: "bold" }}
                  >
                    {stats.soldProperties + stats.rentedProperties}
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
                    <th>Property</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Location</th>
                    <th>Posted Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : properties.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <p className="mb-0">No properties found</p>
                      </td>
                    </tr>
                  ) : (
                    properties.map((property) => (
                      <tr key={property._id}>
                        <td>
                          <div className="listing-box">
                            <div className="images">
                              <Image
                                alt="property"
                                src={property.mainImage || property.imageSrc || "/images/home/house-db-1.jpg"}
                                width={50}
                                height={50}
                                style={{ borderRadius: "8px" }}
                              />
                            </div>
                            <div className="content">
                              <div className="title">
                                <Link
                                  href={`/admin/edit-property/${property._id}`}
                                  className="link"
                                >
                                  {property.title || "Untitled Property"}
                                </Link>
                              </div>
                              <div className="text-date">
                                {property.details?.bedrooms || property.bedrooms || 0} beds, {property.details?.bathrooms || property.bathrooms || 0} baths
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`role-badge ${getTypeClass(property.propertyType || property.listingType)}`}
                          >
                            {getTypeText(property.propertyType)}
                          </span>
                        </td>
                        <td>
                          <div className="status-wrap">
                            <span className={getStatusClass(property.status)}>
                              {getStatusText(property.status)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span>{formatPrice(property.price)}</span>
                        </td>
                        <td>
                          <span>{property.location?.address || property.location || "Location not specified"}</span>
                        </td>
                        <td>
                          <span>{formatDate(property.createdAt)}</span>
                        </td>
                        <td>
                          <ul className="list-action">
                            <li>
                              <Link
                                href={`/admin/edit-property/${property._id}`}
                                className="edit-file item"
                              >
                                <svg
                                  width={16}
                                  height={16}
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M11.3333 2.33334C11.5083 2.15834 11.7167 2.07167 11.9583 2.07167C12.2 2.07167 12.4083 2.15834 12.5833 2.33334C12.7583 2.50834 12.85 2.71667 12.85 2.95834C12.85 3.2 12.7583 3.40834 12.5833 3.58334L4.33333 11.8333H2V9.5L11.3333 2.33334Z"
                                    stroke="#A3ABB0"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                Edit
                              </Link>
                            </li>
                            <li>
                              <button
                                className="remove-file item"
                                onClick={() => handleDeleteProperty(property)}
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
              <h4 style={{ margin: 0, color: "#333" }}>Confirm Delete Property</h4>
            </div>
            <div className="modal-body" style={{ marginBottom: "30px" }}>
              <p style={{ margin: 0, color: "#666", lineHeight: "1.5" }}>
                Are you sure you want to delete the property{" "}
                <strong>{propertyToDelete?.title}</strong>?
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
                onClick={cancelDeleteProperty}
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
                onClick={confirmDeleteProperty}
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
                {deleteLoading ? "Deleting..." : "Delete Property"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 