"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AddProperty() {
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
    },
    // Additional fields from original component
    propertyId: "",
    rooms: "",
    garagesSize: "",
    unitPrice: "",
    beforePriceLabel: "",
    afterPriceLabel: "",
    propertyLabel: "",
    landArea: "",
    videoUrl: "",
    virtualTourCode: "",
    floorPlan: {
      enabled: false,
      floors: []
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const propertyTypes = [
    "Apartment", "Villa", "Cottage", "Mansion", "Townhouse", 
    "Condo", "Studio", "Penthouse", "Duplex", "Loft"
  ];

  const propertyStatuses = ["For Rent", "For Sale"];
  const propertyLabels = ["New Listing", "Open House", "Featured"];

  const amenitiesList = [
    "Swimming Pool", "Gym", "Parking", "Garden", "Balcony",
    "Fireplace", "Air Conditioning", "Heating", "Dishwasher",
    "Washing Machine", "Dryer", "Security System", "Elevator",
    "Smoke alarm", "Self check-in with lockbox", "Carbon monoxide alarm",
    "Security cameras", "Hangers", "Extra pillows & blankets",
    "Bed linens", "TV with standard cable", "Refrigerator",
    "Microwave", "Coffee maker"
  ];

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
      console.log("Property data:", formData);
      
      // Show success message
      alert("Property added successfully!");
      
      // Redirect to property management
      router.push("/my-property");
    } catch (error) {
      console.error("Error adding property:", error);
      alert("Error adding property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-content w-100">
      <div className="main-content-inner wrap-dashboard-content">
        <div className="widget-box-2 wd-listing">
          <div className="d-flex justify-content-between align-items-center mb-20">
            <h3 className="title">Add New Property</h3>
            <button 
              onClick={() => router.back()}
              className="tf-btn bg-color-secondary pd-13"
            >
              Back to Properties
            </button>
          </div>

          <form onSubmit={handleSubmit} className="property-form">
            {/* Upload Media Section */}
        <div className="widget-box-2 mb-20">
          <h3 className="title">Upload Media</h3>
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
                Select photos
                    <input 
                      type="file" 
                      className="ip-file" 
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
              </a>
              <p className="file-name fw-5">
                or drag photos here <br />
                <span>(Up to 10 photos)</span>
              </p>
            </div>
          </div>

              {/* Image Preview */}
              {formData.images.length > 0 && (
          <div className="box-img-upload">
                  {formData.images.map((image, index) => (
                    <div key={index} className="item-upload file-delete">
              <Image
                alt="img"
                width={615}
                height={405}
                        src={image}
                      />
                      <span 
                        className="icon icon-trashcan1 remove-file"
                        onClick={() => removeImage(index)}
                        style={{ cursor: 'pointer' }}
                      />
            </div>
                  ))}
            </div>
              )}
            </div>

            {/* Basic Information */}
        <div className="widget-box-2 mb-20">
          <h5 className="title">Information</h5>
              <div className="box-info-property">
            <fieldset className="box box-fieldset">
              <label htmlFor="title">
                Title:<span>*</span>
              </label>
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
            <fieldset className="box box-fieldset">
              <label htmlFor="desc">Description:</label>
              <textarea
                    name="description"
                    className={`textarea ${errors.description ? 'error' : ''}`}
                    placeholder="Your Description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                  {errors.description && <span className="error-text">{errors.description}</span>}
            </fieldset>
            <div className="box grid-layout-3 gap-30">
              <fieldset className="box-fieldset">
                <label htmlFor="address">
                  Full Address:<span>*</span>
                </label>
                <input
                  type="text"
                      name="address.street"
                      className={`form-control ${errors.street ? 'error' : ''}`}
                  placeholder="Enter property full address"
                      value={formData.address.street}
                      onChange={handleInputChange}
                />
                    {errors.street && <span className="error-text">{errors.street}</span>}
              </fieldset>
              <fieldset className="box-fieldset">
                <label htmlFor="zip">
                  Zip Code:<span>*</span>
                </label>
                <input
                  type="text"
                      name="address.zipCode"
                      className={`form-control ${errors.zipCode ? 'error' : ''}`}
                  placeholder="Enter property zip code"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                />
                    {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
              </fieldset>
              <fieldset className="box-fieldset">
                <label htmlFor="country">
                  Country:<span>*</span>
                </label>
                    <input
                      type="text"
                      name="address.country"
                      className="form-control"
                      value={formData.address.country}
                      onChange={handleInputChange}
                />
              </fieldset>
            </div>
            <div className="box grid-layout-2 gap-30">
              <fieldset className="box-fieldset">
                <label htmlFor="state">
                  Province/State:<span>*</span>
                </label>
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
              <fieldset className="box-fieldset">
                    <label htmlFor="city">
                      City:<span>*</span>
                </label>
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
            <div className="box box-fieldset">
              <label htmlFor="location">
                Location:<span>*</span>
              </label>
              <div className="box-ip">
                <input
                  type="text"
                      name="location"
                      className={`form-control ${errors.location ? 'error' : ''}`}
                      placeholder="Enter location (e.g., Brooklyn, NY)"
                      value={formData.location}
                      onChange={handleInputChange}
                />
                <a href="#" className="btn-location">
                  <i className="icon icon-location" />
                </a>
              </div>
                  {errors.location && <span className="error-text">{errors.location}</span>}
              <iframe
                className="map"
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d135905.11693909427!2d-73.95165795400088!3d41.17584829642291!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1727094281524!5m2!1sen!2s"
                width="100%"
                height={456}
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
              </div>
        </div>

            {/* Price Section */}
        <div className="widget-box-2 mb-20">
          <h3 className="title">Price</h3>
          <div className="box-price-property">
                <div className="box grid-2 gap-30">
              <fieldset className="box-fieldset mb-30">
                <label htmlFor="price">
                  Price:<span>*</span>
                </label>
                <input
                      type="number"
                      name="price"
                      className={`form-control ${errors.price ? 'error' : ''}`}
                  placeholder="Example value: 12345.67"
                      value={formData.price}
                      onChange={handleInputChange}
                />
                    {errors.price && <span className="error-text">{errors.price}</span>}
              </fieldset>
              <fieldset className="box-fieldset mb-30">
                    <label htmlFor="unitPrice">
                  Unit Price:<span>*</span>
                </label>
                    <input
                      type="number"
                      name="unitPrice"
                      className="form-control"
                      placeholder="Unit price"
                      value={formData.unitPrice}
                      onChange={handleInputChange}
                />
              </fieldset>
              <div className="grid-layout-2 gap-30">
                <fieldset className="box-fieldset">
                      <label htmlFor="beforePriceLabel">
                    Before Price Label:<span>*</span>
                  </label>
                      <input 
                        type="text" 
                        name="beforePriceLabel"
                        className="form-control"
                        value={formData.beforePriceLabel}
                        onChange={handleInputChange}
                      />
                </fieldset>
                <fieldset className="box-fieldset">
                      <label htmlFor="afterPriceLabel">
                    After Price Label:<span>*</span>
                  </label>
                      <input 
                        type="text" 
                        name="afterPriceLabel"
                        className="form-control"
                        value={formData.afterPriceLabel}
                        onChange={handleInputChange}
                      />
                </fieldset>
                  </div>
                </div>
              </div>
          </div>

            {/* Additional Information */}
        <div className="widget-box-2 mb-20">
              <h3 className="title">Additional Information</h3>
            <div className="box grid-layout-3 gap-30">
              <fieldset className="box-fieldset">
                <label htmlFor="type">
                  Property Type:<span>*</span>
                </label>
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
              <fieldset className="box-fieldset">
                <label htmlFor="status">
                  Property Status:<span>*</span>
                </label>
                  <select
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="">Choose</option>
                    {propertyStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
              </fieldset>
              <fieldset className="box-fieldset">
                  <label htmlFor="propertyLabel">
                  Property Label:<span>*</span>
                </label>
                  <select
                    name="propertyLabel"
                    className="form-control"
                    value={formData.propertyLabel}
                    onChange={handleInputChange}
                  >
                    <option value="">Choose</option>
                    {propertyLabels.map(label => (
                      <option key={label} value={label}>{label}</option>
                    ))}
                  </select>
              </fieldset>
            </div>
            <div className="box grid-layout-3 gap-30">
              <fieldset className="box-fieldset">
                  <label htmlFor="sqft">
                  Size (SqFt):<span>*</span>
                </label>
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
              <fieldset className="box-fieldset">
                  <label htmlFor="landArea">
                  Land Area (SqFt):<span>*</span>
                </label>
                  <input 
                    type="number" 
                    name="landArea"
                    className="form-control"
                    placeholder="Land area"
                    value={formData.landArea}
                    onChange={handleInputChange}
                  />
              </fieldset>
              <fieldset className="box-fieldset">
                  <label htmlFor="propertyId">
                  Property ID:<span>*</span>
                </label>
                  <input 
                    type="text" 
                    name="propertyId"
                    className="form-control"
                    placeholder="Property ID"
                    value={formData.propertyId}
                    onChange={handleInputChange}
                  />
              </fieldset>
            </div>
            <div className="box grid-layout-3 gap-30">
              <fieldset className="box-fieldset">
                  <label htmlFor="rooms">
                  Rooms:<span>*</span>
                  </label>
                  <input 
                    type="number" 
                    name="rooms"
                    className="form-control"
                    placeholder="Number of rooms"
                    value={formData.rooms}
                    onChange={handleInputChange}
                  />
                </fieldset>
                <fieldset className="box-fieldset">
                  <label htmlFor="beds">
                    Bedrooms:<span>*</span>
                  </label>
                  <input 
                    type="number" 
                    name="beds"
                    className={`form-control ${errors.beds ? 'error' : ''}`}
                    placeholder="Number of bedrooms"
                    value={formData.beds}
                    onChange={handleInputChange}
                  />
                  {errors.beds && <span className="error-text">{errors.beds}</span>}
                </fieldset>
                <fieldset className="box-fieldset">
                  <label htmlFor="baths">
                    Bathrooms:<span>*</span>
                  </label>
                  <input 
                    type="number" 
                    name="baths"
                    className={`form-control ${errors.baths ? 'error' : ''}`}
                    placeholder="Number of bathrooms"
                    value={formData.baths}
                    onChange={handleInputChange}
                  />
                  {errors.baths && <span className="error-text">{errors.baths}</span>}
                </fieldset>
              </div>
              <div className="box grid-layout-3 gap-30">
                <fieldset className="box-fieldset">
                  <label htmlFor="garage">
                    Garages:<span>*</span>
                  </label>
                  <input 
                    type="number" 
                    name="garage"
                    className="form-control"
                    placeholder="Number of garages"
                    value={formData.garage}
                    onChange={handleInputChange}
                  />
                </fieldset>
                <fieldset className="box-fieldset">
                  <label htmlFor="garagesSize">
                    Garages Size (SqFt):<span>*</span>
                  </label>
                  <input 
                    type="number" 
                    name="garagesSize"
                    className="form-control"
                    placeholder="Garage size"
                    value={formData.garagesSize}
                    onChange={handleInputChange}
                  />
                </fieldset>
                <fieldset className="box-fieldset">
                  <label htmlFor="yearBuilt">
                    Year Built:<span>*</span>
                  </label>
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
            </div>

            {/* Amenities */}
            <div className="widget-box-2 mb-20">
              <h5 className="title">
                Amenities<span>*</span>
              </h5>
              <div className="box-amenities-property">
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
            </div>

            {/* Virtual Tour 360 */}
            <div className="widget-box-2 mb-20">
              <h3 className="title">Virtual Tour 360</h3>
              <div className="box-radio-check">
                <div className="text-btn mb-16">Virtual Tour Type:</div>
                <div className="radio-item">
                  <label>
                    <span className="text-1">Embedded code</span>
                    <input type="radio" name="virtualTourType" value="embedded" />
                    <span className="btn-radio" />
                  </label>
                </div>
                <div className="radio-item style-1">
                  <label>
                    <span className="text-1">Upload image</span>
                    <input type="radio" name="virtualTourType" value="upload" />
                    <span className="btn-radio" />
                  </label>
                </div>
                <fieldset className="box-fieldset">
                  <label htmlFor="virtualTourCode">Embedded Code Virtual 360</label>
                  <textarea 
                    name="virtualTourCode"
                    className="textarea"
                    value={formData.virtualTourCode}
                    onChange={handleInputChange}
                  />
                </fieldset>
              </div>
            </div>

            {/* Videos */}
        <div className="widget-box-2 mb-20">
              <h3 className="title">Videos</h3>
              <fieldset className="box-fieldset">
                <label htmlFor="videoUrl" className="text-btn">
                Video URL:
              </label>
              <input
                type="text"
                  name="videoUrl"
                className="form-control"
                placeholder="Youtube, vimeo url"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
              />
            </fieldset>
            </div>

            {/* Agent Information */}
        <div className="widget-box-2 mb-20">
              <h3 className="title">Agent Information</h3>
          <div className="box-radio-check">
            <div className="text-1 mb-16">Choose type agent information?</div>
            <fieldset className="radio-item mb-8">
              <label>
                <span className="text-1">Your current user information</span>
                    <input type="radio" name="agentType" value="current" />
                <span className="btn-radio" />
              </label>
            </fieldset>
                <fieldset className="radio-item style-1">
              <label>
                <span className="text-1">Other contact</span>
                    <input type="radio" name="agentType" value="other" />
                <span className="btn-radio" />
              </label>
            </fieldset>
          </div>
        </div>

            {/* Submit Buttons */}
        <div className="box-btn">
              <button
                type="submit"
                className="tf-btn bg-color-primary pd-13"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding Property..." : "Add Property"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="tf-btn style-border pd-10"
              >
                Save & Preview
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
