"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { blogAPI, blogCategoryAPI, uploadAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";

export default function EditBlog({ blogId }) {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [infoMessage, setInfoMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [originalFormData, setOriginalFormData] = useState(null);
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

        // Debug: Log the tags to see what we're receiving
        console.log("Blog tags from backend:", blog.tags, typeof blog.tags);
        console.log("Blog tags JSON stringified:", JSON.stringify(blog.tags));

        // Convert existing images to the format expected by the component
        const existingImages = blog.images
          ? blog.images.map((img, index) => {
              console.log("Image data from backend:", {
                originalName: img.originalName,
                size: img.size,
                originalSize: img.originalSize,
                url: img.url,
                willUseSize: img.originalSize || img.size,
              });
              return {
                url: img.url,
                preview: img.url,
                isMain: img.isMain || index === 0,
                altText: img.altText || `Blog image ${index + 1}`,
                isExisting: true, // Flag to identify existing images
                _id: img._id,
                // Store original file info for change detection
                originalFileName: img.originalName,
                originalFileSize: img.originalSize || img.size, // Use originalSize if available, fallback to compressed size
              };
            })
          : [];

        const formDataToSet = {
          title: blog.title || "",
          slug: blog.slug || "",
          excerpt: blog.excerpt || "",
          content: blog.content || "",
          category: blog.category?._id || "",
          tags: (() => {
            // Handle different possible formats of tags from backend
            console.log(
              "Processing tags - initial value:",
              blog.tags,
              typeof blog.tags
            );

            if (!blog.tags) return "";

            let tagsArray = blog.tags;

            // If tags is a string, try to parse it as JSON
            if (typeof blog.tags === "string") {
              console.log("Tags is string:", blog.tags);
              // If it's "[]" or empty string, return empty
              if (blog.tags === "[]" || blog.tags === "") return "";

              try {
                tagsArray = JSON.parse(blog.tags);
                console.log("Parsed tags as JSON:", tagsArray);
              } catch (e) {
                console.log(
                  "Failed to parse as JSON, treating as comma-separated"
                );
                // If not JSON, treat as comma-separated string
                tagsArray = blog.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag);
              }
            }

            // Handle array case
            if (Array.isArray(tagsArray)) {
              console.log("Tags is array:", tagsArray);

              // Special case: if array has one element that looks like JSON string
              if (tagsArray.length === 1 && typeof tagsArray[0] === "string") {
                const singleElement = tagsArray[0];
                console.log("Single array element:", singleElement);

                // Try to parse the single element as JSON
                try {
                  const parsedElement = JSON.parse(singleElement);
                  if (Array.isArray(parsedElement)) {
                    console.log(
                      "Parsed single element as array:",
                      parsedElement
                    );
                    const result = parsedElement.join(",");
                    console.log(
                      "Final tags result from parsed element:",
                      result
                    );
                    return result;
                  }
                } catch (e) {
                  console.log("Failed to parse single element as JSON");
                }
              }

              // Filter out empty strings and "[]" strings
              const validTags = tagsArray.filter(
                (tag) =>
                  tag &&
                  typeof tag === "string" &&
                  tag.trim() !== "" &&
                  tag.trim() !== "[]"
              );

              console.log("Valid tags after filtering:", validTags);

              if (validTags.length > 0) {
                // Join with comma only (no spaces) to match input format
                const result = validTags.join(",");
                console.log("Final tags result:", result);
                return result;
              }
            }

            console.log("Returning empty string for tags");
            return "";
          })(),
          status: blog.status || "draft",
          featured: blog.featured || false,
          featuredImage: blog.featuredImage || null,
          images: existingImages,
        };

        setFormData(formDataToSet);
        // Store original form data for comparison
        setOriginalFormData(JSON.parse(JSON.stringify(formDataToSet)));
      } else {
        setError("Blog not found");
      }
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError(err.response?.data?.error || "Failed to fetch blog");
    } finally {
      setInitialLoading(false);
    }
  };

  // Deep comparison function to check if form data has changed
  const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;

    if (obj1 == null || obj2 == null) return obj1 === obj2;

    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 !== "object") return obj1 === obj2;

    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

    if (Array.isArray(obj1)) {
      if (obj1.length !== obj2.length) return false;
      for (let i = 0; i < obj1.length; i++) {
        if (!deepEqual(obj1[i], obj2[i])) return false;
      }
      return true;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  };

  // Check if form data has changed
  const hasChanges = () => {
    if (!originalFormData) return true;

    // Create copies of form data without images for comparison
    const currentDataWithoutImages = { ...formData };
    const originalDataWithoutImages = { ...originalFormData };
    delete currentDataWithoutImages.images;
    delete originalDataWithoutImages.images;

    // Check if non-image fields have changed
    const nonImageFieldsChanged = !deepEqual(
      currentDataWithoutImages,
      originalDataWithoutImages
    );

    // Check if images have changed
    const currentImages = formData.images || [];
    const originalImages = originalFormData.images || [];

    // If different number of images, definitely changed
    if (currentImages.length !== originalImages.length) {
      return true;
    }

    // If no images in both, only check non-image fields
    if (currentImages.length === 0 && originalImages.length === 0) {
      return nonImageFieldsChanged;
    }

    // For blogs, we only have one image, so compare the single image
    if (currentImages.length === 1 && originalImages.length === 1) {
      const currentImage = currentImages[0];
      const originalImage = originalImages[0];

      // If current image is new (has file property), try to detect if it's the same as original
      if (
        !currentImage.isExisting &&
        currentImage.file &&
        originalImage.isExisting
      ) {
        const currentFileName = currentImage.file.name;
        const currentFileSize = currentImage.file.size;

        // If we have stored the original file info, compare it
        if (
          originalImage.originalFileName &&
          originalImage.originalFileSize !== undefined
        ) {
          console.log("File comparison details:", {
            originalFileName: originalImage.originalFileName,
            currentFileName: currentFileName,
            originalFileSize: originalImage.originalFileSize,
            currentFileSize: currentFileSize,
            nameMatch: originalImage.originalFileName === currentFileName,
            sizeMatch: originalImage.originalFileSize === currentFileSize,
          });

          const isSameFile =
            originalImage.originalFileName === currentFileName &&
            originalImage.originalFileSize === currentFileSize;

          if (isSameFile) {
            // Same file re-uploaded, check if other fields changed
            console.log("✅ Detected same file re-uploaded:", currentFileName);
            return nonImageFieldsChanged;
          } else {
            // Different file uploaded
            console.log("❌ Different file uploaded:", {
              original: {
                name: originalImage.originalFileName,
                size: originalImage.originalFileSize,
              },
              current: { name: currentFileName, size: currentFileSize },
            });
            return true;
          }
        }

        // If we don't have original file info, treat as change (safer approach)
        console.log("No original file info available, treating as change");
        return true;
      }

      // If current image is existing, compare IDs and metadata
      if (currentImage.isExisting && originalImage.isExisting) {
        const imageChanged =
          currentImage._id !== originalImage._id ||
          currentImage.altText !== originalImage.altText ||
          currentImage.isMain !== originalImage.isMain;
        return nonImageFieldsChanged || imageChanged;
      }
    }

    // Default to checking if non-image fields changed
    return nonImageFieldsChanged;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Clear any previous image errors
    setErrors((prev) => ({
      ...prev,
      images: null,
    }));

    // Blog only allows 1 image - replace existing image if any
    const file = files[0];
    if (!file) return;

    // If there's already an image, we'll replace it
    if (formData.images.length > 0) {
      console.log("Replacing existing image with new one");
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage = {
        file,
        preview: e.target.result,
        isMain: true, // Single image is always main
        altText: "Blog image",
        isExisting: false, // Flag for new images
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
    if (blogId) {
      fetchBlog();
      fetchCategories();
    }
  }, [blogId]);

  // Auto-dismiss info message after 5 seconds
  useEffect(() => {
    if (infoMessage) {
      const timer = setTimeout(() => {
        setInfoMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [infoMessage]);

  // Auto-dismiss success message after 3 seconds (shorter since it redirects)
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setErrors({});
    setInfoMessage(null);
    setSuccessMessage(null);

    try {
      // Check if any changes were made
      if (!hasChanges()) {
        setInfoMessage("No changes were made to the blog.");
        setIsSubmitting(false);
        // Scroll to top to show the message
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      // Handle images - separate existing and new images
      const existingImages = formData.images.filter((img) => img.isExisting);
      const newImages = formData.images.filter((img) => !img.isExisting);

      // Check if there are any image changes (new images or removed images)
      const originalExistingImageIds = originalFormData.images
        .filter((img) => img.isExisting)
        .map((img) => img._id)
        .sort();
      const currentExistingImageIds = existingImages
        .map((img) => img._id)
        .sort();

      const hasImageChanges =
        newImages.length > 0 ||
        JSON.stringify(originalExistingImageIds) !==
          JSON.stringify(currentExistingImageIds);

      let response;

      if (hasImageChanges) {
        // Image changes detected - use FormData for multipart request
        const formDataToSend = new FormData();

        // Add blog data fields
        formDataToSend.append("title", formData.title);
        formDataToSend.append("slug", formData.slug);
        formDataToSend.append("excerpt", formData.excerpt);
        formDataToSend.append("content", formData.content);
        formDataToSend.append("status", formData.status);
        formDataToSend.append("featured", formData.featured || false);

        // Always include category field - send empty string if empty to clear it
        if (formData.category && formData.category.trim() !== "") {
          formDataToSend.append("category", formData.category);
        } else {
          formDataToSend.append("category", ""); // Send empty string to clear category
        }

        // Add tags
        const tags = formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [];
        formDataToSend.append("tags", JSON.stringify(tags));

        // Always send existing images metadata (even if empty array)
        // This tells the backend which existing images to keep
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
            formDataToSend.append(
              `imageMetadata[${index}][order]`,
              globalIndex
            );
          });
        }

        response = await blogAPI.updateBlog(blogId, formDataToSend);
      } else {
        // No image changes - use simple JSON request
        const tags = formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [];

        const blogDataToSend = {
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          status: formData.status,
          featured: formData.featured || false,
          tags: tags,
        };

        // Always include category field - send empty string if empty to clear it
        if (formData.category && formData.category.trim() !== "") {
          blogDataToSend.category = formData.category;
        } else {
          blogDataToSend.category = ""; // Send empty string to clear category
        }

        response = await blogAPI.updateBlog(blogId, blogDataToSend);
      }

      if (response.success) {
        // Update the original form data to reflect the new saved state
        setOriginalFormData(JSON.parse(JSON.stringify(formData)));
        setSuccessMessage("Blog updated successfully!");
        // Scroll to top to show the message
        window.scrollTo({ top: 0, behavior: "smooth" });
        // Redirect after a short delay to show the success message
        setTimeout(() => {
          router.push("/admin/blog-management");
        }, 2000);
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
          setError(response.error || "Failed to update blog");
        }
      }
    } catch (err) {
      console.error("Error updating blog:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to update blog"
      );
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

        {/* Messages */}
        {infoMessage && (
          <div className="alert alert-info mb-20" role="alert">
            <div className="d-flex align-items-center">
              <svg
                className="me-2"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#0dcaf0"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M12 16v-4"
                  stroke="#0dcaf0"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 8h.01"
                  stroke="#0dcaf0"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {infoMessage}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success mb-20" role="alert">
            <div className="d-flex align-items-center">
              <svg
                className="me-2"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#198754"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="#198754"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mb-20" role="alert">
            <div className="d-flex align-items-center">
              <svg
                className="me-2"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#dc3545"
                  strokeWidth="2"
                  fill="none"
                />
                <line
                  x1="15"
                  y1="9"
                  x2="9"
                  y2="15"
                  stroke="#dc3545"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="9"
                  y1="9"
                  x2="15"
                  y2="15"
                  stroke="#dc3545"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

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
                      src={image.preview || image.url}
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
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your blog content here..."
                  className={`textarea ${errors.content ? "error" : ""}`}
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
                  {/* If current status is draft, show all options */}
                  {formData.status === "draft" && (
                    <>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </>
                  )}

                  {/* If current status is published, only show published and archived */}
                  {formData.status === "published" && (
                    <>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </>
                  )}

                  {/* If current status is archived, only show published and archived */}
                  {formData.status === "archived" && (
                    <>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </>
                  )}
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
            {isSubmitting ? "Updating..." : "Update Blog"}
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
