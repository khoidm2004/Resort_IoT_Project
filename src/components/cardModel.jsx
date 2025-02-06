import React, { useState, useEffect } from 'react';
import { userStore } from '../state/user.js'; 

const Card = ({ children }) => {
  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      margin: '16px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff'
    }}>
      {children}
    </div>
  );
};

const CardModel = ({ isOpen, onClose, content, setModalContent, guest }) => {
  const [editableText, setEditableText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { users, setUsers } = userStore(); 

  useEffect(() => {
    if (content?.type === 'guest' && guest) {
      setEditableText(guest.name);  // Set editableText to guest's name
    } else {
      setEditableText(content?.content || "");  // For other types, set content directly
    }
  }, [content, guest, isOpen]);

  if (!isOpen) return null;

  const resetEditableText = () => {
    if (content?.type === 'guest') {
      setEditableText(guest?.name || "");  // Reset to guest's name
    } else {
      setEditableText(content?.content || "");  // Reset to action/note content
    }
  };

  const handleSave = () => {
    if (isEditing) {
      if (content?.type === 'guest' && guest) {
        const updatedUsers = users.map((user) =>
          user.id === guest.id ? { ...user, name: editableText } : user
        );
        setUsers(updatedUsers);  // Update the guest name in the userStore
      } else if (content?.type === 'action') {
        setModalContent({ ...content, content: editableText });
      } else if (content?.type === 'note') {
        setModalContent({ ...content, content: editableText });
      }
    }
    setIsEditing(false);
    onClose();
  };

  const handleClose = () => {
    resetEditableText(); 
    setIsEditing(false); 
    onClose(); 
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Card>
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            {isEditing ? (
              <input
                type="text"
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '16px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
            ) : (
              <p onClick={handleEditClick} style={{ fontSize: '16px', cursor: 'pointer' }}>
                {editableText}
              </p>
            )}
          </div>
          <div>
            <button
              style={{
                padding: '10px 20px',
                marginRight: '10px',
                borderRadius: '5px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={handleClose}
            >
              Close
            </button>
            <button
              style={{
                padding: '10px 20px',
                borderRadius: '5px',
                backgroundColor: 'green',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CardModel;
