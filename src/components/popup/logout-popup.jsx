import React, { useState } from "react";
import './logout-popup.css';
import useLogout from "../../hooks/AuthenicationHooks/useLogout";
import { useNavigate } from "react-router-dom";

const LogoutPopup = ({ onClose }) => {
  const { handleLogout, loading, error } = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    if (onClose) onClose();
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    const response = await handleLogout();
    if (response.Status === "success") {
      navigate("/");
      if (onClose) onClose();
    } else {
      alert(response.Message);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="logout-bg">
      <div className="logout-popup">
        <span>Are you sure you want to logout?</span>
        {loading && <p>Logging out...</p>}
        {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
        <div>
          <button onClick={handleCancel} disabled={isLoggingOut}>
            Cancel
          </button>
          <button onClick={handleConfirmLogout} disabled={isLoggingOut}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPopup;