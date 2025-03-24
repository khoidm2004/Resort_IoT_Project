import { create } from "zustand";
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import { getDocs } from "firebase/firestore";

const useEventStore = create((set, get) => ({
  // Map data from the array
  events: [],

  /* Data example
        var event = {
            eventPeriod{
                startFrom: timestamp
                endAt: timestamp
            }

            eventName: string
            eventId: string
            eventContent: string
            eventImageLink: string
        }
  */

  addEvent: async (newEvent, imageFile) => {
    try {
      const uploadImageAPI = import.meta.env.VITE_UPLOAD_EVENT_IMAGE;
      const uploadEventImage = async (imageFile) => {
        if (!imageFile) {
          return {
            Title: "Warning",
            Message: "Please select image file",
            Status: "warning",
          };
        } else {
          const formData = new FormData();
          formData.append("image", imageFile);

          const response = await fetch(uploadImageAPI, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const result = await response.text();
            var eventImageURL = result.replace(
              "File uploaded successfully: ",
              ""
            );
            return eventImageURL;
          } else {
            throw new Error("Filename has been used");
          }
        }
      };

      const imageURL = await uploadEventImage(imageFile);

      const eventRef = collection(firestore, "events");
      const docRef = doc(eventRef);

      const eventInfo = {
        ...newEvent,
        eventImageLink: imageURL,
        eventId: docRef.id,
      };

      await setDoc(docRef, eventInfo);

      set((state) => ({
        events: [...state.events, eventInfo],
      }));
    } catch (error) {
      return {
        Title: "Error",
        Message: error.message,
        Status: "error",
      };
    }
  },

  fetchEvents: async () => {
    try {
      const eventCollection = collection(firestore, "events");
      const eventSnapshot = await getDocs(eventCollection);
      const eventList = eventSnapshot.docs.map((doc) => ({
        eventId: doc.id,
        ...doc.data(),
      }));

      set({ events: eventList });
    } catch (error) {
      return {
        Title: "Error",
        Message: error.message,
        Status: "error",
      };
    }
  },

  deleteEvent: async (eventId) => {
    try {
      const event = get().events.find((e) => e.eventId === eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      if (event) {
        const filenameWithExtension = event.eventImageLink.split("/").pop();
        const filenameWithoutExtension = filenameWithExtension.replace(
          /\.[^/.]+$/,
          ""
        );
        const deleteImageAPI = `${import.meta.env.VITE_DELETE_EVENT_IMAGE}?event=${filenameWithoutExtension}`;

        const response = await fetch(deleteImageAPI, {
          method: "GET",
        });

        if (!response.ok) {
          console.log(response);
          throw new Error("Failed to delete image from storage");
        }
      }

      const eventRef = doc(firestore, "events", eventId);
      await deleteDoc(eventRef);

      set((state) => ({
        events: state.events.filter((e) => e.eventId !== eventId),
      }));

      return {
        Title: "Success",
        Message: "Event and associated image deleted successfully",
        Status: "success",
      };
    } catch (error) {
      return {
        Title: "Error",
        Message: error.message,
        Status: "error",
      };
    }
  },
}));

export default useEventStore;
