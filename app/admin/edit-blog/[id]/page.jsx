import EditBlog from "@/components/dashboard/EditBlog";
import React from "react";

export const metadata = {
  title: "Edit Blog || Proty - Real Estate React Nextjs Template",
  description: "Proty - Real Estate React Nextjs Template",
};

export default function AdminEditBlogPage({ params }) {
  return (
    <>
      <EditBlog blogId={params.id} />
    </>
  );
}
