"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Mock user data - in a real app, this would come from an API
const mockUsers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    role: "Admin",
    status: "Active",
    avatar: "/images/avatar/account.jpg",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    bio: "Experienced real estate professional with over 10 years in the industry."
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    role: "Agent",
    status: "Active",
    avatar: "/images/avatar/account-2.jpg",
    address: "456 Oak Ave",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90210",
    bio: "Specializing in luxury properties and first-time homebuyers."
  },
  {
    id: 3,
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@example.com",
    phone: "+1 (555) 456-7890",
    role: "User",
    status: "Inactive",
    avatar: "/images/avatar/avatar-1.jpg",
    address: "789 Pine St",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    bio: "Looking for investment properties in the downtown area."
  }
];

export default function EditUser({ userId }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    status: "Active",
    avatar: null,
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bio: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get user data
    const user = mockUsers.find(u => u.id == userId);
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: null,
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        bio: user.bio || ""
      });
    } else {
      alert("User not found!");
      router.push("/user-management");
    }
    setIsLoading(false);
  }, [userId, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would typically send the data to your API
      console.log("Form submitted:", formData);
      alert("User updated successfully!");
      router.push("/user-management");
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      // Here you would typically send a delete request to your API
      console.log("Deleting user:", userId);
      alert("User deleted successfully!");
      router.push("/user-management");
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
      <div className="main-content-inner">
        <div className="widget-box-2 mb-20">
          <h3 className="title">Upload Profile Picture</h3>
          <div className="box-uploadfile text-center">
            <div className="uploadfile">
              <a
                href="#"
                className="tf-btn bg-color-primary pd-10 btn-upload mx-auto"
              >
                <svg
                  width={21}
                  height={20}
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.625 14.375V17.1875C13.625 17.705 13.205 18.125 12.6875 18.125H4.5625C4.31386 18.125 4.0754 18.0262 3.89959 17.8504C3.72377 17.6746 3.625 17.4361 3.625 17.1875V6.5625C3.625 6.045 4.045 5.625 4.5625 5.625H6.125C6.54381 5.62472 6.96192 5.65928 7.375 5.72834M13.625 14.375H16.4375C16.955 14.375 17.375 13.955 17.375 13.4375V9.375C17.375 5.65834 14.6725 2.57417 11.125 1.97834C10.7119 1.90928 10.2938 1.87472 9.875 1.875H8.3125C7.795 1.875 7.375 2.295 7.375 2.8125V5.72834M13.625 14.375H8.3125C8.06386 14.375 7.8254 14.2762 7.64959 14.1004C7.47377 13.9246 7.375 13.6861 7.375 13.4375V5.72834M17.375 11.25V9.6875C17.375 8.94158 17.0787 8.22621 16.5512 7.69876C16.0238 7.17132 15.3084 6.875 14.5625 6.875H13.3125C13.0639 6.875 12.8254 6.77623 12.6496 6.60041C12.4738 6.4246 12.375 6.18614 12.375 5.9375V4.6875C12.375 4.31816 12.3023 3.95243 12.1609 3.6112C12.0196 3.26998 11.8124 2.95993 11.5512 2.69876C11.2901 2.4376 10.98 2.23043 10.6388 2.08909C10.2976 1.94775 9.93184 1.875 9.5625 1.875H8.625"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Select photo
                <input 
                  type="file" 
                  className="ip-file" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </a>
              <p className="file-name fw-5">
                or drag photo here <br />
                <span>(JPG, PNG, GIF up to 5MB)</span>
              </p>
            </div>
          </div>
          {formData.avatar && (
            <div className="box-img-upload">
              <div className="item-upload file-delete">
                <Image
                  alt="avatar preview"
                  width={100}
                  height={100}
                  src={URL.createObjectURL(formData.avatar)}
                  style={{ borderRadius: "50%" }}
                />
                <span className="icon icon-trashcan1 remove-file" />
              </div>
            </div>
          )}
        </div>

        <div className="widget-box-2 mb-20">
          <h5 className="title">Basic Information</h5>
          <form className="box-info-property" onSubmit={handleSubmit}>
            <div className="box grid-layout-2 gap-30">
              <fieldset className="box-fieldset">
                <label htmlFor="firstName">
                  First Name:<span>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  className={`form-control ${errors.firstName ? 'error' : ''}`}
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </fieldset>
              <fieldset className="box-fieldset">
                <label htmlFor="lastName">
                  Last Name:<span>*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  className={`form-control ${errors.lastName ? 'error' : ''}`}
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </fieldset>
            </div>
            <div className="box grid-layout-2 gap-30">
              <fieldset className="box-fieldset">
                <label htmlFor="email">
                  Email Address:<span>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </fieldset>
              <fieldset className="box-fieldset">
                <label htmlFor="phone">
                  Phone Number:<span>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  className={`form-control ${errors.phone ? 'error' : ''}`}
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </fieldset>
            </div>
          </form>
        </div>

        <div className="widget-box-2 mb-20">
          <h3 className="title">Account Settings</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="box grid-layout-2 gap-30">
              <fieldset className="box-fieldset">
                <label htmlFor="role">
                  User Role:<span>*</span>
                </label>
                <select
                  name="role"
                  className={`form-control ${errors.role ? 'error' : ''}`}
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Agent">Agent</option>
                  <option value="User">User</option>
                </select>
                {errors.role && <span className="error-text">{errors.role}</span>}
              </fieldset>
              <fieldset className="box-fieldset">
                <label htmlFor="status">
                  Account Status:
                </label>
                <select
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </fieldset>
            </div>
          </form>
        </div>

        <div className="widget-box-2 mb-20">
          <h3 className="title">Additional Information</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <fieldset className="box-fieldset">
              <label htmlFor="address">Address:</label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="Enter full address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </fieldset>
            <div className="box grid-layout-3 gap-30">
              <fieldset className="box-fieldset">
                <label htmlFor="city">City:</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </fieldset>
              <fieldset className="box-fieldset">
                <label htmlFor="state">State/Province:</label>
                <input
                  type="text"
                  name="state"
                  className="form-control"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </fieldset>
              <fieldset className="box-fieldset">
                <label htmlFor="zipCode">Zip Code:</label>
                <input
                  type="text"
                  name="zipCode"
                  className="form-control"
                  placeholder="Enter zip code"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
              </fieldset>
            </div>
            <fieldset className="box-fieldset">
              <label htmlFor="bio">Bio:</label>
              <textarea
                name="bio"
                className="textarea"
                placeholder="Enter user bio"
                rows="4"
                value={formData.bio}
                onChange={handleInputChange}
              />
            </fieldset>
          </form>
        </div>

        <div className="box-btn">
          <button 
            type="submit" 
            className="tf-btn bg-color-primary pd-13"
            onClick={handleSubmit}
          >
            Update User
          </button>
          <a href="/user-management" className="tf-btn style-border pd-10">
            Cancel
          </a>
          <button 
            type="button" 
            className="tf-btn bg-color-danger pd-13"
            onClick={handleDelete}
            style={{ marginLeft: "10px" }}
          >
            Delete User
          </button>
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