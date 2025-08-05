"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Dashboard() {
  // Mock data for users
  const mockUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      status: "Active",
      joinDate: "March 15, 2024",
      avatar: "/images/avatar/account.jpg"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Agent",
      status: "Active",
      joinDate: "March 10, 2024",
      avatar: "/images/avatar/account-2.jpg"
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      role: "User",
      status: "Inactive",
      joinDate: "March 5, 2024",
      avatar: "/images/avatar/avatar-1.jpg"
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      role: "Agent",
      status: "Active",
      joinDate: "March 1, 2024",
      avatar: "/images/avatar/avatar-2.jpg"
    }
  ];

  // Mock data for properties
  const mockProperties = [
    {
      id: 1,
      title: "Gorgeous Apartment Building",
      location: "102 Ingraham St, Brooklyn, NY 11237",
      price: 7500,
      status: "Active",
      type: "Apartment",
      agent: "John Doe",
      imageSrc: "/images/home/house-db-1.jpg"
    },
    {
      id: 2,
      title: "Mountain Mist Retreat, Aspen",
      location: "456 Mountain View Dr, Aspen, CO 81611",
      price: 12000,
      status: "Active",
      type: "Villa",
      agent: "Jane Smith",
      imageSrc: "/images/home/house-db-2.jpg"
    },
    {
      id: 3,
      title: "Lakeview Haven, Lake Tahoe",
      location: "789 Lake Shore Blvd, Lake Tahoe, CA 96150",
      price: 9500,
      status: "Pending",
      type: "Cottage",
      agent: "Mike Johnson",
      imageSrc: "/images/home/house-db-3.jpg"
    },
    {
      id: 4,
      title: "Coastal Serenity Cottage",
      location: "321 Ocean Ave, Malibu, CA 90265",
      price: 8500,
      status: "Active",
      type: "Cottage",
      agent: "Sarah Wilson",
      imageSrc: "/images/home/house-db-4.jpg"
    }
  ];

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

  const getRoleClass = (role) => {
    switch (role) {
      case "Admin":
        return "role-admin";
      case "Agent":
        return "role-agent";
      case "User":
        return "role-user";
      default:
        return "role-other";
    }
  };

  return (
    <div className="main-content w-100">
      <div className="main-content-inner wrap-dashboard-content">
        {/* Dashboard Stats */}
        <div className="flat-counter-v2 tf-counter mb-30">
          <div className="counter-box">
            <div className="box-icon">
              <span className="icon">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
            <div className="content-box">
              <div className="title-count text-variant-1">Total Users</div>
              <div className="box-count d-flex align-items-end">
                <div className="number">{mockUsers.length}</div>
              </div>
            </div>
          </div>
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
                <div className="number">{mockProperties.length}</div>
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
                <div className="number">{mockProperties.filter(p => p.status === "Active").length}</div>
              </div>
            </div>
          </div>
          <div className="counter-box">
            <div className="box-icon">
              <span className="icon">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
            <div className="content-box">
              <div className="title-count text-variant-1">Total Value</div>
              <div className="box-count d-flex align-items-end">
                <div className="number">${mockProperties.reduce((sum, p) => sum + p.price, 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="widget-box-2 wd-listing mb-30">
          <div className="d-flex justify-content-between align-items-center mb-20">
            <h3 className="title">User Management</h3>
            <Link href="/f8e7d6c5b4a398765432109876543210/add-user" className="tf-btn bg-color-primary pd-13">
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
              Add New User
            </Link>
          </div>

              <div className="wrap-table">
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                    <th>User</th>
                    <th>Role</th>
                        <th>Status</th>
                    <th>Join Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                  {mockUsers.map((user) => (
                    <tr key={user.id}>
                          <td>
                            <div className="listing-box">
                              <div className="images">
                                <Image
                              alt="user"
                              src={user.avatar}
                              width={80}
                              height={60}
                                />
                              </div>
                              <div className="content">
                                <div className="title">
                              <Link href={`/f8e7d6c5b4a398765432109876543210/edit-user/${user.id}`} className="link">
                                {user.name}
                                  </Link>
                                </div>
                            <div className="text-date">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                        <span className={`role-badge ${getRoleClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <div className="status-wrap">
                          <span className={getStatusClass(user.status)}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span>{user.joinDate}</span>
                          </td>
                          <td>
                            <ul className="list-action">
                              <li>
                            <Link href={`/f8e7d6c5b4a398765432109876543210/edit-user/${user.id}`} className="item">
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
          <div className="text-center mt-20">
            <Link href="/f8e7d6c5b4a398765432109876543210/user-management" className="tf-btn bg-color-secondary pd-13">
              View All Users
            </Link>
          </div>
        </div>

        {/* Property Management Section */}
        <div className="widget-box-2 wd-listing mb-30">
          <div className="d-flex justify-content-between align-items-center mb-20">
            <h3 className="title">Property Management</h3>
            <Link href="/f8e7d6c5b4a398765432109876543210/add-property" className="tf-btn bg-color-primary pd-13">
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
                  {mockProperties.map((property) => (
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
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge type-${property.type.toLowerCase()}`}>
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
                            <Link href={`/f8e7d6c5b4a398765432109876543210/edit-property/${property.id}`} className="item">
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
          <div className="text-center mt-20">
            <Link href="/f8e7d6c5b4a398765432109876543210/property-management" className="tf-btn bg-color-secondary pd-13">
              View All Properties
            </Link>
          </div>
        </div>


        {/* Quick Actions */}
        <div className="widget-box-2 mb-30">
          <h3 className="title">Quick Actions</h3>
          <div className="row">
            <div className="col-md-3">
              <Link href="/f8e7d6c5b4a398765432109876543210/add-user" className="quick-action-card">
                <div className="card-icon">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>Add User</h4>
                <p>Create a new user account</p>
              </Link>
            </div>
            <div className="col-md-3">
              <Link href="/f8e7d6c5b4a398765432109876543210/add-property" className="quick-action-card">
                <div className="card-icon">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>Add Property</h4>
                <p>List a new property</p>
              </Link>
            </div>
            <div className="col-md-3">
              <Link href="/f8e7d6c5b4a398765432109876543210/user-management" className="quick-action-card">
                <div className="card-icon">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7071C21.7033 16.0601 20.9999 15.6214 20.22 15.456C19.4401 15.2906 18.6201 15.4102 17.92 15.8C17.2199 16.1898 16.6799 16.8289 16.4 17.6" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0148 6.12083 19.02 7.01C19.02 7.94 18.68 8.82 18.07 9.5" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
          </div>
                <h4>Manage Users</h4>
                <p>View and manage all users</p>
              </Link>
            </div>
            <div className="col-md-3">
              <Link href="/f8e7d6c5b4a398765432109876543210/property-management" className="quick-action-card">
                <div className="card-icon">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                    </div>
                <h4>Manage Properties</h4>
                <p>View and manage all properties</p>
              </Link>
            </div>
          </div>
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
