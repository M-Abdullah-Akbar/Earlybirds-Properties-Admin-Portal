"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { propertyAPI, uploadAPI } from "@/utlis/api";

export default function EditProperty({ propertyId }) {
  console.log("EditProperty: Component rendered with propertyId:", propertyId);

  const router = useRouter();
  const actualPropertyId = propertyId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
    price: "",
    currency: "AED",
    priceType: "total",
    listingType: "",
    status: "available",
    featured: false,
    location: {
      address: "",
      emirate: "",
      area: "",
      country: "UAE",
      neighborhood: "",
    },
    details: {
      bedrooms: "",
      bathrooms: "",
      area: "",
      areaUnit: "sqft",
      floorLevel: "",
      totalFloors: "",
      landArea: "",
      yearBuilt: "",
      parking: {
        available: false,
        type: "",
        spaces: 0,
      },
    },
    amenities: [],
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [emirates, setEmirates] = useState([]);
  const [areas, setAreas] = useState([]);
  const [amenities, setAmenities] = useState([]);

  // Constants from backend
  const propertyStatuses = [
    "draft",
    "pending",
    "available",
    "sold",
    "rented",
    "archived",
  ];
  const listingTypes = ["sale", "rent", "off plan"];
  const priceTypes = ["total", "per_sqft", "per_sqm"];
  const areaUnits = ["sqft", "sqm"];
  const parkingTypes = ["covered", "open", "garage", "street"];
  const currencies = ["AED"];

  // Load property data
  useEffect(() => {
    const fetchProperty = async () => {
      if (!actualPropertyId) {
        alert("Property ID not provided!");
        router.push("/admin/property-management");
        return;
      }

      try {
        setIsLoading(true);
        console.log(
          "EditProperty: Calling propertyAPI.getProperty with ID:",
          actualPropertyId
        );
        const response = await propertyAPI.getProperty(actualPropertyId);
        console.log("EditProperty: API response:", response);

        // Check response structure
        if (!response.success) {
          console.error("EditProperty: API call failed:", response.error);
          throw new Error(response.error || "Failed to fetch property");
        }

        if (!response.data || !response.data.property) {
          console.error("EditProperty: Invalid response structure:", response);
          throw new Error("Invalid response structure from API");
        }

        const property = response.data.property;
        console.log("EditProperty: Property data received:", property);

        // Transform backend data to form format
        setFormData({
          title: property.title || "",
          description: property.description || "",
          propertyType: property.propertyType || "",
          price: property.price || "",
          currency: property.currency || "AED",
          priceType: property.priceType || "total",
          listingType: property.listingType || "",
          status: property.status || "available",
          featured: property.featured || false,
          location: {
            address: property.location?.address || "",
            emirate: property.location?.emirate || "",
            area: property.location?.area || "",
            country: property.location?.country || "UAE",
            neighborhood: property.location?.neighborhood || "",
          },
          details: {
            bedrooms: property.details?.bedrooms || "",
            bathrooms: property.details?.bathrooms || "",
            area: property.details?.area || "",
            areaUnit: property.details?.areaUnit || "sqft",
            floorLevel: property.details?.floorLevel || "",
            totalFloors: property.details?.totalFloors || "",
            landArea: property.details?.landArea || "",
            yearBuilt: property.details?.yearBuilt || "",
            parking: {
              available: property.details?.parking?.available || false,
              type: property.details?.parking?.type || "",
              spaces: property.details?.parking?.spaces || 0,
            },
          },
          amenities: property.amenities || [],
          images: property.images || [],
        });

        // Set emirates and fetch areas
        setEmirates([
          "Dubai",
          "Abu Dhabi",
          "Sharjah",
          "Ajman",
          "Ras Al Khaimah",
          "Fujairah",
          "Umm Al Quwain",
        ]);

        if (property.location?.emirate) {
          fetchAreas(property.location.emirate);
        }

        if (property.propertyType) {
          fetchAmenities(property.propertyType);
        }

        // Fetch property types
        const typesResponse = await propertyAPI.getPropertyTypes();
        if (typesResponse.success && typesResponse.data && Array.isArray(typesResponse.data.propertyTypes)) {
          const propertyTypeNames = typesResponse.data.propertyTypes.map(type => type.name);
          setPropertyTypes(propertyTypeNames);
        } else {
          setPropertyTypes([
            "apartment", "villa", "house", "townhouse", "penthouse", 
            "studio", "duplex", "commercial", "land"
          ]);
        }

      } catch (error) {
        console.error("Error loading property:", error);
        setErrors((prev) => ({
          ...prev,
          load: "Failed to load property data",
        }));
      } finally {
        console.log("EditProperty: Setting loading to false");
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [actualPropertyId, router]);

  // Fetch areas when emirate changes
  const fetchAreas = async (emirate) => {
    if (emirate) {
      try {
        const areasResponse = await propertyAPI.getAreasForEmirate(emirate);
        if (areasResponse.success) {
          setAreas(areasResponse.data?.areas || []);
        }
      } catch (error) {
        console.error("Error fetching areas:", error);
      }
    } else {
      setAreas([]);
    }
  };

  // Fetch amenities when property type changes
  const fetchAmenities = async (propertyType) => {
    if (propertyType) {
      try {
        const amenitiesResponse = await propertyAPI.getAmenitiesForPropertyType(
          propertyType
        );
        if (amenitiesResponse.success) {
          setAmenities(amenitiesResponse.data?.all || []);
        }
      } catch (error) {
        console.error("Error fetching amenities:", error);
      }
    } else {
      setAmenities([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child, subChild] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: subChild
            ? {
                ...prev[parent]?.[child],
                [subChild]: type === "checkbox" ? checked : value,
              }
            : type === "checkbox"
            ? checked
            : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Handle dependent field updates
    if (name === "location.emirate") {
      fetchAreas(value);
    }
    if (name === "propertyType") {
      fetchAmenities(value);
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Create image objects with file references for API
    const newImages = files.map((file, index) => ({
      file: file,
      preview: URL.createObjectURL(file),
      order: formData.images.length + index,
      isMain: false, // New images should never be main by default
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const setMainImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isMain: i === index
      }))
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Property title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.propertyType) {
      newErrors.propertyType = "Property type is required";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be a valid positive number";
    }

    if (!formData.listingType) {
      newErrors.listingType = "Listing type is required";
    }

    if (!formData.location.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.location.emirate) {
      newErrors.emirate = "Emirate is required";
    }

    if (!formData.location.area) {
      newErrors.area = "Area is required";
    }

    if (!formData.details.bedrooms) {
      newErrors.bedrooms = "Number of bedrooms is required";
    } else if (isNaN(formData.details.bedrooms) || parseInt(formData.details.bedrooms) < 0) {
      newErrors.bedrooms = "Bedrooms must be a valid non-negative number";
    }

    if (!formData.details.bathrooms) {
      newErrors.bathrooms = "Number of bathrooms is required";
    } else if (isNaN(formData.details.bathrooms) || parseInt(formData.details.bathrooms) < 0) {
      newErrors.bathrooms = "Bathrooms must be a valid non-negative number";
    }

    if (!formData.details.area) {
      newErrors.area = "Area size is required";
    } else if (isNaN(formData.details.area) || parseFloat(formData.details.area) <= 0) {
      newErrors.area = "Area must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // First, handle image uploads if there are new images
      let updatedImages = [...formData.images];
      
      // Check if there are new images to upload (images with file property)
      const newImages = formData.images.filter(image => image.file);
      
      if (newImages.length > 0) {
        try {
          const formDataImages = new FormData();
          newImages.forEach((image, index) => {
            formDataImages.append('images', image.file);
          });
          
          console.log("Uploading new images...");
          const uploadResponse = await uploadAPI.uploadImages(formDataImages);
          
          if (uploadResponse.success && uploadResponse.data && uploadResponse.data.images) {
            const uploadedImages = uploadResponse.data.images;
            console.log("New images uploaded successfully:", uploadedImages);
            
            // Replace new images with uploaded image data
            let imageIndex = 0;
            updatedImages = formData.images.map(image => {
              if (image.file) {
                // Replace new image with uploaded image data
                const uploadedImage = uploadedImages[imageIndex];
                imageIndex++;
                
                // Ensure the uploaded image has proper properties
                return {
                  ...uploadedImage,
                  order: image.order,
                  isMain: image.isMain
                };
              }
              return image;
            });

            // Ensure only one image is marked as main
            const mainImages = updatedImages.filter(img => img.isMain);
            if (mainImages.length > 1) {
              // Keep only the first main image, set others to false
              let foundMain = false;
              updatedImages = updatedImages.map(img => {
                if (img.isMain && !foundMain) {
                  foundMain = true;
                  return img;
                } else if (img.isMain) {
                  return { ...img, isMain: false };
                }
                return img;
              });
            } else if (mainImages.length === 0 && updatedImages.length > 0) {
              // If no main image, set the first one as main
              updatedImages[0].isMain = true;
            }
          } else {
            throw new Error("Failed to upload new images");
          }
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          setErrors((prev) => ({
            ...prev,
            submit: "Failed to upload new images. Please try again.",
          }));
          setSaving(false);
          return;
        }
      }

      // Filter out any images that were removed (keep only existing images and newly uploaded ones)
      updatedImages = updatedImages.filter(image => image && (image.url || image._id || image.id));

      // Prepare property data for API
      const propertyData = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        price: parseFloat(formData.price),
        currency: formData.currency,
        priceType: formData.priceType,
        listingType: formData.listingType,
        status: formData.status,
        featured: formData.featured,
        location: formData.location,
        details: formData.details,
        amenities: formData.amenities,
        images: updatedImages, // Include the updated images array
      };

      console.log("EditProperty: Submitting property data:", propertyData);
      console.log("EditProperty: Images being sent:", updatedImages);
      console.log("EditProperty: Original images:", formData.images);
      console.log("EditProperty: New images count:", newImages.length);

      // Update property
      const response = await propertyAPI.updateProperty(
        actualPropertyId,
        propertyData
      );

      if (response.success) {
        router.push("/admin/property-management");
      } else {
        setErrors((prev) => ({
          ...prev,
          submit: response.error || "Failed to update property",
        }));
      }
    } catch (error) {
      console.error("Error updating property:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      let errorMessage = "Failed to update property";

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
            return; // Don't show alert, errors are now displayed on fields
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
      }

      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this property? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await propertyAPI.deleteProperty(actualPropertyId);

      if (response.success) {
        router.push("/admin/property-management");
      } else {
        setErrors((prev) => ({
          ...prev,
          delete: response.error || "Failed to delete property",
        }));
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      setErrors((prev) => ({
        ...prev,
        delete: "Error deleting property. Please try again.",
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner wrap-dashboard-content">
          <div className="widget-box-2 wd-listing mb-20">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-3">Loading property data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content w-100">
      <div className="main-content-inner wrap-dashboard-content">
        <div className="widget-box-2 wd-listing mb-20">
          <div className="d-flex justify-content-between align-items-center mb-20">
            <h3 className="title">Edit Property</h3>
            <div className="d-flex gap-10">
              <a
                href="/admin/property-management"
                className="tf-btn bg-color-secondary pd-13"
              >
                Back to Properties
              </a>
              <button
                onClick={handleDelete}
                className="tf-btn bg-color-danger pd-13"
              >
                Delete Property
              </button>
            </div>
          </div>

          {errors.load && (
            <div className="alert alert-danger mb-20">{errors.load}</div>
          )}

          {errors.submit && (
            <div className="alert alert-danger mb-20">{errors.submit}</div>
          )}

          {errors.delete && (
            <div className="alert alert-danger mb-20">{errors.delete}</div>
          )}

          <form onSubmit={handleSubmit} className="property-form">

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
                      xmlns="http://http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.625 14.375V17.1875C13.625 17.705 13.205 18.125 12.6875 18.125H4.5625C4.31386 18.125 4.0754 18.0262 3.89959 17.8504C3.72377 17.6746 3.625 17.4361 3.625 17.1875V6.5625C3.625 6.045 4.045 5.625 4.5625 5.625H6.125C6.54381 5.62472 6.96192 5.65928 7.375 5.72834M13.625 14.375H16.4375C16.955 14.375 17.375 13.955 17.375 13.4375V9.375C17.375 5.65834 14.6725 2.57417 11.125 1.97834C10.7119 1.90928 10.2938 1.87472 9.875 1.875H8.3125C7.795 1.875 7.375 2.295 7.375 2.8125V5.72834M13.625 14.375H8.3125C8.06386 14.375 7.8254 14.2762 7.64959 14.1004C7.47377 13.9246 7.375 13.6861 7.375 13.4375V5.72834M17.375 11.25V9.6875C17.375 8.94158 17.0787 8.22621 16.5512 7.69876C16.0238 7.17132 15.3084 6.875 14.5625 6.875H13.3125C13.0639 6.875 12.8254 6.77623 12.6496 6.60041C12.4738 6.4246 12.375 6.18614 12.375 5.9375V4.6875C12.375 4.31816 12.3023 3.95243 12.1609 3.6112C12.0196 3.26998 11.8124 2.95993 11.5512 2.69876C11.2901 2.4376 10.98 2.23043 10.6388 2.08909C10.2976 1.94775 9.93184 1.875 9.5625 1.875H8.625"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Select photos
                    <input 
                      type="file" 
                      className="ip-file" 
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </a>
                  <p className="file-name fw-5">
                    or drag photos here <br />
                    <span>(Up to 10 photos)</span>
                  </p>
                </div>
              </div>

              {errors.images && <span className="error-text">{errors.images}</span>}

                            {/* Image Preview */}
              {Array.isArray(formData.images) && formData.images.length > 0 && (
                <div className="box-img-upload">
                  {formData.images.map((image, index) => (
                    <div key={index} className="item-upload file-delete">
                      <Image
                        alt="img"
                        width={615}
                        height={405}
                        src={image.preview || image.url || image}
                      />
                      <span 
                        className="icon icon-trashcan1 remove-file"
                        onClick={() => removeImage(index)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="widget-box-2 mb-20">
              <h5 className="title">Basic Information</h5>
              <div className="box-info-property">
                <fieldset className="box box-fieldset">
                  <label htmlFor="title">
                    Title:<span>*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className={`form-control ${errors.title ? "error" : ""}`}
                    placeholder="Enter property title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                  {errors.title && (
                    <span className="error-text">{errors.title}</span>
                  )}
                </fieldset>

                <fieldset className="box box-fieldset">
                  <label htmlFor="description">Description:</label>
                  <textarea
                    name="description"
                    className={`textarea ${errors.description ? "error" : ""}`}
                    placeholder="Your Description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                  {errors.description && (
                    <span className="error-text">{errors.description}</span>
                  )}
                </fieldset>

                <div className="box grid-layout-3 gap-30">
                  <fieldset className="box-fieldset">
                    <label htmlFor="propertyType">
                      Property Type:<span>*</span>
                    </label>
                    <select
                      name="propertyType"
                      className={`form-control ${
                        errors.propertyType ? "error" : ""
                      }`}
                      value={formData.propertyType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Property Type</option>
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.propertyType && (
                      <span className="error-text">{errors.propertyType}</span>
                    )}
                  </fieldset>

                  <fieldset className="box-fieldset">
                    <label htmlFor="listingType">
                      Listing Type:<span>*</span>
                    </label>
                    <select
                      name="listingType"
                      className={`form-control ${
                        errors.listingType ? "error" : ""
                      }`}
                      value={formData.listingType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Listing Type</option>
                      {listingTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.listingType && (
                      <span className="error-text">{errors.listingType}</span>
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
                      {propertyStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </fieldset>
                </div>
              </div>
            </div>

        

            {/* Location Information */}
            <div className="widget-box-2 mb-20">
              <h5 className="title">Location Information</h5>
              <div className="box-info-property">
                <fieldset className="box box-fieldset">
                  <label htmlFor="address">
                    Address:<span>*</span>
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    className={`form-control ${errors.address ? "error" : ""}`}
                    placeholder="Enter property address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                  />
                  {errors.address && (
                    <span className="error-text">{errors.address}</span>
                  )}
                </fieldset>

                <div className="box grid-layout-2 gap-30">
                  <fieldset className="box-fieldset">
                    <label htmlFor="emirate">
                      Emirate:<span>*</span>
                    </label>
                    <select
                      name="location.emirate"
                      className={`form-control ${
                        errors.emirate ? "error" : ""
                      }`}
                      value={formData.location.emirate}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Emirate</option>
                      {emirates.map((emirate) => (
                        <option key={emirate} value={emirate}>
                          {emirate}
                        </option>
                      ))}
                    </select>
                    {errors.emirate && (
                      <span className="error-text">{errors.emirate}</span>
                    )}
                  </fieldset>

                  <fieldset className="box-fieldset">
                    <label htmlFor="area">
                      Area:<span>*</span>
                    </label>
                    <select
                      name="location.area"
                      className={`form-control ${errors.area ? "error" : ""}`}
                      value={formData.location.area}
                      onChange={handleInputChange}
                      disabled={!formData.location.emirate}
                    >
                      <option value="">Select Area</option>
                      {areas.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                    {errors.area && (
                      <span className="error-text">{errors.area}</span>
                    )}
                  </fieldset>
                </div>

                <fieldset className="box box-fieldset">
                  <label htmlFor="neighborhood">Neighborhood:</label>
                  <input
                    type="text"
                    name="location.neighborhood"
                    className="form-control"
                    placeholder="Enter neighborhood (optional)"
                    value={formData.location.neighborhood}
                    onChange={handleInputChange}
                  />
                </fieldset>
              </div>
            </div>

            {/* Price Section */}
            <div className="widget-box-2 mb-20">
              <h3 className="title">Price</h3>
              <div className="box-price-property">
                <div className="box grid-3 gap-30">
                  <fieldset className="box-fieldset">
                    <label htmlFor="price">
                      Price:<span>*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      className={`form-control ${errors.price ? "error" : ""}`}
                      placeholder="Enter price"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                    {errors.price && (
                      <span className="error-text">{errors.price}</span>
                    )}
                  </fieldset>

                  <fieldset className="box-fieldset">
                    <label htmlFor="currency">Currency:</label>
                    <select
                      name="currency"
                      className="form-control"
                      value={formData.currency}
                      onChange={handleInputChange}
                    >
                      {currencies.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </fieldset>

                  <fieldset className="box-fieldset">
                    <label htmlFor="priceType">Price Type:</label>
                    <select
                      name="priceType"
                      className="form-control"
                      value={formData.priceType}
                      onChange={handleInputChange}
                    >
                      {priceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.replace("_", " ").charAt(0).toUpperCase() +
                            type.replace("_", " ").slice(1)}
                        </option>
                      ))}
                    </select>
                  </fieldset>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="widget-box-2 mb-20">
              <h3 className="title">Property Details</h3>
              <div className="box grid-layout-3 gap-30">
                <fieldset className="box-fieldset">
                  <label htmlFor="bedrooms">
                    Bedrooms:<span>*</span>
                  </label>
                  <input
                    type="number"
                    name="details.bedrooms"
                    className={`form-control ${errors.bedrooms ? "error" : ""}`}
                    placeholder="Number of bedrooms"
                    value={formData.details.bedrooms}
                    onChange={handleInputChange}
                  />
                  {errors.bedrooms && (
                    <span className="error-text">{errors.bedrooms}</span>
                  )}
                </fieldset>

                <fieldset className="box-fieldset">
                  <label htmlFor="bathrooms">
                    Bathrooms:<span>*</span>
                  </label>
                  <input
                    type="number"
                    name="details.bathrooms"
                    className={`form-control ${
                      errors.bathrooms ? "error" : ""
                    }`}
                    placeholder="Number of bathrooms"
                    value={formData.details.bathrooms}
                    onChange={handleInputChange}
                  />
                  {errors.bathrooms && (
                    <span className="error-text">{errors.bathrooms}</span>
                  )}
                </fieldset>

                <fieldset className="box-fieldset">
                  <label htmlFor="area">
                    Area Size:<span>*</span>
                  </label>
                  <input
                    type="number"
                    name="details.area"
                    className={`form-control ${errors.area ? "error" : ""}`}
                    placeholder="Area size"
                    value={formData.details.area}
                    onChange={handleInputChange}
                  />
                  {errors.area && (
                    <span className="error-text">{errors.area}</span>
                  )}
                </fieldset>
              </div>

              <div className="box grid-layout-3 gap-30">
                <fieldset className="box-fieldset">
                  <label htmlFor="areaUnit">Area Unit:</label>
                  <select
                    name="details.areaUnit"
                    className="form-control"
                    value={formData.details.areaUnit}
                    onChange={handleInputChange}
                  >
                    {areaUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </fieldset>

                <fieldset className="box-fieldset">
                  <label htmlFor="floorLevel">Floor Level:</label>
                  <input
                    type="text"
                    name="details.floorLevel"
                    className="form-control"
                    placeholder="Floor level (optional)"
                    value={formData.details.floorLevel}
                    onChange={handleInputChange}
                  />
                </fieldset>

                <fieldset className="box-fieldset">
                  <label htmlFor="totalFloors">Total Floors:</label>
                  <input
                    type="number"
                    name="details.totalFloors"
                    className="form-control"
                    placeholder="Total floors (optional)"
                    value={formData.details.totalFloors}
                    onChange={handleInputChange}
                  />
                </fieldset>
              </div>

              <div className="box grid-layout-3 gap-30">
                <fieldset className="box-fieldset">
                  <label htmlFor="landArea">Land Area:</label>
                  <input
                    type="number"
                    name="details.landArea"
                    className="form-control"
                    placeholder="Land area (optional)"
                    value={formData.details.landArea}
                    onChange={handleInputChange}
                  />
                </fieldset>

                <fieldset className="box-fieldset">
                  <label htmlFor="yearBuilt">Year Built:</label>
                  <input
                    type="number"
                    name="details.yearBuilt"
                    className="form-control"
                    placeholder="Year built (optional)"
                    value={formData.details.yearBuilt}
                    onChange={handleInputChange}
                  />
                </fieldset>

                <fieldset className="box-fieldset">
                  <label htmlFor="parkingAvailable">Parking Available:</label>
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      name="details.parking.available"
                      id="parkingAvailable"
                      checked={formData.details.parking.available}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="parkingAvailable" className="checkbox-label">
                      Available
                    </label>
                  </div>
                </fieldset>
              </div>

              {formData.details.parking.available && (
                <div className="box grid-layout-2 gap-30">
                  <fieldset className="box-fieldset">
                    <label htmlFor="parkingType">Parking Type:</label>
                    <select
                      name="details.parking.type"
                      className="form-control"
                      value={formData.details.parking.type}
                      onChange={handleInputChange}
                    >
                      <option value="">Select parking type</option>
                      {parkingTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </fieldset>

                  <fieldset className="box-fieldset">
                    <label htmlFor="parkingSpaces">Parking Spaces:</label>
                    <input
                      type="number"
                      name="details.parking.spaces"
                      className="form-control"
                      placeholder="Number of parking spaces"
                      value={formData.details.parking.spaces}
                      onChange={handleInputChange}
                    />
                  </fieldset>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="widget-box-2 mb-20">
              <h5 className="title">Amenities</h5>
              <div className="box-amenities-property">
                <div className="amenities-grid">
                  {amenities.map((amenity) => (
                    <label key={amenity} className="amenity-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Property */}
            <div className="widget-box-2 mb-20">
              <h5 className="title">Featured Property</h5>
              <div className="box-radio-check">
                <div className="radio-item">
                  <label>
                    <span className="text-1">Mark as Featured Property</span>
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
                disabled={saving}
              >
                {saving ? "Updating Property..." : "Update Property"}
              </button>
              <a
                href="/admin/property-management"
                className="tf-btn style-border pd-10"
              >
                Cancel
              </a>
            </div>
          </form>
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
