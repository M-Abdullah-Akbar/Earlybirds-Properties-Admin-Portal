"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/utlis/api";

export default function ChangePassword() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [touchedFields, setTouchedFields] = useState({});

  // Validation functions
  const validatePassword = (value, type = "new") => {
    const passwordType =
      type === "current" ? "Current password" : "New password";

    if (!value) {
      return `${passwordType} is required`;
    } else if (!/(?=.*[A-Z])/.test(value)) {
      return `${passwordType} must contain at least one uppercase letter`;
    } else if (!/(?=.*[a-z])/.test(value)) {
      return `${passwordType} must contain at least one lowercase letter`;
    } else if (!/(?=.*[@$!%*?&])/.test(value)) {
      return `${passwordType} must contain at least one special character (@$!%*?&)`;
    } else if (!/(?=.*\d)/.test(value)) {
      return `${passwordType} must contain at least one number`;
    } else if (value.length < 8) {
      return `${passwordType} must be at least 8 characters long`;
    } else if (value.length > 128) {
      return `${passwordType} cannot exceed 128 characters`;
    } else {
      return "";
    }
  };

  const validateConfirmPassword = (confirmPassword, newPassword) => {
    if (!confirmPassword) return "Please confirm your new password";
    else if (confirmPassword !== newPassword) return "Password do not match";
    else return "";
  };

  const validateField = (name, value) => {
    switch (name) {
      case "currentPassword":
        return validatePassword(value, "current");
      case "newPassword":
        return validatePassword(value, "new");
      case "confirmPassword":
        return validateConfirmPassword(value, formData.newPassword);
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Mark field as touched
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field in real-time if it has been touched or has content
    if (touchedFields[name] || value.trim() !== "") {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }

    // Special case: if newPassword changes, re-validate confirmPassword
    if (name === "newPassword" && touchedFields.confirmPassword) {
      const confirmError = validateConfirmPassword(
        formData.confirmPassword,
        value
      );
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;

    // Mark field as touched
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate the field
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const newErrors = {};
    newErrors.currentPassword = validatePassword(
      formData.currentPassword,
      "current"
    );
    newErrors.newPassword = validatePassword(formData.newPassword, "new");
    newErrors.confirmPassword = validateConfirmPassword(
      formData.confirmPassword,
      formData.newPassword
    );

    // Remove empty errors
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) {
        delete newErrors[key];
      }
    });

    // If there are validation errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Mark all fields as touched to show errors
      setTouchedFields({
        currentPassword: true,
        newPassword: true,
        confirmPassword: true,
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        // Redirect to dashboard without alert
        router.replace("/admin/dashboard");
      } else {
        setErrors({
          submit: response.error || "Failed to change password",
        });
      }
    } catch (error) {
      // Handle specific error cases
      if (
        error.response?.status === 401 &&
        error.response?.data?.error === "Current password is incorrect"
      ) {
        // Show current password error under the field, not at the top
        setErrors({
          currentPassword: "Current password is incorrect",
        });
      } else if (error.response?.status === 400 && error.response?.data) {
        // Handle validation errors (400) - these are expected validation errors
        const responseData = error.response.data;

        // Check if we have detailed field validation errors
        if (responseData.details && Array.isArray(responseData.details)) {
          // Parse field-specific validation errors
          const fieldErrors = {};
          responseData.details.forEach((detail) => {
            if (detail.field && detail.message) {
              fieldErrors[detail.field] = detail.message;
            }
          });

          // Set field-specific errors
          setErrors(fieldErrors);
        } else {
          // Fallback to generic error message
          let errorMessage = "Please fix the validation errors below";

          if (responseData.error) {
            errorMessage = responseData.error;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (typeof responseData === "string") {
            errorMessage = responseData;
          }

          setErrors({
            submit: errorMessage,
          });
        }
      } else {
        // This is an unexpected error - log it for debugging
        console.error("Unexpected error changing password:", error);

        let errorMessage = "Failed to change password";
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = `Network error: ${error.message}`;
        }

        setErrors({
          submit: errorMessage,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
        input[type="password"] {
          background-color: #fff !important;
        }
        input[type="password"]:focus {
          background-color: #fff !important;
        }
        input[type="password"]:valid {
          background-color: #fff !important;
        }
      `}</style>
      <div className="main-content w-100">
        <div className="main-content-inner wrap-dashboard-content">
          {/* Header */}
          <div className="widget-box-2 wd-listing mb-20">
            <h3 className="title">Change Password</h3>
            <p>Update your account password securely</p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="alert alert-danger mb-20">{errors.submit}</div>
          )}

          {/* Change Password Form */}
          <div className="widget-box-2 mb-20">
            <h5 className="title">Password Information</h5>
            <form className="box-info-property" onSubmit={handleSubmit}>
              <div className="box">
                <fieldset className="box-fieldset">
                  <label htmlFor="currentPassword">
                    Current Password:<span>*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      className={`form-control ${
                        errors.currentPassword ? "error" : ""
                      }`}
                      placeholder="Enter your current password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="btn-show-pass"
                      onClick={() => togglePasswordVisibility("current")}
                      style={{
                        position: "absolute",
                        right: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#666",
                        zIndex: 10,
                        padding: "4px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={
                        showPasswords.current
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPasswords.current ? (
                        // Eye slash icon (hide password)
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M1 1l22 22"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        // Eye icon (show password)
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <span className="error-text">{errors.currentPassword}</span>
                  )}
                </fieldset>
              </div>

              <div className="box grid-layout-2 gap-30">
                <fieldset className="box-fieldset">
                  <label htmlFor="newPassword">
                    New Password:<span>*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      className={`form-control ${
                        errors.newPassword ? "error" : ""
                      }`}
                      placeholder="Enter your new password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="btn-show-pass"
                      onClick={() => togglePasswordVisibility("new")}
                      style={{
                        position: "absolute",
                        right: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#666",
                        zIndex: 10,
                        padding: "4px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={
                        showPasswords.new ? "Hide password" : "Show password"
                      }
                    >
                      {showPasswords.new ? (
                        // Eye slash icon (hide password)
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M1 1l22 22"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        // Eye icon (show password)
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <span className="error-text">{errors.newPassword}</span>
                  )}
                </fieldset>

                <fieldset className="box-fieldset">
                  <label htmlFor="confirmPassword">
                    Confirm New Password:<span>*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`form-control ${
                        errors.confirmPassword ? "error" : ""
                      }`}
                      placeholder="Confirm your new password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="btn-show-pass"
                      onClick={() => togglePasswordVisibility("confirm")}
                      style={{
                        position: "absolute",
                        right: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#666",
                        zIndex: 10,
                        padding: "4px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={
                        showPasswords.confirm
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPasswords.confirm ? (
                        // Eye slash icon (hide password)
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M1 1l22 22"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        // Eye icon (show password)
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-text">{errors.confirmPassword}</span>
                  )}
                </fieldset>
              </div>
            </form>
          </div>

          {/* Submit Buttons - Outside the form in grey background */}
          <div className="box-btn">
            <button
              type="submit"
              className="tf-btn bg-color-primary pd-13"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Changing Password..." : "Change Password"}
            </button>
            <a href="/admin/dashboard" className="tf-btn style-border pd-10">
              Cancel
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
    </>
  );
}
