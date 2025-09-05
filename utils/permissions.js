/**
 * Frontend Permission Utility
 * Mirrors the backend permissions.js for consistent access control
 */

const rolePermissions = {
  SuperAdmin: {
    properties: {
      Create: "any",
      Read: "any",
      Update: "any",
      Delete: "any",
      Approve: "any", // SuperAdmin can approve/reject properties
    },
    users: {
      Create: "any",
      Read: "any",
      Update: "own",
      UpdateStatus: "any", // SuperAdmin can update user status (active/inactive)
      Delete: "any",
    },
  },
  admin: {
    properties: {
      Create: "any",
      Read: "own", // Admin can only read their own properties
      Update: "own", // Admin can only update their own properties
      Delete: "rejected_or_draft", // Admin can only delete their own rejected or draft properties
    },
    users: {
      Read: "own",
      Update: "own",
    },
  },
  visitor: {
    properties: {
      Read: "published_only",
    },
  },
};

/**
 * Check if user has permission for a specific action
 * @param {Object} user - User object with role
 * @param {string} resource - Resource type (properties, users)
 * @param {string} action - Action type (Create, Read, Update, Delete, etc.)
 * @param {Object} targetResource - Optional: the resource being accessed (for ownership checks)
 * @returns {boolean} - Whether user has permission
 */
export const hasPermission = (
  user,
  resource,
  action,
  targetResource = null
) => {
  if (!user || !user.role) return false;

  const userRole = user.role;
  const permissions = rolePermissions[userRole];

  if (!permissions || !permissions[resource]) return false;

  const permission = permissions[resource][action];

  if (!permission) return false;

  // Handle different permission types
  switch (permission) {
    case "any":
      return true;
    case "own":
      // Check if user owns the resource
      if (!targetResource) return true; // Allow if no specific resource to check

      const ownsResource =
        targetResource.userId === user.id ||
        targetResource.createdBy === user.id ||
        (targetResource.createdBy &&
          targetResource.createdBy._id === user.id) ||
        (targetResource.createdBy &&
          targetResource.createdBy.toString() === user.id.toString());

      return ownsResource;
    case "rejected_only":
      // For properties: can only delete rejected properties they own
      if (!targetResource) return false;
      return (
        targetResource.approvalStatus === "rejected" &&
        (targetResource.userId === user.id ||
          targetResource.createdBy === user.id)
      );
    case "rejected_or_draft":
      // For properties: can only delete rejected or draft properties they own
      if (!targetResource) return false;
      const ownsProperty =
        targetResource.userId === user.id ||
        targetResource.createdBy === user.id ||
        (targetResource.createdBy &&
          targetResource.createdBy._id === user.id) ||
        (targetResource.createdBy &&
          targetResource.createdBy.toString() === user.id.toString());

      return (
        ownsProperty &&
        (targetResource.approvalStatus === "rejected" ||
          targetResource.status === "draft")
      );
    case "published_only":
      // For properties: can only read published properties
      if (!targetResource) return true; // Allow listing
      return ["available", "sold", "rented", "pending"].includes(
        targetResource.status
      );
    default:
      return false;
  }
};

/**
 * Check if user can access a specific page/route
 * @param {Object} user - User object with role
 * @param {string} route - Route name
 * @returns {boolean} - Whether user can access the route
 */
export const canAccessRoute = (user, route) => {
  if (!user || !user.role) return false;

  const userRole = user.role;

  // Routes accessible to all authenticated users
  const commonRoutes = [
    "dashboard",
    "my-profile",
    "change-password",
    "property-management", // All can view properties
    "add-property", // All can add properties
  ];

  if (commonRoutes.includes(route)) return true;

  // SuperAdmin-only routes
  const superAdminRoutes = ["user-management", "add-user", "property-approval"];

  if (superAdminRoutes.includes(route)) {
    return userRole === "SuperAdmin";
  }

  // Dynamic routes that need permission checking
  if (route.startsWith("edit-property")) {
    return hasPermission(user, "properties", "Update");
  }

  if (route.startsWith("user-profile")) {
    return hasPermission(user, "users", "Read");
  }

  return false;
};

/**
 * Get filtered menu items based on user permissions
 * @param {Object} user - User object with role
 * @returns {Array} - Array of menu items user can access
 */
export const getAccessibleMenuItems = (user) => {
  if (!user || !user.role) return [];

  const allMenuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      route: "dashboard",
      icon: "dashboard",
    },
    {
      id: "my-profile",
      name: "My Profile",
      route: "my-profile",
      icon: "profile",
    },
    {
      id: "user-management",
      name: "Users",
      route: "user-management",
      icon: "users",
      superAdminOnly: true,
    },
    {
      id: "property-management",
      name: "Properties",
      route: "property-management",
      icon: "properties",
    },
    {
      id: "property-approval",
      name: "Property Approval",
      route: "property-approval",
      icon: "approval",
      superAdminOnly: true,
    },
    {
      id: "change-password",
      name: "Change Password",
      route: "change-password",
      icon: "password",
    },
  ];

  return allMenuItems.filter((item) => {
    if (item.superAdminOnly) {
      return user.role === "SuperAdmin";
    }
    return canAccessRoute(user, item.route);
  });
};

/**
 * Check if user can perform action on a specific property
 * @param {Object} user - User object
 * @param {string} action - Action (Update, Delete, Approve)
 * @param {Object} property - Property object
 * @returns {boolean}
 */
export const canManageProperty = (user, action, property) => {
  return hasPermission(user, "properties", action, property);
};

/**
 * Check if user can manage other users
 * @param {Object} user - User object
 * @param {string} action - Action (Create, Read, Update, Delete)
 * @param {Object} targetUser - Target user object (optional)
 * @returns {boolean}
 */
export const canManageUser = (user, action, targetUser = null) => {
  return hasPermission(user, "users", action, targetUser);
};

export default {
  hasPermission,
  canAccessRoute,
  getAccessibleMenuItems,
  canManageProperty,
  canManageUser,
  rolePermissions,
};
