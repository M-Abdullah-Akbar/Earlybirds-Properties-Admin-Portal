"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Mock property data with more details
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
    postingDate: "March 22, 2024",
    expiryDate: "April 10, 2024",
    imageSrc: "/images/home/house-db-1.jpg",
    description: "Beautiful apartment with modern amenities",
    agent: "John Doe",
    featured: true
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
    postingDate: "March 20, 2024",
    expiryDate: "April 15, 2024",
    imageSrc: "/images/home/house-db-2.jpg",
    description: "Luxury mountain retreat with stunning views",
    agent: "Jane Smith",
    featured: true
  },
  {
    id: 3,
    title: "Lakeview Haven, Lake Tahoe",
    location: "789 Lake Shore Blvd, Lake Tahoe, CA 96150",
    price: 9500,
    status: "Pending",
    type: "Cottage",
    beds: 2,
    baths: 2,
    sqft: 1200,
    postingDate: "March 18, 2024",
    expiryDate: "April 12, 2024",
    imageSrc: "/images/home/house-db-3.jpg",
    description: "Cozy cottage with lakefront access",
    agent: "Mike Johnson",
    featured: false
  },
  {
    id: 4,
    title: "Coastal Serenity Cottage",
    location: "321 Ocean Ave, Malibu, CA 90265",
    price: 8500,
    status: "Active",
    type: "Cottage",
    beds: 3,
    baths: 2,
    sqft: 1800,
    postingDate: "March 15, 2024",
    expiryDate: "April 8, 2024",
    imageSrc: "/images/home/house-db-4.jpg",
    description: "Peaceful coastal retreat with ocean views",
    agent: "Sarah Wilson",
    featured: true
  },
  {
    id: 5,
    title: "Sunset Heights Estate",
    location: "654 Sunset Blvd, Beverly Hills, CA 90210",
    price: 15000,
    status: "Inactive",
    type: "Mansion",
    beds: 5,
    baths: 4,
    sqft: 4500,
    postingDate: "March 10, 2024",
    expiryDate: "April 5, 2024",
    imageSrc: "/images/home/house-db-5.jpg",
    description: "Luxury estate with panoramic city views",
    agent: "David Brown",
    featured: true
  }
];

export default function PropertyManagement() {
  const [properties, setProperties] = useState(mockProperties);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Filter properties based on search term and filters
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || property.status === statusFilter;
    const matchesType = typeFilter === "All" || property.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteProperty = (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      setProperties(properties.filter(property => property.id !== propertyId));
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "btn-status active";
      case "Pending":
        return "btn-status pending";
      case "Inactive":
        return "btn-status inactive";
      default:
        return "btn-status";
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case "Apartment":
        return "type-apartment";
      case "Villa":
        return "type-villa";
      case "Cottage":
        return "type-cottage";
      case "Mansion":
        return "type-mansion";
      default:
        return "type-other";
    }
  };

  return (
    <div className="main-content w-100">
      <div className="main-content-inner wrap-dashboard-content">
        <div className="widget-box-2 wd-listing mb-20">
          <div className="d-flex justify-content-between align-items-center mb-20">
            <h3 className="title">Property Management</h3>
            <Link href="/add-property" className="tf-btn bg-color-primary pd-13">
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
              Add New Property
            </Link>
          </div>

          {/* Filters */}
          <div className="row mb-20">
            <div className="col-md-4">
              <fieldset className="box-fieldset">
                <label>Search Properties:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title or location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </fieldset>
            </div>
            <div className="col-md-4">
              <fieldset className="box-fieldset">
                <label>Filter by Status:</label>
                <select
                  className="form-control"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </fieldset>
            </div>
            <div className="col-md-4">
              <fieldset className="box-fieldset">
                <label>Filter by Type:</label>
                <select
                  className="form-control"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Cottage">Cottage</option>
                  <option value="Mansion">Mansion</option>
                </select>
              </fieldset>
            </div>
          </div>

          {/* Stats */}
          <div className="flat-counter-v2 tf-counter mb-20">
            <div className="counter-box">
              <div className="box-icon">
                <span className="icon">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
              <div className="content-box">
                <div className="title-count text-variant-1">Total Properties</div>
                <div className="box-count d-flex align-items-end">
                  <div className="number">{properties.length}</div>
                </div>
              </div>
            </div>
            <div className="counter-box">
              <div className="box-icon">
                <span className="icon">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
              <div className="content-box">
                <div className="title-count text-variant-1">Active Properties</div>
                <div className="box-count d-flex align-items-end">
                  <div className="number">{properties.filter(p => p.status === "Active").length}</div>
                </div>
              </div>
            </div>
            <div className="counter-box">
              <div className="box-icon">
                <span className="icon">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
              <div className="content-box">
                <div className="title-count text-variant-1">Featured Properties</div>
                <div className="box-count d-flex align-items-end">
                  <div className="number">{properties.filter(p => p.featured).length}</div>
                </div>
              </div>
            </div>
            {/*<div className="counter-box">
              <div className="box-icon">
                <span className="icon">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
              <div className="content-box">
                <div className="title-count text-variant-1">Total Value</div>
                <div className="box-count d-flex align-items-end">
                  <div className="number">${properties.reduce((sum, p) => sum + p.price, 0).toLocaleString()}</div>
                </div>
              </div>
            </div>*/}
          </div>

          <div className="wrap-table">
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Agent</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((property) => (
                    <tr key={property.id}>
                      <td>
                        <div className="listing-box">
                          <div className="images">
                            <Image
                              alt="property"
                              src={property.imageSrc}
                              width={80}
                              height={60}
                            />
                          </div>
                          <div className="content">
                            <div className="title">
                              <Link href={`/property-detail/${property.id}`} className="link">
                                {property.title}
                              </Link>
                            </div>
                            <div className="text-date">{property.location}</div>
                            <div className="text-btn">
                              {property.beds} beds • {property.baths} baths • {property.sqft} sqft
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge ${getTypeClass(property.type)}`}>
                          {property.type}
                        </span>
                      </td>
                      <td>
                        <div className="status-wrap">
                          <span className={getStatusClass(property.status)}>
                            {property.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="text-btn text-color-primary">
                          ${property.price.toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <span>{property.agent}</span>
                      </td>
                      <td>
                        <ul className="list-action">
                          <li>
                            <Link href={`/edit-property/${property.id}`} className="item">
                              <svg
                                width={16}
                                height={16}
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11.2413 2.9915L12.366 1.86616C12.6005 1.63171 12.9184 1.5 13.25 1.5C13.5816 1.5 13.8995 1.63171 14.134 1.86616C14.3685 2.10062 14.5002 2.4186 14.5002 2.75016C14.5002 3.08173 14.3685 3.39971 14.134 3.63416L4.55467 13.2135C4.20222 13.5657 3.76758 13.8246 3.29 13.9668L1.5 14.5002L2.03333 12.7102C2.17552 12.2326 2.43442 11.7979 2.78667 11.4455L11.242 2.9915H11.2413ZM11.2413 2.9915L13 4.75016"
                                  stroke="#A3ABB0"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Edit
                            </Link>
                          </li>
                          <li>
                            <button 
                              className="remove-file item"
                              onClick={() => handleDeleteProperty(property.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              <svg
                                width={16}
                                height={16}
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M9.82667 6.00035L9.596 12.0003M6.404 12.0003L6.17333 6.00035M12.8187 3.86035C13.0467 3.89501 13.2733 3.93168 13.5 3.97101M12.8187 3.86035L12.1067 13.1157C12.0776 13.4925 11.9074 13.8445 11.63 14.1012C11.3527 14.3579 10.9886 14.5005 10.6107 14.5003H5.38933C5.0114 14.5005 4.64735 14.3579 4.36999 14.1012C4.09262 13.8445 3.92239 13.4925 3.89333 13.1157L3.18133 3.86035M12.8187 3.86035C12.0492 3.74403 11.2758 3.65574 10.5 3.59568M3.18133 3.86035C2.95333 3.89435 2.72667 3.93101 2.5 3.97035M3.18133 3.86035C3.95076 3.74403 4.72416 3.65575 5.5 3.59568M10.5 3.59568V2.98501C10.5 2.19835 9.89333 1.54235 9.10667 1.51768C8.36908 1.49411 7.63092 1.49411 6.89333 1.51768C6.10667 1.54235 5.5 2.19901 5.5 2.98501V3.59568M10.5 3.59568C8.83581 3.46707 7.16419 3.46707 5.5 3.59568"
                                  stroke="#A3ABB0"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Delete
                            </button>
                          </li>
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <ul className="wg-pagination">
            <li className="arrow">
              <a href="#">
                <i className="icon-arrow-left" />
              </a>
            </li>
            <li>
              <a href="#">1</a>
            </li>
            <li className="active">
              <a href="#">2</a>
            </li>
            <li>
              <a href="#">...</a>
            </li>
            <li>
              <a href="#">3</a>
            </li>
            <li className="arrow">
              <a href="#">
                <i className="icon-arrow-right" />
              </a>
            </li>
          </ul>
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