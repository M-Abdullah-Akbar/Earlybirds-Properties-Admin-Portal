import { toast } from 'react-toastify';

// Custom toast configuration
const defaultConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

// Property CRUD operation notifications
const propertyNotifications = {
  // Create operations
  createSuccess: (propertyTitle = "Property") => {
    toast.success(`✅ ${propertyTitle} created successfully!`, {
      ...defaultConfig,
      autoClose: 4000,
    });
  },

  createError: (error = "We couldn't create your property. Please check all required fields are filled out correctly and try again.") => {
    toast.error(`❌ ${error}`, {
      ...defaultConfig,
      autoClose: 8000,
    });
  },

  // Read operations
  loadError: (error = "We're having trouble loading your properties. Please refresh the page or try again in a moment.") => {
    toast.error(`❌ ${error}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Update operations
  updateSuccess: (propertyTitle = "Property") => {
    toast.success(`✅ ${propertyTitle} updated successfully!`, {
      ...defaultConfig,
      autoClose: 4000,
    });
  },

  updateError: (error = "We couldn't save your changes. Please check all required fields are completed and try again.") => {
    toast.error(`❌ ${error}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Delete operations
  deleteSuccess: (propertyTitle = "Property") => {
    toast.success(`🗑️ ${propertyTitle} deleted successfully!`, {
      ...defaultConfig,
      autoClose: 4000,
    });
  },

  deleteError: (error = "We couldn't delete this property. It may be in use or you may not have permission. Please try again or contact support.") => {
    toast.error(`❌ ${error}`, {
      ...defaultConfig,
      autoClose: 8000,
    });
  },

  // Approval operations
  approveSuccess: (propertyTitle = "Property") => {
    toast.success(`✅ ${propertyTitle} approved successfully!`, {
      ...defaultConfig,
      autoClose: 4000,
    });
  },

  approvalError: (error = "We couldn't approve this property. Please ensure all required information is complete and try again.") => {
    toast.error(`❌ ${error}`, {
      ...defaultConfig,
      autoClose: 8000,
    });
  },

  rejectSuccess: (propertyTitle = "Property") => {
    toast.warning(`⚠️ ${propertyTitle} rejected successfully!`, {
      ...defaultConfig,
      autoClose: 4000,
    });
  },

  rejectionError: (error = "We couldn't reject this property. Please provide a clear reason for rejection (at least 10 characters) and try again.") => {
    toast.error(`❌ ${error}`, {
      ...defaultConfig,
      autoClose: 8000,
    });
  },

  // Bulk operations
  bulkSuccess: (count, operation) => {
    toast.success(`✅ ${count} properties ${operation} successfully!`, {
      ...defaultConfig,
      autoClose: 4000,
    });
  },

  bulkError: (error = "We couldn't complete this action for all selected properties. Some may have been processed successfully. Please refresh and try again for any remaining items.") => {
    toast.error(`❌ ${error}`, {
      ...defaultConfig,
      autoClose: 9000,
    });
  },
};

// General notification functions
const notifications = {
  success: (message, config = {}) => {
    toast.success(message, { ...defaultConfig, ...config });
  },

  error: (message, config = {}) => {
    toast.error(message, { ...defaultConfig, ...config });
  },

  warning: (message, config = {}) => {
    toast.warning(message, { ...defaultConfig, ...config });
  },

  info: (message, config = {}) => {
    toast.info(message, { ...defaultConfig, ...config });
  },

  // Loading notification with promise
  promise: (promise, messages, config = {}) => {
    return toast.promise(
      promise,
      {
        pending: messages.pending || 'Processing...',
        success: messages.success || 'Operation completed successfully!',
        error: messages.error || 'Operation failed!',
      },
      { ...defaultConfig, ...config }
    );
  },
};

// Validation error notifications
const validationNotifications = {
  fieldErrors: (errors) => {
    if (errors && typeof errors === 'object') {
      const errorCount = Object.keys(errors).length;
      if (errorCount === 1) {
        const [field, message] = Object.entries(errors)[0];
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
        toast.error(`❌ ${fieldName}: ${message}`, {
          ...defaultConfig,
          autoClose: 7000,
        });
      } else if (errorCount > 1) {
        toast.error(`❌ Please fix ${errorCount} required fields highlighted in red below`, {
          ...defaultConfig,
          autoClose: 8000,
        });
      }
    } else {
      toast.error('❌ Please fill in all required fields marked with * and fix any errors shown', {
        ...defaultConfig,
        autoClose: 7000,
      });
    }
  },

  required: (fieldName) => {
    const displayName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');
    toast.error(`❌ ${displayName} is required - please fill in this field to continue`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  invalid: (fieldName, reason = "Please check the format and try again") => {
    const displayName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');
    toast.error(`❌ ${displayName}: ${reason}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Common validation scenarios with specific guidance
  emailInvalid: () => {
    toast.error('❌ Please enter a valid email address (example: user@domain.com)', {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  phoneInvalid: () => {
    toast.error('❌ Please enter a valid phone number with country code (example: +971501234567)', {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  priceInvalid: () => {
    toast.error('❌ Please enter a valid price using numbers only (example: 1500000)', {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  imageRequired: () => {
    toast.error('❌ Please upload at least one property image to continue', {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  descriptionTooShort: (minLength = 50) => {
    toast.error(`❌ Description must be at least ${minLength} characters long to provide enough detail for potential buyers`, {
      ...defaultConfig,
      autoClose: 7000,
    });
  },

  fileTooLarge: (maxSize = '5MB') => {
    toast.error(`❌ File is too large. Please choose an image smaller than ${maxSize}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  unsupportedFileType: () => {
    toast.error('❌ Please upload only image files (JPG, PNG, or WebP format)', {
      ...defaultConfig,
      autoClose: 6000,
    });
  },
};

// Authentication notifications
const authNotifications = {
  loginSuccess: (userName = "User") => {
    toast.success(`🎉 Welcome back, ${userName}!`, {
      ...defaultConfig,
      autoClose: 3000,
    });
  },

  loginError: (error = "We couldn't log you in. Please check your email and password, then try again.") => {
    toast.error(`❌ ${error}`, {
      ...defaultConfig,
      autoClose: 7000,
    });
  },

  logoutSuccess: () => {
    toast.info(`👋 You have been logged out successfully`, {
      ...defaultConfig,
      autoClose: 3000,
    });
  },

  sessionExpired: () => {
    toast.warning('⏰ Your session has expired for security. Please log in again to continue.', {
      ...defaultConfig,
      autoClose: 7000,
    });
  },

  unauthorized: () => {
    toast.error('🚫 You don\'t have permission to perform this action. Please contact your administrator if you need access.', {
      ...defaultConfig,
      autoClose: 8000,
    });
  },
};

// Network and API notifications
const apiNotifications = {
  networkError: () => {
    toast.error('🌐 Connection problem - please check your internet connection and try again. If the problem continues, try refreshing the page.', {
      ...defaultConfig,
      autoClose: 8000,
    });
  },

  serverError: (message = "Something went wrong on our end. Please try again in a moment or contact support if the issue continues.") => {
    toast.error(`🔧 ${message}`, {
      ...defaultConfig,
      autoClose: 8000,
    });
  },

  timeout: () => {
    toast.error('⏱️ This is taking longer than expected. Please try again - if it keeps happening, check your internet connection.', {
      ...defaultConfig,
      autoClose: 8000,
    });
  },
};

// Helper function to parse backend validation errors and create user-friendly messages
const parseBackendErrors = (errorResponse) => {
  const errors = [];
  
  // Debug logging to see what we're receiving
  console.log('🔍 parseBackendErrors received:', errorResponse);
  
  // Handle different backend error response formats
  if (errorResponse.details && Array.isArray(errorResponse.details)) {
    console.log('✅ Found details array:', errorResponse.details);
    errorResponse.details.forEach(detail => {
      if (detail.field && detail.message) {
        const fieldName = formatFieldName(detail.field);
        const errorMsg = `${fieldName}: ${detail.message}`;
        console.log('📝 Adding error:', errorMsg);
        errors.push(errorMsg);
      }
    });
  } else if (errorResponse.fieldErrors && typeof errorResponse.fieldErrors === 'object') {
    console.log('✅ Found fieldErrors object:', errorResponse.fieldErrors);
    Object.entries(errorResponse.fieldErrors).forEach(([field, message]) => {
      const fieldName = formatFieldName(field);
      errors.push(`${fieldName}: ${message}`);
    });
  } else if (errorResponse.errors && typeof errorResponse.errors === 'object') {
    console.log('✅ Found errors object:', errorResponse.errors);
    Object.entries(errorResponse.errors).forEach(([field, message]) => {
      const fieldName = formatFieldName(field);
      errors.push(`${fieldName}: ${message}`);
    });
  } else {
    console.log('❌ No recognized error format found in:', errorResponse);
  }
  
  console.log('🎯 Final parsed errors:', errors);
  return errors;
};

// Helper function to format field names for user display
const formatFieldName = (fieldName) => {
  if (!fieldName) return 'Unknown field';
  
  // Handle nested field names (e.g., "location.emirate" -> "Location - Emirate")
  if (fieldName.includes('.')) {
    return fieldName
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, ' $1'))
      .join(' - ');
  }
  
  // Convert camelCase to readable format
  return fieldName
    .charAt(0).toUpperCase() + 
    fieldName.slice(1).replace(/([A-Z])/g, ' $1');
};

// Enhanced validation notifications with backend error parsing
const enhancedValidationNotifications = {
  ...validationNotifications,
  
  // Parse and display backend validation errors
  backendErrors: (errorResponse, customMessage = null) => {
    const errors = parseBackendErrors(errorResponse);
    
    if (errors.length === 0) {
      // Fallback if no specific field errors found
      toast.error(customMessage || 'Please check your input and try again.', {
        ...defaultConfig,
        autoClose: 6000,
      });
      return;
    }
    
    // Show multiple field errors in a single notification
    if (errors.length === 1) {
      toast.error(`❌ ${errors[0]}`, {
        ...defaultConfig,
        autoClose: 8000,
      });
    } else {
      const errorMessage = `Please fix the following issues:\n• ${errors.join('\n• ')}`;
      toast.error(`❌ ${errorMessage}`, {
        ...defaultConfig,
        autoClose: 10000,
        style: {
          whiteSpace: 'pre-line'
        }
      });
    }
  },
  
  // Show field-specific error with context
  fieldError: (fieldName, message, context = null) => {
    const formattedFieldName = formatFieldName(fieldName);
    const fullMessage = context 
      ? `${formattedFieldName}: ${message}. ${context}`
      : `${formattedFieldName}: ${message}`;
    
    toast.error(`❌ ${fullMessage}`, {
      ...defaultConfig,
      autoClose: 7000,
    });
  }
};

// User management notifications
const userNotifications = {
  // User creation notifications
  createSuccess: (userName) => {
    toast.success(`✅ User "${userName}" created successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  createError: (message = "Failed to create user") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // User update notifications
  updateSuccess: (userName) => {
    toast.success(`✅ User "${userName}" updated successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  updateError: (message = "Failed to update user") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // User deletion notifications
  deleteSuccess: (userName) => {
    toast.success(`✅ User "${userName}" deleted successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  deleteError: (message = "Failed to delete user") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // User status change notifications
  statusChangeSuccess: (userName, isActive) => {
    const action = isActive ? "activated" : "deactivated";
    toast.success(`✅ User "${userName}" ${action} successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  statusChangeError: (message = "Failed to change user status") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // User role change notifications
  roleChangeSuccess: (userName, newRole) => {
    toast.success(`✅ User "${userName}" role changed to ${newRole}!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  roleChangeError: (message = "Failed to change user role") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // User profile update notifications
  profileUpdateSuccess: (userName) => {
    toast.success(`✅ Profile for "${userName}" updated successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  profileUpdateError: (message = "Failed to update profile") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // User password change notifications
  passwordChangeSuccess: () => {
    toast.success(`✅ Password changed successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  passwordChangeError: (message = "Failed to change password") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // User loading notifications
  loading: (message = "Processing user...") => {
    toast.info(`⏳ ${message}`, {
      ...defaultConfig,
      autoClose: 3000,
    });
  },

  // User validation notifications
  validationError: (message = "Please check your user details") => {
    toast.error(`⚠️ ${message}`, {
      ...defaultConfig,
      autoClose: 8000,
    });
  },

  // User permission notifications
  permissionDenied: (action = "perform this action") => {
    toast.error(`🚫 You don't have permission to ${action}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // User account security notifications
  accountLocked: (userName) => {
    toast.warning(`⚠️ Account "${userName}" has been locked due to multiple failed login attempts`, {
      ...defaultConfig,
      autoClose: 8000,
    });
  },
  accountUnlocked: (userName) => {
    toast.success(`✅ Account "${userName}" has been unlocked successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },

  // User data transfer notifications
  dataTransferSuccess: (fromUser, toUser) => {
    toast.success(`✅ Data transferred from "${fromUser}" to "${toUser}" successfully!`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },
  dataTransferError: (message = "Failed to transfer user data") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Enhanced backend error parsing for users
  backendErrors: (errorResponse, customMessage = null) => {
    const errors = parseBackendErrors(errorResponse);
    
    if (errors.length === 0) {
      // Fallback if no specific field errors found
      toast.error(customMessage || 'Please check your user details and try again.', {
        ...defaultConfig,
        autoClose: 6000,
      });
      return;
    }
    
    // Show multiple field errors in a single notification
    if (errors.length === 1) {
      toast.error(`❌ ${errors[0]}`, {
        ...defaultConfig,
        autoClose: 8000,
      });
    } else {
      const errorMessage = `Please fix the following issues:\n• ${errors.join('\n• ')}`;
      toast.error(`❌ ${errorMessage}`, {
        ...defaultConfig,
        autoClose: 10000,
        style: {
          whiteSpace: 'pre-line'
        }
      });
    }
  },
};

// Blog management notifications
const blogNotifications = {
  // Blog creation notifications
  createSuccess: (blogTitle) => {
    toast.success(`✅ Blog "${blogTitle}" created successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  createError: (message = "Failed to create blog") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Blog update notifications
  updateSuccess: (blogTitle) => {
    toast.success(`✅ Blog "${blogTitle}" updated successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  updateError: (message = "Failed to update blog") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Blog deletion notifications
  deleteSuccess: (blogTitle) => {
    toast.success(`✅ Blog "${blogTitle}" deleted successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  deleteError: (message = "Failed to delete blog") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Blog fetch notifications
  fetchError: (message = "Failed to fetch blog") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Blog status change notifications
  statusChangeSuccess: (blogTitle, newStatus) => {
    toast.success(`✅ Blog "${blogTitle}" status changed to ${newStatus}!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  statusChangeError: (message = "Failed to change blog status") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Blog validation notifications
  validationError: (message = "Please check your blog details") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 7000,
    });
  },
};

// Blog category management notifications
const blogCategoryNotifications = {
  // Blog category creation notifications
  createSuccess: (categoryName) => {
    toast.success(`✅ Blog category "${categoryName}" created successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  createError: (message = "Failed to create blog category") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Blog category update notifications
  updateSuccess: (categoryName) => {
    toast.success(`✅ Blog category "${categoryName}" updated successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  updateError: (message = "Failed to update blog category") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Blog category deletion notifications
  deleteSuccess: (categoryName) => {
    toast.success(`✅ Blog category "${categoryName}" deleted successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  deleteError: (message = "Failed to delete blog category") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Blog category fetch notifications
  fetchError: (message = "Failed to load blog categories") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Blog category approval notifications
  approvalSuccess: (categoryName, action) => {
    const actionText = action === 'approve' ? 'approved' : 'rejected';
    toast.success(`✅ Blog category "${categoryName}" ${actionText} successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  approvalError: (message = "Failed to process category approval") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },

  // Blog category status change notifications
  statusChangeSuccess: (categoryName, isActive) => {
    const action = isActive ? "activated" : "deactivated";
    toast.success(`✅ Blog category "${categoryName}" ${action} successfully!`, {
      ...defaultConfig,
      autoClose: 5000,
    });
  },
  statusChangeError: (message = "Failed to change category status") => {
    toast.error(`❌ ${message}`, {
      ...defaultConfig,
      autoClose: 6000,
    });
  },
};

// Export individual notification objects for direct import
export {
  propertyNotifications,
  userNotifications,
  blogNotifications,
  blogCategoryNotifications,
  notifications,
  enhancedValidationNotifications as validationNotifications,
  authNotifications,
  apiNotifications,
};

// Default export for grouped access
export default {
  property: propertyNotifications,
  user: userNotifications,
  blog: blogNotifications,
  blogCategory: blogCategoryNotifications,
  general: notifications,
  validation: enhancedValidationNotifications,
  auth: authNotifications,
  api: apiNotifications,
};