import { useState, useEffect } from "react";
import "./clientcomplaint.css";
import useAuthStore from "../../../store/authStore";
import useFeedbackStore from "../../../store/feedbackStore";
import Popup from "../../popup/popup";

const ClientComplaint = () => {
  const user = useAuthStore((state) => state.user);
  const { addFeedback } = useFeedbackStore();
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    status: "",
  });
  const [formData, setFormData] = useState({
    uid: user.uid,
    fullName: user.fullName,
    complaintTitle: "",
    complaintContent: "",
  });
  useEffect(() => {
    if (popup.show) {
      const timeout = setTimeout(() => {
        setPopup((prevPopup) => ({ ...prevPopup, show: false }));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [popup.show]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newFeedback = {
      client: {
        fullName: formData.fullName,
        uid: formData.uid,
      },
      complaint: {
        complaintTitle: formData.complaintTitle,
        complaintContent: formData.complaintContent,
      },
      createdAt: new Date(),
    };

    const result = await addFeedback(newFeedback);
    setPopup({
      show: true,
      title: result.Title,
      message: result.Message,
      status: result.Status,
    });
    setFormData({
      uid: user.uid,
      fullName: user.fullName,
      complaintTitle: "",
      complaintContent: "",
    });
  };

  return (
    <div className="complaint-form">
      <form onSubmit={handleSubmit}>
        <div className="complaint-form-row">
          <div className="complaint-form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={user.fullName}
              placeholder={user.fullName}
              required
              readOnly
            />
          </div>
          <div className="complaint-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              placeholder={user.email}
              required
              readOnly
            />
          </div>
        </div>

        <div className="complaint-form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={user.phoneNum}
            placeholder={user.phoneNum}
            required
            readOnly
          />
        </div>

        <div className="complaint-form-group">
          <label htmlFor="complaintTitle">Reason for Complaint</label>
          <input
            type="text"
            id="complaintTitle"
            name="complaintTitle"
            value={formData.complaintTitle}
            onChange={handleChange}
            placeholder="Reason"
            required
          />
        </div>

        <div className="complaint-form-group details">
          <label htmlFor="complaintContent">Please provide any details</label>
          <textarea
            id="complaintContent"
            name="complaintContent"
            value={formData.complaintContent}
            onChange={handleChange}
            rows="5"
            placeholder="Details"
            required
          />
        </div>

        <button type="submit" className="complaint-submit-button">
          Submit
        </button>
      </form>

      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          status={popup.status}
        />
      )}
    </div>
  );
};

export default ClientComplaint;
