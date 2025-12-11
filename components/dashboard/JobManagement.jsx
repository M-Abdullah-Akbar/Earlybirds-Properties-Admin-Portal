"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
// Assuming we'll create a jobAPI in utils/api or similar, for now I'll mock/setup the call
import { jobAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";

export default function JobManagement() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchJobs = async () => {
    try {
        setLoading(true);
        const res = await jobAPI.getAllJobsAdmin();
        if(res.success) {
            setJobs(res.data);
        } else {
            setError(res.error);
        }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
      if(!confirm("Are you sure you want to delete this job?")) return;
      try {
        const res = await jobAPI.deleteJob(id);
        if(res.success) {
            fetchJobs();
        } else {
            alert("Failed to delete");
        }
      } catch(err) {
          console.error(err);
          alert("Error deleting job");
      }
  }

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

  return (
    <div className="main-content w-100">
      <div className="main-content-inner wrap-dashboard-content">
        <div className="widget-box-2 wd-listing mb-20">
          <div className="d-flex justify-content-between align-items-center mb-20">
            <h3 className="title">Job Management</h3>
            <Link
              href="/admin/add-job"
              className="tf-btn bg-color-primary pd-13"
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: "8px" }}
              >
                <path
                  d="M8 3.33334V12.6667"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.6667 8H3.33333"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Post New Job
            </Link>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.title}</td>
                    <td>{job.department}</td>
                    <td>{job.location}</td>
                    <td>
                        <span className={`btn-status ${job.status === 'active' ? 'active' : 'pending'}`}>
                            {job.status}
                        </span>
                    </td>
                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link href={`/admin/edit-job/${job._id}`} className="btn btn-sm btn-outline-primary">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(job._id)} className="btn btn-sm btn-outline-danger">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                    <tr>
                        <td colSpan="6" className="text-center">No jobs found</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
