"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { blogCategoryAPI } from "@/utils/api";
import { blogCategoryNotifications } from "@/utils/notifications";
import { useAuth } from "@/contexts/AuthContext";

export default function EditBlogCategory({ categoryId }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [infoMessage, setInfoMessage] = useState("");
  const [originalFormData, setOriginalFormData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  // Fetch category data
  const fetchCategory = async () => {
    try {
      setFetchLoading(true);
      setError(null);
      const response = await blogCategoryAPI.getCategory(categoryId);

      if (response.success) {
        const category = response.data?.category;
        const categoryData = {
          name: category.name || "",
          description: category.description || "",
          isActive: category.isActive !== undefined ? category.isActive : true,
        };
        setFormData(categoryData);
        setOriginalFormData(categoryData); // Store original data for comparison
      } else {
        blogCategoryNotifications.fetchError(response.error || "Failed to fetch category");
      }
    } catch (err) {
      console.error("Error fetching category:", err);
      const errorMessage = err.response?.data?.error || "Failed to fetch category";
      blogCategoryNotifications.fetchError(errorMessage);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

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
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Mark field as touched when user starts typing
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Real-time validation as user types
    const validationError = validateField(name, newValue);
    setErrors((prev) => ({
      ...prev,
      [name]: validationError,
    }));

    // Clear info message when user makes changes
    if (infoMessage) {
      setInfoMessage("");
    }
  };

  // Check if any changes were made
  const hasChanges = () => {
    if (!originalFormData) return true; // If no original data, allow update

    // Helper function to compare objects deeply
    const deepEqual = (obj1, obj2) => {
      if (obj1 === obj2) return true;
      if (obj1 == null || obj2 == null) return false;
      if (typeof obj1 !== typeof obj2) return false;

      if (typeof obj1 === "object") {
        if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

        if (Array.isArray(obj1)) {
          if (obj1.length !== obj2.length) return false;
          for (let i = 0; i < obj1.length; i++) {
            if (!deepEqual(obj1[i], obj2[i])) return false;
          }
          return true;
        } else {
          const keys1 = Object.keys(obj1);
          const keys2 = Object.keys(obj2);
          if (keys1.length !== keys2.length) return false;

          for (let key of keys1) {
            if (!keys2.includes(key)) return false;
            if (!deepEqual(obj1[key], obj2[key])) return false;
          }
          return true;
        }
      }

      return obj1 === obj2;
    };

    return !deepEqual(formData, originalFormData);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check if any changes were made
    if (!hasChanges()) {
      // No changes made, show info message
      setInfoMessage("No changes were made to the category.");
      setError(null);
      setErrors({});
      setLoading(false);

      // Scroll to top to show the message
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Auto-dismiss info message after 5 seconds
      setTimeout(() => {
        setInfoMessage("");
      }, 5000);

      return;
    }

    setInfoMessage(""); // Clear any existing info message

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
      isActive: true,
    });

    // If there are validation errors, don't submit
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrors({}); // Clear any existing field errors

    try {
      const response = await blogCategoryAPI.updateCategory(
        categoryId,
        formData
      );

      if (response.success) {
        blogCategoryNotifications.updateSuccess();
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
            blogCategoryNotifications.updateError(response.error || "Failed to update category");
          }
        } else {
          blogCategoryNotifications.updateError(response.error || "Failed to update category");
        }
      }
    } catch (err) {
      console.error("Error updating category:", err);
      const errorMessage = "Failed to update category";
      blogCategoryNotifications.updateError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/admin/blog-categories");
  };

  if (fetchLoading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner">
          <div className="widget-box-2 mb-20">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-3">Loading category...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h3 className="title">Edit Blog Category</h3>
          <p>Update the blog category details and settings</p>
        </div>

        <div className="widget-box-2 wd-listing mb-20">
          {/* Error Message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Info Message */}
          {infoMessage && (
            <div className="alert alert-info" role="alert">
              {infoMessage}
            </div>
          )}

          {/* Edit Category Form */}
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

        {/* Category Settings */}
        <div className="widget-box-2 mb-20">
          <h5 className="title">Category Settings</h5>
          <div className="box-radio-check">
            <div className="radio-item">
              <label>
                <span className="text-1">Active Category</span>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span className="btn-radio" />
              </label>
            </div>
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
                Updating...
              </>
            ) : (
              "Update Category"
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
