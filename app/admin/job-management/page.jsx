import JobManagement from "@/components/dashboard/JobManagement";
import React from "react";

export const metadata = {
  title: "Job Management || Earlybirds Properties Admin",
  description: "Manage career opportunities.",
};

export default function AdminJobManagementPage() {
  return (
    <>
      <JobManagement />
    </>
  );
}
