import React, { useState, useEffect } from "react";
import "./cardmodel.css";

const CardModal = ({ isOpen, onClose, content, onSave }) => {
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    if (content) {
      setLocalContent(content);
    }
  }, [content]);

  if (!isOpen || !content) return null;

  const handleSave = () => {
    onSave(localContent);
    onClose();
  };

  return (
    <div className="custom-modal-overlay">
      <div className="custom-card">
        <div className="custom-card-content">
          <div className="custom-editable-section">
            {Array.isArray(localContent) ? (
              <table className="info-table">
                <tbody>
                  {localContent.map((row, index) => (
                    <tr key={index}>
                      <td className="info-key">{Object.keys(row)[0]}:</td>
                      <td className="info-value">{row[Object.keys(row)[0]]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>{localContent}</p>
            )}
          </div>
          <div className="custom-button-container">
            <button className="custom-button close-button" onClick={onClose}>
              Close
            </button>
            <button className="custom-button save-button" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
