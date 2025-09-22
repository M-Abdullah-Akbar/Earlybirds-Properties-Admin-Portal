import EditBlog from "@/components/dashboard/EditBlog";
import React from "react";

export const metadata = {
  title: "Edit Blog || Proty - Real Estate React Nextjs Template",
  description: "Proty - Real Estate React Nextjs Template",
};

export default async function AdminEditBlogPage({ params }) {
  const { id } = await params;
  return (
    <>
      <EditBlog blogId={id} />
    </>
  );
}
