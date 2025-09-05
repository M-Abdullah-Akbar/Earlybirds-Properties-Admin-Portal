import PropertyApproval from "@/components/dashboard/PropertyApproval";
import RoleProtectedRoute, {
  AccessDenied,
} from "@/components/auth/RoleProtectedRoute";
import React from "react";

export const metadata = {
  title: "Property Approval || Proty - Real Estate React Nextjs Template",
  description: "Proty - Real Estate React Nextjs Template",
};

export default function PropertyApprovalPage() {
  return (
    <RoleProtectedRoute
      requiredRoute="property-approval"
      fallbackComponent={
        <AccessDenied
          message="SuperAdmin Access Required"
          description="Only SuperAdmin users can approve or reject properties."
        />
      }
    >
      <PropertyApproval />
    </RoleProtectedRoute>
  );
}
