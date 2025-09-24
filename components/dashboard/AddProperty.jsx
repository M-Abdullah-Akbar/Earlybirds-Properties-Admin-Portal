"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { propertyAPI, uploadAPI, adminUtils } from "@/utils/api";
import { safeLocalStorage } from "@/utils/clientUtils";
import { PropertyDescriptionEditor } from "@/components/tiptap-templates/property/property-description-editor";
import { 
  propertyNotifications, 
  validationNotifications, 
  apiNotifications 
} from "@/utils/notifications";

export default function AddProperty() {
  const router = useRouter();
  const fileInputRef = useRef(null);
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
  const [touchedFields, setTouchedFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [emirates, setEmirates] = useState([]);
  const [areas, setAreas] = useState([]);
  const [amenities, setAmenities] = useState([]);
  // Constants from adminUtils - KEEPING YOUR STATUS LOGIC
  const propertyStatuses = adminUtils.getPropertyStatuses("create");
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

  // Helper function to determine if price section should be shown (prevents hydration issues)
  const shouldShowPriceSection = () => {
    // Always return the same logic regardless of mount state to prevent hydration mismatch
    return formData.listingType !== "off plan";
  };

  // Validation function - updated to make fields optional like backend
  const validateField = (fieldName, value, currentFormData = formData) => {
    switch (fieldName) {
      case "title":
        // Title is now optional
        if (!value || value.trim() === "") {
          return "";
        } else if (value.trim().length < 5) {
          return "Title must be at least 5 characters long";
        } else if (value.trim().length > 200) {
          return "Title cannot exceed 200 characters";
        } else if (!/[a-zA-Z]/.test(value.trim())) {
          return "Title must contain at least some letters";
        }
        return "";

      case "description":
        // Description is now optional
        if (!value || value.trim() === "") {
          return "";
        } else if (value.trim().length < 200) {
          return "Description must be at least 200 characters long";
        } else if (value.trim().length > 10000) {
          return "Description cannot exceed 10000 characters";
        }
        return "";

      case "propertyType":
        // Property type is now optional
        if (!value || value.trim() === "") {
          return "";
        } else if (typeof value !== "string") {
          return "Property type must be a string";
        } else if (
          !/^[a-zA-Z0-9\s-]+$/.test(value) ||
          value.trim() !== value ||
          value.includes("  ")
        ) {
          return `Invalid property type format: "${value}". Must contain only letters, numbers, spaces, and hyphens, with no leading/trailing spaces.`;
        }
        return "";

      case "price":
        // Skip price validation for off plan listing type
        if (currentFormData.listingType === "off plan") {
          return "";
        }
        // Price is now optional
        if (!value || value.toString().trim() === "") {
          return "";
        }
        const numPrice = parseFloat(value);
        if (isNaN(numPrice) || numPrice <= 0) {
          return "Price must be a positive number";
        }
        return "";

      case "listingType":
        if (!value || value.trim() === "") {
          return "Listing type is required";
        }
        return "";

      case "location.address":
        // Address is now optional
        if (!value || value.trim() === "") {
          return "";
        } else if (value.trim().length < 5) {
          return "Address must be at least 5 characters long";
        } else if (value.trim().length > 200) {
          return "Address cannot exceed 200 characters";
        }
        return "";

      case "location.emirate":
        // Emirate is now optional
        if (!value || value.trim() === "") {
          return "";
        }
        return "";

      case "location.area":
        // Area is now optional
        if (value === "") {
          return "";
        } else if (!currentFormData.location?.emirate) {
          return "";
        }
        return "";

      case "details.bedrooms":
        const propertyType = currentFormData.propertyType;

        // For studio and office property types, bedrooms should not be provided
        if (propertyType === "studio" || propertyType === "office") {
          // If bedrooms field exists and has a value, reject it
          if (value !== null && value !== undefined && value !== "") {
            return `Bedrooms field is not applicable for ${propertyType} property type. Please remove this field.`;
          }
          return "";
        }

        // Bedrooms are now optional for all other property types
        if (value === null || value === undefined || value === "") {
          return "";
        } else if (!Number.isInteger(Number(value)) || Number(value) < 0) {
          return "Bedrooms must be a non-negative integer";
        }

        return "";

      case "details.bathrooms":
        // Bathrooms are now optional
        if (value === null || value === undefined || value === "") {
          return "";
        }

        const numBathrooms = parseInt(value);
        if (
          isNaN(numBathrooms) ||
          numBathrooms < 0 ||
          !Number.isInteger(Number(value))
        ) {
          return "Bathrooms must be a non-negative integer";
        }

        return "";

      case "details.area":
        // Area is now optional
        if (value === null || value === undefined || value === "") {
          return "";
        }

        const numArea = parseFloat(value);
        if (isNaN(numArea) || numArea <= 0) {
          return "Property area must be a positive number";
        }

        return "";

      case "details.floorLevel":
        const propertyTypeForFloor = currentFormData.propertyType;

        // For villa, townhouse property types, floorLevel should NOT be provided
        if (
          propertyTypeForFloor === "villa" ||
          propertyTypeForFloor === "townhouse"
        ) {
          // If floorLevel field exists and has a value, reject it
          if (value !== undefined && value !== "") {
            return `Floor level field is not applicable for ${propertyTypeForFloor} property type. Please remove this field.`;
          }
          return "";
        }

        // For all other property types, floorLevel is optional
        // No additional validation needed for floorLevel as it's a text field
        return "";

      case "details.totalFloors":
        // If totalFloors is not provided (null, undefined, empty string), it's optional
        if (value === null || value === undefined || value === "") {
          return "";
        } else if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
          return "Total floors must be a positive integer greater than 0";
        }

        return "";

      case "details.landArea":
        const propertyTypeForLand = currentFormData.propertyType;

        // For apartment, penthouse, and studio property types, landArea should NOT be provided
        if (
          propertyTypeForLand === "apartment" ||
          propertyTypeForLand === "penthouse" ||
          propertyTypeForLand === "studio"
        ) {
          // If landArea field exists and has a value, reject it
          if (value !== null && value !== undefined && value !== "") {
            return `Land area field is not applicable for ${propertyTypeForLand} property type. Please remove this field.`;
          }
          return "";
        }

        // For villa, townhouse, and office property types, landArea is optional
        else if (value === null || value === undefined || value === "") {
          return "";
        }

        const numLandArea = parseFloat(value);
        if (isNaN(numLandArea) || numLandArea < 0) {
          return "Land area must be a positive number";
        }

        return "";

      case "details.yearBuilt":
        // If yearBuilt is not provided (null, undefined, empty string), it's optional
        if (value === null || value === "" || value === undefined) {
          return "";
        }

        // If provided, validate the range
        const currentYear = new Date().getFullYear();
        const minYear = 1990;
        const maxYear = currentYear + 2;

        if (
          !Number.isInteger(Number(value)) ||
          Number(value) < minYear ||
          Number(value) > maxYear
        ) {
          return `Year built must be between ${minYear} and ${maxYear}`;
        }

        return "";

      case "details.parking.type":
        const parkingAvailable = currentFormData.details?.parking?.available;

        // Convert string "true"/"false" to boolean for proper comparison
        const isParkingAvailable =
          parkingAvailable === true || parkingAvailable === "true";

        // If parking is available, type must be specified
        if (isParkingAvailable && (!value || value.trim() === "")) {
          return "Parking type is required when parking is available";
        }
        // If parking is not available, type should not be specified
        else if (!isParkingAvailable && value && value.trim() !== "") {
          return "Parking type should not be specified when parking is not available";
        }
        return "";

      case "details.parking.spaces":
        const parkingAvailableSpaces =
          currentFormData.details?.parking?.available;

        // Convert string "true"/"false" to boolean for proper comparison
        const isParkingAvailableSpaces =
          parkingAvailableSpaces === true || parkingAvailableSpaces === "true";

        // Parking spaces are now optional even when parking is available
        if (isParkingAvailableSpaces) {
          // If spaces is provided, validate it
          if (value !== null && value !== undefined && value !== "") {
            // Convert to number and validate
            const numSpaces = parseInt(value);
            if (isNaN(numSpaces) || numSpaces <= 0) {
              return "Number of parking spaces must be greater than 0 when provided";
            }
          }
        }
        // If parking is not available, spaces should not be specified
        else if (
          !isParkingAvailableSpaces &&
          value &&
          value !== "0" &&
          value !== 0
        ) {
          return "Parking spaces should not be specified when parking is not available";
        }
        return "";

      case "images":
        // Images are now optional
        if (!value || !Array.isArray(value) || value.length === 0) {
          return "";
        } else if (value.length > 10) {
          return "Must have between 1 and 10 images";
        }

        // Check for main image validation
        let mainImageCount = 0;
        for (const image of value) {
          if (image.isMain === true) {
            mainImageCount++;
          }
        }

        if (mainImageCount > 1) {
          return "Only one image can be marked as main image";
        }

        return "";

      case "amenities":
        // Amenities are optional
        if (!value || value.length === 0) {
          return "";
        }

        // Must be an array
        if (!Array.isArray(value)) {
          return "Amenities must be an array";
        } else if (value.length > 50) {
          return "Cannot have more than 50 amenities";
        }

        // Check for duplicates
        const uniqueAmenities = Array.from(new Set(value));
        if (uniqueAmenities.length !== value.length) {
          return "Duplicate amenities are not allowed";
        }

        // Validate each amenity format
        for (let i = 0; i < value.length; i++) {
          const amenity = value[i];

          // Must be string
          if (typeof amenity !== "string") {
            return `Amenity must be a string: ${amenity}`;
          }

          // Format validation
          if (
            !/^[a-zA-Z0-9\s\-_.,()&]+$/.test(amenity) ||
            amenity.trim() !== amenity ||
            amenity.includes("  ")
          ) {
            return `Invalid amenity format: "${amenity}". Must contain only letters, numbers, spaces, and common punctuation, with no leading/trailing spaces or double spaces.`;
          }

          // Length validation
          if (amenity.length < 2) {
            return `Amenity must be at least 2 characters long: "${amenity}"`;
          } else if (amenity.length > 100) {
            return `Amenity cannot exceed 100 characters: "${amenity}"`;
          }
        }

        return "";

      default:
        return "";
    }
  };

  // Legacy validation code (disabled)
  const validateFieldLegacy = (fieldName, value, currentFormData = formData) => {
    switch (fieldName) {
      case "title":
        if (!value || value.trim() === "") {
          return "Property title is required";
        } else if (value.trim().length < 5) {
          return "Title must be at least 5 characters long";
        } else if (value.trim().length > 200) {
          return "Title cannot exceed 200 characters";
        } else if (!/[a-zA-Z]/.test(value.trim())) {
          return "Title must contain at least some letters";
        }
        return "";

      case "description":
        if (!value || value.trim() === "") {
          return "Property description is required";
        } else if (value.trim().length < 200) {
          return "Description must be at least 200 characters long";
        } else if (value.trim().length > 10000) {
          return "Description cannot exceed 10000 characters";
        }
        return "";

      case "propertyType":
        if (!value || value.trim() === "") {
          return "Property type is required";
        } else if (typeof value !== "string") {
          return "Property type must be a string";
        } else if (
          !/^[a-zA-Z0-9\s-]+$/.test(value) ||
          value.trim() !== value ||
          value.includes("  ")
        ) {
          return `Invalid property type format: "${value}". Must contain only letters, numbers, spaces, and hyphens, with no leading/trailing spaces.`;
        }
        return "";

      case "price":
        // Skip price validation for off plan listing type
        if (currentFormData.listingType === "off plan") {
          return "";
        }
        if (!value || value.toString().trim() === "") {
          return "Price is required";
        }
        const numPrice = parseFloat(value);
        if (isNaN(numPrice) || numPrice <= 0) {
          return "Price must be a positive number";
        }
        return "";

      case "listingType":
        if (!value || value.trim() === "") {
          return "Listing type is required";
        }
        return "";

      case "location.address":
        if (!value || value.trim() === "") {
          return "Address is required";
        } else if (value.trim().length < 5) {
          return "Address must be at least 5 characters long";
        } else if (value.trim().length > 200) {
          return "Address cannot exceed 200 characters";
        }
        return "";

      case "location.emirate":
        if (!value || value.trim() === "") {
          return "Emirate is required";
        }
        return "";

      case "location.area":
        if (value === "") {
          return "Location area is required";
        } else if (!currentFormData.location?.emirate) {
          return "Emirate must be selected before area";
        }
        return "";

      case "details.bedrooms":
        const propertyType = currentFormData.propertyType;

        // For studio and office property types, bedrooms should not be provided
        if (propertyType === "studio" || propertyType === "office") {
          // If bedrooms field exists and has a value, reject it
          if (value !== null && value !== undefined && value !== "") {
            return `Bedrooms field is not applicable for ${propertyType} property type. Please remove this field.`;
          }
          return "";
        }

        // For all other property types, bedrooms are required
        if (value === null || value === undefined || value === "") {
          return "Number of bedrooms is required";
        } else if (!Number.isInteger(Number(value)) || Number(value) < 0) {
          return "Bedrooms must be a non-negative integer";
        }

        return "";

      case "details.bathrooms":
        if (value === null || value === undefined || value === "") {
          return "Number of bathrooms is required";
        }

        const numBathrooms = parseInt(value);
        if (
          isNaN(numBathrooms) ||
          numBathrooms < 0 ||
          !Number.isInteger(Number(value))
        ) {
          return "Bathrooms must be a non-negative integer";
        }

        return "";

      case "details.area":
        if (value === null || value === undefined || value === "") {
          return "Property area is required";
        }

        const numArea = parseFloat(value);
        if (isNaN(numArea) || numArea <= 0) {
          return "Property area must be a positive number";
        }

        return "";

      case "details.floorLevel":
        const propertyTypeForFloor = currentFormData.propertyType;

        // For villa, townhouse property types, floorLevel should NOT be provided
        if (
          propertyTypeForFloor === "villa" ||
          propertyTypeForFloor === "townhouse"
        ) {
          // If floorLevel field exists and has a value, reject it
          if (value !== undefined && value !== "") {
            return `Floor level field is not applicable for ${propertyTypeForFloor} property type. Please remove this field.`;
          }
          return "";
        }

        // For all other property types, floorLevel is optional
        // No additional validation needed for floorLevel as it's a text field
        return "";

      case "details.totalFloors":
        // If totalFloors is not provided (null, undefined, empty string), it's optional
        if (value === null || value === undefined || value === "") {
          return "";
        } else if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
          return "Total floors must be a positive integer greater than 0";
        }

        return "";

      case "details.landArea":
        const propertyTypeForLand = currentFormData.propertyType;

        // For apartment, penthouse, and studio property types, landArea should NOT be provided
        if (
          propertyTypeForLand === "apartment" ||
          propertyTypeForLand === "penthouse" ||
          propertyTypeForLand === "studio"
        ) {
          // If landArea field exists and has a value, reject it
          if (value !== null && value !== undefined && value !== "") {
            return `Land area field is not applicable for ${propertyTypeForLand} property type. Please remove this field.`;
          }
          return "";
        }

        // For villa, townhouse, and office property types, landArea is optional
        else if (value === null || value === undefined || value === "") {
          return "";
        }

        const numLandArea = parseFloat(value);
        if (isNaN(numLandArea) || numLandArea < 0) {
          return "Land area must be a positive number";
        }

        return "";

      case "details.yearBuilt":
        // If yearBuilt is not provided (null, undefined, empty string), it's optional
        if (value === null || value === "" || value === undefined) {
          return "";
        }

        // If provided, validate the range
        const currentYear = new Date().getFullYear();
        const minYear = 1990;
        const maxYear = currentYear + 2;

        if (
          !Number.isInteger(Number(value)) ||
          Number(value) < minYear ||
          Number(value) > maxYear
        ) {
          return `Year built must be between ${minYear} and ${maxYear}`;
        }

        return "";

      case "details.parking.type":
        const parkingAvailable = currentFormData.details?.parking?.available;

        // Convert string "true"/"false" to boolean for proper comparison
        const isParkingAvailable =
          parkingAvailable === true || parkingAvailable === "true";

        // If parking is available, type must be specified
        if (isParkingAvailable && (!value || value.trim() === "")) {
          return "Parking type is required when parking is available";
        }
        // If parking is not available, type should not be specified
        else if (!isParkingAvailable && value && value.trim() !== "") {
          return "Parking type should not be specified when parking is not available";
        }
        return "";

      case "details.parking.spaces":
        const parkingAvailableSpaces =
          currentFormData.details?.parking?.available;

        // Convert string "true"/"false" to boolean for proper comparison
        const isParkingAvailableSpaces =
          parkingAvailableSpaces === true || parkingAvailableSpaces === "true";

        // If parking is available, spaces must be > 0
        if (isParkingAvailableSpaces) {
          // Check if spaces is provided and valid
          if (value === null || value === undefined || value === "") {
            return "Number of parking spaces is required when parking is available";
          }

          // Convert to number and validate
          const numSpaces = parseInt(value);
          if (isNaN(numSpaces) || numSpaces <= 0) {
            return "Number of parking spaces must be greater than 0 when parking is available";
          }
        }
        // If parking is not available, spaces should not be specified
        else if (
          !isParkingAvailableSpaces &&
          value &&
          value !== "0" &&
          value !== 0
        ) {
          return "Parking spaces should not be specified when parking is not available";
        }
        return "";

      case "images":
        if (!value || !Array.isArray(value) || value.length === 0) {
          return "At least one image is required";
        } else if (value.length > 10) {
          return "Must have between 1 and 10 images";
        }

        // Check for main image validation
        let mainImageCount = 0;
        for (const image of value) {
          if (image.isMain === true) {
            mainImageCount++;
          }
        }

        if (mainImageCount > 1) {
          return "Only one image can be marked as main image";
        }

        return "";

      case "amenities":
        // Amenities are optional
        if (!value || value.length === 0) {
          return "";
        }

        // Must be an array
        if (!Array.isArray(value)) {
          return "Amenities must be an array";
        } else if (value.length > 50) {
          return "Cannot have more than 50 amenities";
        }

        // Check for duplicates
        const uniqueAmenities = Array.from(new Set(value));
        if (uniqueAmenities.length !== value.length) {
          return "Duplicate amenities are not allowed";
        }

        // Validate each amenity format
        for (let i = 0; i < value.length; i++) {
          const amenity = value[i];

          // Must be string
          if (typeof amenity !== "string") {
            return `Amenity must be a string: ${amenity}`;
          }

          // Format validation
          if (
            !/^[a-zA-Z0-9\s-]{2,50}$/.test(amenity) ||
            amenity.trim() !== amenity ||
            amenity.includes("  ")
          ) {
            return `Invalid amenity format: "${amenity}". Must be 2-50 characters, contain only letters, numbers, spaces, and hyphens, with no leading/trailing spaces.`;
          }
        }

        return "";

      default:
        return "";
    }
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
    let newFormData;

    if (name.includes(".")) {
      const [parent, child, subChild] = name.split(".");
      setFormData((prev) => {
        newFormData = {
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
        };
        return newFormData;
      });
    } else {
      setFormData((prev) => {
        newFormData = {
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

        // Clear price fields when listing type changes (both to and from off plan)
        if (name === "listingType") {
          const previousListingType = prev.listingType;

          // Clear price fields when changing TO off plan
          if (value === "off plan") {
            console.log(
              `Listing type changed to "${value}", clearing price fields`
            );
            newFormData.price = "";
            newFormData.currency = "AED";
            newFormData.priceType = "total";
          }
          // Clear price fields when changing FROM off plan to other types
          else if (previousListingType === "off plan") {
            console.log(
              `Listing type changed from "off plan" to "${value}", clearing price fields`
            );
            newFormData.price = "";
            newFormData.currency = "AED";
            newFormData.priceType = "total";
          }
        }

        return newFormData;
      });
    }

    // Mark field as touched
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Map field names to their corresponding error keys
    let errorKey = name;
    if (name === "location.area") {
      errorKey = "locationArea";
    } else if (name === "location.address") {
      errorKey = "address";
    } else if (name === "location.emirate") {
      errorKey = "emirate";
    } else if (name.includes(".")) {
      const parts = name.split(".");
      errorKey = parts[parts.length - 1];
    }

    // Validate field in real-time if it has been touched or has content
    if (touchedFields[name] || (value && value.toString().trim() !== "")) {
      const error = validateField(
        name,
        type === "checkbox" ? checked : value,
        newFormData || formData
      );
      setErrors((prev) => ({
        ...prev,
        [errorKey]: error,
      }));
    }

    // Special handling for parking fields - clear related parking errors and revalidate
    if (name.startsWith("details.parking")) {
      if (name === "details.parking.available") {
        // When parking availability changes, clear all parking errors and revalidate
        setErrors((prev) => ({
          ...prev,
          parkingType: "",
          parkingSpaces: "",
        }));

        // If parking is now disabled, clear parking validation errors
        if (!checked) {
          setErrors((prev) => ({
            ...prev,
            parkingType: "",
            parkingSpaces: "",
          }));
        }
      } else if (
        name === "details.parking.type" &&
        touchedFields["details.parking.type"]
      ) {
        // Revalidate parking type
        const error = validateField(name, value, newFormData || formData);
        setErrors((prev) => ({
          ...prev,
          parkingType: error,
        }));
      } else if (
        name === "details.parking.spaces" &&
        touchedFields["details.parking.spaces"]
      ) {
        // Revalidate parking spaces
        const error = validateField(name, value, newFormData || formData);
        setErrors((prev) => ({
          ...prev,
          parkingSpaces: error,
        }));
      }
    }

    // Special case: if property type changes, revalidate bedrooms
    if (name === "propertyType" && touchedFields["details.bedrooms"]) {
      const bedroomsError = validateField(
        "details.bedrooms",
        (newFormData || formData).details?.bedrooms,
        newFormData || formData
      );
      setErrors((prev) => ({
        ...prev,
        bedrooms: bedroomsError,
      }));
    }
  };

  const handleFieldBlur = (e) => {
    const { name, value, type, checked } = e.target;

    // Mark field as touched on blur
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Map field names to their corresponding error keys
    let errorKey = name;
    if (name === "location.area") {
      errorKey = "locationArea";
    } else if (name === "location.address") {
      errorKey = "address";
    } else if (name === "location.emirate") {
      errorKey = "emirate";
    } else if (name.includes(".")) {
      const parts = name.split(".");
      errorKey = parts[parts.length - 1];
    }

    // Validate field on blur
    const error = validateField(name, type === "checkbox" ? checked : value);
    setErrors((prev) => ({
      ...prev,
      [errorKey]: error,
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => {
      const updatedAmenities = Array.isArray(prev.amenities)
        ? prev.amenities.includes(amenity)
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity]
        : [amenity];

      // Validate amenities after update
      const amenityError = validateField("amenities", updatedAmenities);
      setErrors((prevErrors) => ({
        ...prevErrors,
        amenities: amenityError,
      }));

      return {
        ...prev,
        amenities: updatedAmenities,
      };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Check if there's already a main image
    const hasMainImage =
      Array.isArray(formData.images) &&
      formData.images.some((img) => img.isMain);

    // Create image objects with file references for API
    const newImages = files.map((file, index) => ({
      file: file,
      preview: URL.createObjectURL(file),
      order:
        (Array.isArray(formData.images) ? formData.images.length : 0) + index,
      // Only set first new image as main if there are no existing images AND no main image
      isMain:
        (!Array.isArray(formData.images) || formData.images.length === 0) &&
        !hasMainImage &&
        index === 0,
    }));

    setFormData((prev) => {
      const updatedImages = Array.isArray(prev.images)
        ? [...prev.images, ...newImages]
        : newImages;

      // Validate images after update
      const imageError = validateField("images", updatedImages);
      setErrors((prevErrors) => ({
        ...prevErrors,
        images: imageError,
      }));

      return {
        ...prev,
        images: updatedImages,
      };
    });

    // Reset the file input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      if (!Array.isArray(prev.images)) {
        return { ...prev, images: [] };
      }

      const imageToRemove = prev.images[index];
      const remainingImages = prev.images.filter((_, i) => i !== index);

      // If we're removing the main image and there are other images left,
      // set the first remaining image as main
      if (imageToRemove?.isMain && remainingImages.length > 0) {
        remainingImages[0].isMain = true;
      }

      // Validate images after removal
      const imageError = validateField("images", remainingImages);
      setErrors((prevErrors) => ({
        ...prevErrors,
        images: imageError,
      }));

      return {
        ...prev,
        images: remainingImages,
      };
    });
  };

  const setMainImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: Array.isArray(prev.images)
        ? prev.images.map((img, i) => ({
            ...img,
            isMain: i === index,
          }))
        : [],
    }));
  };

  const validateForm = () => {
    // Let the server handle all validation for consistency
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation disabled - proceed directly to submission

    setIsSubmitting(true);
    setErrors({});

    try {
      // Create FormData for multipart request (includes both property data and images)
      const formDataToSend = new FormData();

      // Add property data fields
      formDataToSend.append("title", formData.title);
      // Convert JSON description back to string for backend
      const descriptionToSend = typeof formData.description === 'string' ? formData.description : JSON.stringify(formData.description);
      formDataToSend.append("description", descriptionToSend);
      formDataToSend.append("propertyType", formData.propertyType);

      // Add price fields only for non-off plan listing types
      if (formData.listingType !== "off plan") {
        formDataToSend.append("price", parseFloat(formData.price));
        formDataToSend.append("currency", formData.currency);
        formDataToSend.append("priceType", formData.priceType);
      }

      formDataToSend.append("listingType", formData.listingType);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("featured", formData.featured || false);

      // Add location data
      formDataToSend.append(
        "location[address]",
        formData.location.address.trim()
      );
      formDataToSend.append("location[emirate]", formData.location.emirate);
      formDataToSend.append("location[area]", formData.location.area);
      formDataToSend.append("location[country]", formData.location.country);
      formDataToSend.append(
        "location[neighborhood]",
        formData.location.neighborhood?.trim() || ""
      );

      // Add details data
      if (shouldShowBedrooms() && formData.details.bedrooms) {
        formDataToSend.append(
          "details[bedrooms]",
          parseInt(formData.details.bedrooms)
        );
      }
      if (formData.details.bathrooms) {
        formDataToSend.append(
          "details[bathrooms]",
          parseInt(formData.details.bathrooms)
        );
      }
      if (formData.details.area) {
        formDataToSend.append(
          "details[area]",
          parseFloat(formData.details.area)
        );
      }
      formDataToSend.append("details[areaUnit]", formData.details.areaUnit);

      if (shouldShowFloorLevel() && formData.details.floorLevel) {
        formDataToSend.append(
          "details[floorLevel]",
          formData.details.floorLevel
        );
      }
      if (formData.details.totalFloors) {
        formDataToSend.append(
          "details[totalFloors]",
          parseInt(formData.details.totalFloors)
        );
      }
      if (shouldShowLandArea() && formData.details.landArea) {
        formDataToSend.append(
          "details[landArea]",
          parseFloat(formData.details.landArea)
        );
      }
      if (formData.details.yearBuilt) {
        formDataToSend.append(
          "details[yearBuilt]",
          parseInt(formData.details.yearBuilt)
        );
      }

      // Add parking data
      formDataToSend.append(
        "details[parking][available]",
        formData.details.parking.available
      );
      if (formData.details.parking.available) {
        if (formData.details.parking.type) {
          formDataToSend.append(
            "details[parking][type]",
            formData.details.parking.type
          );
        }
        formDataToSend.append(
          "details[parking][spaces]",
          parseInt(formData.details.parking.spaces) || 0
        );
      }

      // Add amenities
      if (Array.isArray(formData.amenities)) {
        formData.amenities.forEach((amenity, index) => {
          formDataToSend.append(`amenities[${index}]`, amenity);
        });
      }

      // Add image files and their metadata
      if (Array.isArray(formData.images) && formData.images.length > 0) {
        // Ensure only one image is marked as main
        let processedImages = [...formData.images];
        const mainImageCount = processedImages.filter(
          (img) => img.isMain
        ).length;

        if (mainImageCount > 1) {
          // If multiple images are marked as main, keep only the first one
          let foundMain = false;
          processedImages = processedImages.map((img) => {
            if (img.isMain && !foundMain) {
              foundMain = true;
              return img;
            } else if (img.isMain && foundMain) {
              return { ...img, isMain: false };
            }
            return img;
          });
        } else if (mainImageCount === 0) {
          // If no image is marked as main, mark the first one as main
          processedImages[0] = { ...processedImages[0], isMain: true };
        }

        // Add image files
        processedImages.forEach((image, index) => {
          formDataToSend.append("images", image.file);
          // Add image metadata
          formDataToSend.append(
            `imageMetadata[${index}][isMain]`,
            image.isMain || false
          );
          formDataToSend.append(
            `imageMetadata[${index}][altText]`,
            image.altText || `Property image ${index + 1}`
          );
          formDataToSend.append(`imageMetadata[${index}][order]`, index);
        });
      }

      // Log the data being sent for debugging
      console.log(
        "AddProperty: Sending FormData with property data and images"
      );
      console.log("AddProperty: Images count:", formData.images?.length || 0);

      // Debug FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // Create property using the API (will use POST /api/properties)
      const response = await propertyAPI.createProperty(formDataToSend);

      console.log("API Response:", response);

      if (response.success) {
        // Show success notification
        propertyNotifications.createSuccess(formData.title);
        // Redirect after a brief delay to allow notification to show
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
            // First check if fieldName exists to avoid undefined errors
            if (!fieldName) {
              fieldName = "unknown"; // Fallback for undefined field names
            } else if (fieldName === "propertyType") fieldName = "propertyType";
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
            else if (fieldName === "images") fieldName = "images";
            // Handle any other nested fields by keeping the full path as fallback
            else if (fieldName.includes(".")) {
              fieldName = fieldName.replace(".", "_"); // Convert dots to underscores for unique keys
            }

            fieldErrors[fieldName] = detail.message;
          });
          console.log("Final field errors:", fieldErrors);
          setErrors(fieldErrors);
          
          // Use enhanced validation notifications to show backend errors
          validationNotifications.backendErrors(response, "Please fix the validation errors and try again.");
        } else {
          const errorMessage = response.error || "Failed to add property";
          setErrors((prev) => ({
            ...prev,
            submit: errorMessage,
          }));
          propertyNotifications.createError(errorMessage);
        }
      }
    } catch (error) {
      // Log the full error for debugging
      console.error("Full error object:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);

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
          
          // Use enhanced validation notifications to show backend errors
          validationNotifications.backendErrors(error.response.data, "Please fix the validation errors and try again.");
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
        propertyNotifications.createError(errorMessage);
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
      
      // Show appropriate notification based on error type
      if (error.message && (error.message.includes("Network Error") || error.message.includes("CORS Error"))) {
        apiNotifications.networkError();
      } else {
          propertyNotifications.createError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner wrap-dashboard-content">
          <div className="widget-box-2 wd-listing">
            <div className="text-center py-50">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-20">Loading Properties Data...</p>
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
          <h3 className="title">Add New Property</h3>
          <p>Create a new property listing with all necessary details</p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="alert alert-danger mb-20">{errors.submit}</div>
        )}

        {/* Upload Media Section */}
        <div className="widget-box-2 mb-20">
          <h5 className="title">Upload Media<span>*</span></h5>
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
                  ref={fileInputRef}
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
                  className="form-control"
                  placeholder="Enter property title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                />
                {errors.title && (
                  <span className="error-text">{errors.title}</span>
                )}
              </fieldset>
            </div>

            <div className="box">
              <fieldset className="box-fieldset">
                <label htmlFor="description">Description:<span>*</span></label>
                <PropertyDescriptionEditor
                  value={formData.description}
                  onChange={(content) => {
                    setFormData((prev) => ({ ...prev, description: JSON.stringify(content) }));
                    // Clear error when user starts typing
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: null }));
                    }
                  }}
                  onBlur={(content) => {
                    // Handle blur validation if needed
                  }}
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
                    ""
                  }`}
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
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
                    ""
                  }`}
                  value={formData.listingType}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
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
                  Address:
                </label>
                <input
                  type="text"
                  name="location.address"
                  className="form-control"
                  placeholder="Enter property address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
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
                  className="form-control"
                  value={formData.location.emirate}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
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
                  Area:
                </label>
                <select
                  name="location.area"
                  className={`form-control ${
                    ""
                  }`}
                  value={formData.location.area}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
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

        {/* Conditionally render price section - not applicable for off plan listing type */}
        {shouldShowPriceSection() && (
          <div className="widget-box-2 mb-20">
            <h5 className="title">Price</h5>
            <form className="box-info-property">
              <div className="box grid-layout-3 gap-30">
                <fieldset className="box-fieldset">
                  <label htmlFor="price">
                    Price:
                  </label>
                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
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
        )}

        {/* Property Details */}
        <div className="widget-box-2 mb-20">
          <h5 className="title">Property Details</h5>
          <form className="box-info-property">
            <div className="box grid-layout-3 gap-30">
              {/* Conditionally render bedrooms field - not applicable for office and studio */}
              {shouldShowBedrooms() && (
                <fieldset className="box-fieldset">
                  <label htmlFor="bedrooms">
                    Bedrooms:
                  </label>
                  <input
                    type="number"
                    name="details.bedrooms"
                    className="form-control"
                    placeholder="Number of bedrooms"
                    value={formData.details.bedrooms}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                  />
                  {errors.bedrooms && (
                    <span className="error-text">{errors.bedrooms}</span>
                  )}
                </fieldset>
              )}

              <fieldset className="box-fieldset">
                <label htmlFor="bathrooms">
                  Bathrooms:
                </label>
                <input
                  type="number"
                  name="details.bathrooms"
                  className="form-control"
                  placeholder="Number of bathrooms"
                  value={formData.details.bathrooms}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                />
                {errors.bathrooms && (
                  <span className="error-text">{errors.bathrooms}</span>
                )}
              </fieldset>

              <fieldset className="box-fieldset">
                <label htmlFor="area">
                  Area Size:
                </label>
                <input
                  type="number"
                  name="details.area"
                  className="form-control"
                  placeholder="Area size"
                  value={formData.details.area}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
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
                          ""
                        }`}
                        placeholder="Floor level (optional)"
                        value={formData.details.floorLevel}
                        onChange={handleInputChange}
                        onBlur={handleFieldBlur}
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
                          ""
                        }`}
                        placeholder="Total floors (optional)"
                        value={formData.details.totalFloors}
                        onChange={handleInputChange}
                        onBlur={handleFieldBlur}
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
                        onBlur={handleFieldBlur}
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
                        onBlur={handleFieldBlur}
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
                          ""
                        }`}
                        placeholder="Land area (optional)"
                        value={formData.details.landArea}
                        onChange={handleInputChange}
                        onBlur={handleFieldBlur}
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
                          ""
                        }`}
                        placeholder="Year built (optional)"
                        value={formData.details.yearBuilt}
                        onChange={handleInputChange}
                        onBlur={handleFieldBlur}
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
                    className="form-control"
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
                        ""
                      }`}
                      value={formData.details.parking.type}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
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
                        ""
                      }`}
                      placeholder="Number of parking spaces"
                      value={formData.details.parking.spaces}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
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
