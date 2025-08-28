"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { propertyAPI, uploadAPI, adminUtils } from "@/utlis/api";
import { safeLocalStorage } from "@/utlis/clientUtils";
import { ToastContainer, toast } from "react-toastify";
import RichTextEditor from "../common/RichTextEditor";

export default function AddProperty() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
    price: "",
    currency: "AED",
    priceType: "total",
    listingType: "",
    status: "draft",
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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [emirates, setEmirates] = useState([]);
  const [areas, setAreas] = useState([]);
  const [amenities, setAmenities] = useState([]);
  // Constants from adminUtils
  const propertyStatuses = adminUtils.getPropertyStatuses();
  const listingTypes = adminUtils.getListingTypes();
  const priceTypes = adminUtils.getPriceTypes();
  const areaUnits = adminUtils.getAreaUnits();
  const parkingTypes = adminUtils.getParkingTypes();
  const currencies = adminUtils.getCurrencies();

  // Helper function to determine if bedrooms should be shown (prevents hydration issues)
  const shouldShowBedrooms = () => {
    // Always return the same logic regardless of mount state to prevent hydration mismatch
    return (
      formData.propertyType !== "office" && formData.propertyType !== "studio"
    );
  };

  // Helper function to determine if we're in office/studio mode (prevents hydration issues)
  const isOfficeOrStudio = () => {
    // Always return the same logic regardless of mount state to prevent hydration mismatch
    return (
      formData.propertyType === "office" || formData.propertyType === "studio"
    );
  };

  // Helper function to determine if totalFloors should be shown (prevents hydration issues)
  const shouldShowTotalFloors = () => {
    // totalFloors should always be shown for all property types - it's optional
    return true;
  };

  // Helper function to determine if floorLevel should be shown (prevents hydration issues)
  const shouldShowFloorLevel = () => {
    // floorLevel should NOT be shown for villa and townhouse only
    return (
      formData.propertyType !== "villa" && formData.propertyType !== "townhouse"
    );
  };

  // Helper function to determine if landArea should be shown (prevents hydration issues)
  const shouldShowLandArea = () => {
    // landArea should be shown for villa, townhouse, and office only
    return (
      formData.propertyType === "villa" ||
      formData.propertyType === "townhouse" ||
      formData.propertyType === "office"
    );
  };

  // Helper function to determine if we're in villa/townhouse mode (for floorLevel)
  const isVillaTownhouse = () => {
    return (
      formData.propertyType === "villa" || formData.propertyType === "townhouse"
    );
  };

  // Helper function to determine if we're in apartment/penthouse/studio mode (for landArea)
  const isApartmentPenthouseStudio = () => {
    return (
      formData.propertyType === "apartment" ||
      formData.propertyType === "penthouse" ||
      formData.propertyType === "studio"
    );
  };

  // Helper function to determine if we're in villa/townhouse/penthouse mode (for layout)
  const isVillaTownhousePenthouse = () => {
    return (
      formData.propertyType === "villa" ||
      formData.propertyType === "townhouse" ||
      formData.propertyType === "penthouse"
    );
  };

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated
        const adminToken = safeLocalStorage.getItem("admin_token");
        if (!adminToken) {
          console.error("No admin token found. User not authenticated.");
          router.push("/admin/login");
          return;
        }

        console.log("Admin token found, fetching initial data...");

        // Fetch property types from API
        const typesResponse = await propertyAPI.getPropertyTypes();
        console.log("Property types API response:", typesResponse);

        if (
          typesResponse.success &&
          typesResponse.data &&
          Array.isArray(typesResponse.data.propertyTypes)
        ) {
          // Extract the name property from each property type object
          const propertyTypeNames = typesResponse.data.propertyTypes.map(
            (type) => type.name
          );
          setPropertyTypes(propertyTypeNames);
          console.log("Property types set successfully:", propertyTypeNames);
        } else {
          console.warn(
            "Property types response structure is incorrect:",
            typesResponse
          );
          // Set fallback property types if API fails
          setPropertyTypes(adminUtils.getPropertyTypes());
        }

        // Set emirates from adminUtils
        setEmirates(adminUtils.getEmirates());
      } catch (error) {
        console.error("Error fetching initial data:", error);

        // Check if it's an authentication error
        if (error.response?.status === 401) {
          safeLocalStorage.removeItem("admin_token");
          safeLocalStorage.removeItem("admin_user");
          router.push("/admin/login");
          return;
        }

        // Set fallback values if API fails
        setPropertyTypes(adminUtils.getPropertyTypes());
        setEmirates(adminUtils.getEmirates());
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [router]);

  // Fetch areas when emirate changes
  useEffect(() => {
    const fetchAreas = async () => {
      if (formData.location.emirate) {
        try {
          // Check if user is authenticated
          const adminToken = safeLocalStorage.getItem("admin_token");
          if (!adminToken) {
            console.error(
              "No admin token found when fetching areas. User not authenticated."
            );
            setAreas([]);
            return;
          }

          console.log("Fetching areas for emirate:", formData.location.emirate);
          const areasResponse = await propertyAPI.getAreasForEmirate(
            formData.location.emirate
          );
          console.log("Areas API response:", areasResponse);

          if (
            areasResponse.success &&
            areasResponse.data &&
            Array.isArray(areasResponse.data.areas)
          ) {
            setAreas(areasResponse.data.areas);
            console.log("Areas set successfully:", areasResponse.data.areas);
          } else {
            console.warn(
              "Areas response structure is incorrect:",
              areasResponse
            );
            // Use fallback areas from adminUtils
            setAreas(adminUtils.getAreasForEmirate(formData.location.emirate));
          }
        } catch (error) {
          console.error("Error fetching areas:", error);

          // Check if it's an authentication error
          if (error.response?.status === 401) {
            safeLocalStorage.removeItem("admin_token");
            safeLocalStorage.removeItem("admin_user");
            router.push("/admin/login");
            return;
          }

          // Use fallback areas from adminUtils
          setAreas(adminUtils.getAreasForEmirate(formData.location.emirate));
        }
      } else {
        setAreas([]);
      }
    };

    fetchAreas();
  }, [formData.location.emirate, router]);

  // Fetch amenities when property type changes
  useEffect(() => {
    const fetchAmenities = async () => {
      if (formData.propertyType) {
        try {
          // Check if user is authenticated
          const adminToken = safeLocalStorage.getItem("admin_token");
          if (!adminToken) {
            console.error(
              "No admin token found when fetching amenities. User not authenticated."
            );
            setAmenities([]);
            return;
          }

          console.log(
            "Fetching amenities for property type:",
            formData.propertyType
          );
          const amenitiesResponse =
            await propertyAPI.getAmenitiesForPropertyType(
              formData.propertyType
            );
          console.log("Amenities API response:", amenitiesResponse);

          if (
            amenitiesResponse.success &&
            amenitiesResponse.data &&
            Array.isArray(amenitiesResponse.data.all)
          ) {
            setAmenities(amenitiesResponse.data.all);
            console.log(
              "Amenities set successfully:",
              amenitiesResponse.data.all
            );
          } else {
            console.warn(
              "Amenities response structure is incorrect:",
              amenitiesResponse
            );
            // Use fallback amenities from adminUtils
            setAmenities(
              adminUtils.getAmenitiesForPropertyType(formData.propertyType)
            );
          }
        } catch (error) {
          console.error("Error fetching amenities:", error);

          // Check if it's an authentication error
          if (error.response?.status === 401) {
            safeLocalStorage.removeItem("admin_token");
            safeLocalStorage.removeItem("admin_user");
            router.push("/admin/login");
            return;
          }

          // Use fallback amenities from adminUtils
          setAmenities(
            adminUtils.getAmenitiesForPropertyType(formData.propertyType)
          );
        }
      } else {
        setAmenities([]);
      }
    };

    fetchAmenities();
  }, [formData.propertyType, router]);

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
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };

        // Clear bedrooms when property type changes to office or studio
        if (
          name === "propertyType" &&
          (value === "office" || value === "studio")
        ) {
          newFormData.details = {
            ...newFormData.details,
            bedrooms: "",
          };
        }

        // Clear floorLevel when property type changes to villa or townhouse
        if (
          name === "propertyType" &&
          (value === "villa" || value === "townhouse")
        ) {
          newFormData.details = {
            ...newFormData.details,
            floorLevel: "",
          };
        }

        // Clear landArea when property type changes to apartment, penthouse, or studio
        if (
          name === "propertyType" &&
          (value === "apartment" || value === "penthouse" || value === "studio")
        ) {
          newFormData.details = {
            ...newFormData.details,
            landArea: "",
          };
        }

        return newFormData;
      });
    }

    // Clear error when user starts typing
    let errorKey = name;

    // Map field names to their corresponding error keys
    if (name === "location.area") {
      errorKey = "locationArea";
    } else if (name.includes(".")) {
      const parts = name.split(".");
      errorKey = parts[parts.length - 1]; // Use the last part for other nested fields
    }

    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: Array.isArray(prev.amenities)
        ? prev.amenities.includes(amenity)
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity]
        : [amenity],
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Create image objects with file references for API
    const newImages = files.map((file, index) => ({
      file: file,
      preview: URL.createObjectURL(file),
      order:
        (Array.isArray(formData.images) ? formData.images.length : 0) + index,
      isMain:
        (!Array.isArray(formData.images) || formData.images.length === 0) &&
        index === 0,
    }));

    setFormData((prev) => ({
      ...prev,
      images: Array.isArray(prev.images)
        ? [...prev.images, ...newImages]
        : newImages,
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: Array.isArray(prev.images)
        ? prev.images.filter((_, i) => i !== index)
        : [],
    }));
  };

  const validateForm = () => {
    // Let the server handle all validation for consistency
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    toast.info("Processing your request...", { autoClose: 2000 });

    try {
      // First, upload images if any
      let uploadedImages = [];
      if (Array.isArray(formData.images) && formData.images.length > 0) {
        const formDataImages = new FormData();
        formData.images.forEach((image, index) => {
          formDataImages.append("images", image.file);
        });

        console.log("Uploading images...");
        const uploadResponse = await uploadAPI.uploadImages(formDataImages);

        if (
          uploadResponse.success &&
          uploadResponse.data &&
          uploadResponse.data.images
        ) {
          uploadedImages = uploadResponse.data.images;
          console.log("Images uploaded successfully:", uploadedImages);
        } else {
          throw new Error("Failed to upload images");
        }
      }

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
        featured: formData.featured || false,
        location: {
          address: formData.location.address.trim(),
          emirate: formData.location.emirate,
          area: formData.location.area,
          country: formData.location.country,
          neighborhood: formData.location.neighborhood?.trim() || "",
        },
        details: {
          // Only include bedrooms for property types other than office and studio
          ...(shouldShowBedrooms() && {
            bedrooms: parseInt(formData.details.bedrooms),
          }),
          bathrooms: parseInt(formData.details.bathrooms),
          area: parseFloat(formData.details.area),
          areaUnit: formData.details.areaUnit,
          // Only include floorLevel for property types other than villa, townhouse, penthouse
          ...(shouldShowFloorLevel() &&
            formData.details.floorLevel && {
              floorLevel: formData.details.floorLevel,
            }),
          // Include totalFloors if provided (optional for all property types)
          ...(formData.details.totalFloors && {
            totalFloors: parseInt(formData.details.totalFloors),
          }),
          landArea: formData.details.landArea
            ? parseFloat(formData.details.landArea)
            : null,
          yearBuilt: formData.details.yearBuilt
            ? parseInt(formData.details.yearBuilt)
            : null,
          parking: {
            available: formData.details.parking.available,
            type: formData.details.parking.type || null,
            spaces: formData.details.parking.spaces || 0,
          },
        },
        amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
        images: uploadedImages,
      };

      // Log the data being sent for debugging
      console.log("AddProperty: Property data being sent:", propertyData);
      console.log("AddProperty: Images count:", uploadedImages.length);

      // Create property using the appropriate API based on whether images are present
      let response;
      if (uploadedImages.length > 0) {
        // Use the original endpoint if images are present
        response = await propertyAPI.createProperty(propertyData);
      } else {
        // Use the new endpoint for properties without images
        response = await propertyAPI.createPropertyWithoutImages(propertyData);
      }
      

      console.log("API Response:", response);

      if (response.success) {
        // Show success notification
        toast.success("Property added successfully!");
        // Redirect after a short delay to allow the user to see the notification
        setTimeout(() => {
          router.push("/admin/property-management");
        }, 1500);
      } else {
        console.log("Response failed, checking for validation errors...");
        console.log("Response details:", response.details);

        // Handle backend validation errors
        if (response.details && Array.isArray(response.details)) {
          console.log("Found validation details, mapping to field errors...");
          const fieldErrors = {};
          response.details.forEach((detail) => {
            console.log("Processing detail:", detail);

            // Map backend field names to frontend field names if needed
            let fieldName = detail.field;

            // Map backend field names to frontend field names, preserving nested structure for unique keys
            if (fieldName === "propertyType") fieldName = "propertyType";
            else if (fieldName === "listingType") fieldName = "listingType";
            else if (fieldName === "location.emirate") fieldName = "emirate";
            else if (fieldName === "location.area") fieldName = "locationArea";
            else if (fieldName === "location.address") fieldName = "address";
            else if (fieldName === "details.bedrooms") fieldName = "bedrooms";
            else if (fieldName === "details.bathrooms") fieldName = "bathrooms";
            else if (fieldName === "details.area") fieldName = "area";
            else if (fieldName === "details.totalFloors")
              fieldName = "totalFloors";
            else if (fieldName === "details.floorLevel")
              fieldName = "floorLevel";
            else if (fieldName === "details.landArea") fieldName = "landArea";
            else if (fieldName === "details.parking.type")
              fieldName = "parkingType";
            else if (fieldName === "details.parking.spaces")
              fieldName = "parkingSpaces";
            else if (fieldName === "details.parking.available")
              fieldName = "parkingAvailable";
            // Handle any other nested fields by keeping the full path as fallback
            else if (fieldName.includes(".")) {
              fieldName = fieldName.replace(".", "_"); // Convert dots to underscores for unique keys
            }

            fieldErrors[fieldName] = detail.message;
          });
          console.log("Final field errors:", fieldErrors);
          setErrors(fieldErrors);
        } else {
          setErrors((prev) => ({
            ...prev,
            submit: response.error || "Failed to add property",
          }));
        }
      }
    } catch (error) {
      // Handle validation errors (400) differently from other errors
      if (error.response?.status === 400 && error.response?.data) {
        // This is expected validation error - handle gracefully without console noise
        if (
          error.response.data.details &&
          Array.isArray(error.response.data.details)
        ) {
          const fieldErrors = {};
          error.response.data.details.forEach((detail) => {
            // Map backend field names to frontend field names if needed
            let fieldName = detail.field;

            // Map backend field names to frontend field names, preserving nested structure for unique keys
            if (fieldName === "propertyType") fieldName = "propertyType";
            else if (fieldName === "listingType") fieldName = "listingType";
            else if (fieldName === "location.emirate") fieldName = "emirate";
            else if (fieldName === "location.area") fieldName = "locationArea";
            else if (fieldName === "location.address") fieldName = "address";
            else if (fieldName === "details.bedrooms") fieldName = "bedrooms";
            else if (fieldName === "details.bathrooms") fieldName = "bathrooms";
            else if (fieldName === "details.area") fieldName = "area";
            else if (fieldName === "details.totalFloors")
              fieldName = "totalFloors";
            else if (fieldName === "details.floorLevel")
              fieldName = "floorLevel";
            else if (fieldName === "details.landArea") fieldName = "landArea";
            else if (fieldName === "details.parking.type")
              fieldName = "parkingType";
            else if (fieldName === "details.parking.spaces")
              fieldName = "parkingSpaces";
            else if (fieldName === "details.parking.available")
              fieldName = "parkingAvailable";
            // Handle any other nested fields by keeping the full path as fallback
            else if (fieldName.includes(".")) {
              fieldName = fieldName.replace(".", "_"); // Convert dots to underscores for unique keys
            }

            // If there are multiple errors for the same field, combine them
            if (fieldErrors[fieldName]) {
              fieldErrors[fieldName] += "; " + detail.message;
            } else {
              fieldErrors[fieldName] = detail.message;
            }
          });

          setErrors(fieldErrors);
          return; // Don't process other error types
        }

        // Handle other 400 errors
        let errorMessage = "Please fix the validation errors below";
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }

        setErrors((prev) => ({
          ...prev,
          submit: errorMessage,
        }));
        return;
      }

      // This is an unexpected error - log it for debugging
      console.error("Unexpected error adding property:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      let errorMessage = "Failed to add property";

      // Handle specific error types with user-friendly messages
      if (error.message) {
        if (error.message.includes("CORS Error")) {
          errorMessage =
            "CORS Error: The server is blocking requests from your browser. Please contact support.";
        } else if (error.message.includes("File too large")) {
          errorMessage =
            "File too large: Please compress your images or use smaller files (under 10MB each).";
        } else if (error.message.includes("Network Error")) {
          errorMessage =
            "Network Error: Unable to connect to the server. Please check your internet connection.";
        } else if (error.message.includes("Authentication failed")) {
          errorMessage = "Authentication failed: Please log in again.";
        } else if (error.message.includes("Access denied")) {
          errorMessage =
            "Access denied: You do not have permission to create properties.";
        } else if (error.message.includes("Upload failed")) {
          errorMessage = error.message; // Use the specific upload error message
        } else {
          errorMessage = error.message; // Use the error message from the API
        }
      } else if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
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
      
      // Show error notification for exceptions
      toast.error(errorMessage || "An unexpected error occurred. Please try again.");
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
              <p className="mt-3">Loading property types and areas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content w-100">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="main-content-inner">
        {/* Header */}
        <div className="widget-box-2 mb-20">
          <h3 className="title">Add New Property</h3>
          <p>Create a new property listing with all necessary details</p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="alert alert-danger mb-20">{errors.submit}</div>
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
                    src={image.preview}
                  />
                  <span
                    className="icon icon-trashcan1 remove-file"
                    onClick={() => removeImage(index)}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="widget-box-2 mb-20">
          <h5 className="title">Basic Information</h5>
          <form className="box-info-property">
            <div className="box">
              <fieldset className="box-fieldset">
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
            </div>

            <div className="box">
              <fieldset className="box-fieldset">
                <label htmlFor="description">Description:</label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
                  placeholder="Your Description"
                  error={errors.description}
                />
                {errors.description && (
                  <span className="error-text">{errors.description}</span>
                )}
              </fieldset>
            </div>

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
                  {Array.isArray(propertyTypes) &&
                    propertyTypes.map((type) => (
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
                  {Array.isArray(listingTypes) &&
                    listingTypes.map((type) => (
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
                  {Array.isArray(propertyStatuses) &&
                    propertyStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                </select>
              </fieldset>
            </div>
          </form>
        </div>

        {/* Location Information */}
        <div className="widget-box-2 mb-20">
          <h5 className="title">Location Information</h5>
          <form className="box-info-property">
            <div className="box">
              <fieldset className="box-fieldset">
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
            </div>

            <div className="box grid-layout-2 gap-30">
              <fieldset className="box-fieldset">
                <label htmlFor="emirate">
                  Emirate:<span>*</span>
                </label>
                <select
                  name="location.emirate"
                  className={`form-control ${errors.emirate ? "error" : ""}`}
                  value={formData.location.emirate}
                  onChange={handleInputChange}
                >
                  <option value="">Select Emirate</option>
                  {Array.isArray(emirates) &&
                    emirates.map((emirate) => (
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
                  className={`form-control ${
                    errors.locationArea ? "error" : ""
                  }`}
                  value={formData.location.area}
                  onChange={handleInputChange}
                  disabled={!formData.location.emirate}
                >
                  <option value="">Select Area</option>
                  {Array.isArray(areas) &&
                    areas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                </select>
                {errors.locationArea && (
                  <span className="error-text">{errors.locationArea}</span>
                )}
              </fieldset>
            </div>

            <div className="box">
              <fieldset className="box-fieldset">
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
          </form>
        </div>

        {/* Price Section */}
        <div className="widget-box-2 mb-20">
          <h5 className="title">Price</h5>
          <form className="box-info-property">
            <div className="box grid-layout-3 gap-30">
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
                  {Array.isArray(currencies) &&
                    currencies.map((currency) => (
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
                  {Array.isArray(priceTypes) &&
                    priceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace("_", " ").charAt(0).toUpperCase() +
                          type.replace("_", " ").slice(1)}
                      </option>
                    ))}
                </select>
              </fieldset>
            </div>
          </form>
        </div>

        {/* Property Details */}
        <div className="widget-box-2 mb-20">
          <h5 className="title">Property Details</h5>
          <form className="box-info-property">
            <div className="box grid-layout-3 gap-30">
              {/* Conditionally render bedrooms field - not applicable for office and studio */}
              {shouldShowBedrooms() && (
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
              )}

              <fieldset className="box-fieldset">
                <label htmlFor="bathrooms">
                  Bathrooms:<span>*</span>
                </label>
                <input
                  type="number"
                  name="details.bathrooms"
                  className={`form-control ${errors.bathrooms ? "error" : ""}`}
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

              {/* When bedrooms is hidden (office/studio), move Area Unit up to fill the gap */}
              {isOfficeOrStudio() && (
                <fieldset className="box-fieldset">
                  <label htmlFor="areaUnit">Area Unit:</label>
                  <select
                    name="details.areaUnit"
                    className="form-control"
                    value={formData.details.areaUnit}
                    onChange={handleInputChange}
                  >
                    {Array.isArray(areaUnits) &&
                      areaUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit.toUpperCase()}
                        </option>
                      ))}
                  </select>
                </fieldset>
              )}
            </div>

            <div className="box grid-layout-3 gap-30">
              {/* Show these fields here when bedrooms is visible (not office/studio) */}
              {shouldShowBedrooms() && (
                <>
                  <fieldset className="box-fieldset">
                    <label htmlFor="areaUnit">Area Unit:</label>
                    <select
                      name="details.areaUnit"
                      className="form-control"
                      value={formData.details.areaUnit}
                      onChange={handleInputChange}
                    >
                      {Array.isArray(areaUnits) &&
                        areaUnits.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit.toUpperCase()}
                          </option>
                        ))}
                    </select>
                  </fieldset>

                  {/* Only show Floor Level for property types other than villa, townhouse, penthouse */}
                  {shouldShowFloorLevel() && (
                    <fieldset className="box-fieldset">
                      <label htmlFor="floorLevel">Floor Level:</label>
                      <input
                        type="text"
                        name="details.floorLevel"
                        className={`form-control ${
                          errors.floorLevel ? "error" : ""
                        }`}
                        placeholder="Floor level (optional)"
                        value={formData.details.floorLevel}
                        onChange={handleInputChange}
                      />
                      {errors.floorLevel && (
                        <span className="error-text">{errors.floorLevel}</span>
                      )}
                    </fieldset>
                  )}

                  {/* Show Total Floors here for non-villa/townhouse/penthouse types */}
                  {!isVillaTownhousePenthouse() && (
                    <fieldset className="box-fieldset">
                      <label htmlFor="totalFloors">Total Floors:</label>
                      <input
                        type="number"
                        name="details.totalFloors"
                        className={`form-control ${
                          errors.totalFloors ? "error" : ""
                        }`}
                        placeholder="Total floors (optional)"
                        value={formData.details.totalFloors}
                        onChange={handleInputChange}
                      />
                      {errors.totalFloors && (
                        <span className="error-text">{errors.totalFloors}</span>
                      )}
                    </fieldset>
                  )}
                </>
              )}

              {/* Show Floor Level and Total Floors here when in office/studio mode */}
              {isOfficeOrStudio() && (
                <>
                  {/* Only show Floor Level for property types other than villa, townhouse, penthouse */}
                  {shouldShowFloorLevel() && (
                    <fieldset className="box-fieldset">
                      <label htmlFor="floorLevel">Floor Level:</label>
                      <input
                        type="text"
                        name="details.floorLevel"
                        className={`form-control ${
                          errors.floorLevel ? "error" : ""
                        }`}
                        placeholder="Floor level (optional)"
                        value={formData.details.floorLevel}
                        onChange={handleInputChange}
                      />
                      {errors.floorLevel && (
                        <span className="error-text">{errors.floorLevel}</span>
                      )}
                    </fieldset>
                  )}

                  {/* Only show Total Floors for property types other than villa, townhouse, penthouse */}
                  {shouldShowTotalFloors() && (
                    <fieldset className="box-fieldset">
                      <label htmlFor="totalFloors">Total Floors:</label>
                      <input
                        type="number"
                        name="details.totalFloors"
                        className={`form-control ${
                          errors.totalFloors ? "error" : ""
                        }`}
                        placeholder="Total floors (optional)"
                        value={formData.details.totalFloors}
                        onChange={handleInputChange}
                      />
                      {errors.totalFloors && (
                        <span className="error-text">{errors.totalFloors}</span>
                      )}
                    </fieldset>
                  )}

                  {/* Show Land Area for office, villa, townhouse OR Year Built for studio */}
                  {formData.propertyType === "office" && (
                    <fieldset className="box-fieldset">
                      <label htmlFor="landArea">Land Area:</label>
                      <input
                        type="number"
                        name="details.landArea"
                        className={`form-control ${
                          errors.landArea ? "error" : ""
                        }`}
                        placeholder="Land area (optional)"
                        value={formData.details.landArea}
                        onChange={handleInputChange}
                      />
                      {errors.landArea && (
                        <span className="error-text">{errors.landArea}</span>
                      )}
                    </fieldset>
                  )}

                  {formData.propertyType === "studio" && (
                    <fieldset className="box-fieldset">
                      <label htmlFor="yearBuilt">Year Built:</label>
                      <input
                        type="number"
                        name="details.yearBuilt"
                        className={`form-control ${
                          errors.yearBuilt ? "error" : ""
                        }`}
                        placeholder="Year built (optional)"
                        value={formData.details.yearBuilt}
                        onChange={handleInputChange}
                      />
                      {errors.yearBuilt && (
                        <span className="error-text">{errors.yearBuilt}</span>
                      )}
                    </fieldset>
                  )}
                </>
              )}

              {/* Show Total Floors for villa/townhouse */}
              {(formData.propertyType === "villa" ||
                formData.propertyType === "townhouse") && (
                <fieldset className="box-fieldset">
                  <label htmlFor="totalFloors">Total Floors:</label>
                  <input
                    type="number"
                    name="details.totalFloors"
                    className={`form-control ${
                      errors.totalFloors ? "error" : ""
                    }`}
                    placeholder="Total floors (optional)"
                    value={formData.details.totalFloors}
                    onChange={handleInputChange}
                  />
                  {errors.totalFloors && (
                    <span className="error-text">{errors.totalFloors}</span>
                  )}
                </fieldset>
              )}

              {/* Show Land Area for villa/townhouse */}
              {(formData.propertyType === "villa" ||
                formData.propertyType === "townhouse") && (
                <fieldset className="box-fieldset">
                  <label htmlFor="landArea">Land Area:</label>
                  <input
                    type="number"
                    name="details.landArea"
                    className={`form-control ${errors.landArea ? "error" : ""}`}
                    placeholder="Land area (optional)"
                    value={formData.details.landArea}
                    onChange={handleInputChange}
                  />
                  {errors.landArea && (
                    <span className="error-text">{errors.landArea}</span>
                  )}
                </fieldset>
              )}

              {/* Show Total Floors here when in penthouse mode only (villa/townhouse have their own section above) */}
              {formData.propertyType === "penthouse" && (
                <>
                  <fieldset className="box-fieldset">
                    <label htmlFor="totalFloors">Total Floors:</label>
                    <input
                      type="number"
                      name="details.totalFloors"
                      className={`form-control ${
                        errors.totalFloors ? "error" : ""
                      }`}
                      placeholder="Total floors (optional)"
                      value={formData.details.totalFloors}
                      onChange={handleInputChange}
                    />
                    {errors.totalFloors && (
                      <span className="error-text">{errors.totalFloors}</span>
                    )}
                  </fieldset>
                </>
              )}
            </div>

            <div className="box grid-layout-3 gap-30">
              {/* Year Built - exclude studio since it has yearBuilt in row 2 */}
              {formData.propertyType !== "studio" && (
                <fieldset className="box-fieldset">
                  <label htmlFor="yearBuilt">Year Built:</label>
                  <input
                    type="number"
                    name="details.yearBuilt"
                    className={`form-control ${
                      errors.yearBuilt ? "error" : ""
                    }`}
                    placeholder="Year built (optional)"
                    value={formData.details.yearBuilt}
                    onChange={handleInputChange}
                  />
                  {errors.yearBuilt && (
                    <span className="error-text">{errors.yearBuilt}</span>
                  )}
                </fieldset>
              )}

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
                {errors.parkingAvailable && (
                  <span className="error-text">{errors.parkingAvailable}</span>
                )}
              </fieldset>

              {/* Show Parking Type in the same row when parking is available */}
              {formData.details.parking.available && (
                <>
                  <fieldset className="box-fieldset">
                    <label htmlFor="parkingType">Parking Type:</label>
                    <select
                      name="details.parking.type"
                      className={`form-control ${
                        errors.parkingType ? "error" : ""
                      }`}
                      value={formData.details.parking.type}
                      onChange={handleInputChange}
                    >
                      <option value="">Select parking type</option>
                      {Array.isArray(parkingTypes) &&
                        parkingTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                    </select>
                    {errors.parkingType && (
                      <span className="error-text">{errors.parkingType}</span>
                    )}
                  </fieldset>

                  <fieldset className="box-fieldset">
                    <label htmlFor="parkingSpaces">Parking Spaces:</label>
                    <input
                      type="number"
                      name="details.parking.spaces"
                      className={`form-control ${
                        errors.parkingSpaces ? "error" : ""
                      }`}
                      placeholder="Number of parking spaces"
                      value={formData.details.parking.spaces}
                      onChange={handleInputChange}
                    />
                    {errors.parkingSpaces && (
                      <span className="error-text">{errors.parkingSpaces}</span>
                    )}
                  </fieldset>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Amenities */}
        <div className="widget-box-2 mb-20">
          <h5 className="title">Amenities</h5>
          <div className="box-amenities-property">
            <div className="amenities-grid">
              {Array.isArray(amenities) &&
                amenities.map((amenity) => (
                  <label key={amenity} className="amenity-checkbox">
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(formData.amenities) &&
                        formData.amenities.includes(amenity)
                      }
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
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding Property..." : "Add Property"}
          </button>
          <a
            href="/admin/property-management"
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
