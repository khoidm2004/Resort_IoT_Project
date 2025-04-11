import { useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "./tv.css";
import useEventStore from "../../store/eventStore";

function EventsTabs() {
  const { events, fetchEvents } = useEventStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="events-tabs">
      {events.map((event) => (
        <Accordion key={event.eventId} disableGutters elevation={0} square>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${event.eventId}-content`}
            id={`panel${event.eventId}-header`}
          >
            <Typography>{event.eventName}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="event-details-content">
              {event.eventImageLink && event.eventImageLink !== "" ? (
                <img
                  src={event.eventImageLink}
                  alt={event.eventName}
                  className="event-image"
                  loading="lazy"
                />
              ) : null}
              <div
                className="event-content"
                dangerouslySetInnerHTML={{ __html: event.eventContent }}
              />
              <div className="event-time">
                <p>
                  <strong>Start:</strong>{" "}
                  {new Date(
                    event.eventPeriod.startFrom.seconds * 1000,
                  ).toLocaleString()}
                </p>
                <p>
                  <strong>End:</strong>{" "}
                  {new Date(
                    event.eventPeriod.endAt.seconds * 1000,
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}

export default EventsTabs;
