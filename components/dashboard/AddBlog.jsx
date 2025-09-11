"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { blogAPI, blogCategoryAPI, uploadAPI } from "@/utlis/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AddBlog() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    status: "draft",
    featured: false,
    featuredImage: null,
    images: [],
  });

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
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Clear any previous image errors
    setErrors((prev) => ({
      ...prev,
      images: null,
    }));

    // Only process the first file for blogs (replace existing if any)
    const file = files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage = {
        file,
        preview: e.target.result,
        isMain: true, // Single image is always main
        altText: "Blog image",
        order: 0,
      };

      setFormData((prev) => ({
        ...prev,
        images: [newImage], // Replace any existing image
      }));
    };
    reader.readAsDataURL(file);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove image
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: [], // For blogs, simply clear the single image
    }));

    // Clear any image-related errors
    setErrors((prev) => ({
      ...prev,
      images: null,
    }));
  };

  // Set main image - Not needed for blogs since only 1 image allowed
  const setMainImage = (index) => {
    // No-op for blogs since there's only one image which is always main
    return;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setErrors({});

    try {
      // Create FormData for multipart request (includes both blog data and images)
      const formDataToSend = new FormData();

      // Add blog data fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("featured", formData.featured || false);
      formDataToSend.append("author", user._id);

      // Add tags
      const tags = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim())
        : [];
      formDataToSend.append("tags", JSON.stringify(tags));

      // Add images if any
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image, index) => {
          formDataToSend.append("images", image.file);
          // Add image metadata
          formDataToSend.append(
            `imageMetadata[${index}][isMain]`,
            image.isMain || false
          );
          formDataToSend.append(
            `imageMetadata[${index}][altText]`,
            image.altText || `Blog image ${index + 1}`
          );
          formDataToSend.append(`imageMetadata[${index}][order]`, index);
        });
      }

      const response = await blogAPI.createBlog(formDataToSend);

      if (response.success) {
        router.push("/admin/blog-management");
      } else {
        // Handle backend validation errors
        if (response.details && Array.isArray(response.details)) {
          const fieldErrors = {};
          response.details.forEach((detail) => {
            let fieldName = detail.field;
            fieldErrors[fieldName] = detail.message;
          });
          setErrors(fieldErrors);
        } else {
          setError(response.error || "Failed to create blog");
        }
      }
    } catch (err) {
      console.error("Error creating blog:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to create blog"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner">
          <div className="widget-box-2 mb-20">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-3">Loading categories...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content w-100">
      <div className="main-content-inner">
        {/* Header */}
        <div className="widget-box-2 mb-20">
          <h3 className="title">Add New Blog</h3>
          <p>Create a new blog post with all necessary details</p>
        </div>

        {/* Submit Error */}
        {error && <div className="alert alert-danger mb-20">{error}</div>}

        {/* Upload Media Section */}
        <div className="widget-box-2 mb-20">
          <h5 className="title">Upload Media</h5>
          <div className="box-uploadfile text-center">
            <div className="uploadfile">
              <a
                href="#"
                className="tf-btn bg-color-primary pd-10 btn-upload mx-auto"
              >
                <svg
                  width={21}
                  height={20}
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.625 14.375V17.1875C13.625 17.705 13.205 18.125 12.6875 18.125H4.5625C4.31386 18.125 4.0754 18.0262 3.89959 17.8504C3.72377 17.6746 3.625 17.4361 3.625 17.1875V6.5625C3.625 6.045 4.045 5.625 4.5625 5.625H6.125C6.54381 5.62472 6.96192 5.65928 7.375 5.72834M13.625 14.375H16.4375C16.955 14.375 17.375 13.955 17.375 13.4375V9.375C17.375 5.65834 14.6725 2.57417 11.125 1.97834C10.7119 1.90928 10.2938 1.87472 9.875 1.875H8.3125C7.795 1.875 7.375 2.295 7.375 2.8125V5.72834M13.625 14.375H8.3125C8.06386 14.375 7.8254 14.2762 7.64959 14.1004C7.47377 13.9246 7.375 13.6861 7.375 13.4375V5.72834M17.375 11.25V9.6875C17.375 8.94158 17.0787 8.22621 16.5512 7.69876C16.0238 7.17132 15.3084 6.875 14.5625 6.875H13.3125C13.0639 6.875 12.8254 6.77623 12.6496 6.60041C12.4738 6.4246 12.375 6.18614 12.375 5.9375V4.6875C12.375 4.31816 12.3023 3.95243 12.1609 3.6112C12.0196 3.26998 11.8124 2.95993 11.5512 2.69876C11.2901 2.4376 10.98 2.23043 10.6388 2.08909C10.2976 1.94775 9.93184 1.875 9.5625 1.875H8.625"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Select photo
                <input
                  ref={fileInputRef}
                  type="file"
                  className="ip-file"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </a>
              <p className="file-name fw-5">
                or drag photo here <br />
                <span>(1 photo only)</span>
              </p>
            </div>
          </div>

          {errors.images && <span className="error-text">{errors.images}</span>}

          {/* Image Preview */}
          {formData.images &&
            Array.isArray(formData.images) &&
            formData.images.length > 0 && (
              <div className="box-img-upload">
                {formData.images.map((image, index) => (
                  <div key={index} className="item-upload file-delete">
                    <Image
                      alt="img"
                      width={615}
                      height={405}
                      src={image.preview}
                    />
                    <div className="image-controls">
                      <div className="top-controls">
                        <span className="main-image-badge" title="Blog image">
                          Blog Image
                        </span>
                        <span
                          className="icon icon-trashcan1 remove-file"
                          onClick={() => removeImage(index)}
                          style={{ cursor: "pointer" }}
                          title="Remove image"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Basic Information */}
        <div className="widget-box-2 mb-20">
          <h5 className="title">Basic Information</h5>
          <form className="box-info-property" onSubmit={handleSubmit}>
            <div className="box">
              <fieldset className="box-fieldset">
                <label htmlFor="title">
                  Blog Title:<span>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className={`form-control ${errors.title ? "error" : ""}`}
                  placeholder="Enter blog title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
                {errors.title && (
                  <span className="error-text">{errors.title}</span>
                )}
              </fieldset>
            </div>

            <div className="box">
              <fieldset className="box-fieldset">
                <label htmlFor="content">
                  Content:<span>*</span>
                </label>
                <textarea
                  name="content"
                  className={`textarea ${errors.content ? "error" : ""}`}
                  placeholder="Write your blog content here..."
                  value={formData.content}
                  onChange={handleInputChange}
                  style={{
                    resize: "none",
                    overflowY: "auto",
                    scrollbarGutter: "stable",
                  }}
                />
                {errors.content && (
                  <span className="error-text">{errors.content}</span>
                )}
              </fieldset>
            </div>

            <div className="box grid-layout-2 gap-30">
              <fieldset className="box-fieldset">
                <label htmlFor="category">Category:</label>
                <select
                  name="category"
                  className={`form-control ${errors.category ? "error" : ""}`}
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="error-text">{errors.category}</span>
                )}
              </fieldset>

              <fieldset className="box-fieldset">
                <label htmlFor="status">Status:</label>
                <select
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </fieldset>
            </div>

            <div className="box">
              <fieldset className="box-fieldset">
                <label htmlFor="tags">Tags:</label>
                <input
                  type="text"
                  name="tags"
                  className="form-control"
                  placeholder="Enter tags separated by commas (e.g., real estate,dubai,property)"
                  value={formData.tags}
                  onChange={handleInputChange}
                />
              </fieldset>
            </div>
          </form>
        </div>

        {/* Featured Blog */}
        <div className="widget-box-2 mb-20">
          <h5 className="title">Featured Blog</h5>
          <div className="box-radio-check">
            <div className="radio-item">
              <label>
                <span className="text-1">Mark as Featured Blog</span>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Blog"}
          </button>
          <a
            href="/admin/blog-management"
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
    </div>
  );
}
