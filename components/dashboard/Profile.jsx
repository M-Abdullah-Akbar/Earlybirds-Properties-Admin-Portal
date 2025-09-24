"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/utils/api";

export default function Profile() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [infoMessage, setInfoMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Refs for timeout cleanup
  const infoTimeoutRef = useRef(null);
  const successTimeoutRef = useRef(null);

  // Helper function to handle different error response formats
  const handleValidationErrors = (errorData) => {
    // Case 1: Backend validation details array format
    if (errorData.details && Array.isArray(errorData.details)) {
      const fieldErrors = {};
      errorData.details.forEach((detail) => {
        if (detail.field && detail.message) {
          fieldErrors[detail.field] = detail.message;
        }
      });
      setErrors(fieldErrors);
      
      // Use enhanced validation notifications to show backend errors
      validationNotifications.backendErrors(errorData, "Please fix the validation errors and try again.");
      return true;
    }

    // Case 2: Structured errors object (field: message)
    if (errorData.errors && typeof errorData.errors === "object") {
      setErrors(errorData.errors);
      return true;
    }

    // Case 3: Single error message
    if (errorData.error && typeof errorData.error === "string") {
      const errorMessage = errorData.error;

      // Try to map error message to specific fields
      if (errorMessage.toLowerCase().includes("name")) {
        setErrors({ name: errorMessage });
      } else if (errorMessage.toLowerCase().includes("username")) {
        setErrors({ username: errorMessage });
      } else if (errorMessage.toLowerCase().includes("email")) {
        setErrors({ email: errorMessage });
      } else if (
        errorMessage.toLowerCase().includes("required") ||
        errorMessage.toLowerCase().includes("validation") ||
        errorMessage.toLowerCase().includes("invalid") ||
        errorMessage.toLowerCase().includes("empty") ||
        errorMessage.toLowerCase().includes("missing") ||
        errorMessage.toLowerCase().includes("cannot be empty") ||
        errorMessage.toLowerCase().includes("is required")
      ) {
        // Show as general error if we can't determine the field
        setErrors({ general: errorMessage });
      } else {
        // Not a validation error
        return false;
      }
      return true;
    }

    // Case 4: Message field
    if (errorData.message && typeof errorData.message === "string") {
      const errorMessage = errorData.message;

      if (
        errorMessage.toLowerCase().includes("required") ||
        errorMessage.toLowerCase().includes("validation") ||
        errorMessage.toLowerCase().includes("invalid") ||
        errorMessage.toLowerCase().includes("empty") ||
        errorMessage.toLowerCase().includes("missing")
      ) {
        setErrors({ general: errorMessage });
        return true;
      }
    }

    return false; // Not a validation error
  };

  // Real-time validation functions
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) {
          return "FullName is required";
        } else if (value.trim().length < 5) {
          return "FullName must be at least 5 characters";
        } else if (value.trim().length > 100) {
          return "FullName cannot exceed 100 characters";
        } else if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          return "FullName can only contain letters, spaces, hyphens, and apostrophes";
        } else if (!/[a-zA-Z]/.test(value.trim())) {
          return "FullName must contain at least some letters";
        } else if (
          value.includes("  ") ||
          value.startsWith(" ") ||
          value.endsWith(" ")
        ) {
          return "FullName cannot have leading, trailing, or multiple consecutive spaces";
        }
        return "";
      case "username":
        if (!value.trim()) {
          return "Username is required";
        } else if (value.trim().length < 3) {
          return "Username must be at least 3 characters";
        } else if (value.trim().length > 50) {
          return "Username cannot exceed 50 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) {
          return "Username can only contain letters, numbers, and underscores";
        }
        return "";
      case "email":
        if (!value.trim()) {
          return "Email is required";
        } else {
          const email = value.trim().toLowerCase();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return "Must be a valid email address";
          } else if (email.length > 254) {
            return "Email address cannot exceed 254 characters";
          } else if (
            email.includes("..") ||
            email.startsWith(".") ||
            email.endsWith(".")
          ) {
            return "Email address format is invalid";
          }
        }
        return "";
      default:
        return "";
    }
  };

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      if (infoTimeoutRef.current) {
        clearTimeout(infoTimeoutRef.current);
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear info message when user starts making changes
    if (infoMessage) {
      setInfoMessage("");
      if (infoTimeoutRef.current) {
        clearTimeout(infoTimeoutRef.current);
      }
    }

    // Clear success message when user starts making changes
    if (successMessage) {
      setSuccessMessage("");
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    }

    // Mark field as touched
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field in real-time if it has been touched
    if (touchedFields[name] || value.trim() !== "") {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;

    // Mark field as touched on blur
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field on blur
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    // Run frontend validation for all fields before submitting
    const frontendErrors = {};
    Object.keys(formData).forEach((fieldName) => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        frontendErrors[fieldName] = error;
      }
    });

    // If there are frontend validation errors, show them and don't submit
    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors);
      setSaving(false);
      return;
    }

    // Check if any changes were made
    const hasChanges =
      formData.name !== (user?.name || "") ||
      formData.username !== (user?.username || "") ||
      formData.email !== (user?.email || "");

    if (!hasChanges) {
      // No changes made, show info message
      setInfoMessage("No changes were made to your profile.");
      setErrors({});
      setSaving(false);
      // Scroll to top to show the message
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Auto-dismiss info message after 5 seconds
      if (infoTimeoutRef.current) {
        clearTimeout(infoTimeoutRef.current);
      }
      infoTimeoutRef.current = setTimeout(() => {
        setInfoMessage("");
      }, 5000);

      return;
    }

    setErrors({}); // Clear previous errors
    setInfoMessage(""); // Clear previous info messages
    setSuccessMessage(""); // Clear previous success messages

    try {
      const userData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
      };

      // Call the actual API to update user profile
      const response = await userAPI.updateUser(user.id || user._id, userData);

      // Debug: Log the response structure to understand the format
      console.log("Profile update response:", response);

      if (response.success) {
        // Update user context with the complete user data from backend response
        // Based on actual API response, the structure is response.data.user
        const updatedUserData = response.data?.user;

        console.log("Updated user data from API:", updatedUserData);

        // Update user context if we have the data
        if (updateUser && updatedUserData) {
          console.log("Updating user context with:", updatedUserData);
          updateUser(updatedUserData);
        } else {
          console.warn(
            "No updated user data found in response or updateUser not available"
          );
          console.log("Response structure:", response);
        }

        // Also update the form data to reflect the changes immediately
        if (updatedUserData) {
          const newFormData = {
            name: updatedUserData.name || formData.name,
            username: updatedUserData.username || formData.username,
            email: updatedUserData.email || formData.email,
          };
          console.log("Updating form data to:", newFormData);
          setFormData(newFormData);
        } else {
          console.warn("No updated user data to update form with");
        }

        setInfoMessage(""); // Clear any info messages
        setSuccessMessage("Profile updated successfully!");
        // Scroll to top to show the success message
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Auto-dismiss success message after 5 seconds
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }
        successTimeoutRef.current = setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      } else {
        // Handle server-side validation errors
        setSuccessMessage(""); // Clear any success messages
        if (!handleValidationErrors(response)) {
          throw new Error(response.error || "Failed to update profile");
        }
      }
    } catch (error) {
      // Clear success message on error
      setSuccessMessage("");

      // Log only non-validation errors to reduce console noise
      if (
        !error.response?.data ||
        !handleValidationErrors(error.response.data)
      ) {
        console.error("Error updating profile:", error);
      }

      // Handle server validation errors from error response
      if (
        error.response?.data &&
        !handleValidationErrors(error.response.data)
      ) {
        // Not a validation error, show alert
        alert("Failed to update profile. Please try again.");
      } else if (!error.response?.data) {
        // No response data, show alert
        alert("Failed to update profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
      });
    }
    setErrors({});
    setTouchedFields({});
    setInfoMessage("");
    setSuccessMessage("");

    // Clear any active timeouts
    if (infoTimeoutRef.current) {
      clearTimeout(infoTimeoutRef.current);
    }
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }

    // Redirect to dashboard
    router.push("/dashboard");
  };

  const getRoleDisplayName = (role) => {
    switch (role?.toLowerCase()) {
      case "superadmin":
        return "Super Admin";
      case "admin":
        return "Admin";
      default:
        return "User";
    }
  };

  if (isLoading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner wrap-dashboard-content">
          <div className="widget-box-2 wd-listing">
            <div className="text-center py-50">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-20">Loading User Data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .form-control {
          background-color: #fff !important;
        }
        .form-control:focus {
          background-color: #fff !important;
        }
        .form-control:active {
          background-color: #fff !important;
        }
        .form-control:visited {
          background-color: #fff !important;
        }
        .form-control:valid {
          background-color: #fff !important;
        }
        .form-control:invalid {
          background-color: #fff !important;
        }
        .form-control:-webkit-autofill {
          background-color: #fff !important;
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
        }
        input[type="text"],
        input[type="email"],
        input[type="password"] {
          background-color: #fff !important;
        }
        input[type="text"]:focus,
        input[type="email"]:focus,
        input[type="password"]:focus {
          background-color: #fff !important;
        }
        input[type="text"]:valid,
        input[type="email"]:valid,
        input[type="password"]:valid {
          background-color: #fff !important;
        }
        input[type="text"]:-webkit-autofill,
        input[type="email"]:-webkit-autofill,
        input[type="password"]:-webkit-autofill {
          background-color: #fff !important;
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
        }
      `}</style>
      <div className="main-content w-100">
        <div className="main-content-inner wrap-dashboard-content">
          <div className="widget-box-2 wd-listing mb-20">
            <h3 className="title">Basic Information</h3>
            {errors.general && (
              <div className="alert alert-danger mb-20">{errors.general}</div>
            )}
            {infoMessage && (
              <div className="alert alert-info mb-20">{infoMessage}</div>
            )}
            {successMessage && (
              <div className="alert alert-success mb-20">{successMessage}</div>
            )}
            <form className="box-info-property" onSubmit={handleSubmit}>
              <div className="box grid-layout-2 gap-30">
                <fieldset className="box-fieldset">
                  <label htmlFor="name">
                    Full Name:<span>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? "error" : ""}`}
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                  />
                  {errors.name && (
                    <span className="error-text">{errors.name}</span>
                  )}
                </fieldset>
                <fieldset className="box-fieldset">
                  <label htmlFor="username">
                    Username:<span>*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    className={`form-control ${errors.username ? "error" : ""}`}
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                  />
                  {errors.username && (
                    <span className="error-text">{errors.username}</span>
                  )}
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
                    className={`form-control ${errors.email ? "error" : ""}`}
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                  />
                  {errors.email && (
                    <span className="error-text">{errors.email}</span>
                  )}
                </fieldset>
              </div>
            </form>
          </div>

          <div className="widget-box-2 mb-20">
            <h3 className="title">Account Information</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="box">
                <fieldset className="box-fieldset">
                  <label htmlFor="role">User Role:</label>
                  <input
                    type="text"
                    name="role"
                    className="form-control"
                    value={getRoleDisplayName(user?.role)}
                    readOnly
                    disabled
                    style={{
                      backgroundColor: "#f8f9fa",
                      color: "#6c757d",
                      cursor: "not-allowed",
                      height: "50px",
                      fontSize: "16px",
                      padding: "12px 16px",
                    }}
                  />
                </fieldset>
              </div>
              <div className="box">
                <fieldset className="box-fieldset">
                  <label htmlFor="isActive">Account Status:</label>
                  <input
                    type="text"
                    name="isActive"
                    className="form-control"
                    value={user?.isActive ? "Active" : "Inactive"}
                    readOnly
                    disabled
                    style={{
                      backgroundColor: "#f8f9fa",
                      color: user?.isActive ? "#28a745" : "#dc3545",
                      cursor: "not-allowed",
                      height: "50px",
                      fontSize: "16px",
                      padding: "12px 16px",
                      fontWeight: "600",
                    }}
                  />
                  {user?.role !== "SuperAdmin" && (
                    <small className="text-muted">
                      Status changes are managed by SuperAdmin
                    </small>
                  )}
                </fieldset>
              </div>
            </form>
          </div>

          <div className="box-btn">
            <button
              type="submit"
              className="tf-btn bg-color-primary pd-13"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Updating User..." : "Update User"}
            </button>
            <button
              type="button"
              className="tf-btn style-border pd-10"
              onClick={handleCancel}
            >
              Cancel
            </button>
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
    </>
  );
}
