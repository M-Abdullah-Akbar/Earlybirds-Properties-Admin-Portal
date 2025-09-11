import EditBlogCategory from "@/components/dashboard/EditBlogCategory";
import React from "react";

export const metadata = {
  title: "Edit Blog Category || Proty - Real Estate React Nextjs Template",
  description: "Proty - Real Estate React Nextjs Template",
};

export default function AdminEditBlogCategoryPage({ params }) {
  return (
    <>
      <EditBlogCategory categoryId={params.id} />
    </>
  );
}
