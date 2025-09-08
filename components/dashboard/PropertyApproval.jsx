"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { propertyAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PropertyApproval() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionError, setRejectionError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [stats, setStats] = useState({
    pending: 0,
  });

  useEffect(() => {
    // Only SuperAdmin can access this page
    if (user && user.role !== "SuperAdmin") {
      router.push("/admin/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "SuperAdmin") {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner wrap-dashboard-content">
          <div className="widget-box-2 wd-listing mb-20">
            <div className="text-center py-5">
              <p>Access denied. SuperAdmin privileges required.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch pending properties
  const fetchPendingProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await propertyAPI.getPendingProperties({
        page: currentPage,
        limit: limit,
      });

      if (response.success) {
        setPendingProperties(response.data?.properties || []);
        setTotalPages(response.data?.pagination?.totalPages || 1);
      } else {
        setError(response.error || "Failed to fetch pending properties");
      }
    } catch (err) {
      console.error("Error fetching pending properties:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to fetch pending properties"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending count from existing stats API
  const fetchPendingCount = async () => {
    try {
      const response = await propertyAPI.getApprovalStats();
      if (response.success) {
        setStats({
          pending: response.data.stats?.pending || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching pending count:", err);
    }
  };

  useEffect(() => {
    fetchPendingProperties();
    fetchPendingCount();
  }, [currentPage]);

  // Real-time validation function for rejection reason
  const validateField = (name, value) => {
    if (name === "rejectionReason") {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        return "Rejection reason is required";
      } else if (trimmedValue.length < 10) {
        return "Rejection reason must be at least 10 characters long";
      } else if (trimmedValue.length > 500) {
        return "Rejection reason cannot exceed 500 characters";
      }
      return "";
    }
    return "";
  };

  // Handle input change with real-time validation
  const handleRejectionReasonChange = (e) => {
    const { name, value } = e.target;
    setRejectionReason(value);

    // Mark field as touched
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Clear general errors when user starts typing
    if (rejectionError) {
      setRejectionError("");
    }

    // Validate field in real-time if it has been touched or has content
    if (touchedFields[name] || value.trim() !== "") {
      const error = validateField(name, value);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Handle field blur
  const handleRejectionReasonBlur = (e) => {
    const { name, value } = e.target;

    // Mark field as touched on blur
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field on blur
    const error = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // Handle property approval
  const handleApproveProperty = (property) => {
    setSelectedProperty(property);
    setShowApprovalModal(true);
  };

  // Handle property rejection
  const handleRejectProperty = (property) => {
    setSelectedProperty(property);
    setRejectionReason("");
    setRejectionError("");
    setFieldErrors({});
    setTouchedFields({});
    setShowRejectionModal(true);
  };

  // Confirm property approval
  const confirmApproval = async () => {
    if (!selectedProperty) return;

    setActionLoading(true);
    try {
      const response = await propertyAPI.approveProperty(selectedProperty._id);
      if (response.success) {
        // Refresh the lists
        fetchPendingProperties();
        fetchPendingCount();
        setShowApprovalModal(false);
        setSelectedProperty(null);
        toast.success("Property approved successfully!");
        // Redirect to property-approval page
        setTimeout(() => {
          router.push("/admin/property-approval");
        }, 1000);
      } else {
        toast.error(response.error || "Failed to approve property");
      }
    } catch (error) {
      console.error("Error approving property:", error);
      toast.error("Failed to approve property. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm property rejection
  const confirmRejection = async () => {
    // Clear previous errors
    setRejectionError("");

    // Validate the rejection reason before submitting
    const rejectionReasonError = validateField(
      "rejectionReason",
      rejectionReason
    );

    if (rejectionReasonError) {
      // Mark field as touched and show error
      setTouchedFields((prev) => ({ ...prev, rejectionReason: true }));
      setFieldErrors((prev) => ({
        ...prev,
        rejectionReason: rejectionReasonError,
      }));
      return;
    }

    setActionLoading(true);
    try {
      const response = await propertyAPI.rejectProperty(selectedProperty._id, {
        rejectionReason: rejectionReason.trim(),
      });
      if (response.success) {
        // Refresh the lists
        fetchPendingProperties();
        fetchPendingCount();
        setShowRejectionModal(false);
        setSelectedProperty(null);
        setRejectionReason("");
        setRejectionError("");
        setFieldErrors({});
        setTouchedFields({});
        toast.success("Property rejected successfully!");
        // Redirect to property-approval page
        setTimeout(() => {
          router.push("/admin/property-approval");
        }, 1000);
      } else {
        // Handle server-side validation errors
        if (response.fieldErrors && typeof response.fieldErrors === "object") {
          setFieldErrors(response.fieldErrors);
        } else if (response.errors && typeof response.errors === "object") {
          setFieldErrors(response.errors);
        } else {
          const errorMessage = response.error || "Failed to reject property";
          setRejectionError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      // Handle validation errors (400) from backend
      if (error.response?.status === 400 && error.response?.data) {
        const errorData = error.response.data;

        // Handle field-specific validation errors in various formats
        if (
          errorData.fieldErrors &&
          typeof errorData.fieldErrors === "object"
        ) {
          setFieldErrors(errorData.fieldErrors);
        } else if (errorData.errors && typeof errorData.errors === "object") {
          setFieldErrors(errorData.errors);
        } else if (errorData.details && Array.isArray(errorData.details)) {
          // Convert backend validation format to fieldErrors format
          const fieldErrors = {};
          errorData.details.forEach((detail) => {
            if (detail.field && detail.message) {
              fieldErrors[detail.field] = detail.message;
            }
          });
          if (Object.keys(fieldErrors).length > 0) {
            setFieldErrors(fieldErrors);
          } else {
            const errorMessage = errorData.error ||
                errorData.message ||
                "Please fix the validation errors";
            setRejectionError(errorMessage);
            toast.error(errorMessage);
          }
        } else {
          setRejectionError(
            errorData.error ||
              errorData.message ||
              "Please fix the validation errors"
          );
        }
      } else {
          console.error("Error rejecting property:", error);
          const errorMessage = "Failed to reject property. Please try again.";
          setRejectionError(errorMessage);
          toast.error(errorMessage);
        }
    } finally {
      setActionLoading(false);
    }
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

  const getTypeText = (type) => {
    if (!type) return "Unknown";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading && pendingProperties.length === 0) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner wrap-dashboard-content">
          <div className="widget-box-2 wd-listing mb-20">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-3">Loading pending properties...</p>
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
            <h3 className="title">Property Approval Management</h3>
          </div>

          {error && (
            <div className="alert alert-danger mb-20" role="alert">
              {error}
            </div>
          )}

          {/* Current Workload */}
          {stats.pending > 0 && (
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
                    ⏳
                  </span>
                </div>
                <div className="content-box">
                  <div
                    className="title-count text-variant-1"
                    style={{ fontSize: "16px" }}
                  >
                    Properties Awaiting Your Review
                  </div>
                  <div className="box-count d-flex align-items-end">
                    <div
                      className="number"
                      style={{ fontSize: "32px", fontWeight: "bold" }}
                    >
                      {stats.pending}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="wrap-table">
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Location</th>
                    <th>Created By</th>
                    <th>Submitted Date</th>
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
                  ) : pendingProperties.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <p className="mb-0">No pending properties found</p>
                      </td>
                    </tr>
                  ) : (
                    pendingProperties.map((property) => (
                      <tr key={property._id}>
                        <td>
                          <div className="listing-box">
                            <div className="images">
                              <Image
                                alt="property"
                                src={
                                  property.images?.[0]?.url ||
                                  property.mainImage ||
                                  "/images/home/house-db-1.jpg"
                                }
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
                                {property.details?.bedrooms || 0} beds,{" "}
                                {property.details?.bathrooms || 0} baths
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="role-badge role-admin">
                            {getTypeText(property.propertyType)}
                          </span>
                        </td>
                        <td>
                          <span>{formatPrice(property.price)}</span>
                        </td>
                        <td>
                          <span>
                            {property.location?.address ||
                              "Location not specified"}
                          </span>
                        </td>
                        <td>
                          <span>
                            {property.createdBy?.name || "Unknown"}
                            <br />
                            <small style={{ color: "#666" }}>
                              {property.createdBy?.email || ""}
                            </small>
                          </span>
                        </td>
                        <td>
                          <span>{formatDate(property.createdAt)}</span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="tf-btn bg-color-primary pd-5"
                              onClick={() => handleApproveProperty(property)}
                              style={{
                                fontSize: "12px",
                                padding: "5px 10px",
                                marginRight: "5px",
                              }}
                            >
                              ✅ Approve
                            </button>
                            <button
                              className="tf-btn style-border pd-5"
                              onClick={() => handleRejectProperty(property)}
                              style={{
                                fontSize: "12px",
                                padding: "5px 10px",
                                borderColor: "#dc3545",
                                color: "#dc3545",
                              }}
                            >
                              ❌ Reject
                            </button>
                          </div>
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

        {/* Footer */}
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
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
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
              <h4 style={{ margin: 0, color: "#333" }}>Approve Property</h4>
            </div>
            <div className="modal-body" style={{ marginBottom: "30px" }}>
              <p style={{ margin: 0, color: "#666", lineHeight: "1.5" }}>
                Are you sure you want to approve the property{" "}
                <strong>"{selectedProperty?.title}"</strong>?
              </p>
              <p
                style={{
                  margin: "10px 0 0 0",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                Once approved, this property will be visible to visitors.
              </p>
            </div>
            <div className="modal-footer" style={{ textAlign: "right" }}>
              <button
                className="tf-btn style-border pd-10"
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedProperty(null);
                }}
                disabled={actionLoading}
                style={{ marginRight: "10px" }}
              >
                Cancel
              </button>
              <button
                className="tf-btn bg-color-primary pd-10"
                onClick={confirmApproval}
                disabled={actionLoading}
              >
                {actionLoading ? "Approving..." : "✅ Approve Property"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
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
              <h4 style={{ margin: 0, color: "#333" }}>Reject Property</h4>
            </div>
            <div className="modal-body" style={{ marginBottom: "30px" }}>
              <p
                style={{
                  margin: "0 0 15px 0",
                  color: "#666",
                  lineHeight: "1.5",
                }}
              >
                Please provide a reason for rejecting the property{" "}
                <strong>"{selectedProperty?.title}"</strong>:
              </p>
              <textarea
                className="form-control"
                name="rejectionReason"
                rows="4"
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={handleRejectionReasonChange}
                onBlur={handleRejectionReasonBlur}
                style={{
                  width: "100%",
                  padding: "10px",
                  border:
                    (rejectionError &&
                      !(
                        fieldErrors.rejectionReason &&
                        touchedFields.rejectionReason
                      )) ||
                    (fieldErrors.rejectionReason &&
                      touchedFields.rejectionReason)
                      ? "1px solid #dc3545"
                      : "1px solid #ddd",
                  borderRadius: "4px",
                  resize: "vertical",
                }}
              />
              {/* Character counter */}
              <div
                style={{
                  fontSize: "12px",
                  color: rejectionReason.length > 500 ? "#dc3545" : "#666",
                  textAlign: "right",
                  marginTop: "4px",
                }}
              >
                {rejectionReason.length}/500 characters
              </div>
              {/* Field-specific error (priority over general error) - only show if touched */}
              {fieldErrors.rejectionReason && touchedFields.rejectionReason && (
                <div
                  style={{
                    color: "#dc3545",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {fieldErrors.rejectionReason}
                </div>
              )}
              {/* General error (only show if no field-specific error) */}
              {rejectionError &&
                !(
                  fieldErrors.rejectionReason && touchedFields.rejectionReason
                ) && (
                  <div
                    style={{
                      color: "#dc3545",
                      fontSize: "14px",
                      marginTop: "4px",
                    }}
                  >
                    {rejectionError}
                  </div>
                )}
            </div>
            <div className="modal-footer" style={{ textAlign: "right" }}>
              <button
                className="tf-btn style-border pd-10"
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedProperty(null);
                  setRejectionReason("");
                  setRejectionError("");
                  setFieldErrors({});
                  setTouchedFields({});
                }}
                disabled={actionLoading}
                style={{ marginRight: "10px" }}
              >
                Cancel
              </button>
              <button
                className="tf-btn pd-10"
                onClick={confirmRejection}
                disabled={actionLoading}
                style={{
                  backgroundColor: actionLoading ? "#6c757d" : "#dc3545",
                  color: "white",
                  border: `1px solid ${actionLoading ? "#6c757d" : "#dc3545"}`,
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                {actionLoading ? "Rejecting..." : "❌ Reject Property"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
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
