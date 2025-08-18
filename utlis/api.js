import axios from "axios";
import { safeLocalStorage, safeWindow } from "./clientUtils";

// Base API configuration
const API_BASE_URL = "http://13.60.13.251/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Skip adding Authorization header for login requests
    if (config.url === "/auth/login" || config.url?.includes("/auth/login")) {
      return config;
    }

    const token = safeLocalStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Check if response is HTML instead of JSON
    if (
      typeof response.data === "string" &&
      response.data.includes("<!DOCTYPE html>")
    ) {
      console.error(
        "HTML response received:",
        response.data.substring(0, 200) + "..."
      );
      throw new Error(
        "Received HTML response instead of JSON. This usually means the API endpoint is not accessible. Please check if the backend server is running."
      );
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("🚨 401 Error - URL:", error.config?.url);
      console.log("🚨 401 Error - Response:", error.response?.data);

      // Skip auth data clearing for login requests - 401 is expected for invalid credentials
      if (
        error.config?.url === "/auth/login" ||
        error.config?.url?.includes("/auth/login")
      ) {
        console.log("✅ 401 from login - not clearing auth");
        return Promise.reject(error);
      }

      // Token expired or invalid for authenticated requests
      console.log("🚨 401 from authenticated request - clearing auth data");
      safeLocalStorage.removeItem("admin_token");
      safeLocalStorage.removeItem("admin_user");

      // Only redirect if we're not already on the login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        console.log("🚨 Redirecting to login");
        safeWindow.redirect("/admin/login");
      }
    } else if (error.response?.status === 0 || error.code === "ERR_NETWORK") {
      // Network error - server may be down
      console.error("Network error - server may be down:", error);
      throw new Error(
        "Unable to connect to the API server. Please check if the backend server is running and accessible."
      );
    }
    return Promise.reject(error);
  }
);

// Auth API functions - matches backend /api/auth routes exactly
export const authAPI = {
  // Admin login - POST /api/auth/login
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Change password - PUT /api/auth/change-password
  changePassword: async (passwordData) => {
    const response = await api.put("/auth/change-password", passwordData);
    return response.data;
  },
};

// User API functions - matches backend /api/users routes exactly
export const userAPI = {
  // Get all users with filtering and pagination - GET /api/users
  getUsers: async (params = {}) => {
    const response = await api.get("/users", { params });

    // Transform the response data to ensure React compatibility
    if (response.data && response.data.data && response.data.data.users) {
      response.data.data.users = response.data.data.users
        .map(transformUserData)
        .filter(Boolean);
    }

    return response.data;
  },

  // Get single user - GET /api/users/:id
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);

    // Transform the response data to ensure React compatibility
    if (response.data && response.data.data && response.data.data.user) {
      response.data.user = transformUserData(response.data.data.user);
    }

    return response.data;
  },

  // Create new user - POST /api/users
  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // Update user - PUT /api/users/:id
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user - DELETE /api/users/:id
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Get user statistics - GET /api/users/stats
  getUserStats: async () => {
    const response = await api.get("/users/stats");
    return response.data;
  },
};

// Dashboard API functions - aggregates data from other endpoints
export const dashboardAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      let properties = [];
      let users = [];
      let propertyStats = {};

      // Get properties stats using the new dedicated function
      try {
        const propertyStatsResponse = await propertyAPI.getPropertyStats();
        if (propertyStatsResponse.success) {
          propertyStats = propertyStatsResponse.data;
        }
      } catch (error) {
        console.error("Error fetching property stats:", error);
        // Fallback: calculate stats from properties list
        try {
          const propertiesResponse = await propertyAPI.getProperties({
            limit: 10,
          });
          if (propertiesResponse.data?.properties) {
            const properties = propertiesResponse.data.properties;
            propertyStats = {
              total: properties.length,
              available: properties.filter((p) => p.status === "available")
                .length,
              pending: properties.filter((p) => p.status === "pending").length,
              sold: properties.filter((p) => p.status === "sold").length,
              rented: properties.filter((p) => p.status === "rented").length,
              draft: properties.filter((p) => p.status === "draft").length,
              archived: properties.filter((p) => p.status === "archived")
                .length,
              byType: {},
              byEmirate: {},
            };

            // Group by property type
            properties.forEach((property) => {
              const type = property.propertyType;
              if (type) {
                propertyStats.byType[type] =
                  (propertyStats.byType[type] || 0) + 1;
              }
            });

            // Group by emirate
            properties.forEach((property) => {
              const emirate = property.location?.emirate;
              if (emirate) {
                propertyStats.byEmirate[emirate] =
                  (propertyStats.byEmirate[emirate] || 0) + 1;
              }
            });
          }
        } catch (fallbackError) {
          console.error(
            "Fallback stats calculation also failed:",
            fallbackError
          );
          // Continue with empty property stats
        }
      }

      // Get recent properties for dashboard
      try {
        const propertiesResponse = await propertyAPI.getProperties({
          limit: 20,
        });
        properties = propertiesResponse.data?.properties || [];
        // Transform properties data to ensure React compatibility
        properties = properties.map(transformPropertyData).filter(Boolean);
      } catch (error) {
        console.error("Error fetching properties:", error);
        // Continue with empty properties array
      }

      // Get users stats - use limit 100 to match backend validation
      try {
        const usersResponse = await userAPI.getUsers({ limit: 100 });
        users = usersResponse.data?.users || [];
        // Transform users data to ensure React compatibility
        users = users.map(transformUserData).filter(Boolean);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Continue with empty users array
      }

      // Calculate comprehensive statistics
      const stats = {
        // Property statistics
        totalProperties: propertyStats.total || properties.length,
        availableProperties:
          propertyStats.available ||
          properties.filter((p) => p.status === "available").length,
        pendingProperties:
          propertyStats.pending ||
          properties.filter((p) => p.status === "pending").length,
        soldProperties:
          propertyStats.sold ||
          properties.filter((p) => p.status === "sold").length,
        rentedProperties:
          propertyStats.rented ||
          properties.filter((p) => p.status === "rented").length,
        draftProperties:
          propertyStats.draft ||
          properties.filter((p) => p.status === "draft").length,
        archivedProperties:
          propertyStats.archived ||
          properties.filter((p) => p.status === "archived").length,
        propertiesByType: propertyStats.byType || {},
        propertiesByEmirate: propertyStats.byEmirate || {},

        // User statistics
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.status === "active").length,
        inactiveUsers: users.filter((u) => u.status === "inactive").length,

        // Recent data for dashboard
        recentProperties: properties.slice(0, 5), // Last 5 properties
        recentUsers: users.slice(0, 5), // Last 5 users
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        success: false,
        error: "Failed to fetch dashboard statistics",
      };
    }
  },
};

// Property API functions - matches backend /api/properties routes exactly
export const propertyAPI = {
  // Get all properties with filtering and pagination - GET /api/properties
  getProperties: async (params = {}) => {
    const response = await api.get("/properties", { params });

    // Transform the response data to ensure React compatibility
    if (response.data && response.data.data && response.data.data.properties) {
      response.data.data.properties = response.data.data.properties
        .map(transformPropertyData)
        .filter(Boolean);
    }

    return response.data;
  },

  // Get single property - GET /api/properties/:id
  getProperty: async (id) => {
    console.log("ðŸ” getProperty called with ID:", id);
    console.log("ðŸ”— Making request to:", `/properties/${id}`);

    const response = await api.get(`/properties/${id}`);
    console.log("ðŸ“¡ Raw API response:", response);

    // Transform the response data to ensure React compatibility
    if (response.data && response.data.data && response.data.data.property) {
      console.log("âœ… Found property in response.data.data.property");
      response.data.data.property = transformPropertyData(
        response.data.data.property
      );
    } else if (
      response.data &&
      response.data.data &&
      response.data.data.properties
    ) {
      console.log("âš ï¸ Found properties array instead of property object");
      console.log(
        "ðŸ“Š Properties array length:",
        response.data.data.properties.length
      );
      if (response.data.data.properties.length > 0) {
        console.log("ðŸ”„ Using first property from array");
        response.data.data.property = transformPropertyData(
          response.data.data.properties[0]
        );
        // Remove the properties array to avoid confusion
        delete response.data.data.properties;
      }
    } else {
      console.log("âŒ No property data found in response");
      console.log("ðŸ“„ Response structure:", response.data);
    }

    return response.data;
  },

  // Create property with images - POST /api/properties/with-images
  createProperty: async (propertyData) => {
    const response = await api.post("/properties/with-images", propertyData);
    return response.data;
  },

  // Update property - PUT /api/properties/:id
  updateProperty: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },

  // Delete property - DELETE /api/properties/:id
  deleteProperty: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  // Get available property types - GET /api/properties/property-types
  getPropertyTypes: async () => {
    const response = await api.get("/properties/property-types");
    return response.data;
  },

  // Get amenities for property type - GET /api/properties/amenities/:propertyType
  getAmenitiesForPropertyType: async (propertyType) => {
    const response = await api.get(`/properties/amenities/${propertyType}`);
    return response.data;
  },

  // Get areas for emirate - GET /api/properties/areas/:emirate
  getAreasForEmirate: async (emirate) => {
    const response = await api.get(`/properties/areas/${emirate}`);
    return response.data;
  },

  // Delete property image - DELETE /api/properties/:id/images/:imageId
  deletePropertyImage: async (propertyId, imageId) => {
    const response = await api.delete(
      `/properties/${propertyId}/images/${imageId}`
    );
    return response.data;
  },

  // Set main property image - PUT /api/properties/:id/images/:imageId/main
  setMainPropertyImage: async (propertyId, imageId) => {
    const response = await api.put(
      `/properties/${propertyId}/images/${imageId}/main`
    );
    return response.data;
  },

  // Get property statistics - This endpoint needs to be implemented in backend
  getPropertyStats: async () => {
    try {
      // For now, we'll calculate stats from the properties list
      // TODO: Implement dedicated stats endpoint in backend
      const response = await api.get("/properties", { params: { limit: 10 } });

      if (
        response.data &&
        response.data.data &&
        response.data.data.properties
      ) {
        const properties = response.data.data.properties;

        // Calculate statistics
        const stats = {
          total: properties.length,
          available: properties.filter((p) => p.status === "available").length,
          pending: properties.filter((p) => p.status === "pending").length,
          sold: properties.filter((p) => p.status === "sold").length,
          rented: properties.filter((p) => p.status === "rented").length,
          draft: properties.filter((p) => p.status === "draft").length,
          archived: properties.filter((p) => p.status === "archived").length,
          byType: {},
          byEmirate: {},
        };

        // Group by property type
        properties.forEach((property) => {
          const type = property.propertyType;
          stats.byType[type] = (stats.byType[type] || 0) + 1;
        });

        // Group by emirate
        properties.forEach((property) => {
          const emirate = property.location?.emirate;
          if (emirate) {
            stats.byEmirate[emirate] = (stats.byEmirate[emirate] || 0) + 1;
          }
        });

        return {
          success: true,
          data: stats,
        };
      }

      return {
        success: false,
        error: "No properties data available",
      };
    } catch (error) {
      console.error("Error fetching property stats:", error);
      return {
        success: false,
        error: "Failed to fetch property statistics",
      };
    }
  },
};

// Upload API functions - matches backend /api/upload routes exactly
export const uploadAPI = {
  // Upload images - POST /api/upload/images
  uploadImages: async (formData) => {
    const response = await api.post("/upload/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// Helper function to transform backend property data to frontend format
const transformPropertyData = (property) => {
  if (!property) return null;

  console.log("ðŸ”„ Transforming property data:", {
    originalPropertyType: property.propertyType,
    originalListingType: property.listingType,
    originalLocation: property.location,
    originalDetails: property.details,
  });

  const transformed = {
    ...property,
    // Ensure we have clean string values for display
    title: property.title || "Untitled Property",
    // Preserve the full location object structure
    location: property.location || "Location not specified",
    // Preserve the full details object structure
    details: property.details || {},
    // Preserve the full images array structure
    images: property.images || [],
    // Preserve amenities array
    amenities: property.amenities || [],
    // Preserve other important fields
    featured: property.featured || false,
    status: property.status || "available",
    listingType: property.listingType || "sale",
    currency: property.currency || "AED",
    priceType: property.priceType || "total",
    slug: property.slug || "",
    // Map backend image structure to frontend expected structure (for backward compatibility)
    imageSrc: property.images?.[0]?.url || property.imageSrc,
    // Ensure we have the main image (for backward compatibility)
    mainImage:
      property.images?.find((img) => img.isMain)?.url ||
      property.images?.[0]?.url,
    // Preserve the original propertyType, don't override with listingType
    propertyType: property.propertyType || "apartment",
    // Add beds and baths for compatibility (but don't override the original details)
    beds: property.details?.bedrooms || property.bedrooms || 0,
    baths: property.details?.bathrooms || property.bathrooms || 0,
    // Ensure price is a number
    price:
      typeof property.price === "number"
        ? property.price
        : parseFloat(property.price) || 0,
  };

  console.log("âœ… Transformed property data:", {
    finalPropertyType: transformed.propertyType,
    finalListingType: transformed.listingType,
    finalLocation: transformed.location,
    finalDetails: transformed.details,
  });

  return transformed;
};

// Helper function to transform backend user data to frontend format
const transformUserData = (user) => {
  if (!user) return null;

  const transformed = {
    ...user,
    // Ensure we have clean string values for display
    name:
      user.name ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.username ||
      "Unknown User",
    // Ensure email is a string
    email: user.email || "No email provided",
    // Ensure role is a string
    role: user.role || "user",
    // Ensure status is a string
    status: user.status || "inactive",
    // Ensure avatar has a fallback
    avatar: user.avatar || "/images/avatar/account.jpg",
    // Ensure createdAt is properly formatted
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
  };

  return transformed;
};

// Utility functions for admin portal
export const adminUtils = {
  // Health check function to test API connectivity
  healthCheck: async () => {
    try {
      const response = await api.get("/");
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status || "unknown",
      };
    }
  },

  // Get all available emirates from constants
  getEmirates: () => {
    return [
      "Dubai",
      "Abu Dhabi",
      "Sharjah",
      "Ajman",
      "Ras Al Khaimah",
      "Fujairah",
      "Umm Al Quwain",
    ];
  },

  // Get all available property types from constants
  getPropertyTypes: () => {
    return [
      "apartment",
      "villa",
      "house",
      "townhouse",
      "penthouse",
      "studio",
      "duplex",
      "commercial",
      "land",
    ];
  },

  // Get all available property statuses
  getPropertyStatuses: () => {
    return ["draft", "pending", "available", "sold", "rented", "archived"];
  },

  // Get all available listing types
  getListingTypes: () => {
    return ["sale", "rent", "off plan"];
  },

  // Get all available area units
  getAreaUnits: () => {
    return ["sqft", "sqm"];
  },

  // Get all available parking types
  getParkingTypes: () => {
    return ["covered", "open", "garage", "street"];
  },

  // Get all available price types
  getPriceTypes: () => {
    return ["total", "per_sqft", "per_sqm"];
  },

  // Get all available countries
  getCountries: () => {
    return ["UAE"];
  },

  // Get all available currencies
  getCurrencies: () => {
    return ["AED"];
  },

  // Get areas for a specific emirate
  getAreasForEmirate: (emirate) => {
    const emirateAreaMap = {
      Dubai: [
        "Downtown Dubai",
        "Dubai Marina",
        "Jumeirah Beach Residence (JBR)",
        "Palm Jumeirah",
        "Business Bay",
        "DIFC",
        "Dubai Hills Estate",
        "Arabian Ranches",
        "Jumeirah Village Circle (JVC)",
        "Dubai Sports City",
        "Motor City",
        "The Greens",
        "Emirates Hills",
        "Jumeirah",
        "Bur Dubai",
        "Deira",
        "Al Barsha",
        "Dubai Investment Park (DIP)",
        "International City",
        "Discovery Gardens",
        "Mirdif",
        "Festival City",
        "Silicon Oasis",
        "Dubai South",
        "Al Furjan",
        "Damac Hills",
        "Town Square",
        "Dubai Land",
        "Al Mizhar",
        "Al Warqa",
      ],
      "Abu Dhabi": [
        "Abu Dhabi City",
        "Al Reem Island",
        "Saadiyat Island",
        "Yas Island",
        "Al Reef",
        "Khalifa City",
        "Mohammed Bin Zayed City",
        "Al Shamkha",
        "Al Rahba",
        "Masdar City",
        "Corniche Area",
        "Tourist Club Area",
        "Electra Street",
        "Hamdan Street",
        "Al Bateen",
        "Al Mushrif",
        "Al Karamah",
        "Al Manhal",
        "Al Khalidiyah",
        "Al Markaziyah",
      ],
      Sharjah: [
        "Sharjah City",
        "Al Majaz",
        "Al Qasba",
        "Al Nahda",
        "Muweilah",
        "Al Warqa",
        "University City",
        "Al Taawun",
        "Al Qadisiya",
        "Al Fisht",
      ],
      Ajman: [
        "Ajman City",
        "Al Nuaimiya",
        "Al Rashidiya",
        "Al Jurf",
        "Al Hamidiyah",
      ],
      "Ras Al Khaimah": [
        "RAK City",
        "Al Hamra",
        "Mina Al Arab",
        "Al Marjan Island",
        "Al Rams",
        "Al Jazirah Al Hamra",
      ],
      Fujairah: [
        "Fujairah City",
        "Dibba Al-Fujairah",
        "Kalba",
        "Khor Fakkan",
        "Al Bithnah",
      ],
      "Umm Al Quwain": ["UAQ City", "Al Salamah", "Falaj Al Mualla"],
    };

    return emirateAreaMap[emirate] || [];
  },

  // Get amenities for a specific property type
  getAmenitiesForPropertyType: (propertyType) => {
    const propertyTypeAmenitiesMap = {
      apartment: [
        "Air Conditioning",
        "Central Heating",
        "Built-in Wardrobes",
        "Balcony",
        "City View",
        "Sea View",
        "Marina View",
        "High Floor",
        "Elevator",
        "Swimming Pool",
        "Gym",
        "Security",
        "24/7 Security",
        "CCTV",
        "Concierge",
        "Parking",
        "Covered Parking",
        "Internet Ready",
        "Cable TV Ready",
        "Intercom",
        "Maintenance",
        "Cleaning Service",
        "Pets Allowed",
        "Furnished",
        "Semi Furnished",
        "Unfurnished",
      ],
      villa: [
        "Private Pool",
        "Private Garden",
        "Garage",
        "Maid Room",
        "Driver Room",
        "Study Room",
        "Walk-in Closet",
        "Multiple Living Areas",
        "Formal Dining",
        "Family Room",
        "Home Office",
        "Storage Room",
        "Laundry Room",
        "BBQ Area",
        "Outdoor Kitchen",
        "Jacuzzi",
        "Fireplace",
        "High Ceilings",
        "Marble Floors",
        "Wooden Floors",
        "Smart Home",
        "Solar Panels",
        "Generator Backup",
        "Security System",
        "CCTV",
        "Landscaped Garden",
        "Tree-lined Street",
        "Gated Community",
      ],
      house: [
        "Private Pool",
        "Private Garden",
        "Garage",
        "Maid Room",
        "Driver Room",
        "Study Room",
        "Walk-in Closet",
        "Multiple Living Areas",
        "Formal Dining",
        "Family Room",
        "Home Office",
        "Storage Room",
        "Laundry Room",
        "BBQ Area",
        "Outdoor Kitchen",
        "Jacuzzi",
        "Fireplace",
        "High Ceilings",
        "Marble Floors",
        "Wooden Floors",
        "Smart Home",
        "Solar Panels",
        "Generator Backup",
        "Security System",
        "CCTV",
        "Landscaped Garden",
        "Tree-lined Street",
        "Gated Community",
      ],
      townhouse: [
        "Private Pool",
        "Private Garden",
        "Garage",
        "Maid Room",
        "Driver Room",
        "Study Room",
        "Walk-in Closet",
        "Multiple Living Areas",
        "Formal Dining",
        "Family Room",
        "Home Office",
        "Storage Room",
        "Laundry Room",
        "BBQ Area",
        "Outdoor Kitchen",
        "Jacuzzi",
        "Fireplace",
        "High Ceilings",
        "Marble Floors",
        "Wooden Floors",
        "Smart Home",
        "Solar Panels",
        "Generator Backup",
        "Security System",
        "CCTV",
        "Landscaped Garden",
        "Tree-lined Street",
        "Gated Community",
      ],
      penthouse: [
        "Private Pool",
        "Private Garden",
        "Garage",
        "Maid Room",
        "Driver Room",
        "Study Room",
        "Walk-in Closet",
        "Multiple Living Areas",
        "Formal Dining",
        "Family Room",
        "Home Office",
        "Storage Room",
        "Laundry Room",
        "BBQ Area",
        "Outdoor Kitchen",
        "Jacuzzi",
        "Fireplace",
        "High Ceilings",
        "Marble Floors",
        "Wooden Floors",
        "Smart Home",
        "Solar Panels",
        "Generator Backup",
        "Security System",
        "CCTV",
        "Landscaped Garden",
        "Tree-lined Street",
        "Gated Community",
      ],
      studio: [
        "Air Conditioning",
        "Central Heating",
        "Built-in Wardrobes",
        "Balcony",
        "City View",
        "Sea View",
        "Marina View",
        "High Floor",
        "Elevator",
        "Swimming Pool",
        "Gym",
        "Security",
        "24/7 Security",
        "CCTV",
        "Concierge",
        "Parking",
        "Covered Parking",
        "Internet Ready",
        "Cable TV Ready",
        "Intercom",
        "Maintenance",
        "Cleaning Service",
        "Pets Allowed",
        "Furnished",
        "Semi Furnished",
        "Unfurnished",
      ],
      duplex: [
        "Private Pool",
        "Private Garden",
        "Garage",
        "Maid Room",
        "Driver Room",
        "Study Room",
        "Walk-in Closet",
        "Multiple Living Areas",
        "Formal Dining",
        "Family Room",
        "Home Office",
        "Storage Room",
        "Laundry Room",
        "BBQ Area",
        "Outdoor Kitchen",
        "Jacuzzi",
        "Fireplace",
        "High Ceilings",
        "Marble Floors",
        "Wooden Floors",
        "Smart Home",
        "Solar Panels",
        "Generator Backup",
        "Security System",
        "CCTV",
        "Landscaped Garden",
        "Tree-lined Street",
        "Gated Community",
      ],
      commercial: [
        "Air Conditioning",
        "Central Heating",
        "Built-in Wardrobes",
        "Balcony",
        "City View",
        "Sea View",
        "Marina View",
        "High Floor",
        "Elevator",
        "Swimming Pool",
        "Gym",
        "Security",
        "24/7 Security",
        "CCTV",
        "Concierge",
        "Parking",
        "Covered Parking",
        "Internet Ready",
        "Cable TV Ready",
        "Intercom",
        "Maintenance",
        "Cleaning Service",
        "Pets Allowed",
        "Furnished",
        "Semi Furnished",
        "Unfurnished",
      ],
      land: [
        "Electricity",
        "Water",
        "Sewage",
        "Road Access",
        "Fencing",
        "Security",
        "CCTV",
        "Gated Community",
      ],
    };

    return propertyTypeAmenitiesMap[propertyType] || [];
  },

  // Format price for display
  formatPrice: (price, currency = "AED") => {
    if (!price) return "Price on request";
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  },

  // Format date for display
  formatDate: (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-AE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  // Get status color for UI
  getStatusColor: (status) => {
    const colors = {
      draft: "gray",
      pending: "yellow",
      available: "green",
      sold: "blue",
      rented: "purple",
      archived: "red",
    };
    return colors[status] || "gray";
  },

  // Get listing type color for UI
  getListingTypeColor: (listingType) => {
    const colors = {
      sale: "blue",
      rent: "green",
    };
    return colors[listingType] || "gray";
  },

  // Get property type color for UI
  getPropertyTypeColor: (propertyType) => {
    const colors = {
      apartment: "blue",
      villa: "green",
      house: "purple",
      townhouse: "orange",
      penthouse: "red",
      studio: "teal",
      duplex: "indigo",
      commercial: "yellow",
      land: "brown",
    };
    return colors[propertyType] || "gray";
  },

  // Basic validation helper - most validation is now handled by backend
  validatePropertyData: (propertyData) => {
    // This function is kept for backward compatibility
    // Most validation is now handled by the backend API
    return {
      isValid: true,
      errors: [],
    };
  },

  // Format area for display
  formatArea: (area, unit = "sqft") => {
    if (!area) return "N/A";
    return `${area.toLocaleString()} ${unit}`;
  },

  // Get property status transitions
  getValidStatusTransitions: (currentStatus) => {
    const transitions = {
      draft: ["pending", "available", "archived"],
      pending: ["available", "draft", "archived"],
      available: ["sold", "rented", "pending", "draft", "archived"],
      sold: ["available", "draft", "archived"],
      rented: ["available", "draft", "archived"],
      archived: ["draft"],
    };

    return transitions[currentStatus] || [];
  },
};

export default api;
