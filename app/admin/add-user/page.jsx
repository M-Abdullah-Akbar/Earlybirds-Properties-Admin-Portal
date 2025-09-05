import AddUser from "@/components/dashboard/AddUser";
import RoleProtectedRoute, {
  AccessDenied,
} from "@/components/auth/RoleProtectedRoute";
import React from "react";

export const metadata = {
  title: "Add User || Proty - Real Estate React Nextjs Template",
  description: "Proty - Real Estate React Nextjs Template",
};

export default function AdminAddUserPage() {
  return (
    <RoleProtectedRoute
      requiredRoute="add-user"
      fallbackComponent={
        <AccessDenied
          message="SuperAdmin Access Required"
          description="Only SuperAdmin users can create new users."
        />
      }
    >
      <AddUser />
    </RoleProtectedRoute>
  );
}
