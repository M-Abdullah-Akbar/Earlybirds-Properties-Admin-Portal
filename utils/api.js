import axios from "axios";
import { safeLocalStorage, safeWindow } from "./clientUtils";
import { canAccessRoute } from "../utils/permissions";

// Base API configuration
const API_BASE_URL = "https://api.earlybirdsproperties.com/api";

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

      // Skip auth data clearing for login and change password requests - 401 is expected for invalid credentials
      if (
        error.config?.url === "/auth/login" ||
        error.config?.url?.includes("/auth/login") ||
        error.config?.url === "/auth/change-password" ||
        error.config?.url?.includes("/auth/change-password")
      ) {
        console.log("✅ 401 from login/change-password - not clearing auth");
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
    const response = await api.post("/users", userData, {
      validateStatus: (status) => {
        // Treat 400 (validation errors) as successful response to avoid AxiosError
        return status < 500;
      },
    });
    return response.data;
  },

  // Update user - PUT /api/users/:id
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);

    // Transform the response data to ensure React compatibility
    if (response.data && response.data.data && response.data.data.user) {
      response.data.data.user = transformUserData(response.data.data.user);
    }

    return response.data;
  },

  // Update user status - PATCH /api/users/:id/status
  updateUserStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`/users/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      // Handle 403 errors gracefully by returning the error response
      if (error.response && error.response.status === 403) {
        return error.response.data;
      }
      // Re-throw other errors
      throw error;
    }
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

  // Transfer property ownership - PATCH /api/users/:id/transfer-properties
  transferPropertyOwnership: async (currentOwnerId, data) => {
    const response = await api.patch(
      `/users/${currentOwnerId}/transfer-properties`,
      data
    );
    return response.data;
  },
};

// Dashboard API functions - aggregates data from other endpoints
export const dashboardAPI = {
  // Get dashboard statistics
  getDashboardStats: async (currentUser = null) => {
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

      // Get users stats - only for users who can access user management
      if (currentUser && canAccessRoute(currentUser, "user-management")) {
        try {
          // Fetch all users with pagination (respecting backend limit of 10)
          let page = 1;
          let hasMorePages = true;
          const limit = 10; // Maximum allowed by backend
          users = [];

          while (hasMorePages) {
            const usersResponse = await userAPI.getUsers({ page, limit });

            if (usersResponse.success && usersResponse.data?.users) {
              // Add users to the array
              const pageUsers = usersResponse.data.users
                .map(transformUserData)
                .filter(Boolean);
              users = users.concat(pageUsers);

              // Check if there are more pages
              const pagination = usersResponse.data.pagination;
              hasMorePages = pagination && page < pagination.pages;
              page++;
            } else {
              hasMorePages = false;
            }
          }
        } catch (error) {
          console.error("Error fetching users:", error);
          // Continue with empty users array
        }
      } else {
        console.log(
          "User does not have permission to access user management - skipping user stats"
        );
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

  // Create property with images - POST /api/properties (handles file uploads)
  createProperty: async (propertyData) => {
    try {
      // Check if propertyData is FormData (file upload) or regular object (pre-processed images)
      if (propertyData instanceof FormData) {
        // File upload - use the new endpoint that handles validation first
        const response = await api.post("/properties", propertyData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } else {
        // Pre-processed image data - use the existing endpoint
        const response = await api.post(
          "/properties/with-images",
          propertyData
        );
        return response.data;
      }
    } catch (error) {
      // Handle validation errors (400) as expected responses, not errors
      if (error.response && error.response.status === 400) {
        // Return the validation error response data instead of throwing
        return error.response.data;
      }
      // For other errors (401, 403, 500, etc.), re-throw the error
      throw error;
    }
  },

  // Update property - PUT /api/properties/:id (handles file uploads same as create)
  updateProperty: async (id, propertyData) => {
    try {
      // Check if propertyData is FormData (file upload) or regular object
      if (propertyData instanceof FormData) {
        // File upload - use multipart/form-data
        const response = await api.put(`/properties/${id}`, propertyData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } else {
        // Regular JSON data
        const response = await api.put(`/properties/${id}`, propertyData);
        return response.data;
      }
    } catch (error) {
      // Handle validation errors (400) as expected responses, not errors
      if (error.response && error.response.status === 400) {
        // Return the validation error response data instead of throwing
        return error.response.data;
      }
      // For other errors (401, 403, 500, etc.), re-throw the error
      throw error;
    }
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

  // Property Approval API functions (SuperAdmin only)
  // Get pending properties for approval - GET /api/property-approval/pending
  getPendingProperties: async (params = {}) => {
    const response = await api.get("/property-approval/pending", { params });

    // Transform the response data to ensure React compatibility
    if (response.data && response.data.data && response.data.data.properties) {
      response.data.data.properties = response.data.data.properties
        .map(transformPropertyData)
        .filter(Boolean);
    }

    return response.data;
  },

  // Get approval statistics - GET /api/property-approval/stats
  getApprovalStats: async () => {
    const response = await api.get("/property-approval/stats");
    return response.data;
  },

  // Approve property - PATCH /api/property-approval/:id/approve
  approveProperty: async (id, notes = "") => {
    const response = await api.patch(`/property-approval/${id}/approve`, {
      notes,
    });
    return response.data;
  },

  // Reject property - PATCH /api/property-approval/:id/reject
  rejectProperty: async (id, data) => {
    const response = await api.patch(`/property-approval/${id}/reject`, data);
    return response.data;
  },

  // Bulk approve/reject properties - PATCH /api/property-approval/bulk
  bulkApproval: async (data) => {
    const response = await api.patch("/property-approval/bulk", data);
    return response.data;
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
    // Transform isActive boolean to status string for consistency
    status:
      user.isActive !== undefined
        ? user.isActive
          ? "active"
          : "inactive"
        : "inactive",
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

  // Get available property statuses based on operation type
  getPropertyStatuses: (
    operation = "all",
    currentStatus = null,
    previousStatus = undefined
  ) => {
    const allStatuses = [
      "draft",
      "pending",
      "available",
      "sold",
      "rented",
      "archived",
    ];

    switch (operation) {
      case "create":
        // When creating: only draft and available
        return ["draft", "available"];
      case "update":
        // When updating: status transitions based on current status
        if (!currentStatus) {
          // If no current status, return all except draft
          return ["pending", "available", "sold", "rented", "archived"];
        }

        switch (currentStatus) {
          case "draft":
            // From draft: can only go to available (or stay draft)
            return ["draft", "available"];
          case "available":
            // From available: can select any other status
            return ["available", "pending", "sold", "rented", "archived"];
          case "pending":
            // From pending: can select any other status
            return ["pending", "available", "sold", "rented", "archived"];
          case "sold":
          case "rented":
            // From sold or rented: can only select archived (or keep current)
            return [currentStatus, "archived"];
          case "archived":
            // From archived: can only go back to the previous status
            const baseOptions = ["archived"];

            if (previousStatus) {
              // If we know the previous status, allow going back to it only
              if (!baseOptions.includes(previousStatus)) {
                baseOptions.push(previousStatus);
              }
            } else {
              // This should not happen in normal flow since properties always have status history
              // But if it does, we'll only allow staying archived to prevent invalid transitions
              console.warn(
                "⚠️ Archived property found without previousStatus - this should not happen"
              );
            }

            return baseOptions;
          default:
            // Default: all except draft
            return ["pending", "available", "sold", "rented", "archived"];
        }
      default:
        // Default: all statuses
        return allStatuses;
    }
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
  getValidStatusTransitions: (currentStatus, previousStatus = null) => {
    const transitions = {
      draft: ["draft", "available"],
      pending: ["pending", "available", "sold", "rented", "archived"],
      available: ["available", "pending", "sold", "rented", "archived"],
      sold: ["sold", "archived"],
      rented: ["rented", "archived"],
      archived: previousStatus ? ["archived", previousStatus] : ["archived"],
    };

    return transitions[currentStatus] || [];
  },
};

// Blog API functions - matches backend /api/blogs routes exactly
export const blogAPI = {
  // Get all blogs with filtering and pagination - GET /api/blogs
  getBlogs: async (params = {}) => {
    const response = await api.get("/blogs", { params });
    return response.data;
  },

  // Get single blog - GET /api/blogs/:id
  getBlog: async (id) => {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  },

  // Get blog by slug - GET /api/blogs/slug/:slug
  getBlogBySlug: async (slug) => {
    const response = await api.get(`/blogs/slug/${slug}`);
    return response.data;
  },

  // Create blog - POST /api/blogs/with-images (handles both form data and images)
  createBlog: async (blogData) => {
    try {
      const response = await api.post("/blogs/with-images", blogData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        validateStatus: (status) => {
          return status < 500;
        },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Update blog - PUT /api/blogs/:id/with-images (handles both form data and images)
  updateBlog: async (id, blogData) => {
    try {
      const response = await api.put(`/blogs/${id}/with-images`, blogData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        validateStatus: (status) => {
          return status < 500;
        },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Delete blog - DELETE /api/blogs/:id
  deleteBlog: async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },

  // Delete specific image from blog - DELETE /api/blogs/:id/images/:imageId
  deleteBlogImage: async (blogId, imageId) => {
    const response = await api.delete(`/blogs/${blogId}/images/${imageId}`);
    return response.data;
  },

  // Set image as main blog image - PUT /api/blogs/:id/images/:imageId/main
  setMainBlogImage: async (blogId, imageId) => {
    const response = await api.put(`/blogs/${blogId}/images/${imageId}/main`);
    return response.data;
  },

  // Get blog statistics
  getBlogStats: async () => {
    try {
      const response = await api.get("/blogs", { params: { limit: 10 } });

      if (response.data && response.data.data && response.data.data.blogs) {
        const blogs = response.data.data.blogs;

        const stats = {
          total: blogs.length,
          published: blogs.filter((b) => b.status === "published").length,
          draft: blogs.filter((b) => b.status === "draft").length,
          archived: blogs.filter((b) => b.status === "archived").length,
          byCategory: {},
        };

        // Group by category
        blogs.forEach((blog) => {
          if (blog.category && blog.category.name) {
            const categoryName = blog.category.name;
            stats.byCategory[categoryName] =
              (stats.byCategory[categoryName] || 0) + 1;
          }
        });

        return {
          success: true,
          data: stats,
        };
      }

      return {
        success: false,
        error: "Failed to fetch blog statistics",
      };
    } catch (err) {
      console.error("Error fetching blog stats:", err);
      return {
        success: false,
        error: "Failed to fetch blog statistics",
      };
    }
  },
};

// Blog Category API functions - matches backend /api/blog-categories routes exactly
export const blogCategoryAPI = {
  // Get all blog categories - GET /api/blog-categories
  getCategories: async (params = {}) => {
    const response = await api.get("/blog-categories", { params });
    return response.data;
  },

  // Get single blog category - GET /api/blog-categories/:id
  getCategory: async (id) => {
    const response = await api.get(`/blog-categories/${id}`);
    return response.data;
  },

  // Create blog category - POST /api/blog-categories
  createCategory: async (categoryData) => {
    try {
      const response = await api.post("/blog-categories", categoryData, {
        validateStatus: (status) => {
          return status < 500;
        },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Update blog category - PUT /api/blog-categories/:id
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/blog-categories/${id}`, categoryData, {
        validateStatus: (status) => {
          return status < 500;
        },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Delete blog category - DELETE /api/blog-categories/:id
  deleteCategory: async (id) => {
    const response = await api.delete(`/blog-categories/${id}`);
    return response.data;
  },

  // Get pending categories for approval - GET /api/blog-category-approval/pending
  getPendingCategories: async (params = {}) => {
    try {
      const response = await api.get("/blog-category-approval/pending", {
        params,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error || "Failed to fetch pending categories",
      };
    }
  },

  // Approve category - PATCH /api/blog-category-approval/:id/approve
  approveCategory: async (id) => {
    try {
      const response = await api.patch(`/blog-category-approval/${id}/approve`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to approve category",
      };
    }
  },

  // Reject category - PATCH /api/blog-category-approval/:id/reject
  rejectCategory: async (id, data) => {
    try {
      const response = await api.patch(
        `/blog-category-approval/${id}/reject`,
        data,
        {
          validateStatus: (status) => {
            return status < 500;
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return error.response.data;
      }
      return {
        success: false,
        error: error.response?.data?.error || "Failed to reject category",
      };
    }
  },

  // Get category approval stats - GET /api/blog-category-approval/stats
  getApprovalStats: async () => {
    try {
      const response = await api.get("/blog-category-approval/stats");
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch category approval statistics",
      };
    }
  },
};

// Job API functions - matches backend /api/jobs routes exactly
export const jobAPI = {
  // Get all jobs (admin) - GET /api/jobs/admin/all
  getAllJobsAdmin: async (params = {}) => {
    const response = await api.get("/jobs/admin/all", { params });
    return response.data;
  },

  // Get single job - GET /api/jobs/:id
  getJob: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Create job - POST /api/jobs
  createJob: async (jobData) => {
    const response = await api.post("/jobs", jobData);
    return response.data;
  },

  // Update job - PUT /api/jobs/:id
  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Delete job - DELETE /api/jobs/:id
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};

export default api;
