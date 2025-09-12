"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { blogCategoryAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AddBlogCategory() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Frontend validation function
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "name":
        if (!value || value.trim() === "") {
          return "Category name is required";
        } else if (value.trim().length < 2) {
          return "Category name must be at least 2 characters long";
        } else if (value.trim().length > 100) {
          return "Category name cannot exceed 100 characters";
        } else if (!/[a-zA-Z]/.test(value.trim())) {
          return "Category name must contain at least some letters";
        }
        return "";

      case "description":
        if (value && value.trim().length > 500) {
          return "Description cannot exceed 500 characters";
        }
        return "";

      default:
        return "";
    }
  };

  // Handle field blur for validation
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Mark field as touched when user starts typing
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Real-time validation as user types
    const validationError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: validationError,
    }));

    // Clear general error when user makes changes
    if (error) {
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate all fields before submission
    const validationErrors = {};
    Object.keys(formData).forEach((fieldName) => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        validationErrors[fieldName] = error;
      }
    });

    // Mark all fields as touched to show validation errors
    setTouchedFields({
      name: true,
      description: true,
    });

    // If there are validation errors, don't submit
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrors({}); // Clear any existing errors

    try {
      const response = await blogCategoryAPI.createCategory(formData);

      if (response.success) {
        // Redirect back to blog categories page
        router.push("/admin/blog-categories");
      } else {
        // Handle validation errors from backend
        if (response.details) {
          console.log("Validation details found:", response.details);
          const backendErrors = {};
          response.details.forEach((error) => {
            console.log("Processing error:", error);
            if (error.field) {
              backendErrors[error.field] = error.message;
            }
          });
          console.log("Backend errors object:", backendErrors);
          setErrors(backendErrors);

          // Don't set general error if we have field-specific errors
          if (Object.keys(backendErrors).length === 0) {
            setError(response.error || "Failed to create category");
          }
        } else {
          setError(response.error || "Failed to create category");
        }
      }
    } catch (err) {
      console.error("Error creating category:", err);
      setError("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/admin/blog-categories");
  };

  return (
    <div className="main-content w-100">
      <style jsx>{`
        .form-control.is-invalid {
          background-image: none !important;
          padding-right: 0.75rem !important;
        }
        .error-text {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: block;
        }
        .form-control.error {
          border-color: #dc3545;
        }
      `}</style>
      <div className="main-content-inner">
        <div className="widget-box-2 mb-20">
          <h3 className="title">Add New Blog Category</h3>
          <p>Create a new blog category to organize your blog posts</p>
        </div>

        <div className="widget-box-2 wd-listing mb-20">
          {/* Error Message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Add Category Form */}
          <div className="wrap-form">
            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="name" className="form-label">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        (touchedFields.name && errors.name) ||
                        (!touchedFields.name &&
                          errors.name &&
                          Object.keys(errors).length > 1)
                          ? "is-invalid"
                          : ""
                      }`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Enter category name"
                    />
                    {((touchedFields.name && errors.name) ||
                      (!touchedFields.name &&
                        errors.name &&
                        Object.keys(errors).length > 1)) && (
                      <div className="invalid-feedback d-block">
                        {errors.name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      className={`form-control ${
                        (touchedFields.description && errors.description) ||
                        (!touchedFields.description &&
                          errors.description &&
                          Object.keys(errors).length > 1)
                          ? "is-invalid"
                          : ""
                      }`}
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      placeholder="Enter category description (optional)"
                      style={{
                        resize: "none",
                        overflowY: "auto",
                        scrollbarGutter: "stable",
                      }}
                    />
                    {((touchedFields.description && errors.description) ||
                      (!touchedFields.description &&
                        errors.description &&
                        Object.keys(errors).length > 1)) && (
                      <div className="invalid-feedback d-block">
                        {errors.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="box-btn">
          <button
            type="submit"
            className="tf-btn bg-color-primary pd-13"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Creating...
              </>
            ) : (
              "Create Category"
            )}
          </button>
          <button
            type="button"
            className="tf-btn style-border pd-10"
            onClick={handleCancel}
            disabled={loading}
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
  );
}
