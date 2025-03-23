import { useEffect, useState } from "react";
import "./popup.css";

const Popup = ({ title, message, status }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="popup-row">
      <div className="popup-container">
        <br />
        <div className={`popup-content ${status}`}>
          <p>{title}</p>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Popup;