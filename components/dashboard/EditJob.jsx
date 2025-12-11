"use client";
import React, { useState, useEffect } from "react";
import AddJob from "@/components/dashboard/AddJob";

import { jobAPI } from "@/utils/api";

export default function EditJob({ id }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await jobAPI.getJob(id);
        
        if (res.success) {
          setJob(res.data);
        } else {
          setError(res.error || "Job not found");
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to fetch job details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner wrap-dashboard-content">
            <div className="widget-box-2 wd-listing">
                <div className="text-center py-50">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="main-content w-100">
            <div className="main-content-inner wrap-dashboard-content">
                <div className="alert alert-danger">{error}</div>
            </div>
        </div>
    );
  }

  return job ? <AddJob isEdit={true} initialData={job} /> : null;
}
