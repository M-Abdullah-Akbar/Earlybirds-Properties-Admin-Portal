"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { userAPI } from "@/utils/api";

export default function AddUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});

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

      case "password":
        if (!value) {
          return "Password is required";
        } else if (!/(?=.*[A-Z])/.test(value)) {
          return "Password must contain at least one uppercase letter";
        } else if (!/(?=.*[a-z])/.test(value)) {
          return "Password must contain at least one lowercase letter";
        } else if (!/(?=.*[@$!%*?&])/.test(value)) {
          return "Password must contain at least one special character (@$!%*?&)";
        } else if (!/(?=.*\d)/.test(value)) {
          return "Password must contain at least one number";
        } else if (value.length < 8) {
          return "Password must be at least 8 characters long";
        } else if (value.length > 128) {
          return "Password cannot exceed 128 characters";
        }
        return "";

      case "confirmPassword":
        if (!value) {
          return "Please confirm your password";
        } else if (value !== formData.password) {
          return "Password do not match";
        }
        return "";

      case "role":
        if (value && value.trim() === "") {
          return "Role cannot be empty";
        } else if (
          value &&
          value.trim() !== "admin" &&
          value.trim() !== "SuperAdmin"
        ) {
          return "Role must be either admin or SuperAdmin";
        }
        return "";

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

    // Validate field in real-time if it has been touched
    if (touchedFields[name] || value.trim() !== "") {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }

    // Special case: if password changes, revalidate confirmPassword
    if (name === "password" && touchedFields.confirmPassword) {
      const confirmPasswordError = validateField(
        "confirmPassword",
        formData.confirmPassword
      );
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmPasswordError,
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

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
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      };

      const response = await userAPI.createUser(userData);

      if (response.success) {
        // Redirect immediately without showing alert
        router.push("/admin/user-management");
      } else {
        // Handle server-side validation errors - merge with existing errors
        if (response.errors && typeof response.errors === "object") {
          setErrors((prevErrors) => ({ ...prevErrors, ...response.errors }));
        } else if (response.details && Array.isArray(response.details)) {
          // Handle detailed validation errors
          const fieldErrors = {};
          response.details.forEach((detail) => {
            fieldErrors[detail.field] = detail.message;
          });
          setErrors((prevErrors) => ({ ...prevErrors, ...fieldErrors }));
        } else {
          alert(response.error || "Failed to create user");
        }
      }
    } catch (error) {
      console.error("Error creating user:", error);

      // Handle server validation errors from error response - merge with existing errors
      if (
        error.response?.data?.errors &&
        typeof error.response.data.errors === "object"
      ) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          ...error.response.data.errors,
        }));
      } else if (
        error.response?.data?.details &&
        Array.isArray(error.response.data.details)
      ) {
        // Handle detailed validation errors
        const fieldErrors = {};
        error.response.data.details.forEach((detail) => {
          fieldErrors[detail.field] = detail.message;
        });
        setErrors((prevErrors) => ({ ...prevErrors, ...fieldErrors }));
      } else {
        // Handle general errors
        let errorMessage = "Failed to create user";
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response?.data === "string") {
          errorMessage = error.response.data;
        }
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
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
      `}</style>
      <div className="main-content w-100">
        <div className="main-content-inner">
          <div className="widget-box-2 mb-20">
            <h5 className="title">Basic Information</h5>
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
            <h3 className="title">Account Settings</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="box">
                <fieldset className="box-fieldset">
                  <label htmlFor="role">
                    User Role:<span>*</span>
                  </label>
                  <select
                    name="role"
                    className={`form-control ${errors.role ? "error" : ""}`}
                    value={formData.role}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    style={{
                      height: "50px",
                      fontSize: "16px",
                      padding: "12px 16px",
                    }}
                  >
                    <option value="admin">Admin</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                  </select>
                  {errors.role && (
                    <span className="error-text">{errors.role}</span>
                  )}
                </fieldset>
              </div>
              <div className="box grid-layout-2 gap-30">
                <fieldset className="box-fieldset">
                  <label htmlFor="password">
                    Password:<span>*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`form-control ${
                        errors.password ? "error" : ""
                      }`}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn-show-pass"
                      onClick={togglePasswordVisibility}
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
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
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
                  {errors.password && (
                    <span className="error-text">{errors.password}</span>
                  )}
                </fieldset>
                <fieldset className="box-fieldset">
                  <label htmlFor="confirmPassword">
                    Confirm Password:<span>*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      className={`form-control ${
                        errors.confirmPassword ? "error" : ""
                      }`}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn-show-pass"
                      onClick={toggleConfirmPasswordVisibility}
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
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
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

          <div className="box-btn">
            <button
              type="submit"
              className="tf-btn bg-color-primary pd-13"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating User..." : "Create User"}
            </button>
            <a
              href="/admin/user-management"
              className="tf-btn style-border pd-10"
            >
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
