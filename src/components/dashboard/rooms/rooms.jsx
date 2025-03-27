import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import "./rooms.css";
import "../../variables.css";
import useRoomBookingStore from "../../../store/roomBookingStore.js";
import CardModal from "../../card/cardModel.jsx";

const Rooms = () => {
  const { roomBookings, fetchRoomBookings } = useRoomBookingStore();
  const [activeRoom, setActiveRoom] = useState("A");
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const isMobile = window.innerWidth <= 768; 

  useEffect(() => {
    fetchRoomBookings();
  }, [fetchRoomBookings]);

  const bookingsForActiveRoom = useMemo(() => {
    return roomBookings.filter((booking) => booking.room === activeRoom);
  }, [roomBookings, activeRoom]);

  const handleGuestClick = (guest) => {
    if (!isMobile) {
      setModalContent([
        { "Name": guest.fullName },
        { "UID": guest.uid },
      ]);
      setModalOpen(true);
    }
  };

  const handleActionClick = (action) => {
    if (!isMobile) {
      setModalContent([
        { "Action": action || "No Action" },
      ]);
      setModalOpen(true);
    }
  };

  const handleNoteClick = (note) => {
    if (!isMobile) {
      setModalContent([
        { "Note": note || "No Note" },
      ]);
      setModalOpen(true);
    }
  };

  const handleRowClick = (booking) => {
    if (isMobile) {
      setModalContent([
        { "Booking ID": booking.bookingId },
        { "Guest Name": booking.client.fullName },
        { "Guest UID": booking.client.uid },
        { "Check-in": new Date(booking.bookingPeriod.startFrom.toMillis()).toLocaleString() },
        { "Check-out": new Date(booking.bookingPeriod.endAt.toMillis()).toLocaleString() },
        { "Note": booking.note || "No Note" },
      ]);
      setModalOpen(true);
    }
  };

  const getColumns = () => {
    return ["Guest", "Check-in", "Check-out", "Note"];
  };

  const roomTabs = [
    { code: "A", label: "A Lentäjän Poika 1" },
    { code: "B", label: "B Lentäjän Poika 2" },
    { code: "C", label: "C Henry Ford Cabin" },
    { code: "D", label: "D Beach House" },
  ];

  return (
    <div className="rooms">
      <div className="dir">
        <span>Dashboard</span>
        <Icon icon="material-symbols:chevron-right-rounded" width="24" height="24" />
        <span>{roomTabs.find((room) => room.code === activeRoom)?.label}</span>
      </div>

      <div className="tab-dropdown-container">
        <select
          className="tab-dropdown"
          value={activeRoom}
          onChange={(e) => setActiveRoom(e.target.value)}
        >
          {roomTabs.map((room) => (
            <option key={room.code} value={room.code}>
              {room.label}
            </option>
          ))}
        </select>
      </div>

      <div className="tabs">
        {roomTabs.map((room) => (
          <span
            key={room.code}
            className={`tab-item ${activeRoom === room.code ? "active" : ""}`}
            onClick={() => setActiveRoom(room.code)}
          >
            {room.label}
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
          {bookingsForActiveRoom.map((booking) => (
            <tr key={booking.bookingId} onClick={() => handleRowClick(booking)}>
              <td>
                <span onClick={(e) => {
                  e.stopPropagation();
                  handleGuestClick(booking.client);
                }}>
                  {booking.client.fullName}
                </span>
              </td>
              <td>{new Date(booking.bookingPeriod.startFrom.toMillis()).toLocaleString()}</td>
              <td>{new Date(booking.bookingPeriod.endAt.toMillis()).toLocaleString()}</td>
              <td>
                <span onClick={(e) => {
                  e.stopPropagation();
                  handleNoteClick(booking.note);
                }}>
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
      />
    </div>
  );
};

export default Rooms;