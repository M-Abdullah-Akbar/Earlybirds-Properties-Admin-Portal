"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Mock user data - in a real app, this would come from an API
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "Active",
    avatar: "/images/avatar/account.jpg",
    joinDate: "2024-01-15",
    lastLogin: "2024-03-20"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Agent",
    status: "Active",
    avatar: "/images/avatar/account-2.jpg",
    joinDate: "2024-02-10",
    lastLogin: "2024-03-19"
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "User",
    status: "Inactive",
    avatar: "/images/avatar/avatar-1.jpg",
    joinDate: "2024-01-20",
    lastLogin: "2024-02-15"
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    role: "Agent",
    status: "Active",
    avatar: "/images/avatar/avatar-2.jpg",
    joinDate: "2024-03-01",
    lastLogin: "2024-03-20"
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@example.com",
    role: "User",
    status: "Active",
    avatar: "/images/avatar/avatar-3.jpg",
    joinDate: "2024-02-25",
    lastLogin: "2024-03-18"
  }
];

export default function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || user.status === statusFilter;
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const getStatusClass = (status) => {
    return status === "Active" ? "btn-status active" : "btn-status inactive";
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
        return "role-user";
    }
  };

  return (
    <div className="main-content w-100">
      <div className="main-content-inner wrap-dashboard-content">
        <div className="widget-box-2 wd-listing mb-20">
          <div className="d-flex justify-content-between align-items-center mb-20">
            <h3 className="title">User Management</h3>
            <Link href="/add-user" className="tf-btn bg-color-primary pd-13">
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

          {/* Filters */}
          <div className="row mb-20">
            <div className="col-md-4">
              <fieldset className="box-fieldset">
                <label>Search Users:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email"
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
                  <option value="Inactive">Inactive</option>
                </select>
              </fieldset>
            </div>
            <div className="col-md-4">
              <fieldset className="box-fieldset">
                <label>Filter by Role:</label>
                <select
                  className="form-control"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Agent">Agent</option>
                  <option value="User">User</option>
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
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 21V19C22 18.1137 21.7311 17.2528 21.2312 16.5159C20.7313 15.7789 20.0218 15.1999 19.1899 14.8501C18.358 14.5003 17.4375 14.3944 16.5228 14.5466C15.6081 14.6988 14.7337 15.1039 14 15.72" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
              <div className="content-box">
                <div className="title-count text-variant-1">Total Users</div>
                <div className="box-count d-flex align-items-end">
                  <div className="number">{users.length}</div>
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
                <div className="title-count text-variant-1">Admins</div>
                <div className="box-count d-flex align-items-end">
                  <div className="number">{users.filter(u => u.role === "Admin").length}</div>
                </div>
              </div>
            </div>
            <div className="counter-box">
              <div className="box-icon">
                <span className="icon">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 3.42172 15.4214 2.67157 16.1716C1.92143 16.9217 1.5 17.9391 1.5 19V21" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M23 21V19C23 18.1137 22.7311 17.2528 22.2312 16.5159C21.7313 15.7789 21.0218 15.1999 20.1899 14.8501C19.358 14.5003 18.4375 14.3944 17.5228 14.5466C16.6081 14.6988 15.7337 15.1039 15 15.72" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 3.13C17.8604 3.35031 18.623 3.85071 19.1676 4.55232C19.7122 5.25392 20.0078 6.11683 20.0078 7.005C20.0078 7.89317 19.7122 8.75608 19.1676 9.45768C18.623 10.1593 17.8604 10.6597 17 10.88" stroke="#F1913D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
              <div className="content-box">
                <div className="title-count text-variant-1">Agents</div>
                <div className="box-count d-flex align-items-end">
                  <div className="number">{users.filter(u => u.role === "Agent").length}</div>
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
                <div className="title-count text-variant-1">Active Users</div>
                <div className="box-count d-flex align-items-end">
                  <div className="number">{users.filter(u => u.status === "Active").length}</div>
                </div>
              </div>
            </div>
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
                    <th>Last Login</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="listing-box">
                          <div className="images">
                            <Image
                              alt="avatar"
                              src={user.avatar}
                              width={50}
                              height={50}
                              style={{ borderRadius: "50%" }}
                            />
                          </div>
                          <div className="content">
                            <div className="title">
                              <Link href={`/user-detail/${user.id}`} className="link">
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
                        <span>{user.lastLogin}</span>
                      </td>
                      <td>
                        <ul className="list-action">
                          <li>
                            <Link href={`/edit-user/${user.id}`} className="item">
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
                              onClick={() => handleDeleteUser(user.id)}
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
        {/* /.footer-dashboard */}
      </div>
      <div className="overlay-dashboard" />
    </div>
  );
} 