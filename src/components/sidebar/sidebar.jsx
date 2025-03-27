import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import classNames from "classnames";
import { NavLink } from "react-router-dom";
import './sidebar.css';
import LogoutPopup from '../popup/logout-popup';

const Sidebar = ({ isAdmin, visible, closeSidebar }) => {
  const [activeItem, setActiveItem] = useState(() => {
    const savedActiveItem = localStorage.getItem("activeItem");
    return savedActiveItem ? savedActiveItem : "Dashboard"; 
  });

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const adminMenuItems = [
    { name: "Dashboard", icon: "mdi:monitor-dashboard", path: "/" },
    { name: "Reports", icon: "mdi:chart-line", path: "reports" },
    { name: "Rooms", icon: "material-symbols:key-vertical-outline", path: "rooms" },
    { name: "Bookings", icon: "ic:outline-list-alt", path: "bookings" },
    { name: "Complaints", icon: "material-symbols:person-alert-outline-rounded", path: "complaints" },
    { name: "Events", icon: "mdi:calendar", path: "events" },
    { name: "Admin", icon: "mdi:person-circle-outline", path: "info" },
    { name: "Logout", icon: "mdi:logout" },
  ];

  if (!isAdmin) {
    return null;
  }

  const handleLogoutClick = () => {
    setShowLogoutPopup(true);
    if (closeSidebar) {
      closeSidebar();
    }
  };

  const handleMenuItemClick = (itemName) => {
    setActiveItem(itemName); 
    localStorage.setItem("activeItem", itemName); 

    if (itemName === "Logout") {
      handleLogoutClick();
    }

    if (closeSidebar && itemName !== "Logout") {
      closeSidebar();
    }
  };

  return (
    <>
      <div className={classNames("sidebar", { visible, hidden: !visible })}>
        {adminMenuItems.map((item) => (
          item.path ? (
            <NavLink
              key={item.name}
              to={`/admin/${item.path}`}
              className={({ isActive }) => (isActive || activeItem === item.name ? "sidebar-gr active" : "sidebar-gr")}
              onClick={() => handleMenuItemClick(item.name)}
            >
              <Icon icon={item.icon} className="sidebar-icon" />
              <span className="sidebar-text">{item.name}</span>
            </NavLink>
          ) : (
            <div
              key={item.name}
              className="sidebar-gr"
              onClick={() => handleMenuItemClick(item.name)}
            >
              <Icon icon={item.icon} className="sidebar-icon" />
              <span className="sidebar-text">{item.name}</span>
            </div>
          )
        ))}
      </div>

      {showLogoutPopup && (
        <LogoutPopup onClose={() => setShowLogoutPopup(false)} />
      )}
    </>
  );
};

export default Sidebar;
