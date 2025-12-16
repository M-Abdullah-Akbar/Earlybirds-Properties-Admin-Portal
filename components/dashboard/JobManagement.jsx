"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { jobAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

export default function JobManagement() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    closed: 0
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getAllJobsAdmin();
      if (res.success) {
        const fetchedJobs = res.data || [];
        setJobs(fetchedJobs);

        // Calculate Stats
        setStats({
          total: fetchedJobs.length,
          active: fetchedJobs.filter(j => j.status === 'active').length,
          closed: fetchedJobs.filter(j => j.status !== 'active').length
        });
      } else {
        setError(res.error || "Failed to fetch jobs");
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    setDeleteLoading(true);
    try {
      const res = await jobAPI.deleteJob(jobToDelete._id);
      if (res.success) {
        fetchJobs(); // Refresh list
        setShowDeleteModal(false);
        setJobToDelete(null);
      } else {
        alert(res.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting job");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  // Filter Logic
  const getFilteredJobs = () => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || job.status === statusFilter.toLowerCase();
      const matchesDept = deptFilter === 'All' || job.department === deptFilter;

      return matchesSearch && matchesStatus && matchesDept;
    });
  };

  const filteredJobs = getFilteredJobs();
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, deptFilter]);


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
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px" }}>
                <path d="M8 3.33334V12.6667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12.6667 8H3.33333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Post New Job
            </Link>
          </div>

          {error && <div className="alert alert-danger mb-20">{error}</div>}

          {/* Stats Section */}
          <div className="flat-counter-v2 tf-counter mb-20">
            <div className="counter-box">
              <div className="box-icon" style={{ width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="icon" style={{ fontSize: "28px", width: "28px", height: "28px", display: "block" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 22V12H15V22" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <div className="content-box">
                <div className="title-count text-variant-1" style={{ fontSize: "16px" }}>Total Jobs</div>
                <div className="box-count"><div className="number" style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.total}</div></div>
              </div>
            </div>

            <div className="counter-box">
              <div className="box-icon" style={{ width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="icon" style={{ fontSize: "28px", width: "28px", height: "28px", display: "block" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <div className="content-box">
                <div className="title-count text-variant-1" style={{ fontSize: "16px" }}>Active Jobs</div>
                <div className="box-count"><div className="number" style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.active}</div></div>
              </div>
            </div>
            <div className="counter-box">
              <div className="box-icon" style={{ width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="icon" style={{ fontSize: "28px", width: "28px", height: "28px", display: "block" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 15" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <div className="content-box">
                <div className="title-count text-variant-1" style={{ fontSize: "16px" }}>Closed Jobs</div>
                <div className="box-count"><div className="number" style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.closed}</div></div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="row mb-20">
            <div className="col-md-4">
              <fieldset className="box-fieldset">
                <label style={{ color: "var(--text-color, #333)" }}>Search Jobs:</label>
                <input type="text" className="form-control" placeholder="Search by title or location" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ color: "var(--text-color, #333)", backgroundColor: "var(--input-bg, #fff)", border: "1px solid var(--border-color, #ddd)" }} />
              </fieldset>
            </div>
            <div className="col-md-4">
              <fieldset className="box-fieldset">
                <label style={{ color: "var(--text-color, #333)" }}>Filter by Status:</label>
                <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ color: "var(--text-color, #333)", backgroundColor: "var(--input-bg, #fff)", border: "1px solid var(--border-color, #ddd)" }}>
                  <option value="All">All Status</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </fieldset>
            </div>
            <div className="col-md-4">
              <fieldset className="box-fieldset">
                <label style={{ color: "var(--text-color, #333)" }}>Filter by Department:</label>
                <select className="form-control" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
                  style={{ color: "var(--text-color, #333)", backgroundColor: "var(--input-bg, #fff)", border: "1px solid var(--border-color, #ddd)" }}>
                  <option value="All">All Departments</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Administration">Administration</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                </select>
              </fieldset>
            </div>
          </div>

          <div className="wrap-table">
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
                  {paginatedJobs.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-4">No jobs found</td></tr>
                  ) : (
                    paginatedJobs.map((job) => (
                      <tr key={job._id}>
                        <td>
                          <div className="listing-box">
                            <div className="content">
                              <div className="title">
                                <Link href={`/admin/edit-job/${job._id}`} className="link">
                                  {job.title}
                                </Link>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{job.department}</td>
                        <td>{job.location}</td>
                        <td style={{ textAlign: "left" }}>
                          <span className={`btn-status ${job.status === 'active' ? 'active' : 'pending'}`}
                            style={{ padding: "6px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "500", display: "inline-block" }}>
                            {job.status === 'active' ? 'Active' : 'Closed'}
                          </span>
                        </td>
                        <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                        <td>
                          <ul className="list-action">
                            {/*<li>
                              <Link href={`/admin/edit-job/${job._id}`} className="item" style={{ border: "none", background: "none" }}>
                                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M11.2413 2.99115L12.366 4.11582C12.5532 4.30321 12.6583 4.55728 12.6583 4.82226C12.6583 5.08724 12.5532 5.34131 12.366 5.5287L6.25 11.6447H4V9.3947L10.116 3.2787C10.3034 3.09152 10.5574 2.98637 10.8224 2.98637C11.0874 2.98637 11.3415 3.09152 11.5289 3.2787L11.2413 2.99115Z" stroke="#A3ABB0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Edit
                              </Link>
                            </li>*/}
                            <li>
                              <button className="remove-file item" onClick={() => handleDelete(job)} style={{ border: "none", background: "none", cursor: "pointer" }}>
                                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9.82667 6.00035L9.596 12.0003M6.404 12.0003L6.17333 6.00035M12.8187 3.86035C13.0467 3.89501 13.2733 3.93168 13.5 3.97101M12.8187 3.86035L12.1067 13.1157C12.0776 13.4925 11.9074 13.8445 11.63 14.1012C11.3527 14.3579 10.9886 14.5005 10.6107 14.5003H5.38933C5.0114 14.5005 4.64735 14.3579 4.36999 14.1012C4.09262 13.8445 3.92239 13.4925 3.89333 13.1157L3.18133 3.86035M12.8187 3.86035C12.0492 3.74403 11.2758 3.65574 10.5 3.59568M3.18133 3.86035C2.95333 3.89435 2.72667 3.93101 2.5 3.97035M3.18133 3.86035C3.95076 3.74403 4.72416 3.65575 5.5 3.59568M10.5 3.59568V2.98501C10.5 2.19835 9.89333 1.54235 9.10667 1.51768C8.36908 1.49411 7.63092 1.49411 6.89333 1.51768C6.10667 1.54235 5.5 2.19901 5.5 2.98501V3.59568M10.5 3.59568C8.83581 3.46707 7.16419 3.46707 5.5 3.59568" stroke="#A3ABB0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Delete
                              </button>
                            </li>
                          </ul>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination Logic */}
          {totalPages > 1 && (
            <ul className="wg-pagination">
              <li className={`arrow ${currentPage === 1 ? 'disabled' : ''}`}>
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ background: 'none', border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
                  <i className="icon-arrow-left" />
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i + 1} className={currentPage === i + 1 ? 'active' : ''}>
                  <button onClick={() => setCurrentPage(i + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{i + 1}</button>
                </li>
              ))}
              <li className={`arrow ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ background: 'none', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
                  <i className="icon-arrow-right" />
                </button>
              </li>
            </ul>
          )}

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {
        showDeleteModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "8px",
                maxWidth: "500px",
                width: "90%",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="modal-header" style={{ marginBottom: "20px" }}>
                <h4 style={{ margin: 0, color: "#333" }}>
                  Confirm Delete Job
                </h4>
              </div>
              <div className="modal-body" style={{ marginBottom: "30px" }}>
                <p style={{ margin: 0, color: "#666", lineHeight: "1.5" }}>
                  Are you sure you want to delete the job{" "}
                  <strong>{jobToDelete?.title}</strong>?
                  <br />
                  <small style={{ color: "#999" }}>
                    This action cannot be undone.
                  </small>
                </p>
              </div>
              <div
                className="modal-footer"
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #ddd",
                    backgroundColor: "white",
                    color: "#666",
                    borderRadius: "4px",
                    cursor: deleteLoading ? "not-allowed" : "pointer",
                    opacity: deleteLoading ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    backgroundColor: "#dc3545",
                    color: "white",
                    borderRadius: "4px",
                    cursor: deleteLoading ? "not-allowed" : "pointer",
                    opacity: deleteLoading ? 0.6 : 1,
                  }}
                >
                  {deleteLoading ? "Deleting..." : "Delete Job"}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
