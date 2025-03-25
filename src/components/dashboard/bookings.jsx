import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import "./rooms/rooms.css";
import "./../variables.css";
import useLaundryBookingStore from "../../store/laundryBookingStore.js";
import useSaunaBookingStore from "../../store/saunaBookingStore.js";
import CardModal from "../card/cardModel.jsx";

const Bookings = ({ type = "sauna" }) => {
  const { saunaBookings, fetchSaunaBookings } = useSaunaBookingStore(); 
  const { laundryBookings, fetchLaundryBookings } = useLaundryBookingStore(); 
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeType, setActiveType] = useState(type);

  useEffect(() => {
    if (activeType === "sauna") {
      fetchSaunaBookings();
    } else if (activeType === "laundry") {
      fetchLaundryBookings();
    }
  }, [activeType, fetchSaunaBookings, fetchLaundryBookings]);

  const bookings = activeType === "sauna" ? saunaBookings : laundryBookings;

  const handleNoteClick = (note) => {
    setModalContent(`Edit Note: ${note}`);
    setModalOpen(true);
  };

  const getColumns = () => ["Guest", "From", "To", "Note"];

  return (
    <div className="rooms">
      <div className="dir">
        <span>Dashboard</span>
        <Icon icon="material-symbols:chevron-right-rounded" width="24" height="24" />
        <span>{activeType.charAt(0).toUpperCase() + activeType.slice(1)}</span>
      </div>

      <div className="tab-dropdown-container">
        <select
          className="tab-dropdown"
          value={activeType}
          onChange={(e) => setActiveType(e.target.value)}
        >
          {["sauna", "laundry"].map((tab) => (
            <option key={tab} value={tab}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="tabs">
        {["sauna", "laundry"].map((tab) => (
          <span
            key={tab}
            className={`tab-item ${activeType === tab ? "active" : ""}`}
            onClick={() => setActiveType(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </span>
        ))}
      </div>

      <table className="booking-table">
        <thead>
          <tr>
            {getColumns().map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr key={booking.saunaBookingId || booking.laundryBookingId}>
              <td>
                <span variant="link">
                  {booking.client?.fullName}
                </span>
              </td>
              <td>{booking.bookingPeriod?.startFrom?.toDate().toLocaleString()}</td>
              <td>{booking.bookingPeriod?.endAt?.toDate().toLocaleString()}</td>
              <td>
                <span variant="link" onClick={() => handleNoteClick(booking.note)}>
                  {booking.note || "No Note"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CardModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        content={modalContent}
        setModalContent={setModalContent}
      />
    </div>
  );
};

export default Bookings;