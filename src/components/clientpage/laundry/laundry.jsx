import { useState, useEffect, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./laundry.css";
import useAuthStore from "../../../store/authStore";
import useLaundryBookingStore from "../../../store/laundryBookingStore";
import Popup from "../../popup/popup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const localizer = momentLocalizer(moment);

const generateSlots = (date, isDailyView = false) => {
  const slots = [];
  const startDate = isDailyView
    ? moment(date).startOf("day")
    : moment(date).startOf("week");
  const endDate = isDailyView
    ? moment(date).endOf("day")
    : moment(startDate).endOf("week");

  for (let day = startDate; day.isBefore(endDate); day.add(1, "day")) {
    for (let hour = 8; hour <= 21; hour++) {
      const slotTime = moment(day).set({ hour, minute: 0, second: 0 });
      slots.push(
        {
          id: `${day.format("YYYY-MM-DD")}-${hour}-washer`,
          title: "available",
          start: slotTime.toDate(),
          end: moment(slotTime).add(1, "hour").toDate(),
          status: "available",
          type: "washer",
        },
        {
          id: `${day.format("YYYY-MM-DD")}-${hour}-dryer`,
          title: "available",
          start: slotTime.toDate(),
          end: moment(slotTime).add(1, "hour").toDate(),
          status: "available",
          type: "dryer",
        },
      );
    }
  }
  return slots;
};

const updateSlotStatus = (slots, laundryBookings, user) => {
  return slots.map((slot) => {
    const booking = laundryBookings.find((booking) => {
      const startFrom = booking.bookingPeriod.startFrom;
      const endAt = booking.bookingPeriod.endAt;

      const startFromDate = startFrom?.toDate ? startFrom.toDate() : startFrom;
      const endAtDate = endAt?.toDate ? endAt.toDate() : endAt;

      const facilities = booking.facilities || {};
      const isWasherBooking =
        slot.type === "washer" && facilities.isWashingMachine;
      const isDryerBooking = slot.type === "dryer" && facilities.isDryer;

      return (
        startFromDate.getTime() === slot.start.getTime() &&
        endAtDate.getTime() === slot.end.getTime() &&
        (isWasherBooking || isDryerBooking)
      );
    });

    if (booking) {
      return {
        ...slot,
        status: "booked",
        title: booking.client.uid === user.uid ? "my-reservation" : "booked",
      };
    }
    return slot;
  });
};

const LaundryCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const user = useAuthStore((state) => state.user);
  const {
    addLaundryBooking,
    deleteLaundryBooking,
    fetchLaundryBookings,
    laundryBookings,
  } = useLaundryBookingStore();
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    status: "",
  });

  const slots = useMemo(() => {
    const generatedSlots = generateSlots(selectedDate, isMobile);
    return updateSlotStatus(generatedSlots, laundryBookings, user);
  }, [selectedDate, isMobile, laundryBookings, user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchLaundryBookings();
  }, [fetchLaundryBookings]);

  useEffect(() => {
    if (popup.show) {
      const timeout = setTimeout(() => {
        setPopup((prevPopup) => ({ ...prevPopup, show: false }));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [popup.show]);

  const handleSlotClick = async (event) => {
    const currentTime = new Date();
    const twoHoursAfter = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);

    if (event.start < twoHoursAfter) {
      setPopup({
        show: true,
        title: "Error",
        message:
          "You cannot modify a slot that is within 2 hours of the current time.",
        status: "error",
      });
      return;
    }

    const clickedSlot = slots.find((slot) => slot.id === event.id);
    if (!clickedSlot) return;

    if (clickedSlot.status === "available") {
      const newBooking = {
        bookingPeriod: {
          startFrom: clickedSlot.start,
          endAt: clickedSlot.end,
        },
        client: {
          fullName: user.fullName,
          uid: user.uid,
        },
        facilities: {
          isWashingMachine: clickedSlot.type === "washer",
          isDryer: clickedSlot.type === "dryer",
        },
      };
      await addLaundryBooking(newBooking);
    } else {
      const bookingToDelete = laundryBookings.find((booking) => {
        const startFrom = booking.bookingPeriod.startFrom;
        const endAt = booking.bookingPeriod.endAt;

        const startFromDate = startFrom?.toDate
          ? startFrom.toDate()
          : startFrom;
        const endAtDate = endAt?.toDate ? endAt.toDate() : endAt;

        const facilities = booking.facilities || {};
        const isWasherBooking =
          clickedSlot.type === "washer" && facilities.isWashingMachine;
        const isDryerBooking =
          clickedSlot.type === "dryer" && facilities.isDryer;

        return (
          startFromDate.getTime() === clickedSlot.start.getTime() &&
          endAtDate.getTime() === clickedSlot.end.getTime() &&
          (isWasherBooking || isDryerBooking)
        );
      });

      if (bookingToDelete) {
        const result = await deleteLaundryBooking(
          bookingToDelete.laundryBookingId,
          user.uid,
        );
        setPopup({
          show: true,
          title: result.Title,
          message: result.Message,
          status: result.Status,
        });
      }
    }
  };

  const handleNavigate = (newDate) => {
    setSelectedDate(newDate);
  };

  const eventPropGetter = (event) => {
    if (!event || !event.title) return {};

    const currentTime = new Date();
    const twoHoursAfter = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
    const isWithinTwoHours = event.start < twoHoursAfter;

    const baseClass = isWithinTwoHours
      ? "laundry-past"
      : event.title === "my-reservation"
        ? "laundry-my-reservation"
        : event.status === "booked"
          ? "laundry-booked"
          : "laundry-available";

    return {
      className: `${baseClass} ${event.type}`,
      style: {
        cursor: isWithinTwoHours ? "not-allowed" : "pointer",
        pointerEvents: isWithinTwoHours ? "none" : "auto",
        margin: isMobile ? "0 0 5px 0" : "0 0 10px 0",
      },
    };
  };

  const EventComponent = ({ event }) => {
    if (!event || !event.title) return null;

    const currentTime = new Date();
    const twoHoursAfter = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
    const isWithinTwoHours = event.start < twoHoursAfter;

    const slotTypeLabel = event.type === "washer" ? "Washer" : "Dryer";

    let statusLabel;
    if (isWithinTwoHours) {
      statusLabel =
        event.title === "my-reservation"
          ? "My Reservation"
          : event.status === "booked"
            ? "Booked"
            : "Past";
    } else {
      statusLabel =
        event.title === "my-reservation"
          ? "Cancel"
          : event.status === "booked"
            ? "Booked"
            : "Available";
    }

    return (
      <div className={`event-content ${event.type}`}>
        <div className="slot-type-label">{slotTypeLabel}</div>
        <div className="slot-status-label">{statusLabel}</div>
      </div>
    );
  };

  return (
    <div className="laundry-calendar">
      <div className="booking-calendar-container">
        {isMobile && (
          <div className="mobile-date-picker">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                handleNavigate(date);
              }}
              dateFormat="dd/MM/yyyy"
              className="date-picker-input"
            />
          </div>
        )}
        <Calendar
          localizer={localizer}
          events={slots}
          startAccessor="start"
          endAccessor="end"
          defaultView={isMobile ? "day" : "week"}
          views={isMobile ? ["day"] : ["week", "day"]}
          step={60}
          timeslots={1}
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 22, 0, 0)}
          onSelectEvent={handleSlotClick}
          onNavigate={handleNavigate}
          eventPropGetter={eventPropGetter}
          components={{
            event: EventComponent,
          }}
          defaultDate={new Date()}
        />
      </div>
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

export default LaundryCalendar;
