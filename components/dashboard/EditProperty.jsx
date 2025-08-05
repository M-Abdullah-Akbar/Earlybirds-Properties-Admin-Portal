"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Mock property data - in a real app, this would come from an API
const mockProperties = [
  {
    id: 1,
    title: "Gorgeous Apartment Building",
    location: "102 Ingraham St, Brooklyn, NY 11237",
    price: 7500,
    status: "Active",
    type: "Apartment",
    beds: 3,
    baths: 2,
    sqft: 1500,
    garage: 1,
    yearBuilt: 2010,
    lotSize: 2000,
    agent: "John Doe",
    featured: true,
    description: "Beautiful apartment with modern amenities",
    images: ["/images/home/house-db-1.jpg"],
    amenities: ["Swimming Pool", "Gym", "Parking", "Air Conditioning"],
    address: {
      street: "102 Ingraham St",
      city: "Brooklyn",
      state: "NY",
      zipCode: "11237",
      country: "United States"
    },
    coordinates: {
      lat: "40.711536",
      lng: "-73.994601"
    }
  },
  {
    id: 2,
    title: "Mountain Mist Retreat, Aspen",
    location: "456 Mountain View Dr, Aspen, CO 81611",
    price: 12000,
    status: "Active",
    type: "Villa",
    beds: 4,
    baths: 3,
    sqft: 2800,
    garage: 2,
    yearBuilt: 2015,
    lotSize: 5000,
    agent: "Jane Smith",
    featured: true,
    description: "Luxury mountain retreat with stunning views",
    images: ["/images/home/house-db-2.jpg"],
    amenities: ["Fireplace", "Garden", "Balcony", "Security System"],
    address: {
      street: "456 Mountain View Dr",
      city: "Aspen",
      state: "CO",
      zipCode: "81611",
      country: "United States"
    },
    coordinates: {
      lat: "39.1911",
      lng: "-106.8175"
    }
  }
];

export default function EditProperty({ propertyId }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    type: "",
    status: "Active",
    beds: "",
    baths: "",
    sqft: "",
    garage: "",
    yearBuilt: "",
    lotSize: "",
    agent: "",
    featured: false,
    images: [],
    amenities: [],
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States"
    },
    coordinates: {
      lat: "",
      lng: ""
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const propertyTypes = [
    "Apartment", "Villa", "Cottage", "Mansion", "Townhouse", 
    "Condo", "Studio", "Penthouse", "Duplex", "Loft"
  ];

  const amenitiesList = [
    "Swimming Pool", "Gym", "Parking", "Garden", "Balcony",
    "Fireplace", "Air Conditioning", "Heating", "Dishwasher",
    "Washing Machine", "Dryer", "Security System", "Elevator"
  ];

  useEffect(() => {
    // Simulate loading property data
    const loadProperty = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const property = mockProperties.find(p => p.id === parseInt(propertyId));
        if (property) {
          setFormData(property);
        } else {
          alert("Property not found!");
          router.push("/my-property");
        }
      } catch (error) {
        console.error("Error loading property:", error);
        alert("Error loading property data!");
        router.push("/my-property");
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyId) {
      loadProperty();
    }
  }, [propertyId, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Property title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.type) newErrors.type = "Property type is required";
    if (!formData.beds) newErrors.beds = "Number of bedrooms is required";
    if (!formData.baths) newErrors.baths = "Number of bathrooms is required";
    if (!formData.sqft) newErrors.sqft = "Square footage is required";
    if (!formData.address.street.trim()) newErrors.street = "Street address is required";
    if (!formData.address.city.trim()) newErrors.city = "City is required";
    if (!formData.address.state.trim()) newErrors.state = "State is required";
    if (!formData.address.zipCode.trim()) newErrors.zipCode = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would send the data to your API
      console.log("Updated property data:", formData);
      
      // Show success message
      alert("Property updated successfully!");
      
      // Redirect to property management
      router.push("/my-property");
    } catch (error) {
      console.error("Error updating property:", error);
      alert("Error updating property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      setIsSubmitting(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log("Deleting property:", propertyId);
        
        alert("Property deleted successfully!");
        router.push("/my-property");
      } catch (error) {
        console.error("Error deleting property:", error);
        alert("Error deleting property. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="main-content w-100">
        <div className="main-content-inner wrap-dashboard-content">
          <div className="widget-box-2 wd-listing">
            <div className="text-center py-50">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-20">Loading property data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content w-100">
      <div className="main-content-inner wrap-dashboard-content">
        <div className="widget-box-2 wd-listing">
          <div className="d-flex justify-content-between align-items-center mb-20">
            <h3 className="title">Edit Property</h3>
            <div className="d-flex gap-10">
              <button 
                onClick={() => router.back()}
                className="tf-btn bg-color-secondary pd-13"
              >
                Back to Properties
              </button>
              <button 
                onClick={handleDelete}
                className="tf-btn bg-color-danger pd-13"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Property"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="property-form">
            {/* Basic Information */}
            <div className="form-section mb-30">
              <h4 className="section-title">Basic Information</h4>
              <div className="row">
                <div className="col-md-6">
                  <fieldset className="box-fieldset">
                    <label>Property Title *</label>
                    <input
                      type="text"
                      name="title"
                      className={`form-control ${errors.title ? 'error' : ''}`}
                      placeholder="Enter property title"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                    {errors.title && <span className="error-text">{errors.title}</span>}
                  </fieldset>
                </div>
                <div className="col-md-6">
                  <fieldset className="box-fieldset">
                    <label>Property Type *</label>
                    <select
                      name="type"
                      className={`form-control ${errors.type ? 'error' : ''}`}
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Property Type</option>
                      {propertyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.type && <span className="error-text">{errors.type}</span>}
                  </fieldset>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <fieldset className="box-fieldset">
                    <label>Description *</label>
                    <textarea
                      name="description"
                      className={`form-control ${errors.description ? 'error' : ''}`}
                      placeholder="Describe the property..."
                      rows="4"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                    {errors.description && <span className="error-text">{errors.description}</span>}
                  </fieldset>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="form-section mb-30">
              <h4 className="section-title">Location Information</h4>
              <div className="row">
                <div className="col-md-12">
                  <fieldset className="box-fieldset">
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      className={`form-control ${errors.location ? 'error' : ''}`}
                      placeholder="Enter location (e.g., Brooklyn, NY)"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                    {errors.location && <span className="error-text">{errors.location}</span>}
                  </fieldset>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <fieldset className="box-fieldset">
                    <label>Street Address *</label>
                    <input
                      type="text"
                      name="address.street"
                      className={`form-control ${errors.street ? 'error' : ''}`}
                      placeholder="Enter street address"
                      value={formData.address.street}
                      onChange={handleInputChange}
                    />
                    {errors.street && <span className="error-text">{errors.street}</span>}
                  </fieldset>
                </div>
                <div className="col-md-6">
                  <fieldset className="box-fieldset">
                    <label>City *</label>
                    <input
                      type="text"
                      name="address.city"
                      className={`form-control ${errors.city ? 'error' : ''}`}
                      placeholder="Enter city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                    />
                    {errors.city && <span className="error-text">{errors.city}</span>}
                  </fieldset>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <fieldset className="box-fieldset">
                    <label>State *</label>
                    <input
                      type="text"
                      name="address.state"
                      className={`form-control ${errors.state ? 'error' : ''}`}
                      placeholder="Enter state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                    />
                    {errors.state && <span className="error-text">{errors.state}</span>}
                  </fieldset>
                </div>
                <div className="col-md-4">
                  <fieldset className="box-fieldset">
                    <label>ZIP Code *</label>
                    <input
                      type="text"
                      name="address.zipCode"
                      className={`form-control ${errors.zipCode ? 'error' : ''}`}
                      placeholder="Enter ZIP code"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                    />
                    {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
                  </fieldset>
                </div>
                <div className="col-md-4">
                  <fieldset className="box-fieldset">
                    <label>Country</label>
                    <input
                      type="text"
                      name="address.country"
                      className="form-control"
                      value={formData.address.country}
                      onChange={handleInputChange}
                    />
                  </fieldset>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="form-section mb-30">
              <h4 className="section-title">Property Details</h4>
              <div className="row">
                <div className="col-md-3">
                  <fieldset className="box-fieldset">
                    <label>Price *</label>
                    <input
                      type="number"
                      name="price"
                      className={`form-control ${errors.price ? 'error' : ''}`}
                      placeholder="Enter price"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                    {errors.price && <span className="error-text">{errors.price}</span>}
                  </fieldset>
                </div>
                <div className="col-md-3">
                  <fieldset className="box-fieldset">
                    <label>Bedrooms *</label>
                    <input
                      type="number"
                      name="beds"
                      className={`form-control ${errors.beds ? 'error' : ''}`}
                      placeholder="Number of beds"
                      value={formData.beds}
                      onChange={handleInputChange}
                    />
                    {errors.beds && <span className="error-text">{errors.beds}</span>}
                  </fieldset>
                </div>
                <div className="col-md-3">
                  <fieldset className="box-fieldset">
                    <label>Bathrooms *</label>
                    <input
                      type="number"
                      name="baths"
                      className={`form-control ${errors.baths ? 'error' : ''}`}
                      placeholder="Number of baths"
                      value={formData.baths}
                      onChange={handleInputChange}
                    />
                    {errors.baths && <span className="error-text">{errors.baths}</span>}
                  </fieldset>
                </div>
                <div className="col-md-3">
                  <fieldset className="box-fieldset">
                    <label>Square Feet *</label>
                    <input
                      type="number"
                      name="sqft"
                      className={`form-control ${errors.sqft ? 'error' : ''}`}
                      placeholder="Square footage"
                      value={formData.sqft}
                      onChange={handleInputChange}
                    />
                    {errors.sqft && <span className="error-text">{errors.sqft}</span>}
                  </fieldset>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <fieldset className="box-fieldset">
                    <label>Garage Spaces</label>
                    <input
                      type="number"
                      name="garage"
                      className="form-control"
                      placeholder="Number of garage spaces"
                      value={formData.garage}
                      onChange={handleInputChange}
                    />
                  </fieldset>
                </div>
                <div className="col-md-4">
                  <fieldset className="box-fieldset">
                    <label>Year Built</label>
                    <input
                      type="number"
                      name="yearBuilt"
                      className="form-control"
                      placeholder="Year built"
                      value={formData.yearBuilt}
                      onChange={handleInputChange}
                    />
                  </fieldset>
                </div>
                <div className="col-md-4">
                  <fieldset className="box-fieldset">
                    <label>Lot Size (sqft)</label>
                    <input
                      type="number"
                      name="lotSize"
                      className="form-control"
                      placeholder="Lot size in square feet"
                      value={formData.lotSize}
                      onChange={handleInputChange}
                    />
                  </fieldset>
                </div>
              </div>
            </div>

            {/* Agent Information */}
            <div className="form-section mb-30">
              <h4 className="section-title">Agent Information</h4>
              <div className="row">
                <div className="col-md-6">
                  <fieldset className="box-fieldset">
                    <label>Assigned Agent</label>
                    <input
                      type="text"
                      name="agent"
                      className="form-control"
                      placeholder="Enter agent name"
                      value={formData.agent}
                      onChange={handleInputChange}
                    />
                  </fieldset>
                </div>
                <div className="col-md-6">
                  <fieldset className="box-fieldset">
                    <label>Status</label>
                    <select
                      name="status"
                      className="form-control"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </fieldset>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="form-section mb-30">
              <h4 className="section-title">Amenities</h4>
              <div className="amenities-grid">
                {amenitiesList.map(amenity => (
                  <label key={amenity} className="amenity-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="form-section mb-30">
              <h4 className="section-title">Property Images</h4>
              <fieldset className="box-fieldset">
                <label>Upload Additional Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="form-control"
                />
              </fieldset>

              {formData.images.length > 0 && (
                <div className="image-preview mt-20">
                  <h5>Current Images:</h5>
                  <div className="image-grid">
                    {formData.images.map((image, index) => (
                      <div key={index} className="image-item">
                        <Image
                          src={image}
                          alt={`Property image ${index + 1}`}
                          width={150}
                          height={100}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="remove-image-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Featured Property */}
            <div className="form-section mb-30">
              <h4 className="section-title">Additional Options</h4>
              <div className="row">
                <div className="col-md-6">
                  <fieldset className="box-fieldset">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                      />
                      <span>Featured Property</span>
                    </label>
                  </fieldset>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="submit"
                className="tf-btn bg-color-primary pd-13"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating Property..." : "Update Property"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="tf-btn bg-color-secondary pd-13 ml-10"
              >
                Cancel
              </button>
            </div>
          </form>
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
        {/* .footer-dashboard */}
      </div>
      <div className="overlay-dashboard" />
    </div>
  );
} 