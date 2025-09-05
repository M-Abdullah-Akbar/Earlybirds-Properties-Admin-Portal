import UserManagement from "@/components/dashboard/UserManagement";
import RoleProtectedRoute, {
  AccessDenied,
} from "@/components/auth/RoleProtectedRoute";
import React from "react";

export const metadata = {
  title: "User Management || Proty - Real Estate React Nextjs Template",
  description: "Proty - Real Estate React Nextjs Template",
};

export default function AdminUserManagementPage() {
  return (
    <RoleProtectedRoute
      requiredRoute="user-management"
      fallbackComponent={
        <AccessDenied
          message="SuperAdmin Access Required"
          description="Only SuperAdmin users can access user management features."
        />
      }
    >
      <UserManagement />
    </RoleProtectedRoute>
  );
}
