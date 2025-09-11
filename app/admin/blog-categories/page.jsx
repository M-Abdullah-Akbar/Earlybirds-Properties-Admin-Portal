import BlogCategoryManagement from "@/components/dashboard/BlogCategoryManagement";
import React from "react";

export const metadata = {
  title: "Blog Categories || Proty - Real Estate React Nextjs Template",
  description: "Proty - Real Estate React Nextjs Template",
};

export default function AdminBlogCategoriesPage() {
  return (
    <>
      <BlogCategoryManagement />
    </>
  );
}
