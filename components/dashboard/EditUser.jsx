"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { userAPI } from "@/utils/api";

export default function EditUser({ userId }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const actualUserId = userId || params?.id;
  // Always in view mode since this component is only used for user-profile route
  const isReadOnly = true;

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    role: "admin",
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!actualUserId) {
        alert("User ID not provided!");
        router.push("/admin/user-management");
        return;
      }

      try {
        setIsLoading(true);
        const response = await userAPI.getUser(actualUserId);

        if (response.success) {
          const user = response.data.user;
          setFormData({
            name: user.name || "",
            username: user.username || "",
            email: user.email || "",
            role: user.role || "admin",
            isActive: user.isActive !== undefined ? user.isActive : true,
          });
        } else {
          alert(response.error || "Failed to fetch user data");
          router.push("/admin/user-management");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        alert(error.response?.data?.error || "Failed to fetch user data");
        router.push("/admin/user-management");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [actualUserId, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStatusChange = async (e) => {
    const { checked } = e.target;

    // If in read-only mode, update status immediately via API
    if (isReadOnly) {
      try {
        const response = await userAPI.updateUserStatus(actualUserId, checked);

        if (response.success) {
          setFormData((prev) => ({
            ...prev,
            isActive: checked,
          }));
          setMessage({
            type: "success",
            text: `User ${checked ? "activated" : "deactivated"} successfully`,
          });
          // Scroll to top to show the message
          window.scrollTo({ top: 0, behavior: "smooth" });
          // Clear message after 5 seconds
          setTimeout(() => setMessage({ type: "", text: "" }), 5000);
        } else {
          // Reset the checkbox to its previous state
          setFormData((prev) => ({
            ...prev,
            isActive: !checked,
          }));

          setMessage({
            type: "error",
            text: response.error || "Failed to update user status",
          });
          // Scroll to top to show the message
          window.scrollTo({ top: 0, behavior: "smooth" });
          // Clear message after 5 seconds
          setTimeout(() => setMessage({ type: "", text: "" }), 5000);
        }
      } catch (error) {
        console.error("Error updating user status:", error);

        // Reset the checkbox to its previous state
        setFormData((prev) => ({
          ...prev,
          isActive: !checked,
        }));

        const errorMessage =
          error.response?.data?.error || "Failed to update user status";
        setMessage({
          type: "error",
          text: errorMessage,
        });
        // Scroll to top to show the message
        window.scrollTo({ top: 0, behavior: "smooth" });
        // Clear message after 5 seconds
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      }
    } else {
      // If not read-only, just update the form data
      handleInputChange(e);
    }
  };

  // No handleSubmit function needed - this component is view-only
  // Status updates are handled separately via handleStatusChange

  if (isLoading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner">
          <div className="text-center">
            <p>Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content w-100">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="main-content-inner wrap-dashboard-content">
        <div className="widget-box-2 wd-listing mb-20">
          <h3 className="title">
            {isReadOnly ? "User Profile" : "Basic Information"}
          </h3>

          {/* Success/Error Message Banner */}
          {message.text && (
            <div
              className={`alert mb-20 ${
                message.type === "success" ? "alert-success" : "alert-danger"
              }`}
              style={{
                backgroundColor:
                  message.type === "success" ? "#d4edda" : "#f8d7da",
                border: `1px solid ${
                  message.type === "success" ? "#c3e6cb" : "#f5c6cb"
                }`,
                borderRadius: "4px",
                padding: "12px 16px",
                color: message.type === "success" ? "#155724" : "#721c24",
                marginBottom: "20px",
              }}
            >
              {message.text}
              <button
                type="button"
                className="btn-close"
                onClick={() => setMessage({ type: "", text: "" })}
                style={{
                  float: "right",
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: message.type === "success" ? "#155724" : "#721c24",
                }}
              >
                ×
              </button>
            </div>
          )}

          <form className="box-info-property">
            <div className="box grid-layout-2 gap-30">
              <fieldset className="box-fieldset">
                <label htmlFor="name">
                  Full Name:<span>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  style={
                    isReadOnly
                      ? { backgroundColor: "#f8f9fa", cursor: "not-allowed" }
                      : {}
                  }
                />
              </fieldset>
              <fieldset className="box-fieldset">
                <label htmlFor="username">
                  Username:<span>*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  style={
                    isReadOnly
                      ? { backgroundColor: "#f8f9fa", cursor: "not-allowed" }
                      : {}
                  }
                />
              </fieldset>
            </div>
            <div className="box">
              <fieldset className="box-fieldset">
                <label htmlFor="email">
                  Email Address:<span>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  style={
                    isReadOnly
                      ? { backgroundColor: "#f8f9fa", cursor: "not-allowed" }
                      : {}
                  }
                />
              </fieldset>
            </div>
          </form>
        </div>

        <div className="widget-box-2 mb-20">
          <h3 className="title">Account Settings</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="box">
              <fieldset className="box-fieldset">
                <label htmlFor="role">
                  User Role:<span>*</span>
                </label>
                <select
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  style={{
                    height: "50px",
                    fontSize: "16px",
                    padding: "12px 16px",
                    ...(isReadOnly
                      ? { backgroundColor: "#f8f9fa", cursor: "not-allowed" }
                      : {}),
                  }}
                >
                  <option value="">Select Role</option>
                  <option value="SuperAdmin">Super Admin</option>
                  <option value="admin">Admin</option>
                </select>
              </fieldset>
            </div>
            <div className="box">
              <fieldset className="box-fieldset">
                <label htmlFor="isActive">Account Status:</label>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleStatusChange}
                    style={isReadOnly ? { cursor: "pointer" } : {}}
                  />
                  <label htmlFor="isActive" className="checkbox-label">
                    Active Account
                  </label>
                </div>
              </fieldset>
            </div>
          </form>
        </div>

        <div className="box-btn">
          {/* No submit button needed - this component is view-only */}
          <a
            href="/admin/user-management"
            className="tf-btn style-border pd-10"
          >
            {isReadOnly ? "Back to User Management" : "Cancel"}
          </a>
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
    </div>
  );
}
