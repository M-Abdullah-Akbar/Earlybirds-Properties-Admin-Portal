import EditProperty from "@/components/dashboard/EditProperty";
import React from "react";

export const metadata = {
  title: "Edit Property || Proty - Real Estate React Nextjs Template",
  description: "Proty - Real Estate React Nextjs Template",
};

export default async function AdminEditPropertyPage({ params }) {
  const { id } = await params;
  
  return (
    <>
      <EditProperty propertyId={id} />
    </>
  );
} 