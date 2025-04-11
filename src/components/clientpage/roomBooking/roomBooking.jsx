import { useState, useEffect } from "react";
import "./roomBooking.css";
import useRoomBookingStore from "../../../store/roomBookingStore";
import useAuthStore from "../../../store/authStore";
import { Timestamp } from "firebase/firestore";
import Popup from "../../popup/popup";

const RoomBooking = () => {
  const [newBooking, setNewBooking] = useState({
    bookingPeriod: {
      startFrom: "",
      endAt: "",
    },
    room: "",
    note: "",
  });

  const { roomBookings, addRoomBooking, deleteRoomBooking, fetchRoomBookings } =
    useRoomBookingStore();
  const { user } = useAuthStore();
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    status: "",
  });

  const roomOptions = [
    { label: "A Lentäjän Poika 1", value: "A" },
    { label: "B Lentäjän Poika 2", value: "B" },
    { label: "C Henry Ford Cabin", value: "C" },
    { label: "D Beach House", value: "D" },
  ];

  useEffect(() => {
    if (user) {
      fetchRoomBookings();
    }
  }, [user, fetchRoomBookings]);
  useEffect(() => {
    if (popup.show) {
      const timeout = setTimeout(() => {
        setPopup((prevPopup) => ({ ...prevPopup, show: false }));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [popup.show]);

  const userBookings = roomBookings.filter(
    (booking) => booking.client.uid === user?.uid,
  );

  const handleAddBooking = async (e) => {
    e.preventDefault();

    const startFrom = new Date(
      `${newBooking.bookingPeriod.startFrom}T14:00:00`,
    );
    const endAt = new Date(`${newBooking.bookingPeriod.endAt}T12:00:00`);

    const bookingData = {
      ...newBooking,
      bookingPeriod: {
        startFrom: Timestamp.fromDate(startFrom),
        endAt: Timestamp.fromDate(endAt),
      },
      client: {
        fullName: user.fullName,
        uid: user.uid,
      },
    };

    const result = await addRoomBooking(bookingData);
    setPopup({
      show: true,
      title: result.Title,
      message: result.Message,
      status: result.Status,
    });
    if (result.Status === "success") {
      setNewBooking({
        bookingPeriod: {
          startFrom: "",
          endAt: "",
        },
        room: "",
        note: "",
      });
    }
  };

  const handleDeleteBooking = async (bookingId, startFrom) => {
    const currentTime = new Date();
    const bookingStartTime = startFrom.toDate();

    if (bookingStartTime > currentTime) {
      const result = await deleteRoomBooking(bookingId, user.uid);
      setPopup({
        show: true,
        title: result.Title,
        message: result.Message,
        status: result.Status,
      });
    } else {
      setPopup({
        show: true,
        title: "Error",
        message:
          "You can only delete upcoming bookings (bookings that have not started yet).",
        status: "error",
      });
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  return (
    <div className="rooms-client">
      <form onSubmit={handleAddBooking}>
        <h3>Room Booking</h3>
        <div>
          <label>Room:</label>
          <select
            value={newBooking.room}
            onChange={(e) =>
              setNewBooking({ ...newBooking, room: e.target.value })
            }
            required
          >
            <option value="">Select a room</option>
            {roomOptions.map((room) => (
              <option key={room.value} value={room.value}>
                {room.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Start Date:</label>
          <input
            type="date"
            value={newBooking.bookingPeriod.startFrom}
            onChange={(e) =>
              setNewBooking({
                ...newBooking,
                bookingPeriod: {
                  ...newBooking.bookingPeriod,
                  startFrom: e.target.value,
                },
              })
            }
            required
          />
          <small>Default time: 2:00 PM</small>
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={newBooking.bookingPeriod.endAt}
            onChange={(e) =>
              setNewBooking({
                ...newBooking,
                bookingPeriod: {
                  ...newBooking.bookingPeriod,
                  endAt: e.target.value,
                },
              })
            }
            required
          />
          <small>Default time: 12:00 PM</small>
        </div>
        <div>
          <label>Note:</label>
          <textarea
            value={newBooking.note}
            onChange={(e) =>
              setNewBooking({ ...newBooking, note: e.target.value })
            }
            rows={3}
            placeholder="Add a note..."
          />
        </div>
        <button type="submit">Add Booking</button>
      </form>

      <ul>
        <h3>Your Bookings</h3>
        {userBookings.map((booking) => {
          const isUpcoming =
            booking.bookingPeriod.startFrom.toMillis() > Date.now();

          return (
            <li key={booking.bookingId}>
              <div className="booking-info">
                <p>
                  Room:{" "}
                  {roomOptions.find((room) => room.value === booking.room)
                    ?.label || booking.room}
                </p>
                <p>Client: {booking.client.fullName}</p>
                <p>Start: {formatTimestamp(booking.bookingPeriod.startFrom)}</p>
                <p>End: {formatTimestamp(booking.bookingPeriod.endAt)}</p>
                {isUpcoming && (
                  <button
                    onClick={() =>
                      handleDeleteBooking(
                        booking.bookingId,
                        booking.bookingPeriod.startFrom,
                      )
                    }
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="booking-note">
                <p>Note: {booking.note || "No note"}</p>
              </div>
            </li>
          );
        })}
      </ul>
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

export default RoomBooking;
