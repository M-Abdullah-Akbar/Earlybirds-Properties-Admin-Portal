"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { jobAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AddJob({ isEdit = false, initialData = {} }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    department: initialData.department || "",
    location: initialData.location || "Dubai",
    salary: initialData.salary || "",
    type: initialData.type || "Full Time",
    status: initialData.status || "active",
    description: initialData.description || "",
    requirements: initialData.requirements ? initialData.requirements.join("\n") : "",
    responsibilities: initialData.responsibilities ? initialData.responsibilities.join("\n") : "",
    adminEmail: initialData.adminEmail || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
          ...formData,
          requirements: formData.requirements.split('\n').filter(i => i.trim()),
          responsibilities: formData.responsibilities.split('\n').filter(i => i.trim())
      };

      let res;
      if (isEdit) {
          res = await jobAPI.updateJob(initialData._id, payload);
      } else {
          res = await jobAPI.createJob(payload);
      }

      if (res.success) {
        // alert(isEdit ? "Job updated!" : "Job created!");
        router.push("/admin/job-management");
      } else {
        alert(res.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content w-100">
      <div className="main-content-inner wrap-dashboard-content">
        <div className="widget-box-2 mb-20">
          <h3 className="title">{isEdit ? "Edit Job" : "Add New Job"}</h3>
          <form className="form-add-property" onSubmit={handleSubmit}>
            
            <div className="box pb-0">
               <fieldset className="box-fieldset">
                <label>Job Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </fieldset>

              <div className="row">
                   <div className="col-md-6">
                        <fieldset className="box-fieldset">
                            <label>Department</label>
                            <input
                            type="text"
                            name="department"
                            className="form-control"
                            value={formData.department}
                            onChange={handleChange}
                            required
                            />
                        </fieldset>
                   </div>
                   <div className="col-md-6">
                        <fieldset className="box-fieldset">
                            <label>Location</label>
                            <input
                            type="text"
                            name="location"
                            className="form-control"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            />
                        </fieldset>
                   </div>
              </div>

              <div className="row">
                   <div className="col-md-6">
                        <fieldset className="box-fieldset">
                            <label>Job Type</label>
                           <select 
                                name="type" 
                                className="form-control"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <option value="Full Time">Full Time</option>
                                <option value="Part Time">Part Time</option>
                                <option value="Contract">Contract</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Internship">Internship</option>
                           </select>
                        </fieldset>
                   </div>
                   <div className="col-md-6">
                        <fieldset className="box-fieldset">
                            <label>Salary (Optional)</label>
                            <input
                            type="text"
                            name="salary"
                            className="form-control"
                            value={formData.salary}
                            onChange={handleChange}
                            />
                        </fieldset>
                   </div>
              </div>

              <fieldset className="box-fieldset">
                <label>Contact Email (for applications)</label>
                <input
                  type="email"
                  name="adminEmail"
                  className="form-control"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                  placeholder="e.g. info@earlybirdproperties.com"
                />
              </fieldset>
              
               <div className="row">
                   <div className="col-md-6">
                        <fieldset className="box-fieldset">
                            <label>Status</label>
                           <select 
                                name="status" 
                                className="form-control"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                           </select>
                        </fieldset>
                   </div>
                </div>

              <fieldset className="box-fieldset">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </fieldset>

              <fieldset className="box-fieldset">
                <label>Responsibilities (One per line)</label>
                <textarea
                  name="responsibilities"
                  className="form-control"
                  rows="4"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  placeholder="- Shoot high-quality content..."
                ></textarea>
              </fieldset>

               <fieldset className="box-fieldset">
                <label>Requirements (One per line)</label>
                <textarea
                  name="requirements"
                  className="form-control"
                  rows="4"
                  value={formData.requirements}
                  onChange={handleChange}
                   placeholder="- Proven experience..."
                ></textarea>
              </fieldset>

            </div>

            <button type="submit" className="tf-btn bg-color-primary pd-13" disabled={loading}>
              {loading ? "Saving..." : (isEdit ? "Update Job" : "Add Job")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
