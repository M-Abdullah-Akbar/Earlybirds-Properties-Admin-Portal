import EditJob from "@/components/dashboard/EditJob";
import React from "react";

export const metadata = {
  title: "Edit Job || Earlybirds Properties Admin",
  description: "Edit job details.",
};

export default async function EditJobPage({ params }) {
    const { id } = await params;
  return (
    <>
      <EditJob id={id} />
    </>
  );
}
