import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Sidebar from "../sidebar/sidebar";
import { NavLink } from "react-router-dom"; 
import './header.css';

const Header = ({ isAdmin }) => { 
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); 

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible); 
  };

  const closeSidebar = () => {
    setSidebarVisible(false); 
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const guestOptions = [
    { name: "Complaint", path: "complaint" },
    { name: "Sauna", path: "sauna" },
    { name: "Laundry", path: "laundry" },
  ];

  return (
    <>
      <div className={`header ${!isAdmin ? 'guest' : ''}`}>
        <img className="resortlogo" src="/logo.png" alt="logo" />
        
        <div className="header-options">
          {!isAdmin && guestOptions.map(option => (
            <NavLink
              key={option.path}
              to={`/client/${option.path}`}
              className={({ isActive }) => (isActive ? 'header-option-link active' : 'header-option-link')}  
            >
              <span>{option.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="header-info">
          {isAdmin ? (
            <Icon icon="mdi:menu" className="menu-icon" onClick={toggleSidebar} />
          ) : (
            <NavLink to="/client/info" className="guest-section">
              <Icon icon="mdi:account" className="guest-icon" />
              <span className="guest-label">Guest</span>
            </NavLink>
          )}
        </div>
      </div>

      {isAdmin && <Sidebar visible={isSidebarVisible} isAdmin={isAdmin} closeSidebar={isMobile ? closeSidebar : () => {}} />}
    </>
  );
};

export default Header;