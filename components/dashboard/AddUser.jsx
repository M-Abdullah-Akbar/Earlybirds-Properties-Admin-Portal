"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { userAPI } from "@/utlis/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);
      toast.info("Creating user...");
      try {
        const userData = {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };

        const response = await userAPI.createUser(userData);

        if (response.success) {
          // Show success toast and redirect after a delay
          toast.success("User created successfully!");
          setTimeout(() => {
            router.push("/admin/user-management");
          }, 2000);
        } else {
          toast.error(response.error || "Failed to create user");
        }
      } catch (error) {
        console.error("Error creating user:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);

        let errorMessage = "Failed to create user";

        if (error.response?.data) {
          if (error.response.data.error) {
            errorMessage = error.response.data.error;

            // If there are detailed validation errors, set them as field errors
            if (
              error.response.data.details &&
              Array.isArray(error.response.data.details)
            ) {
              const fieldErrors = {};
              error.response.data.details.forEach((detail) => {
                fieldErrors[detail.field] = detail.message;
              });
              setErrors(fieldErrors);
              // Show validation errors as toasts
              Object.values(fieldErrors).forEach(message => {
                toast.error(message);
              });
              return; // Don't show general error toast, field-specific toasts are shown
            }
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          }
        }

        toast.error(`Error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="main-content w-100">
      <ToastContainer position="top-right" autoClose={5000} />
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
                  style={{
                    height: "50px",
                    fontSize: "16px",
                    padding: "12px 16px",
                  }}
                >
                  <option value="">Select Role</option>
                  <option value="SuperAdmin">Super Admin</option>
                  <option value="admin">Admin</option>
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
                <div
                  className="password-input-container"
                  style={{ position: "relative" }}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`form-control ${errors.password ? "error" : ""}`}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "#666",
                    }}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
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
                <div
                  className="password-input-container"
                  style={{ position: "relative" }}
                >
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className={`form-control ${
                      errors.confirmPassword ? "error" : ""
                    }`}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "#666",
                    }}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
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
  );
}
