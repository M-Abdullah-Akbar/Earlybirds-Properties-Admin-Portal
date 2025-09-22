"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { blogAPI, blogCategoryAPI, uploadAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { PropertyDescriptionEditor } from "@/components/tiptap-templates/property/property-description-editor";
import { blogNotifications } from "@/utils/notifications";

export default function EditBlog({ blogId }) {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
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

  // Fetch blog data
  const fetchBlog = async () => {
    try {
      setInitialLoading(true);
      const response = await blogAPI.getBlog(blogId);

      if (response.success && response.data?.blog) {
        const blog = response.data.blog;

        // Convert existing images to the format expected by the component
        const existingImages = blog.images
          ? blog.images.map((img, index) => ({
              url: img.url,
              preview: img.url,
              isMain: img.isMain || index === 0,
              altText: img.altText || `Blog image ${index + 1}`,
              isExisting: true, // Flag to identify existing images
              _id: img._id,
            }))
          : [];

        setFormData({
          title: blog.title || "",
          content: blog.content || "",
          category: blog.category?._id || "",
          tags: blog.tags ? blog.tags.join(", ") : "",
          status: blog.status || "draft",
          featured: blog.featured || false,
          featuredImage: blog.featuredImage || null,
          images: existingImages,
        });
      } else {
        blogNotifications.fetchError("Blog not found");
      }
    } catch (err) {
      console.error("Error fetching blog:", err);
      const errorMessage = err.response?.data?.error || "Failed to fetch blog";
      blogNotifications.fetchError(errorMessage);
    } finally {
      setInitialLoading(false);
    }
  };

  // Validation function - disabled (no validations)
  const validateField = (fieldName, value) => {
    // All validations disabled - always return null (no error)
    return null;
  };

  // Legacy validation code (disabled)
  const validateFieldLegacy = (fieldName, value) => {
    switch (fieldName) {
      case "title":
        if (!value || value.trim().length === 0) {
          return "Blog title is required";
        }
        if (value.trim().length < 3) {
          return "Blog title must be at least 3 characters long";
        }
        if (value.trim().length > 200) {
          return "Blog title must be less than 200 characters";
        }
        break;
      case "content":
        if (!value || value.trim().length === 0) {
          return "Blog content is required";
        }
        // Handle JSON content from PropertyDescriptionEditor
        let textContent = "";
        try {
          const contentObj = typeof value === 'string' ? JSON.parse(value) : value;
          // Extract text from JSON structure
          const extractText = (node) => {
            if (node.type === 'text') return node.text || '';
            if (node.content) {
              return node.content.map(extractText).join('');
            }
            return '';
          };
          textContent = extractText(contentObj).trim();
        } catch (e) {
          // Fallback for HTML content
          textContent = value.replace(/<[^>]*>/g, "").trim();
        }
        if (textContent.length === 0) {
          return "Blog content is required";
        }
        if (textContent.length < 50) {
          return "Blog content must be at least 50 characters long";
        }
        break;
      case "category":
        if (!value) {
          return "Please select a category";
        }
        break;
      default:
        return null;
    }
    return null;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          images: "Please select only image files",
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          images: "Image size should be less than 5MB",
        }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          file,
          preview: e.target.result,
          isMain: formData.images.length === 0, // First image is main by default
          altText: `Blog image ${formData.images.length + 1}`,
          isExisting: false, // Flag for new images
        };

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, newImage],
        }));
      };
      reader.readAsDataURL(file);
    });

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove image
  const removeImage = (index) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      // If we removed the main image, make the first remaining image main
      if (newImages.length > 0 && prev.images[index].isMain) {
        newImages[0].isMain = true;
      }
      return { ...prev, images: newImages };
    });
  };

  // Set main image
  const setMainImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isMain: i === index,
      })),
    }));
  };

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
      } else {
        blogNotifications.fetchError("Failed to load blog categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      blogNotifications.fetchError("Failed to load blog categories");
    }
  };

  useEffect(() => {
    if (blogId) {
      fetchBlog();
      fetchCategories();
    }
  }, [blogId]);

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

  // Handle field blur for validation
  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setErrors({});

    // Validation disabled - proceed directly to submission

    try {
      // Create FormData for multipart request (includes both blog data and images)
      const formDataToSend = new FormData();

      // Add blog data fields
      formDataToSend.append("title", formData.title);
      // Convert JSON content back to string for backend
      const contentToSend = typeof formData.content === 'string' ? formData.content : JSON.stringify(formData.content);
      formDataToSend.append("content", contentToSend);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("featured", formData.featured || false);

      // Add tags
      const tags = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim())
        : [];
      // Send tags as individual array items instead of JSON string
      tags.forEach(tag => {
        if (tag) formDataToSend.append("tags", tag);
      });

      // Handle images - separate existing and new images
      const existingImages = formData.images.filter((img) => img.isExisting);
      const newImages = formData.images.filter((img) => !img.isExisting);

      // Add existing images metadata
      if (existingImages.length > 0) {
        formDataToSend.append(
          "existingImages",
          JSON.stringify(
            existingImages.map((img, index) => ({
              _id: img._id,
              url: img.url,
              isMain: img.isMain,
              altText: img.altText,
              order: formData.images.indexOf(img),
            }))
          )
        );
      }

      // Add new images if any
      if (newImages.length > 0) {
        newImages.forEach((image, index) => {
          formDataToSend.append("images", image.file);
          // Add image metadata
          const globalIndex = formData.images.indexOf(image);
          formDataToSend.append(
            `imageMetadata[${index}][isMain]`,
            image.isMain || false
          );
          formDataToSend.append(
            `imageMetadata[${index}][altText]`,
            image.altText || `Blog image ${globalIndex + 1}`
          );
          formDataToSend.append(`imageMetadata[${index}][order]`, globalIndex);
        });
      }

      const response = await blogAPI.updateBlog(blogId, formDataToSend);

      if (response.success) {
        blogNotifications.updateSuccess(formData.title || "Blog");
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
          blogNotifications.updateError(response.error || "Failed to update blog");
        }
      }
    } catch (err) {
      console.error("Error updating blog:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to update blog";
      blogNotifications.updateError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner">
          <div className="widget-box-2 mb-20">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-3">Loading blog...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && initialLoading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner">
          <div className="widget-box-2 mb-20">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
            <button
              className="tf-btn bg-color-secondary pd-23"
              onClick={() => router.push("/admin/blog-management")}
            >
              Back to Blog Management
            </button>
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
          <h3 className="title">Edit Blog</h3>
          <p>Update blog post with all necessary details</p>
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
                onClick={(e) => {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }}
              >
                <svg
                  width={21}
                  height={20}
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.5 12.5V15.8333C18.5 16.2754 18.3244 16.6993 18.0118 17.0118C17.6993 17.3244 17.2754 17.5 16.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.6667 6.66667L10.5 2.5L6.33333 6.66667"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.5 2.5V12.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Choose Images
              </a>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*"
                style={{ display: "none" }}
              />
              <p className="file-name">
                Drag your images here, or{" "}
                <span
                  className="tf-color"
                  style={{ cursor: "pointer" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse
                </span>
              </p>
              <p className="list-file">
                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB each)
              </p>
            </div>
            {/* Images error display disabled */}
            {formData.images.length > 0 && (
              <div className="image-preview-grid mt-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="image-preview-item">
                    <Image
                      width={100}
                      height={100}
                      alt={`Preview ${index + 1}`}
                      src={image.preview}
                    />
                    <div className="image-controls">
                      <div className="top-controls">
                        {image.isMain && (
                          <span className="main-image-badge" title="Main image">
                            Main Image
                          </span>
                        )}
                        <span
                          className="icon icon-trashcan1 remove-file"
                          onClick={() => removeImage(index)}
                          style={{ cursor: "pointer" }}
                          title="Remove image"
                        />
                      </div>
                      <div className="bottom-controls">
                        {!image.isMain && (
                          <button
                            type="button"
                            className="btn-set-main"
                            onClick={() => setMainImage(index)}
                            title="Set as main image"
                          >
                            Set as Main
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                  className="form-control"
                  placeholder="Enter blog title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                />
                {/* Error display disabled */}
              </fieldset>
            </div>

            <div className="box">
              <fieldset className="box-fieldset">
                <label htmlFor="content">
                  Content:<span>*</span>
                </label>
                <PropertyDescriptionEditor
                  value={formData.content}
                  onChange={(content) => {
                    setFormData((prev) => ({ ...prev, content: JSON.stringify(content) }));
                    // Clear error when user starts typing
                    if (errors.content) {
                      setErrors((prev) => ({ ...prev, content: null }));
                    }
                  }}
                  onBlur={(content) => {
                    // Handle blur validation if needed
                  }}
                />
              </fieldset>
            </div>

            <div className="box grid-layout-2 gap-30">
              <fieldset className="box-fieldset">
                <label htmlFor="category">
                  Category:<span>*</span>
                </label>
                <select
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {/* Error display disabled */}
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
                  placeholder="Enter tags separated by commas (e.g., real estate, dubai, property)"
                  value={formData.tags}
                  onChange={handleInputChange}
                />
              </fieldset>
            </div>

            <div className="box">
              <div className="checkbox-item">
                <label className="checkbox-item-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                  <span className="btn-checkbox" />
                  Featured Blog
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="widget-box-2 mb-20">
          <div className="d-flex gap-15">
            <button
              type="button"
              className="tf-btn bg-color-secondary pd-23"
              onClick={() => router.push("/admin/blog-management")}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="tf-btn bg-color-primary pd-23"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Blog"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
