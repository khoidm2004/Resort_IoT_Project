import React, { useState } from "react";
import { Icon } from "@iconify/react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import './sidebar.css';
import LogoutPopup from '../popup/logout-popup';

const Sidebar = ({ isAdmin, visible, closeSidebar }) => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const adminMenuItems = [
    { name: "Dashboard", icon: "mdi:monitor-dashboard", path: "/admin" },
    { name: "Reports", icon: "mdi:chart-line", path: "/admin/reports" },
    { name: "Rooms", icon: "material-symbols:key-vertical-outline", path: "/admin/rooms" },
    { name: "Bookings", icon: "ic:outline-list-alt", path: "/admin/bookings" },
    { name: "Complaints", icon: "material-symbols:person-alert-outline-rounded", path: "/admin/complaints" },
    { name: "Events", icon: "mdi:calendar", path: "/admin/events" },
    { name: "Admin", icon: "mdi:person-circle-outline", path: "/admin/info" },
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
          <Link
            key={item.name}
            to={item.path || "#"}
            className={classNames("sidebar-gr", { active: activeItem === item.name })}
            onClick={() => handleMenuItemClick(item.name)}
          >
            <Icon icon={item.icon} className="sidebar-icon" />
            <span className="sidebar-text">{item.name}</span>
          </Link>
        ))}
      </div>

      {showLogoutPopup && (
        <LogoutPopup onClose={() => setShowLogoutPopup(false)} />
      )}
    </>
  );
};

export default Sidebar;