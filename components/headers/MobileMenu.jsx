"use client";
import { blogMenu, homes, otherPages, propertyLinks } from "@/data/menu";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function MobileMenu() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const isParentActive = (menus) =>
    menus.some((menu) =>
      menu.submenu
        ? menu.submenu.some((item) =>
            item.submenu
              ? item.submenu.some(
                  (item) => item.href.split("/")[1] === pathname.split("/")[1]
                )
              : item.href.split("/")[1] === pathname.split("/")[1]
          )
        : menu.href.split("/")[1] === pathname.split("/")[1]
    );
  return (
    <div
      className="offcanvas offcanvas-start mobile-nav-wrap"
      tabIndex={-1}
      id="menu-mobile"
      aria-labelledby="menu-mobile"
    >
      <div className="offcanvas-header top-nav-mobile">
        <div className="offcanvas-title">
          <Link href={`/dashboard`}>
            <Image
              alt=""
              src="/images/logo/Earlybird_Logo.png"
              width={90}
              height={70}
            />
          </Link>
        </div>
        <div data-bs-dismiss="offcanvas" aria-label="Close">
          <i className="icon-close" />
        </div>
      </div>
      <div className="offcanvas-body inner-mobile-nav">
        <div className="mb-body">
          <ul id="menu-mobile-menu">
            {/*<li
              className={`menu-item menu-item-has-children-mobile  ${
                homes.some((elm) => elm.href == pathname)
                  ? "current-menu-item"
                  : ""
              } `}
            >
              <a
                href="#dropdown-menu-one"
                className="item-menu-mobile collapsed"
                data-bs-toggle="collapse"
                aria-expanded="true"
                aria-controls="dropdown-menu-one"
              >
                Home
              </a>
              <div
                id="dropdown-menu-one"
                className="collapse"
                data-bs-parent="#menu-mobile-menu"
              >
                <ul className="sub-mobile">
                  {homes.map((link, i) => (
                    <li
                      key={i}
                      className={
                        pathname == link.href
                          ? "menu-item current-item"
                          : "menu-item "
                      }
                    >
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
            <li
              className={`menu-item menu-item-has-children-mobile  ${
                isParentActive(propertyLinks) ? "current-menu-item" : ""
              } `}
            >
              <a
                href="#dropdown-menu-two"
                className="item-menu-mobile collapsed"
                data-bs-toggle="collapse"
                aria-expanded="true"
                aria-controls="dropdown-menu-two"
              >
                Listing
              </a>
              <div
                id="dropdown-menu-two"
                className="collapse"
                data-bs-parent="#menu-mobile-menu"
              >
                <ul className="sub-mobile">
                  {propertyLinks.map((links, i) => (
                    <li
                      key={i}
                      className={`menu-item menu-item-has-children-mobile-2 ${
                        isParentActive(links.submenu) ? "current-menu-item" : ""
                      }`}
                    >
                      <a
                        href="#sub-layout"
                        className="item-menu-mobile collapsed"
                        data-bs-toggle="collapse"
                        aria-expanded="true"
                        aria-controls="sub-agents"
                      >
                        {links.title}
                      </a>
                      <div
                        id="sub-layout"
                        className="collapse"
                        data-bs-parent="#dropdown-menu-two"
                      >
                        <ul className="sub-mobile">
                          {links.submenu.map((link, i2) => (
                            <li
                              key={i2}
                              className={
                                pathname.split("/")[1] ==
                                link.href.split("/")[1]
                                  ? "menu-item current-item"
                                  : "menu-item "
                              }
                            >
                              <Link
                                href={link.href}
                                className="item-menu-mobile"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
            <li
              className={`menu-item menu-item-has-children-mobile   ${
                isParentActive(otherPages) ? "current-menu-item" : ""
              } `}
            >
              <a
                href="#dropdown-menu-four"
                className="item-menu-mobile collapsed"
                data-bs-toggle="collapse"
                aria-expanded="true"
                aria-controls="dropdown-menu-four"
              >
                Pages
              </a>
              <div
                id="dropdown-menu-four"
                className="collapse"
                data-bs-parent="#menu-mobile-menu"
              >
                <ul className="sub-mobile">
                  {otherPages.map((links, i) => (
                    <React.Fragment key={i}>
                      {links.submenu ? (
                        <li
                          className={`menu-item menu-item-has-children-mobile-2   ${
                            isParentActive(links.submenu || [])
                              ? "current-menu-item"
                              : ""
                          }   `}
                        >
                          <a
                            href="#sub-agents"
                            className="item-menu-mobile collapsed"
                            data-bs-toggle="collapse"
                            aria-expanded="true"
                            aria-controls="sub-agents"
                          >
                            {links.title}
                          </a>
                          <div
                            id="sub-agents"
                            className="collapse"
                            data-bs-parent="#dropdown-menu-four"
                          >
                            <ul className="sub-mobile">
                              {links.submenu.map((link, i2) => (
                                <li
                                  className={`menu-item ${
                                    link.href?.split("/")[1] ==
                                    pathname.split("/")[1]
                                      ? "current-item"
                                      : ""
                                  }`}
                                  key={i2}
                                >
                                  <Link
                                    href={link.href}
                                    className="item-menu-mobile"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </li>
                      ) : (
                        <li
                          className={`menu-item ${
                            links.href?.split("/")[1] == pathname.split("/")[1]
                              ? "current-item"
                              : ""
                          }`}
                        >
                          <Link href={links.href}>{links.label}</Link>
                        </li>
                      )}
                    </React.Fragment>
                  ))}
                </ul>
              </div>
            </li>
            <li
              className={`menu-item menu-item-has-children-mobile ${
                isParentActive(blogMenu) ? "current-menu-item" : ""
              } `}
            >
              <a
                href="#dropdown-menu-five"
                className="item-menu-mobile collapsed"
                data-bs-toggle="collapse"
                aria-expanded="true"
                aria-controls="dropdown-menu-five"
              >
                Blogs
              </a>
              <div
                id="dropdown-menu-five"
                className="collapse"
                data-bs-parent="#menu-mobile-menu"
              >
                <ul className="sub-mobile">
                  {blogMenu.map((link, i) => (
                    <li
                      key={i}
                      className={
                        link.href.split("/")[1] == pathname.split("/")[1]
                          ? "menu-item current-item"
                          : "menu-item"
                      }
                    >
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>*/}
            <li
              className={`menu-item ${
                "/dashboard" == pathname ? "current-item" : ""
              }`}
            >
              <Link href={`/dashboard`} className="item-menu-mobile">
                Dashboard
              </Link>
            </li>
            <li
              className={`menu-item ${
                "/user-management" == pathname ? "current-item" : ""
              }`}
            >
              <Link href={`/user-management`} className="item-menu-mobile">
                Users
              </Link>
            </li>
            <li
              className={`menu-item ${
                "/property-management" == pathname ? "current-item" : ""
              }`}
            >
              <Link href={`/property-management`} className="item-menu-mobile">
                Properties
              </Link>
            </li>
            {/*<li
              className={`menu-item ${
                "/logout" == pathname ? "current-item" : ""
              }`}
            >
              <a href="#" onClick={handleLogout} className="item-menu-mobile">
                Logout
              </a>
            </li>*/}
          </ul>
          <div className="support">
            <a href="#" className="text-need">
              {" "}
              Need help?
            </a>
            <ul className="mb-info">
              <li>
                Call Us Now: <span className="number">1-555-678-8888</span>
              </li>
              <li>
                Support 24/7: <a href="#">themesflat@gmail.com</a>
              </li>
              <li>
                <div className="wrap-social">
                  <p>Follow us:</p>
                  <ul className="tf-social style-2">
                    <li>
                      <a href="#">
                        <i className="icon-fb" />
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="icon-X" />
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="icon-linked" />
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="icon-ins" />
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
