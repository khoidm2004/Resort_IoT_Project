import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./events.css";
import eventStore from '../../../../../Backend/src/store/eventStore';
import Popup from '../../popup/popup';

const EventsPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    image: null,
    content: "",
    startDate: null,
    endDate: null,
  });
  const [popup, setPopup] = useState({
      show: false,
      title: "",
      message: "",
      status: "",
    });

  const { events, addEvent, fetchEvents, deleteEvent } = eventStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (popup.show) {
      const timeout = setTimeout(() => {
        setPopup(prevPopup => ({ ...prevPopup, show: false }));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [popup.show]);

  const handleAddEvent = async (e) => {
    e.preventDefault();

    const { title, content, startDate, endDate, image } = formData;

    if (!title || !content || !startDate || !endDate) {
      setPopup({
        show: true,
        title: "Error",
        message: "Please fill out all required fields!",
        status: "error",
      });
      return;
    }

    const newEvent = {
      eventName: title,
      eventContent: content,
      eventPeriod: {
        startFrom: startDate,
        endAt: endDate,
      },
    };
    
    const result = await addEvent(newEvent, image);
    setPopup({
      show: true,
      title: result.Title,
      message: result.Message,
      status: result.Status,
    });

    if (result.Status === "success") {
      setFormData({
        title: "",
        image: null,
        content: "",
        startDate: null,
        endDate: null,
      });
    } 
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file) {
        const fileName = file.name;
        const isValidFileName = /^[a-zA-Z]+$/.test(fileName.split('.')[0]); 
        if (!isValidFileName) {
          setPopup({
            show: true,
            title: "Error",
            message: "File name must contain only letters and no spaces!",
            status: "error",
          });
          return; 
        }
        setFormData((prevData) => ({
          ...prevData,
          [name]: file,
        }));
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleContentChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      content: value,
    }));
  };

  const handleDeleteEvent = async (eventId) => {
    console.log(eventId);
    const result = await deleteEvent(eventId);
    setPopup({
      show: true,
      title: result.Title,
      message: result.Message,
      status: result.Status,
    });
  }; 

  return (
    <div className="events-page">
      <h1>Create Event</h1>

      <form onSubmit={handleAddEvent} className="event-form">
        <div className="form-group">
          <label htmlFor="title">Event Name:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Summer Camping Trip 2023"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Event Image (optional):</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleInputChange}
          />
          <p className="hint">Upload a photo that represents the event. File name must contain only letters and no spaces.</p>
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date:</label>
          <DatePicker
            selected={formData.startDate}
            onChange={(date) => setFormData({ ...formData, startDate: date })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Select start date and time"
            className="date-picker-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date:</label>
          <DatePicker
            selected={formData.endDate}
            onChange={(date) => setFormData({ ...formData, endDate: date })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Select end date and time"
            className="date-picker-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Event Details:</label>
          <ReactQuill
            value={formData.content}
            onChange={handleContentChange}
            placeholder="e.g., Join us for a fun camping trip at XYZ National Park! We'll have BBQ, games, and more."
          />
          <p className="hint">Describe your event in detail, including activities and any special instructions.</p>
        </div>

        <button type="submit" className="submit-button">
          Add Event
        </button>
      </form>
      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          status={popup.status}
        />
      )}

      <div className="events-list">
        <h2>Event List</h2>
        {events.length === 0 ? (
          <p>No events added yet.</p>
        ) : (
          events.map((event) => (
            <div key={event.eventId} className="event-card">
              {event.eventImageLink && (
                <img src={event.eventImageLink} alt={event.eventName} className="event-image" />
              )}
              <h3 className="event-title">{event.eventName}</h3>
              <div
                className="event-content"
                dangerouslySetInnerHTML={{ __html: event.eventContent }}
              />
              <p><strong>Start:</strong> {new Date(event.eventPeriod.startFrom.seconds * 1000).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(event.eventPeriod.endAt.seconds * 1000).toLocaleString()}</p>
              <button
                className="delete-button"
                onClick={() => handleDeleteEvent(event.eventId)}
              >
                Delete Event
              </button>
            </div>
          ))
        )}
      </div>
      
    </div>
  );
};

export default EventsPage;