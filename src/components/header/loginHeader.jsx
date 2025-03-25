import React, { useEffect } from "react";
import './header.css';

const LoginHeader = ({ isAdmin }) => { 
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <div className={`header ${!isAdmin ? 'guest' : ''}`}>
        <img className="resortlogo" src="/logo.png" alt="logo" />
      </div>
    </>
  );
};

export default LoginHeader;