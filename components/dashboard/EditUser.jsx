"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { userAPI } from "@/utlis/api";

export default function EditUser({ userId }) {
  const router = useRouter();
  const params = useParams();
  const actualUserId = userId || params?.id;

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    role: "admin",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!actualUserId) {
        alert("User ID not provided!");
        router.push("/admin/user-management");
        return;
      }

      try {
        setIsLoading(true);
        const response = await userAPI.getUser(actualUserId);

        if (response.success) {
          const user = response.data.user;
          setFormData({
            name: user.name || "",
            username: user.username || "",
            email: user.email || "",
            role: user.role || "admin",
            isActive: user.isActive !== undefined ? user.isActive : true,
          });
        } else {
          alert(response.error || "Failed to fetch user data");
          router.push("/admin/user-management");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        alert(error.response?.data?.error || "Failed to fetch user data");
        router.push("/admin/user-management");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [actualUserId, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setSaving(true);
      try {
        const userData = {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        };

        const response = await userAPI.updateUser(actualUserId, userData);

        if (response.success) {
          router.push("/admin/user-management");
        } else {
          alert(response.error || "Failed to update user");
        }
      } catch (error) {
        console.error("Error updating user:", error);
        const errorMessage =
          error.response?.data?.error || "Failed to update user";
        alert(errorMessage);
      } finally {
        setSaving(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner">
          <div className="text-center">
            <p>Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content w-100">
      <div className="main-content-inner wrap-dashboard-content">
        <div className="widget-box-2 wd-listing mb-20">
          <h3 className="title">Basic Information</h3>
          <form className="box-info-property" onSubmit={handleSubmit}>
            <div className="box grid-layout-2 gap-30">
              <fieldset className="box-fieldset">
                <label htmlFor="name">
                  Full Name:<span>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={`form-control ${errors.name ? "error" : ""}`}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && (
                  <span className="error-text">{errors.name}</span>
                )}
              </fieldset>
              <fieldset className="box-fieldset">
                <label htmlFor="username">
                  Username:<span>*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  className={`form-control ${errors.username ? "error" : ""}`}
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
                {errors.username && (
                  <span className="error-text">{errors.username}</span>
                )}
              </fieldset>
            </div>
            <div className="box">
              <fieldset className="box-fieldset">
                <label htmlFor="email">
                  Email Address:<span>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${errors.email ? "error" : ""}`}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </fieldset>
            </div>
          </form>
        </div>

        <div className="widget-box-2 mb-20">
          <h3 className="title">Account Settings</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="box">
              <fieldset className="box-fieldset">
                <label htmlFor="role">
                  User Role:<span>*</span>
                </label>
                <select
                  name="role"
                  className={`form-control ${errors.role ? "error" : ""}`}
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    height: "50px",
                    fontSize: "16px",
                    padding: "12px 16px",
                  }}
                >
                  <option value="">Select Role</option>
                  <option value="SuperAdmin">Super Admin</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && (
                  <span className="error-text">{errors.role}</span>
                )}
              </fieldset>
            </div>
            <div className="box">
              <fieldset className="box-fieldset">
                <label htmlFor="isActive">Account Status:</label>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isActive" className="checkbox-label">
                    Active Account
                  </label>
                </div>
              </fieldset>
            </div>
          </form>
        </div>

        <div className="box-btn">
          <button
            type="submit"
            className="tf-btn bg-color-primary pd-13"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Updating User..." : "Update User"}
          </button>
          <a
            href="/admin/user-management"
            className="tf-btn style-border pd-10"
          >
            Cancel
          </a>
        </div>

        {/* .footer-dashboard */}
        <div className="footer-dashboard">
          <p>Copyright © {new Date().getFullYear()} Popty</p>
          <ul className="list">
            <li>
              <a href="#">Privacy</a>
            </li>
            <li>
              <a href="#">Terms</a>
            </li>
            <li>
              <a href="#">Support</a>
            </li>
          </ul>
        </div>
        {/* /.footer-dashboard */}
      </div>
      <div className="overlay-dashboard" />
    </div>
  );
}
